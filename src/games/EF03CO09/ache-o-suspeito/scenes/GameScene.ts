import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { createTutorial } from '../../../../shared/tutorial/createTutorial'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, POINTS_AFTER_STALL, POINTS_CLEAN } from '../data/levels'
import { isSuspicious, shuffled, validateLevels } from '../data/rules'
import { CARD, DEPTH, HUD } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Mode, TargetCard, Wave } from '../types'
import { createRoom, type Room } from './room'
import { createCards, type Cards } from './cards'
import { createBall, type Ball } from './ball'
import { createImpact, type Impact } from './impact'
import { createBand, type Band } from './band'
import { createHud, type Hud } from './hud'
import { createAudio, type Audio } from './audio'

const GAME_ID = 'ache-o-suspeito'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private index = 0
    private deck: TargetCard[] = []
    private mode: Mode = 'intro'
    private gen = 0

    private tries = 0
    private stalled = false

    private score = 0
    private hits = 0
    private errors = 0
    private done = 0

    private tutorialOpen = false
    private pendingTutorial = true

    private room!: Room
    private cards!: Cards
    private ball!: Ball
    private impact!: Impact
    private band!: Band
    private hud!: Hud
    private audio!: Audio

    private unsubPlatform?: () => void

    private get wave(): Wave {
        return this.level.waves[this.index]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.index = 0
        this.deck = []
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.tutorialOpen = false
        this.pendingTutorial = true
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.done = 0
    }

    create() {
        this.input.topOnly = true

        const problems = validateLevels([this.level])
        if (problems.length) console.error(`[${GAME_ID}]`, problems)

        this.room = createRoom(this)
        this.audio = createAudio(this)
        this.cards = createCards(this, index => void this.pick(index))
        this.ball = createBall(this)
        this.impact = createImpact(this)
        this.band = createBand(this)
        this.hud = createHud(this, {
            waves: this.level.waves.length,
            onHelp: () => this.replayTutorial(),
        })

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
            tint: C.coral,
            depth: DEPTH.hud + 1,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playWave(0)
    }

    private shutdownScene() {
        this.gen++
        this.band?.destroy()
        this.impact?.destroy()
        this.ball?.destroy()
        this.cards?.destroy()
        this.hud?.destroy()
        this.room?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private async playWave(index: number) {
        const gen = ++this.gen
        this.index = index
        this.mode = 'intro'
        this.tries = 0
        this.stalled = false
        this.applyInput()

        this.cards.hideLock()
        void this.band.hush()
        this.impact.clear()
        this.hud.setDone(this.done)

        this.deck = shuffled(this.wave.cards)
        this.audio.slide()
        await this.cards.show(this.deck)
        if (gen !== this.gen) return

        this.mode = 'choosing'
        this.applyInput()

        if (this.pendingTutorial && index === 0) {
            this.pendingTutorial = false
            this.runTutorial(true)
        }
    }

    private async pick(index: number) {
        if (this.mode !== 'choosing' || this.tutorialOpen) return
        const gen = this.gen
        const card = this.deck[index]

        this.mode = 'flying'
        this.applyInput()
        this.audio.tap()
        this.cards.press(index)
        this.cards.focus(index)
        this.cards.hideLock()
        void this.band.hush()

        this.audio.fly()
        await this.ball.launch(this.cards.centerOf(index))
        if (gen !== this.gen) return

        if (isSuspicious(card)) await this.succeed(index, card)
        else await this.stall(index, card)
    }

    private async succeed(index: number, card: TargetCard) {
        const gen = this.gen
        this.mode = 'impact'
        this.applyInput()

        const points = this.stalled ? POINTS_AFTER_STALL : POINTS_CLEAN
        this.score += points
        this.hits += 1
        this.done += 1

        const from = this.cards.centerOf(index)
        this.audio.crumple()
        await FX.all(this.ball.vanish(), this.cards.crumple(index))
        if (gen !== this.gen) return

        void FX.sparks(this, from.x, from.y, { color: C.green, count: 16, spread: 150, depth: DEPTH.fx })
        await this.impact.play(from, card.kind, card.audience, () => this.audio.copies(1))
        if (gen !== this.gen) return

        void this.band.say(card.note, 'good')
        this.audio.deliver()
        await this.cards.deliver()
        if (gen !== this.gen) return

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.audio.wave()
        await this.hud.celebrate(this.done - 1)
        if (gen !== this.gen) return
        await FX.wait(this, 1200)
        if (gen !== this.gen) return

        void this.band.hush()
        const next = this.index + 1
        if (next < this.level.waves.length) void this.playWave(next)
        else void this.endLevel()
    }

    private async stall(index: number, card: TargetCard) {
        const gen = this.gen
        this.tries += 1

        this.audio.bounce()
        void this.ball.bounceOff()
        await this.cards.shake(index)
        if (gen !== this.gen) return

        this.cards.showLock(index)
        void this.band.say(card.note, 'warn')

        if (!this.stalled) {
            this.stalled = true
            this.errors += 1
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER',
                gameId: GAME_ID,
                pointsEarned: 0,
                stage: this.level.level,
            })
            this.lives.lose()
            this.livesLeft = this.lives.remaining
        }

        await FX.wait(this, 900)
        if (gen !== this.gen) return

        if (this.tries >= 2) {
            const right = this.deck.findIndex(isSuspicious)
            if (right >= 0) this.cards.pulse(right)
        }

        this.mode = 'choosing'
        this.applyInput()
    }

    private async endLevel() {
        const gen = ++this.gen
        this.mode = 'done'
        this.applyInput()
        this.hud.setEnabled(false)

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
        void FX.confetti(this, { colors: [C.cyan, C.green, C.amber, C.blue] })

        await FX.wait(this, 1100)
        if (gen !== this.gen) return

        showLevelComplete(this, {
            accent: C.blue,
            panelColor: C.paper,
            overlayColor: C.ink,
            depth: 5000,
            title: 'Protetor de dados!',
            message: 'Antes de compartilhar, veja qual é o dado, de quem ele é e até onde pode chegar.',
            progress: { total: LEVELS.length, current: LEVELS.length, size: 9 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.green,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.blue,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private applyInput() {
        const free = !this.tutorialOpen && this.mode === 'choosing'
        this.cards.setEnabled(free, !this.tutorialOpen && this.mode === 'flying')
    }

    private tutorialSteps(full: boolean) {
        const steps = [
            {
                text: 'Leia o dado e o destino de cada placa.',
                shape: 'rect' as const,
                ...this.cards.bounds(),
                balloonX: 640,
                balloonY: 600,
            },
            {
                text: 'Ache o compartilhamento suspeito.',
                shape: 'rect' as const,
                ...this.hud.orderBounds(),
                balloonX: 640,
                balloonY: 260,
            },
            {
                text: 'Toque na placa: a bolinha vai sozinha até ela.',
                shape: 'rect' as const,
                x: CARD.xs[0],
                y: CARD.y + CARD.h / 2,
                w: CARD.w + 26,
                h: CARD.h + 26,
                balloonX: 900,
                balloonY: 600,
                buttonLabel: 'Vamos!',
                pointer: {
                    fromX: CARD.xs[0],
                    fromY: CARD.y + CARD.h / 2,
                    toX: CARD.xs[0],
                    toY: CARD.y + CARD.h / 2,
                    tap: true,
                },
            },
        ]
        return full ? steps : steps.slice(1)
    }

    private runTutorial(once: boolean, full = true) {
        this.tutorialOpen = true
        this.applyInput()
        this.hud.setEnabled(false)
        createTutorial(this, {
            key: `ef03co09-ache-o-suspeito-l${this.level.level}`,
            once,
            accent: C.cyan,
            safeTop: HUD.h + 14,
            steps: this.tutorialSteps(full),
            onFinish: () => {
                this.tutorialOpen = false
                this.hud.setEnabled(true)
                this.applyInput()
            },
        })
    }

    private replayTutorial() {
        if (this.tutorialOpen || this.mode !== 'choosing') return
        this.runTutorial(false)
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.waves.length
        const done = complete ? total : this.done
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
