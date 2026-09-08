import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS } from '../data/levels'
import { answerOf, solves } from '../data/statements'
import { BOARD, HUD, cardsBounds, plateBounds } from '../data/layout'
import { C } from '../data/theme'
import type { LevelDef, LevelNumber, Phase, Statement, Token } from '../types'
import { createAudio, type Audio } from './audio'
import { createArena, type Arena } from './arena'
import { createFighters, type Fighters } from './fighters'
import { createRope, type Rope } from './rope'
import { createBoard, type Board } from './board'
import { createCards, type Cards } from './cards'
import { createThinkBar, type ThinkBar } from './thinkBar'
import { createHud, type Hud } from './hud'
import { showBalloon } from './balloon'

const GAME_ID = 'cabo-de-guerra-da-verdade'

const HINT = 'Escolha a palavra que deixa a frase do jeito que o robô pediu.'

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private phase: Phase = 'intro'
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0

    private queue: Statement[] = []
    private current!: Statement
    private repeated = new Set<string>()
    private missesHere = 0
    private wins = 0
    private robotPulls = 0

    private audio!: Audio
    private arena!: Arena
    private fighters!: Fighters
    private rope!: Rope
    private board!: Board
    private cards!: Cards
    private think!: ThinkBar
    private hud!: Hud

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.phase = 'intro'
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.queue = []
        this.repeated = new Set()
        this.missesHere = 0
        this.wins = 0
        this.robotPulls = 0
    }

    create() {
        this.audio = createAudio(this)
        this.arena = createArena(this)
        this.fighters = createFighters(this)
        this.rope = createRope(this)
        this.board = createBoard(this)
        this.cards = createCards(this, { onPick: token => this.onPick(token) })
        this.think = createThinkBar(this, { onFull: () => void this.robotPull() })
        this.hud = createHud(this, {
            level: this.level.level,
            totalLevels: LEVELS.length,
            onHelp: () => this.replayTutorial(),
        })

        this.cards.setLabels(this.level.labels)
        this.cards.setEnabled(false)

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
            size: 30,
            tint: C.no,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.startLevel()
    }

    private shutdownScene() {
        this.gen++
        this.audio?.stopTicking()
        this.think?.destroy()
        this.cards?.destroy()
        this.board?.destroy()
        this.rope?.destroy()
        this.fighters?.destroy()
        this.hud?.destroy()
        this.arena?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    update(_time: number, delta: number) {
        if (this.phase !== 'playing') return
        this.think.tick(delta)
    }

    private async startLevel() {
        const gen = ++this.gen
        this.queue = [...this.level.statements]
        this.hud.setTitle('Cabo de guerra!')
        this.hud.setHint(HINT)
        this.fighters.idle()

        await FX.wait(this, 300)
        if (gen !== this.gen) return

        this.current = this.queue.shift()!
        await this.board.show(this.current)
        if (gen !== this.gen) return
        await this.cards.enter()
        if (gen !== this.gen) return

        this.phase = 'tutorial'
        await this.runTutorial(true)
        if (gen !== this.gen) return

        this.beginRound()
    }

    private beginRound() {
        this.missesHere = 0
        this.phase = 'playing'
        this.cards.setEnabled(true)
        this.cards.clearHint()
        this.fighters.thinking()
        this.think.start(this.level.thinkSeconds)
        this.audio.startTicking()
    }

    private async nextStatement() {
        const gen = this.gen
        this.think.stop()
        this.audio.stopTicking()
        this.cards.setEnabled(false)

        if (!this.queue.length) {
            await this.finishLevel()
            return
        }

        this.current = this.queue.shift()!
        await this.board.show(this.current)
        if (gen !== this.gen) return

        this.beginRound()
    }

    private onPick(token: Token) {
        if (this.phase !== 'playing') return
        this.phase = 'locked'
        this.think.stop()
        this.audio.stopTicking()
        this.cards.setEnabled(false)
        this.audio.tap()

        const label = this.level.labels[token]
        if (solves(this.current, token)) void this.won(label, token)
        else void this.missed(label, token)
    }

    private async won(label: string, token: Token) {
        const gen = this.gen
        const again = this.repeated.has(this.current.id)
        const earned = again ? 5 : 10

        this.score += earned
        this.hits++
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        await this.board.fill(label, token, true)
        if (gen !== this.gen) return

        this.wins++
        this.audio.pull()
        this.rope.shiver()
        void this.rope.moveTo(this.wins - this.robotPulls)
        await this.fighters.tug('child')
        if (gen !== this.gen) return

        this.audio.cheer()
        void FX.sparks(this, this.rope.markerPoint().x, this.rope.markerPoint().y, {
            color: C.gold, count: 14, spread: 170, duration: 520,
        })
        await FX.wait(this, 420)
        if (gen !== this.gen) return

        this.emitCheckpoint()
        await this.nextStatement()
    }

    private async missed(label: string, token: Token) {
        const gen = this.gen
        this.errors++
        this.missesHere++

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.audio.wrong()
        this.hud.flash(C.no)
        await this.board.fill(label, token, false)
        if (gen !== this.gen) return

        this.robotPulls++
        this.audio.robotPull()
        void this.rope.moveTo(this.wins - this.robotPulls)
        await this.fighters.tug('robot')
        if (gen !== this.gen) return

        await showBalloon(this, this.current.explain, 1500)
        if (gen !== this.gen) return

        if (this.missesHere >= 2) {
            this.cards.hint(answerOf(this.current))
            await FX.wait(this, 900)
            if (gen !== this.gen) return
        }

        this.repeated.add(this.current.id)
        this.queue.push(this.current)
        this.emitCheckpoint()
        await this.nextStatement()
    }

    private async robotPull() {
        if (this.phase !== 'playing') return
        this.phase = 'locked'
        this.cards.setEnabled(false)
        this.audio.stopTicking()

        this.robotPulls++
        this.audio.robotPull()
        void this.rope.moveTo(this.wins - this.robotPulls)
        this.hud.say('O robô puxou! A frase continua aí.', undefined)
        await this.fighters.tug('robot')

        if (this.phase !== 'locked') return
        this.beginRound()
    }

    private async finishLevel() {
        this.gen++
        this.phase = 'done'
        this.cards.setEnabled(false)
        this.hud.setEnabled(false)
        this.hud.setTitle('Você puxou a corda!')
        this.hud.setHint('')

        await this.rope.slideHome()
        this.audio.win()
        void this.fighters.cheer('child')
        void FX.confetti(this, { colors: [C.gold, C.child, C.deny, C.yes] })

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.level.level,
            totalStages: LEVELS.length,
            score: Math.max(0, this.score),
            errors: this.errors,
        })
        this.emitCheckpoint(true)

        const done = this.level.level

        if (done < LEVELS.length) {
            showLevelComplete(this, {
                title: `${this.level.name} vencido!`,
                subtitle: 'O robô quer a revanche.',
                accent: C.wood,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: done, size: 8 },
                autoAdvance: {
                    delay: 2600,
                    label: 'O robô está esticando a corda...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Você puxou a corda!',
            subtitle: 'O NÃO vira a frase do avesso, e você percebeu.',
            accent: C.wood,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 8 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.yes,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.wood,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const plate = plateBounds()
        const cards = cardsBounds()
        const right = this.cards.pointOf(answerOf(this.current))

        if (this.level.level > 1) {
            return [{
                text: this.level.level === 2
                    ? 'Agora ele pede as duas coisas.'
                    : 'NUNCA também é um jeito de negar.',
                shape: 'rect',
                x: plate.x, y: plate.y, w: plate.w, h: plate.h,
                balloonX: BOARD.cx,
                buttonLabel: 'Vamos lá!',
            }]
        }

        return [
            {
                text: 'O robô quer uma frase VERDADEIRA.',
                shape: 'rect',
                x: plate.x, y: plate.y, w: plate.w, h: plate.h,
                balloonX: BOARD.cx,
            },
            {
                text: 'Escolha a palavra que faz isso.',
                shape: 'rect',
                x: cards.x, y: cards.y, w: cards.w, h: cards.h,
                balloonX: BOARD.cx,
                pointer: { fromX: right.x, fromY: right.y, toX: right.x, toY: right.y, tap: true },
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef03co01-cabo-l${this.level.level}`,
                once,
                accent: C.wood,
                safeTop: HUD.h + 10,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'playing') return
        const gen = this.gen

        this.phase = 'tutorial'
        this.think.pause()
        this.audio.stopTicking()
        this.hud.setEnabled(false)
        this.cards.setEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'playing'
            this.hud.setEnabled(true)
            this.cards.setEnabled(true)
            this.think.resume()
            this.audio.startTicking()
        })
    }

    private emitCheckpoint(complete = false) {
        const total = this.level.statements.length
        const done = complete ? total : this.wins
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
