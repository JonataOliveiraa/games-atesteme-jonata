import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import {
    ALGORITHM_LINE, LEVELS, PHASE_CHEER, TOTAL_MARKS,
    bumpSentence, marksBefore, marksInLevel, solves,
} from '../data/levels'
import { C } from '../data/theme'
import {
    CARD, COURSE, GO, GROUND, RABBIT, SLOT, W,
} from '../data/layout'
import type {
    ActionKind, LevelDef, LevelNumber, PhaseDef, PlayState,
} from '../types'
import { createAudio } from './audio'
import { createHud } from './hud'
import { createPalette } from './palette'
import { createReplay } from './replay'
import { createTalk } from './talk'
import { createTrack, createHelpButton } from './track'
import { createWorld } from './world'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'pulo-programado'
const MAX_STEP_MS = 34

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelDef!: LevelDef
    private phaseIndex = 0
    private phase!: PhaseDef

    private state: PlayState = 'intro'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private cleanPhases = 0
    private resolved = 0
    /** Erros por quadrado nesta fase: dois no mesmo e a carta certa pisca. */
    private slotMistakes: number[] = []
    private phaseClean = true

    private world!: ReturnType<typeof createWorld>
    private track!: ReturnType<typeof createTrack>
    private palette!: ReturnType<typeof createPalette>
    private talk!: ReturnType<typeof createTalk>
    private replay!: ReturnType<typeof createReplay>
    private help!: ReturnType<typeof createHelpButton>
    private hud!: ReturnType<typeof createHud>
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
        this.cleanPhases = 0
        this.resolved = 0
        this.slotMistakes = []
        this.phaseClean = true
    }

    create() {
        this.input.topOnly = true

        this.talk = createTalk(this)
        this.replay = createReplay(this)
        this.audio = createAudio(this)
        this.help = createHelpButton(this, () => this.replayTutorial())
        this.hud = createHud(this, this.levelDef.phases.length)
        this.hud.setLevel(this.levelDef.level, LEVELS.length)
        this.hud.setPhase(0)

        this.buildPhase()
        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.state = 'tutorial'
        this.runTutorial(true, () => {
            this.state = 'building'
            this.hud.setRunning(true)
        })

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.levelDef.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
    }

    update(_time: number, delta: number) {
        if (this.paused) return
        const step = Math.min(delta, MAX_STEP_MS)
        this.talk.update(step)
        this.hud.tick(step)
        this.world.update()
    }

    private shutdownScene() {
        this.gen++
        this.world?.destroy()
        this.track?.destroy()
        this.palette?.destroy()
        this.talk?.destroy()
        this.replay?.destroy()
        this.help?.destroy()
        this.hud?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────── as fases

    private buildPhase() {
        this.phase = this.levelDef.phases[this.phaseIndex]
        this.slotMistakes = this.phase.marks.map(() => 0)
        this.phaseClean = true

        this.world?.destroy()
        this.track?.destroy()
        this.palette?.destroy()

        this.world = createWorld(this, this.phase.marks)
        this.track = createTrack(this, this.phase.marks.length, i => this.onTapSlot(i))
        this.palette = createPalette(
            this,
            this.phase.palette,
            kind => this.onCard(kind),
            () => void this.run(),
        )
        this.palette.setReady(false)
        this.help.setEnabled(true)
    }

    private async finishPhase() {
        const gen = ++this.gen
        this.state = 'replay'
        this.hud.setRunning(false)
        this.palette.setEnabled(false)
        this.help.setEnabled(false)
        this.track.idle()
        this.talk.flash(C.ok)
        this.audio.fanfare()
        void FX.confetti(this)

        if (this.phaseClean) this.cleanPhases += 1

        await this.replay.play(
            this.track.program.filter(Boolean) as ActionKind[],
            PHASE_CHEER[this.phaseIndex % PHASE_CHEER.length],
            ALGORITHM_LINE,
        )
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.levelDef.phases.length) {
            void this.endLevel()
            return
        }

        this.phaseIndex += 1
        this.buildPhase()
        this.hud.setPhase(this.phaseIndex)
        this.hud.setRunning(true)
        this.emitCheckpoint()
        this.state = 'building'
    }

    // ─────────────────────────────────────────────────────── montar

    private onCard(kind: ActionKind) {
        if (this.paused || this.state !== 'building') return
        const slot = this.track.firstEmpty()
        if (slot < 0) return

        this.audio.snap()
        void this.track.place(slot, kind)

        /*
         * O VAI acende AGORA, e não quando a animação da carta terminar. O
         * botão principal do jogo não pode depender de um tween acabar: basta
         * a aba perder o foco no meio do voo para a lista ficar cheia e o
         * botão apagado.
         */
        this.palette.setReady(this.track.isFull())
    }

    /**
     * Tocar num quadrado cheio devolve a carta. É a REORGANIZAÇÃO, e ela vale
     * a qualquer momento em que se esteja montando — não só depois de errar.
     */
    private onTapSlot(index: number) {
        if (this.paused || this.state !== 'building') return
        if (!this.track.program[index]) return
        this.audio.unsnap()
        this.track.clear(index)
        this.palette.setReady(this.track.isFull())
        this.talk.hush()
    }

    // ─────────────────────────────────────────────────────── rodar

    private async run() {
        if (this.state !== 'building' || !this.track.isFull()) return
        const gen = ++this.gen

        this.state = 'running'
        this.palette.setEnabled(false)
        this.palette.setReady(false)
        this.talk.hush()
        this.audio.go()
        this.world.reset()

        const marks = this.phase.marks
        const program = this.track.program as ActionKind[]

        for (let i = 0; i < marks.length; i++) {
            this.track.setActive(i)
            this.world.highlight(i)

            await this.world.walkTo(this.world.markX(i) - 118)
            if (gen !== this.gen) return

            if (!solves(marks[i], program[i])) {
                void this.trip(i)
                return
            }

            if (program[i] === 'pular') this.audio.jump()
            else if (program[i] === 'abaixar') this.audio.duck()
            else this.audio.step()

            await this.world.act(program[i], i)
            if (gen !== this.gen) return

            this.hits += 1
            this.resolved += 1
        }

        this.track.idle()
        this.world.highlight(-1)
        await this.world.walkTo(RABBIT.exitX)
        if (gen !== this.gen) return

        const points = this.phaseClean ? 10 * marks.length : 5 * marks.length
        this.score += points
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()

        await this.world.cheer()
        if (gen !== this.gen) return
        void this.finishPhase()
    }

    /**
     * A TRAVA, e ela é sobre UM QUADRADO. O mundo para, o quadrado culpado
     * ganha brilho vermelho e tremor, e o balão diz o que estava ali — nunca
     * "tente de novo" e nunca a resposta. Só trocar aquela carta destrava.
     */
    private async trip(index: number) {
        const gen = this.gen
        this.state = 'locked'
        this.errors += 1
        this.phaseClean = false
        this.slotMistakes[index] += 1

        this.audio.bump()
        this.talk.flash(C.bad)
        this.cameras.main.shake(200, 0.006)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        await this.world.bump()
        if (gen !== this.gen) return

        void this.talk.say(bumpSentence(this.phase.marks[index]), C.bad)
        await this.track.blame(index)
        if (gen !== this.gen) return

        if (this.slotMistakes[index] >= 2) {
            const right = this.phase.palette.find(
                kind => solves(this.phase.marks[index], kind),
            )
            if (right) this.palette.hint(right)
        }

        /*
         * A carta errada sai do quadrado sozinha. Deixá-la ali obrigaria a
         * criança a descobrir que precisa tocar nela primeiro — e o que ela
         * precisa descobrir é o passo, não a interface.
         */
        this.track.clear(index)
        this.state = 'building'
        this.palette.setEnabled(true)
        this.palette.setReady(this.track.isFull())
        this.help.setEnabled(true)
    }

    // ─────────────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        return [
            {
                text: 'Toque nas cartas para montar a lista do coelho.',
                shape: 'rect', x: (CARD.xs[0] + CARD.xs[2]) / 2, y: CARD.cy,
                w: CARD.xs[2] - CARD.xs[0] + CARD.w + 40, h: CARD.h + 40,
                balloonX: W / 2, balloonY: COURSE.top + 90,
            },
            {
                text: 'Cada quadrado é um pedaço do caminho, na mesma ordem.',
                shape: 'rect', x: W / 2, y: SLOT.cy, w: 900, h: 150,
                balloonX: W / 2, balloonY: GROUND.y - 90,
            },
            {
                text: 'Com a lista cheia, aperte VAI e veja o coelho correr!',
                shape: 'circle', x: GO.x, y: GO.y, w: GO.r * 2.8, h: GO.r * 2.8,
                balloonX: W / 2 - 120, balloonY: COURSE.top + 120,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            key: `ef01co03-pulo-l${this.levelDef.level}`,
            once,
            accent: C.ok,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state !== 'building' && this.state !== 'locked') return
        const previous = this.state
        this.state = 'tutorial'
        this.hud.setRunning(false)
        this.help.setEnabled(false)
        this.palette.setEnabled(false)
        this.runTutorial(false, () => {
            this.state = previous
            this.hud.setRunning(true)
            this.help.setEnabled(true)
            this.palette.setEnabled(true)
        })
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.hud.setRunning(false)
        this.help.setEnabled(false)

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
                subtitle: `Três algoritmos que funcionam  ·  ${this.hud.formatted()}`,
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: 'Preparando o próximo campo...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.score }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Programador de coelho!',
            subtitle: `Você criou e consertou seus algoritmos  ·  ${this.hud.formatted()}`,
            accent: C.ok,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.cyan,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = marksInLevel(this.levelDef)
        const partial = marksBefore(this.levelDef.level)
            + (complete ? total : Math.min(this.resolved, total))
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((partial / TOTAL_MARKS) * 100),
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
