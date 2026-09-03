import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import {
    GAME_DONE, GOAL_FRAMES, LEVELS, LEVEL_DONE, TOTAL_PASSES,
    mediaChain, passesBefore, passesInLevel, planSubjects, rightGoal,
} from '../data/levels'
import { dustPuff } from './icons'
import { pause } from './timing'
import { C } from '../data/theme'
import { createAudio } from './audio'
import { createBall } from './ball'
import { createCourt } from './court'
import { createEdge } from './edge'
import { createHeader } from './header'
import { createGuides } from './guides'
import { showDemo } from './demo'
import type { LevelDef, LevelNumber, MediumId, SubjectDef, Target } from '../types'

const GAME_ID = 'passe-da-mensagem'
const MAX_STEP_MS = 34

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelDef!: LevelDef
    private subjects: SubjectDef[] = []

    private runIndex = 0
    private step = 0

    private subject!: SubjectDef
    private chain: MediumId[] = []
    private holder = 0
    private goalIndex = 0

    private state: 'demo' | 'playing' | 'busy' | 'ending' = 'demo'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private resolved = 0
    private missesHere = 0

    private court!: ReturnType<typeof createCourt>
    private lines!: ReturnType<typeof createGuides>
    private ball!: ReturnType<typeof createBall>
    private header!: ReturnType<typeof createHeader>
    private edge!: ReturnType<typeof createEdge>
    private audio!: ReturnType<typeof createAudio>
    private demo?: ReturnType<typeof showDemo>
    private showIntro = true

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number; demo?: boolean }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.levelDef = LEVELS[number - 1]

        this.showIntro = data?.demo ?? true

        this.state = 'demo'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.resolved = 0
        this.missesHere = 0
        this.runIndex = 0
        this.step = 0
    }

    create() {
        this.input.topOnly = true
        this.subjects = planSubjects(this.levelDef, Math.random)

        this.edge = createEdge(this)
        this.audio = createAudio(this)
        this.court = createCourt(this, (kind, i) => this.onTap(kind, i))
        this.lines = createGuides(this)
        this.ball = createBall(this)
        this.header = createHeader(this, () => this.replayDemo())

        this.header.setLevel(this.levelDef.level, LEVELS.length)
        this.header.setPhases(this.levelDef.runs)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayDemo, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startRun()
        this.court.setEnabled(false)
        this.header.setHelpEnabled(false)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 186,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        if (this.showIntro) this.openDemo()
        else this.beginPlay()
    }

    update(time: number, delta: number) {
        if (this.paused) return
        this.edge.update(Math.min(delta, MAX_STEP_MS))

        if (this.state !== 'playing') {
            this.lines.clear()
            return
        }
        this.lines.refresh(this.ball.at(), this.targets(), time)
    }

    private shutdownScene() {
        this.gen++
        this.demo?.destroy()
        this.court?.destroy()
        this.lines?.destroy()
        this.ball?.destroy()
        this.header?.destroy()
        this.edge?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayDemo, this)
        this.unsubPlatform?.()
    }

    private openDemo() {
        this.state = 'demo'
        this.court.setEnabled(false)
        this.header.setHelpEnabled(false)
        this.lines.clear()
        this.demo = showDemo(this, () => {
            this.demo = undefined
            this.beginPlay()
        })
    }

    private replayDemo() {
        if (this.state !== 'playing') return
        this.openDemo()
    }

    private beginPlay() {
        if (this.state === 'ending') return
        this.state = 'playing'
        this.header.setHelpEnabled(true)
        this.court.setEnabled(true)
    }

    private startRun() {
        this.subject = this.subjects[this.runIndex]
        this.chain = mediaChain(this.runIndex, this.levelDef.passes)
        this.step = 0
        this.missesHere = 0
        this.holder = 0
        this.goalIndex = rightGoal(this.levelDef, this.runIndex)

        this.header.setMessage(this.subject)
        this.header.setRecipient(GOAL_FRAMES[this.goalIndex])
        this.court.spotlight(this.holder)
        this.ball.show(this.court.hookOf('mate', this.holder), this.subject, this.chain[0])
    }

    private targets(): Target[] {
        return this.step < this.levelDef.passes - 1
            ? this.court.targets('mate', this.holder)
            : this.court.targets('goal')
    }

    private onTap(kind: 'mate' | 'goal', index: number) {
        if (this.paused || this.state !== 'playing') return

        const target = this.targets().find(t => t.kind === kind && t.index === index)
        if (!target) return

        this.audio.tap()
        this.court.press(kind, index)

        if (kind === 'goal' && index !== this.goalIndex) {
            void this.missWrongGoal(target)
            return
        }
        void this.succeed(target)
    }

    private reward() {
        const points = this.missesHere === 0 ? 10 : 5
        this.score += points
        this.hits += 1
        this.resolved += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()
    }

    private async succeed(target: Target) {
        const gen = this.gen
        this.state = 'busy'
        this.court.setEnabled(false)
        this.header.setHelpEnabled(false)
        this.lines.clear()
        this.reward()

        this.audio.pass()
        await this.ball.passTo(target.hook)
        if (gen !== this.gen) return

        this.audio.land()
        this.edge.flash(C.ok)
        this.court.cheer(target.kind, target.index)
        void FX.sparks(this, target.hook.x, target.hook.y, { color: C.ok, count: 22, spread: 190 })

        await this.ball.spinInto(this.subject, this.chain[this.step + 1])
        if (gen !== this.gen) return
        await pause(this, 360)
        if (gen !== this.gen) return

        if (target.kind === 'goal') {
            await this.deliver(target)
            return
        }

        this.step += 1
        this.missesHere = 0
        this.holder = target.index
        this.court.spotlight(this.holder)
        this.beginPlay()
    }

    private async deliver(target: Target) {
        const gen = this.gen
        await this.ball.drop(this.court.hookOf('goal', target.index))
        if (gen !== this.gen) return

        this.audio.crowd()
        this.edge.flash(C.warn)
        dustPuff(this, target.hook.x, target.hook.y + 44)

        await this.header.markPhase()
        if (gen !== this.gen) return
        await pause(this, 420)
        if (gen !== this.gen) return

        if (this.runIndex + 1 >= this.levelDef.runs) {
            void this.endLevel()
            return
        }

        this.runIndex += 1
        this.startRun()
        this.emitCheckpoint()
        this.beginPlay()
    }

    private penalize() {
        this.errors += 1
        this.missesHere += 1
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
        this.emitCheckpoint()
    }

    private async missWrongGoal(target: Target) {
        const gen = this.gen
        this.state = 'busy'
        this.court.setEnabled(false)
        this.header.setHelpEnabled(false)
        this.lines.clear()
        this.penalize()

        this.audio.wrong()
        this.edge.flash(C.bad)
        this.cameras.main.shake(160, 0.005)
        await this.court.deny('goal', target.index)
        if (gen !== this.gen) return

        this.header.callRecipient()
        await pause(this, 700)
        if (gen !== this.gen) return

        if (this.missesHere >= 2) {
            this.court.point('goal', this.goalIndex)
            await pause(this, 900)
            if (gen !== this.gen) return
        }
        this.beginPlay()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.header.setHelpEnabled(false)
        this.court.setEnabled(false)
        this.ball.hide()
        this.lines.clear()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelDef.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        await pause(this, 420)
        if (gen !== this.gen) return

        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: LEVEL_DONE,
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2200,
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft, level: next, points: this.score, demo: false,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: GAME_DONE,
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal, level: 1, points: 0, demo: true,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.shirt,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private emitCheckpoint(complete = false) {
        const total = passesInLevel(this.levelDef)
        const partial = passesBefore(this.levelDef.level)
            + (complete ? total : Math.min(this.resolved, total))
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((partial / TOTAL_PASSES) * 100),
            score: Math.max(0, this.score),
            stage: this.levelDef.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private bindPlatform() {
        this.unsubPlatform = runtimeGameBridge.onCommand((command: PlatformCommand) => {
            if (command.type === 'START_GAME') {
                this.score = command.points ?? this.score
                const wanted = command.stage
                    ? Phaser.Math.Clamp(command.stage, 1, LEVELS.length)
                    : this.levelDef.level
                if (wanted !== this.levelDef.level) {
                    this.scene.restart({
                        lives: this.livesLeft, level: wanted, points: this.score, demo: true,
                    })
                    return
                }
            }
            if (command.type === 'PAUSE_GAME') this.setPaused(true)
            if (command.type === 'RESUME_GAME') this.setPaused(false)
        })
    }

    private setPaused(paused: boolean) {
        if (this.paused === paused) return
        this.paused = paused
        if (paused) this.scene.pause()
        else this.scene.resume()
    }

    private onMute(muted: boolean) {
        this.audio.setMuted(muted)
    }
}
