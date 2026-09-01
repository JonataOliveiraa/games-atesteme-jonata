import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import {
    HINT_CHOOSE, HINT_DELIVER, HINT_PASS, HINT_WAIT, KEY_LINE, LEVELS,
    MISS_BLOCKED, MISS_WRONG_GOAL, RUN_CHEER, SAME_LINE, TOTAL_PASSES,
    castFor, mediaChain, passesBefore, passesInLevel, planSubjects, rightGoal,
} from '../data/levels'
import { C } from '../data/theme'
import { MESSAGE, TO } from '../data/layout'
import type {
    LevelDef, LevelNumber, MediumId, Point, SubjectDef, Target,
} from '../types'
import { createAudio } from './audio'
import { createBall, showSameProof } from './ball'
import { createCourt } from './court'
import { createHeader } from './header'
import { createLines, pathIsHit } from './lines'
import { createRobot } from './robot'
import { createTalk } from './talk'

const GAME_ID = 'passe-da-mensagem'
const MAX_STEP_MS = 34

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private levelDef!: LevelDef
    private cast = { mates: [0, 1, 2, 3], goals: [5] }
    private subjects: SubjectDef[] = []

    /** Qual travessia, e em que passe dela. */
    private runIndex = 0
    private step = 0

    private subject!: SubjectDef
    private chain: MediumId[] = []
    private holder = 0
    private goalIndex = 0

    private state: 'tutorial' | 'playing' | 'passing' | 'locked' | 'delivering' | 'ending' = 'tutorial'
    private paused = false
    private gen = 0
    private provedSame = false

    private score = 0
    private hits = 0
    private errors = 0
    private resolved = 0
    private missesHere = 0

    private court!: ReturnType<typeof createCourt>
    private lines!: ReturnType<typeof createLines>
    private robot!: ReturnType<typeof createRobot>
    private ball!: ReturnType<typeof createBall>
    private header!: ReturnType<typeof createHeader>
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

        this.state = 'tutorial'
        this.paused = false
        this.provedSame = false
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

        this.cast = castFor(this.levelDef)
        this.subjects = planSubjects(this.levelDef, Math.random)

        this.talk = createTalk(this)
        this.audio = createAudio(this)
        this.court = createCourt(this, this.levelDef.goals, (kind, i) => this.onTap(kind, i))
        this.lines = createLines(this)
        this.robot = createRobot(this)
        this.ball = createBall(this)
        this.header = createHeader(this, () => this.replayTutorial())

        this.header.setLevel(this.levelDef.level, LEVELS.length)
        this.header.resetMural(this.levelDef.runs)
        this.cast.goals.forEach((frame, i) => this.court.setGoalFace(i, frame))
        this.robot.start(this.levelDef.robot)

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startRun()
        this.court.setEnabled(false)
        this.runTutorial(true, () => this.leaveTutorial())

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 181,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    update(time: number, delta: number) {
        if (this.paused) return
        const dt = Math.min(delta, MAX_STEP_MS)
        this.talk.update(dt)
        this.robot.update(dt)

        if (this.state !== 'playing') {
            this.lines.clear()
            return
        }

        const targets = this.targets()
        const free = this.lines.refresh(this.ball.at(), targets, this.robot.at, time)
        /* Só um alvo VÁLIDO livre conta: no nível 3 o destinatário errado pode
         * estar aberto, e isso não é motivo para mandar a criança jogar. */
        const canPlay = targets.some((t, i) =>
            free[i] && (t.kind !== 'goal' || t.index === this.goalIndex))
        this.header.setHint(canPlay ? this.stepHint() : HINT_WAIT)
    }

    private shutdownScene() {
        this.gen++
        this.court?.destroy()
        this.lines?.destroy()
        this.robot?.destroy()
        this.ball?.destroy()
        this.header?.destroy()
        this.talk?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────── a travessia

    /**
     * Cada travessia é: sai de um colega, passa por outro, entrega no
     * destinatário. Dois toques, e três meios — o recado começa num, e a roda
     * avança a cada passe.
     */
    private startRun() {
        this.subject = this.subjects[this.runIndex]
        this.chain = mediaChain(this.runIndex)
        this.step = 0
        this.missesHere = 0
        this.holder = 0
        this.goalIndex = rightGoal(this.levelDef, this.runIndex)

        this.header.setMessage(this.subject, this.subject.texture)
        this.header.setRecipient(this.cast.goals[this.goalIndex])
        this.court.spotlight(this.holder)
        this.ball.show(this.court.mateHook(this.holder), this.subject, this.chain[0])
        this.header.setHint(this.stepHint())
    }

    /** Passe 1 escolhe entre colegas; passe 2 é a entrega. Um alvo por vez. */
    private targets(): Target[] {
        return this.step === 0
            ? this.court.targets('mate', this.holder)
            : this.court.targets('goal')
    }

    private stepHint() {
        if (this.step === 0) return HINT_PASS
        return this.levelDef.goals > 1 ? HINT_CHOOSE : HINT_DELIVER
    }

    // ─────────────────────────────────────────────── o toque

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
        if (pathIsHit(this.ball.at(), target.hook, this.robot.at)) {
            void this.missBlocked(target)
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
        this.state = 'passing'
        this.court.setEnabled(false)
        this.lines.clear()
        this.talk.hush()
        this.reward()

        if (target.kind === 'goal') {
            void this.deliver(target)
            return
        }

        this.audio.pass()
        await this.ball.passTo(target.hook)
        if (gen !== this.gen) return

        this.audio.land()
        this.talk.flash(C.ok)
        this.court.cheer('mate', target.index)
        void FX.sparks(this, target.hook.x, target.hook.y, { color: C.ok, count: 18, spread: 170 })

        const before = this.chain[this.step]
        const after = this.chain[this.step + 1]
        await this.ball.morph(this.subject, after)
        if (gen !== this.gen) return

        /* A PROVA. O recado mudou de casca na frente da criança, e o desenho de
         * dentro continua o mesmo — a frase só aparece na primeira vez do
         * nível, para não virar leitura obrigatória a cada passe. */
        await showSameProof(
            this, this.subject, before, after, target.hook,
            this.provedSame ? undefined : SAME_LINE,
        )
        if (gen !== this.gen) return
        this.provedSame = true

        this.step += 1
        this.missesHere = 0
        this.holder = target.index
        this.court.spotlight(this.holder)
        this.state = 'playing'
        this.court.setEnabled(true)
    }

    /**
     * A ENTREGA. O recado chega no destinatário, vira a última casca e é
     * guardado no mural — que é a parte da habilidade que fala de informação
     * ARMAZENADA.
     */
    private async deliver(target: Target) {
        const gen = ++this.gen
        this.state = 'delivering'
        this.header.setHelpEnabled(false)

        this.audio.pass()
        await this.ball.passTo(target.hook)
        if (gen !== this.gen) return

        /* A terceira casca. Sem ela a criança só veria DUAS formas do recado, e
         * os três carimbos do mural seriam uma promessa que o jogo não cumpre. */
        this.audio.land()
        const before = this.chain[this.step]
        const after = this.chain[this.step + 1]
        await this.ball.morph(this.subject, after)
        if (gen !== this.gen) return

        await showSameProof(this, this.subject, before, after, target.hook)
        if (gen !== this.gen) return

        this.header.setHint('Recado entregue e guardado!')
        await this.ball.deliver(target.hook)
        if (gen !== this.gen) return

        this.audio.crowd()
        this.talk.flash(C.ok)
        this.court.cheer('goal', target.index)
        void FX.confetti(this, { count: 34, duration: 1500 })
        void FX.sparks(this, target.hook.x, target.hook.y, { color: C.warn, count: 22, spread: 200 })

        await this.header.store(this.subject, this.chain, this.levelDef.runs)
        if (gen !== this.gen) return

        await this.talk.say(RUN_CHEER[this.runIndex % RUN_CHEER.length], C.ok)
        await FX.wait(this, 800)
        if (gen !== this.gen) return
        this.talk.hush()

        if (this.runIndex + 1 >= this.levelDef.runs) {
            void this.endLevel()
            return
        }

        this.runIndex += 1
        this.startRun()
        this.emitCheckpoint()
        this.header.setHelpEnabled(true)
        this.state = 'playing'
        this.court.setEnabled(true)
    }

    // ─────────────────────────────────────────────── o erro

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

    /** Passou pelo robô: ele ergue a bola, faz cara boba e devolve. */
    private async missBlocked(target: Target) {
        const gen = this.gen
        this.state = 'locked'
        this.court.setEnabled(false)
        this.penalize()

        this.audio.robot()
        this.talk.flash(C.bad)
        this.cameras.main.shake(170, 0.005)
        this.court.deny(target.kind, target.index)

        const back = this.ball.at()
        await this.ball.intercept(
            { x: this.robot.at.x, y: this.robot.at.y - 30 },
            back,
            () => this.robot.gloat(),
        )
        if (gen !== this.gen) return

        void this.talk.say(MISS_BLOCKED, C.bad)
        await FX.wait(this, 900)
        if (gen !== this.gen) return
        this.talk.hush()

        this.afterMiss()
    }

    /** Entregou para o colega errado: o rosto do topo é que manda. */
    private async missWrongGoal(target: Target) {
        const gen = this.gen
        this.state = 'locked'
        this.court.setEnabled(false)
        this.penalize()

        this.audio.robot()
        this.talk.flash(C.bad)
        this.cameras.main.shake(150, 0.004)
        this.court.deny('goal', target.index)

        void this.talk.say(MISS_WRONG_GOAL, C.bad)
        await FX.wait(this, 1200)
        if (gen !== this.gen) return
        this.talk.hush()

        this.afterMiss()
    }

    /** Depois de dois erros seguidos, quem está livre acena. */
    private afterMiss() {
        if (this.missesHere >= 2) {
            const safe = this.targets().find(t => {
                if (t.kind === 'goal' && t.index !== this.goalIndex) return false
                return !pathIsHit(this.ball.at(), t.hook, this.robot.at)
            })
            if (safe) this.court.wave(safe.kind, safe.index)
        }
        this.state = 'playing'
        this.court.setEnabled(true)
    }

    // ─────────────────────────────────────────────── tutorial

    /** Dois passos: o que levar e para quem, e a regra do caminho verde. */
    private tutorialSteps(): TutorialStep[] {
        const target: Point = this.court.mateHook(2)
        return [
            {
                text: 'Leve este recado até o colega da direita.',
                shape: 'rect', x: (MESSAGE.x + TO.x) / 2, y: MESSAGE.y, w: 760, h: 130,
                balloonX: 640, balloonY: 380,
            },
            {
                text: 'Toque num colega pelo caminho VERDE. O robô fecha o vermelho.',
                shape: 'circle', x: target.x, y: target.y + 40, w: 420, h: 420,
                balloonX: 430, balloonY: 620,
                pointer: { fromX: target.x, fromY: target.y, toX: target.x, toY: target.y, tap: true },
                buttonLabel: 'Vamos jogar!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            /* Uma chave só para os três níveis: a mecânica não muda, e repetir
             * o tutorial a cada troca de nível atrapalha quem já sabe. */
            key: 'ef01co04-passe',
            once,
            accent: C.shirt,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    /**
     * Devolver o jogo à criança só vale se ela ainda estiver parada no
     * tutorial. O painel some com uma animação, e o `onFinish` pode chegar
     * depois de um passe já ter começado — sem esta guarda ele reabriria a
     * quadra no meio do voo da bola.
     */
    private leaveTutorial() {
        if (this.state !== 'tutorial') return
        this.state = 'playing'
        this.header.setHelpEnabled(true)
        this.court.setEnabled(true)
    }

    private replayTutorial() {
        if (this.state !== 'playing') return
        this.state = 'tutorial'
        this.header.setHelpEnabled(false)
        this.court.setEnabled(false)
        this.lines.clear()
        this.runTutorial(false, () => this.leaveTutorial())
    }

    // ─────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.header.setHelpEnabled(false)
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
        await FX.wait(this, 420)
        if (gen !== this.gen) return

        const level = this.levelDef.level

        if (level < LEVELS.length) {
            const next = (level + 1) as LevelNumber
            showLevelComplete(this, {
                title: `${this.levelDef.name} completo!`,
                subtitle: KEY_LINE,
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2400,
                    label: 'Preparando a próxima partida...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft, level: next, points: this.score,
                    }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Craque dos recados!',
            subtitle: KEY_LINE,
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal, level: 1, points: 0,
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

    // ─────────────────────────────────────────────── plataforma

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
                    this.scene.restart({
                        lives: this.livesLeft, level: command.stage, points: this.score,
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

