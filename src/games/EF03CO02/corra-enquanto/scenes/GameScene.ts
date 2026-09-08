import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { createTimeBar, type TimeBar } from '../../../../shared/hud/createTimeBar'
import { LEVELS, stepsInLevel } from '../data/levels'
import { RULES, holds, runningMs, runsWhen, totalMs } from '../data/rules'
import { CLOCK, HUD, ROBOT_X } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Mode, Rule, Stretch } from '../types'
import { createWorld, type World } from './world'
import { createRobot, type Robot } from './robot'
import { createRuleCard, type RuleCard } from './cards'
import { createPedal, type Pedal } from './pedal'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { createLock, showTrava, type Lock } from './trava'
import { runDemo } from './demo'

const GAME_ID = 'corra-enquanto'

interface Pending {
    needHold: boolean
    left: number
}

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private stretchIndex = 0
    private mode: Mode = 'intro'
    private gen = 0

    private rule: Rule | null = null
    private segments: { on: boolean; ms: number }[] = []
    private segIndex = 0
    private segLeft = 0
    private signalOn = true

    private pending: Pending | null = null
    private advancing = false
    private demoHolding = false
    private travaOpen: { destroy: () => void } | null = null
    private stretchErrors = 0
    private pendingTutorial = true

    private score = 0
    private hits = 0
    private errors = 0
    private stepsDone = 0

    private world!: World
    private robot!: Robot
    private card!: RuleCard
    private pedal!: Pedal
    private timeBar!: TimeBar
    private hud!: Hud
    private audio!: Audio
    private lock!: Lock

    private unsubPlatform?: () => void

    private get stretch(): Stretch {
        return this.level.stretches[this.stretchIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.stretchIndex = 0
        this.mode = 'intro'
        this.rule = null
        this.pending = null
        this.advancing = false
        this.demoHolding = false
        this.travaOpen = null
        this.stretchErrors = 0
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.stepsDone = 0
        this.pendingTutorial = number === 1
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.world = createWorld(this)
        this.robot = createRobot(this, () => {
            this.audio.step()
            this.pedal.beat()
        })
        this.card = createRuleCard(this)
        this.lock = createLock(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayDemo(),
        })
        this.pedal = createPedal(this, {
            onDown: () => this.onDown(),
            onUp: () => this.onUp(),
        })
        this.timeBar = createTimeBar(this, {
            cx: CLOCK.cx,
            cy: CLOCK.cy,
            w: CLOCK.w,
            h: CLOCK.h,
            duration: 20000,
            depth: 520,
            onEmpty: () => this.timeOver(),
        })
        this.timeBar.setRunning(false)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayDemo, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: HUD.livesX,
            y: HUD.cy,
            size: 28,
            tint: C.warn,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startStretch(0)
    }

    private shutdownScene() {
        this.gen++
        this.audio?.loopStop()
        this.travaOpen?.destroy()
        this.pedal?.destroy()
        this.card?.destroy()
        this.timeBar?.destroy()
        this.lock?.destroy()
        this.robot?.destroy()
        this.world?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayDemo, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── escolher a regra

    private startStretch(index: number) {
        this.stretchIndex = index
        this.mode = 'intro'
        this.pending = null
        this.stretchErrors = 0
        this.advancing = false
        this.audio.loopStop()

        const stretch = this.stretch
        this.rule = RULES[stretch.rule]
        this.world.setSignal(stretch.signal, stretch.segments[0].on)
        this.world.setGoal(4200)
        this.world.setBadgeVisible(false)
        this.robot.stand()
        this.pedal.setEnabled(false)
        this.timeBar.setRunning(false)
        this.timeBar.reset(Math.round(totalMs(stretch) * 2))

        this.card.alert(false)
        this.card.show(this.rule)
        this.time.delayedCall(520, () => this.card.pulse())

        this.time.delayedCall(1500, () => {
            if (this.mode === 'intro') this.beginRun()
        })
    }

    // ─────────────────────────────────────────────── rodar o laço

    private beginRun() {
        if (!this.rule) return
        const stretch = this.stretch

        this.segments = [
            ...stretch.segments,
            { on: runsWhen(stretch), ms: Number.POSITIVE_INFINITY },
        ]
        this.segIndex = 0
        this.segLeft = this.segments[0].ms
        this.signalOn = this.segments[0].on
        this.world.setSignal(stretch.signal, this.signalOn)
        this.world.setGoal((runningMs(stretch) / 1000) * this.level.speed)
        this.world.setBadgeVisible(true)
        this.pedal.setEnabled(true)

        if (this.pendingTutorial) {
            this.pendingTutorial = false
            this.mode = 'demo'
            void runDemo(this, {
                onHold: () => {
                    this.demoHolding = true
                },
                onRelease: () => {
                    this.demoHolding = false
                },
            }).then(() => {
                if (this.mode !== 'demo') return
                this.startClock()
            })
            return
        }

        this.startClock()
    }

    private startClock() {
        this.world.setGoal((runningMs(this.stretch) / 1000) * this.level.speed)
        this.timeBar.setRunning(true)
        this.mode = 'running'
    }

    private nextSegment() {
        if (this.segIndex >= this.segments.length - 1) return
        this.segIndex += 1
        this.segLeft = this.segments[this.segIndex].ms
        this.signalOn = this.segments[this.segIndex].on
        this.world.setSignal(this.stretch.signal, this.signalOn, true)
        this.audio.change()
        this.card.pulse()
        this.pending = { needHold: holds(this.rule!, this.signalOn), left: this.level.windowMs }
    }

    update(_time: number, delta: number) {
        const dt = Math.min(delta, 50) / 1000
        const dtMs = dt * 1000

        this.robot.tick(dt)
        this.world.tick(dt)
        if (this.mode === 'running') this.timeBar.tick(dtMs)

        if (this.mode === 'demo') {
            const running = this.demoHolding
            this.setAdvancing(running)
            if (running) {
                this.world.scroll(this.level.speed * dt)
                this.robot.run(dt, this.level.speed)
            } else {
                this.robot.stand()
            }
            return
        }

        if (this.mode !== 'running') return

        this.segLeft -= dtMs
        if (this.segLeft <= 0) this.nextSegment()

        const should = holds(this.rule!, this.signalOn)
        const holding = this.pedal.held
        const running = holding && should

        this.setAdvancing(running)

        if (running) {
            this.world.scroll(this.level.speed * dt)
            this.robot.run(dt, this.level.speed)
            this.score += 2 * dt
        } else {
            this.robot.stand()
        }

        if (this.pending) {
            if (holding === this.pending.needHold) {
                this.resolveChange(true)
            } else {
                this.pending.left -= dtMs
                if (this.pending.left <= 0) {
                    if (holding && !should) this.blockLoop()
                    else this.resolveChange(false)
                }
            }
        }

        if (this.world.arrived) this.finishStretch()
    }

    private setAdvancing(value: boolean) {
        if (value === this.advancing) return
        this.advancing = value
        this.card.setLooping(value)
        if (value) this.audio.loopStart()
        else this.audio.loopStop()
    }

    private resolveChange(inTime: boolean) {
        this.pending = null
        if (!inTime) return

        this.audio.reflex()
        this.pedal.shine(1)
        this.tweens.addCounter({
            from: 1,
            to: 0,
            duration: 420,
            onUpdate: t => this.pedal.shine(t.getValue() ?? 0),
        })
        this.score += 10
        this.hits += 1
        this.stepsDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 10,
            stage: this.level.level,
        })
        this.emitCheckpoint()
    }

    private blockLoop() {
        this.pending = null
        this.mode = 'blocked'
        this.stretchErrors += 1
        this.errors += 1
        this.setAdvancing(false)

        this.robot.stand()
        this.lock.show(ROBOT_X, this.robot.top - 26)
        this.card.alert(true)
        this.card.pulse()
        this.hud.flash(C.warn)
        this.audio.wrong()
        FX.shakeCam(this, 'leve')

        this.travaOpen = showTrava(this, this.travaLine())

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining
    }

    private travaLine() {
        const rule = this.rule
        if (!rule) return 'O laço tinha que parar.'
        return `${rule.text} deixou de valer. O laço tinha que parar aqui.`
    }

    private unblock() {
        if (this.mode !== 'blocked') return
        this.mode = 'running'
        this.travaOpen?.destroy()
        this.travaOpen = null
        this.lock.hide()
        this.card.alert(false)
        this.audio.unlock()

        this.score += 5
        this.hits += 1
        this.stepsDone += 1
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 5,
            stage: this.level.level,
        })
        this.emitCheckpoint()
    }

    private onDown() {
        if (this.mode === 'running' && this.pending && this.pending.needHold) {
            this.resolveChange(true)
        }
    }

    private onUp() {
        if (this.mode === 'blocked') {
            this.unblock()
            return
        }
        if (this.mode === 'running' && this.pending && !this.pending.needHold) {
            this.resolveChange(true)
        }
        this.setAdvancing(false)
    }

    // ─────────────────────────────────────────────── fim

    private finishStretch() {
        this.mode = 'done'
        this.setAdvancing(false)
        this.pedal.setEnabled(false)
        this.timeBar.setRunning(false)
        this.robot.cheer()
        this.audio.arrive()
        this.card.hide()
        void FX.stars(this, ROBOT_X + 80, 470, { count: 16 })

        this.time.delayedCall(1600, () => {
            const next = this.stretchIndex + 1
            if (next < this.level.stretches.length) this.startStretch(next)
            else void this.endLevel()
        })
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setEnabled(false)
        this.timeBar.setRunning(false)
        this.card.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, Math.round(this.score)),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.gold, C.ok, C.blue, C.warn] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name}: feito!`,
                subtitle: 'A repetição continua ENQUANTO a condição vale.',
                accent: C.blue,
                panelColor: C.cream,
                overlayColor: C.ink,
                depth: 5000,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2600,
                    label: `${LEVELS[done].name}...`,
                    onComplete: () =>
                        this.scene.restart({
                            lives: this.livesLeft,
                            level: (done + 1) as LevelNumber,
                            points: this.score,
                        }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Laço fechado!',
            subtitle: 'A repetição continua ENQUANTO a condição vale — e para sozinha quando ela muda.',
            accent: C.blue,
            panelColor: C.cream,
            overlayColor: C.ink,
            depth: 5000,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Correr de novo',
                    color: C.ok,
                    onClick: () =>
                        this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.blue,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private timeOver() {
        if (this.mode === 'done') return
        this.mode = 'done'
        this.setAdvancing(false)
        this.pedal.setEnabled(false)
        this.robot.stand()
        this.audio.wrong()
        this.travaOpen?.destroy()
        this.travaOpen = showTrava(this, 'O tempo acabou!')
        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.level.level })
    }

    // ─────────────────────────────────────────────── demonstração

    private replayDemo() {
        if (this.mode !== 'running') return
        const wasHolding = this.pedal.held
        if (wasHolding) this.pedal.forceRelease()
        this.mode = 'demo'
        void runDemo(this, {
            onHold: () => {
                this.demoHolding = true
            },
            onRelease: () => {
                this.demoHolding = false
            },
        }).then(() => {
            if (this.mode === 'demo') this.mode = 'running'
        })
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = stepsInLevel(this.level)
        const done = complete ? total : this.stepsDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((Math.min(done, total) / total) * 100),
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
                    this.scene.restart({
                        lives: this.livesLeft,
                        level: command.stage,
                        points: this.score,
                    })
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
