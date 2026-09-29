import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { CHEER, LEVELS, POINTS, available, canDo, dealOrder, failOf, pairOf, stepOf } from '../data/levels'
import { C, CSS } from '../data/theme'
import type { LevelDef, MissionDef, Mode } from '../types'

import { createAudio, type Audio } from './audio'
import { createBench, type Bench } from './bench'
import { createStepGuide, type StepGuide } from './guide'
import { createHud, type Hud } from './hud'
import { createRuler, type Ruler } from './ruler'
import { createStage, type Stage } from './stage'

const GAME_ID = 'decolagem-passo-a-passo'

export class GameScene extends Phaser.Scene {
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private missionIndex = 0
    private mode: Mode = 'intro'
    private gen = 0
    private done: string[] = []
    private guiding = false

    private score = 0
    private hits = 0
    private errors = 0
    private missionsDone = 0

    private audio!: Audio
    private stage!: Stage
    private bench!: Bench
    private ruler!: Ruler
    private hud!: Hud
    private guide!: StepGuide

    private unsubPlatform?: () => void

    private get mission(): MissionDef {
        return this.level.missions[this.missionIndex]
    }

    private get over(): boolean {
        return this.mode === 'done'
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.missionIndex = 0
        this.mode = 'intro'
        this.done = []
        this.guiding = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.missionsDone = 0
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.stage = createStage(this)
        this.bench = createBench(this)
        this.ruler = createRuler(this)
        this.hud = createHud(this, {
            missions: this.level.missions.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createStepGuide(this, { stage: this.stage, bench: this.bench, ruler: this.ruler })

        this.bench.onPick(id => this.onPick(id))

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startMission(0)
    }

    private shutdownScene() {
        this.gen++
        this.guide?.destroy()
        this.ruler?.destroy()
        this.bench?.destroy()
        this.stage?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private ready() {
        this.mode = 'pick'
        this.bench.setEnabled(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private hold() {
        this.mode = 'busy'
        this.bench.setEnabled(false)
        this.hud.setHelpEnabled(false)
    }

    private nextId(): string {
        return available(this.mission, this.done)[0]?.id ?? ''
    }

    private async startMission(index: number) {
        const gen = ++this.gen
        this.missionIndex = index
        this.done = []
        this.hold()
        this.mode = 'intro'

        this.hud.setPhase(index)
        this.stage.clear()
        this.bench.clear()
        this.ruler.reset(this.mission.steps.length)

        await this.stage.show(this.mission)
        if (gen !== this.gen) return
        await this.bench.deal(dealOrder(this.mission))
        if (gen !== this.gen) return

        const key = this.mission.guide
        if (key && !this.registry.get(key)) {
            void this.runGuide(gen, key)
            return
        }

        this.ready()
    }

    private async runGuide(gen: number, key: string) {
        this.mode = 'guide'
        this.guiding = true

        await this.guide.play({
            next: () => this.nextId(),
            pick: id => this.pick(id, false),
        })
        this.guiding = false
        if (gen !== this.gen || this.over) return

        this.registry.set(key, true)
        this.hud.setHelpEnabled(true)
    }

    private onPick(id: string) {
        if (this.mode === 'pick') void this.pick(id, true)
    }

    private async pick(id: string, counts: boolean) {
        const extra = this.mission.extra
        if (extra && extra.id === id) {
            await this.miss(id, extra.scene)
            return
        }
        const step = stepOf(this.mission, id)
        if (!step) return
        const gen = this.gen
        this.hold()
        this.audio.tap()

        if (!canDo(step, this.done)) {
            await this.miss(id, failOf(this.mission, step, this.done)?.scene)
            return
        }

        const slot = this.done.length
        const card = this.bench.take(id)
        await Promise.all([card ? this.ruler.place(card, slot) : Promise.resolve(), this.stage.perform(id)])
        if (gen !== this.gen) return
        this.audio.snap(slot)
        this.done.push(id)

        if (counts) {
            this.score += POINTS
            this.hits += 1
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER',
                gameId: GAME_ID,
                pointsEarned: POINTS,
                stage: this.level.level,
            })
        }

        if (this.done.length >= this.mission.steps.length) {
            await this.finishMission(gen)
            return
        }

        this.ready()
    }

    private async miss(id: string, scene: string | undefined) {
        const gen = this.gen
        this.hold()
        this.audio.tap()
        this.audio.boing()
        await this.bench.hop(id)
        if (gen !== this.gen) return
        if (scene) await this.stage.fail(scene)
        if (gen !== this.gen) return
        this.lose()
    }

    private async finishMission(gen: number) {
        this.mode = 'launch'
        this.bench.setEnabled(false)
        this.hud.setHelpEnabled(false)

        await this.stage.launch(this.mission)
        if (gen !== this.gen) return

        const extra = this.mission.extra
        if (extra) void this.bench.dismiss(extra.id)

        this.audio.fanfare()
        await this.ruler.replay(CHEER.mine)
        if (gen !== this.gen) return

        const pair = pairOf(this.mission)
        if (pair) {
            await this.ruler.swap(pair[0], pair[1])
            if (gen !== this.gen) return
            this.audio.fanfare()
            await this.ruler.replay(CHEER.other)
            if (gen !== this.gen) return
        }

        this.missionsDone += 1
        this.emitCheckpoint()
        void this.hud.celebrate(this.missionIndex)
        await FX.wait(this, 900)
        if (gen !== this.gen) return

        const next = this.missionIndex + 1
        if (next < this.level.missions.length) void this.startMission(next)
        else void this.endLevel()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.bench.setEnabled(false)
        this.hud.setHelpEnabled(false)
        this.audio.lose()

        this.errors += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.hud.lives.loseAll()
        this.livesLeft = this.hud.lives.remaining
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.bench.setEnabled(false)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint()

        this.audio.win()
        void FX.confetti(this, { colors: [C.gold, C.green, C.amber, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.gold,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            title: 'Decolagem completa!',
            stars: 3,
            progress: { total: this.level.missions.length, current: this.level.missions.length },
            ...(this.level.level < LEVELS.length
                ? {
                      autoAdvance: {
                          delay: 2600,
                          onComplete: () =>
                              this.scene.restart({
                                  level: this.level.level + 1,
                                  points: this.score,
                                  lives: this.livesLeft,
                              }),
                      },
                  }
                : {
                      buttons: [
                          {
                              label: 'JOGAR DE NOVO',
                              color: C.gold,
                              onClick: () => this.scene.restart({ level: 1, points: 0, lives: this.livesTotal }),
                          },
                      ],
                  }),
        })
    }

    private async explain() {
        if (this.mode !== 'pick' || this.guiding) return
        const gen = this.gen
        this.hold()

        await this.guide.replay({ next: () => this.nextId() })
        if (gen !== this.gen) return

        this.ready()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.missionsDone / this.level.missions.length) * 100),
            score: Math.max(0, Math.round(this.score)),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                if (command.stage && command.stage !== this.level.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.scene.pause()
            if (command.type === 'RESUME_GAME') this.scene.resume()
        })
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
