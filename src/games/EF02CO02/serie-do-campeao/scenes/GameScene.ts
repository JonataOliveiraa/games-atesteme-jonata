import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'
import { FX } from '../../../../shared/effects/FX'
import { LEVELS, stepsInLevel, tapResult } from '../data/routines'
import { ATHLETE, BTN, CARD, HUD, W, cardH, cardY } from '../data/layout'
import { C, MOVE_LABEL } from '../data/theme'
import type { LevelDef, LevelNumber, Move, Phase, RoutineStep } from '../types'
import { createAthlete } from './athlete'
import { createAudio } from './audio'
import { createMoveButton, type MoveButton } from './buttons'
import { createRoutineCard, type RoutineCard } from './cards'
import { createCoach } from './coach'
import { createGym } from './gym'
import { createHud } from './hud'

const GAME_ID = 'serie-do-campeao'

const OTHER: Record<Move, Move> = { jump: 'spin', spin: 'jump' }

const PRECISION_WINDOW = 700

/** Tempo por ETAPA: dez segundos por repetição, com um piso folgado. */
const stepTime = (count: number) => Math.max(25_000, count * 10_000)

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

    private level!: LevelDef
    private routineIndex = 0
    private stepIndex = 0
    private doneCount = 0
    private stepErrors = 0
    private stepsDone = 0
    private stepGen = 0
    private phase: Phase = 'intro'
    private gen = 0
    private busy = false

    private score = 0
    private hits = 0
    private errors = 0

    private gym!: ReturnType<typeof createGym>
    private hud!: ReturnType<typeof createHud>
    private coach!: ReturnType<typeof createCoach>
    private athlete!: ReturnType<typeof createAthlete>
    private audio!: ReturnType<typeof createAudio>

    private cards: RoutineCard[] = []
    private buttons!: Record<Move, MoveButton>

    private unsubPlatform?: () => void

    private get routine() {
        return this.level.routines[this.routineIndex]
    }

    private get step(): RoutineStep {
        return this.routine.steps[this.stepIndex]
    }

    private get card(): RoutineCard | undefined {
        return this.cards[this.stepIndex]
    }

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal

        const number = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) as LevelNumber
        this.level = LEVELS[number - 1]

        this.routineIndex = 0
        this.stepIndex = 0
        this.doneCount = 0
        this.stepErrors = 0
        this.stepsDone = 0
        this.phase = 'intro'
        this.busy = false
        this.score = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.cards = []
    }

    create() {
        this.input.topOnly = true

        this.audio = createAudio(this)
        this.gym = createGym(this)
        this.coach = createCoach(this)
        this.athlete = createAthlete(this, {
            x: ATHLETE.x,
            feetY: ATHLETE.feetY,
            h: ATHLETE.h,
            hop: ATHLETE.hop,
        })
        this.hud = createHud(this, {
            onHelp: () => this.replayTutorial(),
            onTimeOut: () => void this.timeUp(),
            time: stepTime(this.routine.steps[0].count),
        })
        this.hud.setLevel(this.level.level, LEVELS.length)
        this.hud.setTotal(this.level.routines.length)

        this.buttons = {
            jump: createMoveButton(this, {
                move: 'jump',
                x: BTN.jumpX,
                onTap: move => void this.onTap(move),
            }),
            spin: createMoveButton(this, {
                move: 'spin',
                x: BTN.spinX,
                onTap: move => void this.onTap(move),
            }),
        }

        this.bindPlatform()
        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 24,
            y: 44,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        void this.playRoutine(true)
    }

    update(_time: number, delta: number) {
        this.hud?.setRunning(this.phase === 'playing' && !this.busy)
        this.hud?.tick(delta)
    }

    private shutdownScene() {
        this.gen++
        this.clearCards()
        this.buttons?.jump.destroy()
        this.buttons?.spin.destroy()
        this.athlete?.destroy()
        this.coach?.destroy()
        this.hud?.destroy()
        this.gym?.destroy()
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    private clearCards() {
        this.cards.forEach(card => card.destroy())
        this.cards = []
    }

    // ─────────────────────────────────────────────── série

    private async playRoutine(first: boolean) {
        const gen = ++this.gen
        this.phase = 'intro'
        this.busy = false
        this.stepIndex = 0
        this.doneCount = 0
        this.stepErrors = 0

        this.clearCards()
        this.setButtonsEnabled(false)
        this.athlete.reset()
        this.coach.clearMove()

        const steps = this.routine.steps
        const h = cardH(steps.length)
        this.hud.setTitle(`Série ${this.routineIndex + 1} de ${this.level.routines.length}`)
        this.hud.setHint('O cartão da direita diz o movimento e a conta.')
        this.cards = steps.map((step, i) =>
            createRoutineCard(this, { step, x: CARD.cx, y: cardY(i, steps.length), h }),
        )
        this.cards.forEach((card, i) => {
            card.setActive(i === 0)
            void card.appear(i * 120)
        })

        await FX.wait(this, 260 + steps.length * 120)
        if (gen !== this.gen) return

        if (first) {
            await this.runTutorial(true)
            if (gen !== this.gen) return
        }

        this.phase = 'playing'
        this.beginStep()
    }

    private beginStep() {
        this.stepGen++
        this.doneCount = 0
        this.stepErrors = 0
        this.cards.forEach((card, i) => card.setActive(i === this.stepIndex))
        this.coach.setMove(this.step.move)
        void this.coach.raise()
        this.hud.setTitle(`${MOVE_LABEL[this.step.move]} — ${this.step.count} ${this.step.count === 1 ? 'vez' : 'vezes'}`)
        this.hud.setHint(this.routine.steps.length === 1
            ? 'Toque no botão até encher todas as bolinhas.'
            : `Cartão ${this.stepIndex + 1} de ${this.routine.steps.length} — encha as bolinhas dele.`)
        this.hud.resetTime(stepTime(this.step.count))
        this.applyButtons()
    }

    private applyButtons() {
        const wanted = this.step.move
        const hint = this.stepErrors >= 2

        if (this.level.soloButton) {
            this.buttons[wanted].setEnabled(true)
            this.buttons[OTHER[wanted]].setEnabled(false)
        } else {
            this.buttons[wanted].setEnabled(true)
            this.buttons[OTHER[wanted]].setEnabled(!hint)
        }
        this.buttons[wanted].setHint(hint)
    }

    private setButtonsEnabled(on: boolean) {
        this.buttons.jump.setHint(false)
        this.buttons.spin.setHint(false)
        this.buttons.jump.setEnabled(on)
        this.buttons.spin.setEnabled(on)
    }

    // ─────────────────────────────────────────────── toque

    private async onTap(move: Move) {
        if (this.phase !== 'playing' || this.busy) return
        this.busy = true

        const gen = this.gen
        const verdict = tapResult(this.step, move, this.doneCount)
        const card = this.card

        if (verdict === 'wrong-move' || verdict === 'too-many') this.stepGen++

        if (verdict === 'wrong-move') {
            this.audio.wrong()
            await this.athlete.oops()
            if (gen !== this.gen) return
            await this.trava('Esse não é agora.')
            return
        }

        await this.perform(move, this.doneCount)
        if (gen !== this.gen) return

        if (verdict === 'too-many') {
            this.audio.extra()
            await card?.extraDot()
            if (gen !== this.gen) return
            await this.trava('Foi um a mais.')
            return
        }

        this.doneCount++
        this.audio.dot(this.doneCount)
        await card?.fill(this.doneCount)
        if (gen !== this.gen) return

        if (verdict === 'step-complete') {
            await this.completeStep()
            return
        }

        this.busy = false
    }

    private async perform(move: Move, index: number) {
        if (move === 'jump') {
            this.audio.jump(index)
            await this.athlete.hop()
            return
        }
        this.audio.spin(index)
        await this.athlete.twirl()
    }

    private async completeStep() {
        const gen = this.gen
        const stepGen = this.stepGen
        const stale = () => gen !== this.gen || stepGen !== this.stepGen

        this.audio.stepDone()
        await this.card?.glow()
        if (stale()) return

        this.busy = false
        await FX.wait(this, PRECISION_WINDOW)
        if (stale()) return
        this.busy = true

        this.stepGen++
        await this.card?.seal()
        if (gen !== this.gen) return

        this.award()
        this.stepsDone++
        this.emitCheckpoint()

        await this.athlete.cheer()
        if (gen !== this.gen) return

        this.stepIndex++
        if (this.stepIndex < this.routine.steps.length) {
            this.beginStep()
            this.busy = false
            return
        }

        await this.finishRoutine()
    }

    /** O relógio zerou: custa uma vida e a etapa recomeça com a conta limpa. */
    private async timeUp() {
        if (this.phase !== 'playing' || this.busy) {
            this.hud.resetTime()
            return
        }
        this.busy = true
        this.stepGen++
        this.audio.wrong()
        await this.trava('O tempo acabou!')
        this.hud.resetTime()
    }

    private async trava(message: string) {
        const gen = this.gen
        const card = this.card

        this.errors++
        this.stepErrors++
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.level.level,
        })
        this.lives.lose()
        this.livesLeft = this.lives.remaining

        this.hud.flash(C.bad)
        this.hud.alert(message)

        card?.setLocked(true)
        await FX.wait(this, 420)
        if (gen !== this.gen) return

        await card?.emptyDots()
        if (gen !== this.gen) return

        card?.setLocked(false)
        this.doneCount = 0
        this.applyButtons()
        this.busy = false
        this.emitCheckpoint()
    }

    // ─────────────────────────────────────────────── fim da série

    private async finishRoutine() {
        const gen = this.gen
        this.phase = 'replay'
        this.setButtonsEnabled(false)
        this.coach.clearMove()
        this.hud.setTitle('Olha a série inteira!')
        this.hud.setHint('O atleta repete tudo sozinho.')

        await FX.wait(this, 220)
        if (gen !== this.gen) return

        for (let s = 0; s < this.routine.steps.length; s++) {
            const step = this.routine.steps[s]
            this.cards.forEach((card, i) => card.setActive(i === s))
            for (let i = 0; i < step.count; i++) {
                this.audio.replay(i)
                if (step.move === 'jump') await this.athlete.hop(2.2)
                else await this.athlete.twirl(2.2)
                if (gen !== this.gen) return
            }
        }

        this.audio.fanfare()
        await Promise.all([
            this.athlete.cheer(),
            this.coach.cheer(),
            FX.stars(this, ATHLETE.x, ATHLETE.feetY - ATHLETE.h * 0.6, {
                color: C.gold,
                count: 12,
            }),
        ])
        if (gen !== this.gen) return

        this.routineIndex++
        await this.hud.award(this.routineIndex)
        if (gen !== this.gen) return

        if (this.routineIndex < this.level.routines.length) {
            await FX.wait(this, 380)
            if (gen !== this.gen) return
            await this.playRoutine(false)
            return
        }

        this.endLevel()
    }

    private award() {
        this.hits++
        const earned = this.stepErrors === 0 ? 10 : 5
        this.score += earned
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
    }

    private endLevel() {
        const gen = ++this.gen
        this.phase = 'done'
        void gen

        this.setButtonsEnabled(false)
        this.hud.setEnabled(false)

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
                title: `${this.level.name} completo!`,
                subtitle: 'Cada movimento saiu na conta certa.',
                accent: C.teal,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: done, size: 7 },
                autoAdvance: {
                    delay: 2600,
                    label: 'O treinador já tem outra série...',
                    onComplete: () => this.scene.restart({
                        lives: this.livesLeft,
                        level: (done + 1) as LevelNumber,
                        points: this.score,
                    }),
                },
            })
            return
        }

        void FX.confetti(this, { colors: [C.gold, C.teal, C.amber, C.blue] })
        showLevelComplete(this, {
            title: 'Campeão da série!',
            subtitle: 'Repetir a conta certa é o que faz o algoritmo funcionar.',
            accent: C.teal,
            panelColor: C.cream,
            overlayColor: C.ink,
            progress: { total: LEVELS.length, current: LEVELS.length, size: 7 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({
                        lives: this.livesTotal,
                        level: 1,
                        points: 0,
                    }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.teal,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────── tutorial

    private tutorialSteps(): TutorialStep[] {
        const n = this.routine.steps.length
        const move = this.routine.steps[0].move
        const btnX = move === 'jump' ? BTN.jumpX : BTN.spinX
        const y = cardY(0, n)
        const h = cardH(n)

        const column = {
            x: CARD.cx,
            y: (CARD.top + CARD.bottom) / 2,
            w: CARD.w + 26,
            h: CARD.bottom - CARD.top,
        }

        if (n === 1) {
            return [
                {
                    text: 'O cartão diz quantas vezes.',
                    shape: 'rect',
                    x: CARD.cx, y,
                    w: CARD.w + 18, h: h + 18,
                    balloonX: 540, balloonY: 300,
                },
                {
                    text: 'Toque no botão: o atleta faz 1 vez.',
                    shape: 'rect',
                    x: btnX, y: BTN.cy,
                    w: BTN.w + 16, h: BTN.h + 16,
                    balloonX: 640, balloonY: 320,
                    pointer: { fromX: btnX, fromY: BTN.cy, toX: btnX, toY: BTN.cy, tap: true },
                },
                {
                    text: 'Encha todas as bolinhas e a série está pronta!',
                    shape: 'rect',
                    x: CARD.cx + CARD.dotX, y,
                    w: CARD.dotGap * 5, h: h - 24,
                    balloonX: 540, balloonY: 320,
                    buttonLabel: 'Vamos lá!',
                },
            ]
        }

        return [
            {
                text: `Agora a série tem ${n} cartões.`,
                shape: 'rect',
                x: column.x, y: column.y, w: column.w, h: column.h,
                balloonX: 520, balloonY: 300,
            },
            {
                text: 'Os dois botões funcionam: use o que o cartão aceso pede.',
                shape: 'rect',
                x: W / 2, y: BTN.cy,
                w: BTN.spinX - BTN.jumpX + BTN.w + 20, h: BTN.h + 16,
                balloonX: W / 2, balloonY: 330,
            },
            {
                text: 'Termine um cartão antes de passar para o de baixo.',
                shape: 'rect',
                x: column.x, y: column.y, w: column.w, h: column.h,
                balloonX: 520, balloonY: 320,
                buttonLabel: 'Vamos lá!',
            },
        ]
    }

    private runTutorial(once: boolean) {
        return new Promise<void>(resolve => {
            createTutorial(this, {
                key: `ef02co02-serie-l${this.level.level}`,
                once,
                accent: C.amber,
                safeTop: HUD.y + HUD.h + 12,
                steps: this.tutorialSteps(),
                onFinish: () => resolve(),
            })
        })
    }

    private replayTutorial() {
        if (this.phase !== 'playing' || this.busy) return
        if (this.doneCount >= this.step.count) return
        const gen = this.gen
        this.phase = 'tutorial'
        this.hud.setEnabled(false)
        this.setButtonsEnabled(false)

        void this.runTutorial(false).then(() => {
            if (gen !== this.gen) return
            this.phase = 'playing'
            this.hud.setEnabled(true)
            this.applyButtons()
        })
    }

    // ─────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = stepsInLevel(this.level)
        const done = complete ? total : this.stepsDone
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
