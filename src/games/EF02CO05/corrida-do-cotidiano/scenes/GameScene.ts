import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, gatesInLevel } from '../data/levels'
import { SITUATIONS, solves } from '../data/tech'
import { DEPTH, GAP_Z, H, HUD, P_CULL, P_DECIDE, W, WARMUP_Z } from '../data/layout'
import { C } from '../data/theme'
import type { Lane, LevelDef, LevelNumber, Mode, Situation, SituationId } from '../types'
import { createTrack, type Track } from './track'
import { createProps, type Props } from './props'
import { createRunner, type Runner } from './runner'
import { createBalloon, type Balloon } from './balloon'
import { createSignPair, type SignPair } from './signs'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'
import { rewardPop } from './reward'
import { showTrava, type Trava } from './trava'
import { runDemo } from './demo'

const GAME_ID = 'corrida-do-cotidiano'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phaseIndex = 0
    private queue: SituationId[] = []

    private mode: Mode = 'intro'
    private gen = 0

    private speedBase = 480
    private boost = 1
    private gapLeft = WARMUP_Z

    private pair: SignPair | null = null
    private situation: Situation | null = null
    private correctLane: Lane = 0
    private trava: Trava | null = null
    private hintTimer?: Phaser.Time.TimerEvent
    private pendingTutorial = false
    private fallen = false

    private score = 0
    private hits = 0
    private errors = 0
    private combo = 0
    private travasInPhase = 0
    private gatesDone = 0

    private track!: Track
    private props!: Props
    private runner!: Runner
    private balloon!: Balloon
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.phaseIndex = 0
        this.mode = 'intro'
        this.boost = 1
        this.gapLeft = WARMUP_Z
        this.pair = null
        this.situation = null
        this.trava = null
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.combo = 0
        this.travasInPhase = 0
        this.gatesDone = 0
        this.pendingTutorial = this.level.level === 1
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.track = createTrack(this, this.level.mood)
        this.props = createProps(this)
        this.runner = createRunner(this, () => this.audio.step())
        this.balloon = createBalloon(this)
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })

        this.buildLaneZones()
        this.bindKeys()
        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
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

        this.startPhase(0)
    }

    private shutdownScene() {
        this.gen++
        this.hintTimer?.remove()
        this.pair?.destroy()
        this.trava?.destroy()
        this.balloon?.destroy()
        this.runner?.destroy()
        this.props?.destroy()
        this.track?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── entrada

    private buildLaneZones() {
        const top = 200
        const height = H - top
        const lanes: Lane[] = [0, 1]
        lanes.forEach(lane => {
            this.add
                .zone(lane === 0 ? W / 4 : (W * 3) / 4, top + height / 2, W / 2, height)
                .setOrigin(0.5)
                .setDepth(DEPTH.zones)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.choose(lane))
        })
    }

    private bindKeys() {
        const keyboard = this.input.keyboard
        if (!keyboard) return
        keyboard.on('keydown-LEFT', () => this.choose(0))
        keyboard.on('keydown-A', () => this.choose(0))
        keyboard.on('keydown-RIGHT', () => this.choose(1))
        keyboard.on('keydown-D', () => this.choose(1))
    }

    private choose(lane: Lane) {
        if (this.mode === 'running') {
            if (this.runner.lane === lane) return
            this.runner.moveTo(lane)
            this.track.setLane(lane)
            this.audio.choose()
            return
        }

        if (this.mode !== 'blocked' || !this.pair) return

        if (lane === this.correctLane) {
            this.unlock()
            return
        }

        this.audio.stumble()
    }

    // ─────────────────────────────────────────────── laço

    update(_time: number, delta: number) {
        const dt = Math.min(delta, 50) / 1000
        const speed = this.speedBase * this.boost
        const rush = Phaser.Math.Clamp((this.boost - 1) / 0.35, 0, 1)

        if (this.mode === 'running') this.advance(speed * dt, dt)

        this.track.setBoost(rush)
        this.track.draw()
        this.track.fall(dt)
        this.runner.update(
            dt,
            this.mode === 'running' ? speed : 0,
            this.level.mood.wild ? Math.max(rush, 0.42) : rush,
        )
    }

    private advance(dz: number, dt: number) {
        this.track.advance(dz)
        this.props.advance(dz, dt)

        if (!this.pair) {
            this.gapLeft -= dz
            if (this.gapLeft <= 0 && this.queue.length > 0) this.spawnPair()
            return
        }

        const before = this.pair.p
        this.pair.advance(dz)
        const after = this.pair.p

        if (this.pendingTutorial && after >= 0.45) {
            this.pendingTutorial = false
            void this.runDemo()
            return
        }

        if (!this.pair.resolved && before < P_DECIDE && after >= P_DECIDE) {
            this.resolve()
            return
        }

        if (this.pair.resolved && !this.fallen && after > 0.98) {
            this.fallen = true
            this.pair.fall()
        }

        if (this.pair.resolved && after > P_CULL) {
            this.pair.destroy()
            this.pair = null
            this.situation = null
            if (this.queue.length > 0) this.gapLeft = GAP_Z
            else this.endPhase()
        }
    }

    // ─────────────────────────────────────────────── portões

    private startPhase(index: number) {
        this.phaseIndex = index
        const phase = this.level.phases[index]
        this.queue = [...phase.situations]
        this.speedBase = phase.speed
        this.travasInPhase = 0
        this.gapLeft = index === 0 ? WARMUP_Z : GAP_Z
        this.hud.setTitle(`Trecho ${index + 1}`)
        this.mode = 'running'
        this.runner.run()
    }

    private spawnPair() {
        const id = this.queue.shift()
        if (!id) return

        const situation = SITUATIONS[id]
        this.situation = situation

        const flip = Math.random() < 0.5
        const techByLane: [typeof situation.options[0], typeof situation.options[1]] = flip
            ? [situation.options[1], situation.options[0]]
            : [situation.options[0], situation.options[1]]

        this.correctLane = solves(techByLane[0], id) ? 0 : 1
        this.pair = createSignPair(this, { techByLane })
        this.fallen = false
        this.balloon.show(situation.prompt)
        this.audio.ask()
    }

    private resolve() {
        if (!this.pair || !this.situation) return
        this.pair.resolved = true

        const lane = this.runner.lane
        const tech = this.pair.techAt(lane)
        this.balloon.hide()

        if (solves(tech, this.situation.id)) this.award(lane, 10, true)
        else this.block(lane)
    }

    private award(lane: Lane, points: number, boost: boolean) {
        if (!this.pair) return

        this.pair.setState(lane, 'ok')
        const panel = this.pair.panelAt(lane)
        rewardPop(this, this.pair.techAt(lane), panel)
        this.pair.hideFace(lane)

        this.audio.pass()
        this.hud.flash(C.ok)

        if (this.level.mood.wild) {
            const cam = this.cameras.main
            cam.zoomTo(1.035, 130, 'Sine.easeOut')
            this.time.delayedCall(190, () => cam.zoomTo(1, 220, 'Sine.easeInOut'))
            FX.shakeCam(this, 'leve')
            void FX.stars(this, this.runner.x, 500, { count: 14 })
        }

        if (boost) {
            this.audio.boost()
            this.tweens.addCounter({
                from: 1.35,
                to: 1,
                duration: 1000,
                ease: 'Cubic.easeOut',
                onUpdate: tween => {
                    this.boost = tween.getValue() ?? 1
                },
                onComplete: () => {
                    this.boost = 1
                },
            })
        }

        this.score += points
        this.hits += 1
        this.gatesDone += 1
        this.combo += 1

        if (this.combo > 0 && this.combo % 3 === 0) {
            this.score += 5
            this.audio.combo(this.combo / 3)
            void FX.stars(this, this.runner.x, 520, { count: 10 })
        }

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()
    }

    private block(lane: Lane) {
        if (!this.pair) return

        this.mode = 'blocked'
        this.boost = 1
        this.combo = 0
        this.errors += 1
        this.travasInPhase += 1

        this.pair.setState(lane, 'blocked')
        this.runner.stand()
        this.audio.block()
        this.audio.stumble()
        this.hud.flash(C.warn)
        FX.shakeCam(this, 'leve')

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.trava = showTrava(this, this.pair.techAt(lane))

        this.hintTimer?.remove()
        if (this.travasInPhase >= 2) {
            this.pair.hint(this.correctLane)
        } else {
            this.hintTimer = this.time.delayedCall(2200, () => {
                if (this.mode === 'blocked') this.pair?.hint(this.correctLane)
            })
        }
    }

    private unlock() {
        if (!this.pair) return

        this.hintTimer?.remove()
        this.trava?.destroy()
        this.trava = null

        this.runner.moveTo(this.correctLane)
        this.track.setLane(this.correctLane)
        this.runner.run()
        this.audio.unlock()
        this.mode = 'running'

        this.award(this.correctLane, 5, false)
    }

    private endPhase() {
        const next = this.phaseIndex + 1
        if (next >= this.level.phases.length) {
            void this.endLevel()
            return
        }

        this.runner.cheer()
        this.time.delayedCall(900, () => {
            if (this.mode === 'done') return
            this.startPhase(next)
        })
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.hud.setEnabled(false)
        this.hud.setTitle('')
        this.balloon.hide()
        this.runner.cheer()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        this.audio.fanfare()
        void FX.confetti(this, { colors: [C.gold, C.ok, C.blue, C.warn] })
        void FX.stars(this, this.runner.x, 520, { count: 22 })
        this.hud.flash(C.ok)

        await FX.wait(this, 1200)
        if (gen !== this.gen) return

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name}: feito!`,
                subtitle: 'Você achou a tecnologia certa de cada situação.',
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                depth: DEPTH.overlay,
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
            title: 'Bairro conhecido!',
            subtitle: 'Cada coisa do dia a dia tem a tecnologia que resolve.',
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            depth: DEPTH.overlay,
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

    // ─────────────────────────────────────────────── demonstração

    private async runDemo() {
        const gen = this.gen
        const back = this.runner.lane
        this.mode = 'tutorial'
        this.hud.setEnabled(false)

        await runDemo(this, lane => {
            this.runner.moveTo(lane)
            this.track.setLane(lane)
            this.audio.choose()
        })

        if (gen !== this.gen) return

        this.runner.moveTo(back)
        this.track.setLane(back)
        this.hud.setEnabled(true)
        if (this.mode === 'tutorial') this.mode = 'running'
    }

    private replayTutorial() {
        if (this.mode !== 'running') return
        void this.runDemo()
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = gatesInLevel(this.level)
        const done = complete ? total : this.gatesDone
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / total) * 100),
            score: Math.max(0, this.score),
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
