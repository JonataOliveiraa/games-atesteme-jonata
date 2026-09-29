import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { faseInicial } from '../../../../shared/level/faseInicial'
import { FX } from '../../../../shared/effects/FX'

import { GUIDE_KEY, LEVELS, POINTS } from '../data/levels'
import { frameArt } from '../data/problems'
import { stepArt } from '../data/steps'
import { C, CSS } from '../data/theme'
import type { LevelDef, Mode, PhaseDef, RungDef } from '../types'

import { createAudio, type Audio } from './audio'
import { createBoard, type Board } from './board'
import { createClimbGuide, type ClimbGuide } from './guide'
import { createHud, type Hud } from './hud'
import { playIntro } from './intro'
import { createKid, type Kid } from './kid'
import { createLadder, type Ladder } from './ladder'
import { createOptions, type Options } from './options'
import { createReplay, type Replay } from './replay'

const GAME_ID = 'subida-do-dia'

export class GameScene extends Phaser.Scene {
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private rungIndex = 0
    private rightSlot = 0
    private mode: Mode = 'intro'
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private phasesDone = 0
    private guiding = false

    private tapWaiter?: () => void

    private audio!: Audio
    private board!: Board
    private ladder!: Ladder
    private options!: Options
    private kid!: Kid
    private replay!: Replay
    private hud!: Hud
    private guide!: ClimbGuide

    private unsubPlatform?: () => void

    private get phase(): PhaseDef {
        return this.level.phases[this.phaseIndex]
    }

    private get rung(): RungDef {
        return this.phase.rungs[this.rungIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? faseInicial(this, 1), 1, LEVELS.length)
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.rungIndex = 0
        this.rightSlot = 0
        this.mode = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.phasesDone = 0
        this.guiding = false
        this.tapWaiter = undefined
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio()
        this.board = createBoard(this)
        this.ladder = createLadder(this)
        this.options = createOptions(this)
        this.kid = createKid(this)
        this.replay = createReplay(this, { board: this.board, ladder: this.ladder, audio: this.audio })
        this.hud = createHud(this, {
            phases: this.level.phases.length,
            level: this.level.level,
            levels: LEVELS.length,
            livesTotal: this.livesTotal,
            livesLeft: this.livesLeft,
            gameId: GAME_ID,
            stage: () => this.level.level,
            onHelp: () => void this.explain(),
        })
        this.guide = createClimbGuide(this, { board: this.board, ladder: this.ladder, options: this.options })

        this.options.onTap(slot => this.onTap(slot))

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.onShowTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.tapWaiter?.()
        this.tapWaiter = undefined
        this.guide?.destroy()
        this.replay?.destroy()
        this.kid?.destroy()
        this.options?.destroy()
        this.ladder?.destroy()
        this.board?.destroy()
        this.hud?.destroy()
        this.audio?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.onShowTutorial, this)
        this.unsubPlatform?.()
    }

    private art(id: string) {
        return frameArt(this.phase.problem, id)
    }

    private lock() {
        this.options.setEnabled(false)
        this.hud.setHelpEnabled(false)
    }

    private choose() {
        this.mode = 'choose'
        this.options.setEnabled(true)
        this.hud.setHelpEnabled(!this.guiding)
    }

    private async startPhase(index: number) {
        const gen = ++this.gen
        this.phaseIndex = index
        this.mode = 'intro'
        this.lock()
        this.hud.setPhase(index)

        const phase = this.phase
        const goal = this.art(phase.goal)
        await Promise.all([this.kid.home(), this.board.show(this.art(phase.start), goal)])
        if (gen !== this.gen) return

        if (index === 0) await playIntro(this, { board: this.board, kid: this.kid }, goal)
        else await this.board.revealGoal()
        if (gen !== this.gen) return

        await this.ladder.build(phase.rungs.length)
        if (gen !== this.gen) return

        await this.askRung(gen, 0)
    }

    private async askRung(gen: number, index: number) {
        this.rungIndex = index
        this.ladder.glow(index)

        const rung = this.rung
        this.rightSlot = Math.random() < 0.5 ? 0 : 1
        const arts = [stepArt(rung.right), stepArt(rung.wrong)]
        await this.options.show(this.rightSlot === 0 ? arts : arts.reverse())
        if (gen !== this.gen) return

        if (this.phaseIndex === 0 && index === 0 && !this.registry.get(GUIDE_KEY)) {
            this.registry.set(GUIDE_KEY, true)
            void this.runGuide(gen)
            return
        }

        this.choose()
    }

    private async runGuide(gen: number) {
        this.guiding = true
        const childTap = new Promise<void>(resolve => {
            this.tapWaiter = resolve
        })
        this.choose()

        await this.guide.pointAt(this.rightSlot, childTap)
        this.guiding = false
        if (gen !== this.gen) return
        if (this.mode === 'choose') this.hud.setHelpEnabled(true)
    }

    private onTap(slot: number) {
        if (this.mode !== 'choose') return
        const resolve = this.tapWaiter
        this.tapWaiter = undefined
        resolve?.()
        void this.pick(slot)
    }

    private async climbOnto(gen: number, index: number): Promise<boolean> {
        if (index === 0) {
            this.audio.steps()
            await this.kid.walkTo(this.ladder.foot().x)
            if (gen !== this.gen) return false
        }
        this.audio.climb(index)
        await this.kid.climbTo(this.ladder.stand(index))
        return gen === this.gen
    }

    private async pick(slot: number) {
        const gen = this.gen
        const index = this.rungIndex
        const rung = this.rung
        const ok = slot === this.rightSlot
        this.mode = 'busy'
        this.lock()
        this.audio.tap()
        this.options.press(slot)

        this.audio.fly()
        await this.options.fly(slot, this.ladder.rungPoint(index))
        if (gen !== this.gen) return
        this.ladder.glow(-1)
        void this.options.clear()

        await this.ladder.fill(index, stepArt(ok ? rung.right : rung.wrong))
        if (gen !== this.gen) return
        if (!(await this.climbOnto(gen, index))) return

        if (!ok) {
            this.audio.boing()
            await this.board.fail(this.art(rung.fail))
            if (gen !== this.gen) return
            this.audio.slide()
            await this.kid.slideDown(this.ladder.foot())
            if (gen !== this.gen) return
            this.audio.oops()
            this.kid.oops()
            this.lose()
            return
        }

        this.ladder.light(index)
        this.audio.puff()
        await this.board.setFrame(this.art(rung.state))
        if (gen !== this.gen) return

        if (index + 1 < this.phase.rungs.length) await this.askRung(gen, index + 1)
        else await this.reachTop(gen)
    }

    private async reachTop(gen: number) {
        const phase = this.phase
        await this.kid.jumpToCloud()
        if (gen !== this.gen) return

        const last = phase.rungs[phase.rungs.length - 1]
        if (last.state !== phase.goal) {
            this.audio.puff()
            await this.board.setFrame(this.art(phase.goal))
            if (gen !== this.gen) return
        }

        this.audio.fanfare()
        await Promise.all([this.kid.cheer(), this.board.celebrate()])
        if (gen !== this.gen) return

        await this.finishPhase(gen)
    }

    private async finishPhase(gen: number) {
        this.mode = 'replay'
        this.lock()

        this.score += POINTS
        this.hits += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: POINTS,
            stage: this.level.level,
        })

        this.phasesDone += 1
        this.emitCheckpoint()
        void this.hud.celebrate(this.phaseIndex)

        const phase = this.phase
        await this.replay.play(phase.rungs.map(rung => this.art(rung.state)))
        if (gen !== this.gen) return
        if (phase.rungs[phase.rungs.length - 1].state !== phase.goal) {
            await this.board.setFrame(this.art(phase.goal))
            if (gen !== this.gen) return
        }

        this.mode = 'panel'
        await this.replay.waitNext()
        if (gen !== this.gen) return

        const next = this.phaseIndex + 1
        if (next < this.level.phases.length) void this.startPhase(next)
        else void this.endLevel()
    }

    private lose() {
        this.gen++
        this.mode = 'done'
        this.lock()
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
        this.lock()

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
        void FX.confetti(this, { colors: [C.gold, C.green, C.sky, C.white] })
        await FX.wait(this, 700)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.gold,
            panelColor: C.paperLight,
            overlayColor: C.shadow,
            titleColor: CSS.ink,
            subtitleColor: CSS.inkSoft,
            title: 'Chegou lá em cima!',
            stars: 3,
            progress: { total: this.level.phases.length, current: this.level.phases.length },
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
        if (this.mode !== 'choose' || this.guiding) return
        const gen = this.gen
        this.mode = 'guide'
        this.guiding = true
        this.lock()

        await this.guide.help(this.rungIndex)
        this.guiding = false
        if (gen !== this.gen) return

        this.choose()
    }

    private onShowTutorial() {
        void this.explain()
    }

    private emitCheckpoint() {
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((this.phasesDone / this.level.phases.length) * 100),
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
