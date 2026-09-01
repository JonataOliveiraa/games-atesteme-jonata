import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import {
    KEY_LINE, LEVELS, PASSES_PER_PHASE, PHASE_CHEER, TOTAL_PASSES,
    dealPlaques, missSentence, passesBefore, passesInLevel, planPhase,
    sameInformation, type PhasePlan,
} from '../data/messages'
import { C } from '../data/theme'
import { DESTINATION, HEADER_CARD, W } from '../data/layout'
import type {
    LevelDef, LevelNumber, Message, PhaseDef, PlayState, Teammate,
} from '../types'
import { createAudio } from './audio'
import { createBall } from './ball'
import { createCourt } from './court'
import { createHeader } from './header'
import { createMural, type Delivered } from './mural'
import { createTalk } from './talk'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'passe-da-mensagem'
const MAX_STEP_MS = 34

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelDef!: LevelDef
    private phaseIndex = 0
    private phase!: PhaseDef

    private plan!: PhasePlan
    private mates: Teammate[] = []
    private ballMessage!: Message
    /** Quantos passes desta fase já saíram. O último entrega no destino. */
    private step = 0
    private holderAt = { x: 0, y: 0 }

    private state: PlayState = 'intro'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private firstTry = 0
    private resolved = 0
    private missesHere = 0
    private delivered: Delivered[] = []

    private court!: ReturnType<typeof createCourt>
    private ball!: ReturnType<typeof createBall>
    private header!: ReturnType<typeof createHeader>
    private mural!: ReturnType<typeof createMural>
    private talk!: ReturnType<typeof createTalk>
    private audio!: ReturnType<typeof createAudio>

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.levelDef = LEVELS[number - 1]
        this.phaseIndex = 0
        this.phase = this.levelDef.phases[0]

        this.state = 'intro'
        this.paused = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.firstTry = 0
        this.resolved = 0
        this.missesHere = 0
        this.step = 0
        this.mates = []
        this.delivered = []
    }

    create() {
        this.input.topOnly = true

        this.talk = createTalk(this)
        this.mural = createMural(this)
        this.audio = createAudio(this)
        this.court = createCourt(this)
        this.ball = createBall(this)
        this.header = createHeader(this, this.levelDef.phases.length, () => this.replayTutorial())
        this.header.setLevel(this.levelDef.level, LEVELS.length)

        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startPhase()
        this.state = 'tutorial'
        this.court.setEnabled(false)
        this.runTutorial(true, () => {
            this.state = 'playing'
            this.court.setEnabled(true)
        })

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 191,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    update(_time: number, delta: number) {
        if (this.paused) return
        this.talk.update(Math.min(delta, MAX_STEP_MS))
    }

    private shutdownScene() {
        this.gen++
        this.court?.destroy()
        this.ball?.destroy()
        this.header?.destroy()
        this.mural?.destroy()
        this.talk?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────── as fases

    private startPhase() {
        this.phase = this.levelDef.phases[this.phaseIndex]
        this.plan = planPhase(this.phase, Math.random)
        this.step = 0
        this.missesHere = 0

        this.court.build(this.phase.players, i => this.onTapMate(i))
        this.header.setPhase(this.phaseIndex)

        /*
         * Quem começa com a bola é o primeiro colega da lista, e ele NÃO tem
         * plaquinha própria em jogo: a mensagem que ele segura é a do painel.
         * Sem isso a criança poderia passar a bola para quem já está com ela.
         */
        this.holderAt = this.court.at(0)
        this.ballMessage = { subject: this.plan.subject, language: this.plan.chain[0] }
        this.header.setMessage(this.plan.subject)
        this.ball.show(this.holderAt.x, this.holderAt.y)
        this.court.spotlight(0)

        this.dealStep()
    }

    /** Espalha as plaquinhas desta parada: uma certa, o resto de outros assuntos. */
    private dealStep() {
        const right = this.plan.chain[this.step + 1]
        const others = this.phase.players - 1
        const cards = dealPlaques(this.phase, this.plan, right, others, Math.random)

        this.mates = []
        let cursor = 0
        for (let i = 0; i < this.phase.players; i++) {
            if (i === this.holderIndex()) continue
            const message = cards[cursor++]
            const spot = this.court.at(i)
            this.court.setPlaque(i, message)
            this.court.setPlaqueVisible(i, true)
            this.mates.push({ index: i, x: spot.x, y: spot.y, message, blocked: false })
        }

        this.court.unblockAll()
        this.court.setPlaqueVisible(this.holderIndex(), false)
        this.court.spotlight(this.holderIndex())
        this.court.armGoal(this.isLastStep())
        this.header.setHint(
            this.isLastStep()
                ? 'Último passe: mande para quem diz a MESMA coisa'
                : 'Toque em quem diz a MESMA coisa',
        )
    }

    private lastReceiver = 0

    private holderIndex() {
        return this.step === 0 ? 0 : this.lastReceiver
    }

    private isLastStep() {
        return this.step === PASSES_PER_PHASE - 1
    }

    // ─────────────────────────────────────────────────────── o passe

    private onTapMate(index: number) {
        if (this.paused || this.state !== 'playing') return
        const mate = this.mates.find(m => m.index === index)
        if (!mate || mate.blocked) return

        this.audio.tap()
        this.court.press(index)

        if (sameInformation(this.ballMessage, mate.message)) void this.succeed(mate)
        else void this.miss(mate)
    }

    private async succeed(mate: Teammate) {
        const gen = this.gen
        this.state = 'passing'
        this.court.setEnabled(false)
        this.talk.hush()

        const first = this.missesHere === 0
        const points = first ? 10 : 5
        this.score += points
        this.hits += 1
        this.resolved += 1
        if (first) this.firstTry += 1

        this.audio.pass()
        this.court.drawLane(
            { x: this.holderAt.x, y: this.holderAt.y - 120 },
            { x: mate.x, y: mate.y - 120 },
            C.warn,
        )

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()

        await this.ball.passTo(mate.x, mate.y)
        if (gen !== this.gen) return

        this.court.clearLane()
        this.audio.land()
        this.talk.flash(C.ok)
        void FX.sparks(this, mate.x, mate.y - 120, { color: C.ok, count: 20, spread: 180 })

        this.step += 1
        this.missesHere = 0
        this.lastReceiver = mate.index
        this.holderAt = { x: mate.x, y: mate.y }

        // a mensagem passou a ser a que ESTE colega dizia: mesmo assunto,
        // outra linguagem. O topo não muda — o que muda é o jeito, e isso a
        // criança vê acontecendo na quadra, não lendo um rótulo
        this.ballMessage = mate.message
        this.ball.show(mate.x, mate.y)
        this.court.spotlight(mate.index)

        if (this.step >= PASSES_PER_PHASE) {
            void this.deliver()
            return
        }

        this.dealStep()
        this.state = 'playing'
        this.court.setEnabled(true)
    }

    /**
     * A TRAVA, e ela é sobre UMA LINHA de passe. O robô corta, devolve a bola,
     * e aquele colega para de aceitar até a próxima parada. O balão diz o que
     * não bateu — nunca qual é o certo.
     */
    private async miss(mate: Teammate) {
        const gen = this.gen
        this.state = 'locked'
        this.court.setEnabled(false)
        this.errors += 1
        this.missesHere += 1
        mate.blocked = true

        this.audio.robot()
        this.talk.flash(C.bad)
        this.cameras.main.shake(180, 0.005)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        const mid = {
            x: (this.holderAt.x + mate.x) / 2,
            y: (this.holderAt.y + mate.y) / 2,
        }
        this.court.drawBlocked(
            { x: this.holderAt.x, y: this.holderAt.y - 120 },
            { x: mate.x, y: mate.y - 120 },
        )

        await this.ball.intercept(mid.x, mid.y, this.holderAt)
        if (gen !== this.gen) return

        void this.talk.say(missSentence(mate.message), C.bad)
        this.court.block(mate.index)

        if (this.missesHere >= 2) {
            const right = this.mates.find(
                m => !m.blocked && sameInformation(this.ballMessage, m.message),
            )
            if (right) this.court.wave(right.index)
        }

        this.state = 'playing'
        this.court.setEnabled(true)
        this.restoreBlocks()
    }

    /** Devolve as travas depois de qualquer coisa que reabilite a quadra. */
    private restoreBlocks() {
        this.court.setPlaqueVisible(this.holderIndex(), false)
        this.mates.filter(m => m.blocked).forEach(m => this.court.block(m.index))
    }

    private async deliver() {
        const gen = ++this.gen
        this.state = 'mural'
        this.court.setEnabled(false)
        this.court.armGoal(false)
        this.header.setHelpEnabled(false)
        this.talk.hush()

        this.audio.crowd()
        this.talk.flash(C.ok)
        void FX.confetti(this)

        const goal = this.court.goalAt()
        await this.ball.deliver(goal.x, goal.y)
        if (gen !== this.gen) return

        this.delivered.push({ subject: this.plan.subject, chain: [...this.plan.chain] })

        await this.mural.play(
            this.delivered,
            PHASE_CHEER[this.phaseIndex % PHASE_CHEER.length],
            KEY_LINE,
        )
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.levelDef.phases.length) {
            void this.endLevel()
            return
        }

        this.phaseIndex += 1
        this.startPhase()
        this.emitCheckpoint()
        this.header.setHelpEnabled(true)
        this.state = 'playing'
        this.court.setEnabled(true)
    }

    // ─────────────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        const anchor = this.court.at(0)
        return [
            {
                text: 'Você está levando esta mensagem.',
                shape: 'rect', x: HEADER_CARD.x, y: HEADER_CARD.y, w: 420, h: 150,
                balloonX: W / 2, balloonY: 330,
            },
            {
                text: 'Toque no colega que diz A MESMA COISA de outro jeito.',
                shape: 'circle', x: anchor.x + 60, y: anchor.y - 90, w: 300, h: 300,
                balloonX: W / 2 + 180, balloonY: 300,
            },
            {
                text: 'No último passe, a mensagem vai para a caixa de recados.',
                shape: 'circle', x: DESTINATION.x, y: DESTINATION.y,
                w: DESTINATION.size * 2.2, h: DESTINATION.size * 2.2,
                balloonX: W / 2 - 100, balloonY: 300,
                buttonLabel: 'Vamos jogar!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            key: `ef01co04-passe-l${this.levelDef.level}`,
            once,
            accent: C.shirt,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state !== 'playing' && this.state !== 'locked') return
        const previous = this.state
        this.state = 'tutorial'
        this.header.setHelpEnabled(false)
        this.court.setEnabled(false)
        this.runTutorial(false, () => {
            this.state = previous
            this.header.setHelpEnabled(true)
            this.court.setEnabled(true)
            this.restoreBlocks()
        })
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.header.setHelpEnabled(false)
        this.ball.hide()

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED',
            gameId: GAME_ID,
            stage: this.levelDef.level,
            totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)
        if (gen !== this.gen) return

        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `${this.levelDef.name} completo!`,
                subtitle: 'Três mensagens entregues, cada uma por vários jeitos',
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: 'Preparando a próxima partida...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.score }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Craque dos recados!',
            subtitle: 'A mesma informação, dita de todos os jeitos',
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.shirt,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────────────── plataforma

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
                if (command.stage && command.stage !== this.levelDef.level) {
                    this.scene.restart({ lives: this.livesLeft, level: command.stage, points: this.score })
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
