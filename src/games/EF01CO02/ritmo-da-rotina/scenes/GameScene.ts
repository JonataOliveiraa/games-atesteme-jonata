import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import {
    LESSON_FIGURES, LEVELS, OK_NO, OK_YES, PHASE_CHEER, TOTAL_CUES, TRAVEL_BEATS, beatMs,
    buildCues, cuesBefore, cuesInLevel, expectedHit, hasHand, mistakeSentence, stepAt,
} from '../data/routines'
import { C, CSS, SIZE } from '../data/theme'
import {
    DEPTH, DRUM, FIGURE, MINI, PATH, REFUSE, TARGET, TRAVEL, W,
} from '../data/layout'
import type {
    Cue, FallingFigure, HitKind, LevelDef, LevelNumber, PhaseDef, PlayState, StepDef,
} from '../types'
import { createAudio } from './audio'
import { createControls } from './controls'
import { attachLabel, createFigure } from './figures'
import { createFinger, createGuide, createSpotlight } from './lesson'
import { createRecap } from './recap'
import { createStage } from './stage'
import { createHelpButton, createSequence } from './sequence'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'ritmo-da-rotina'
const MAX_STEP_MS = 34

const fx = (o: unknown) => o as unknown as FxTarget

type Live = { cue: FallingFigure; icon: Phaser.GameObjects.Container }

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3
    private levelDef!: LevelDef
    private phaseIndex = 0
    private phase!: PhaseDef
    private cues: Cue[] = []

    private state: PlayState = 'intro'
    private paused = false
    private gen = 0

    private score = 0
    private hits = 0
    private errors = 0
    private firstTry = 0
    private done = 0
    private resolved = 0
    private streak = 0

    /** O relógio único: passo e som saem daqui, nunca de tweens paralelos. */
    private clockMs = 0
    private lastBeat = -1
    private nextCue = 0

    private live: Live[] = []
    private judging: Live | null = null
    private armed = false
    /** Trava de repique: bater rápido demais empilhava anel em cima de anel. */
    private lastPressMs = -1e9

    private stage!: ReturnType<typeof createStage>
    private strip!: ReturnType<typeof createSequence>
    private help!: ReturnType<typeof createHelpButton>
    private controls!: ReturnType<typeof createControls>
    private recap!: ReturnType<typeof createRecap>
    private audio!: ReturnType<typeof createAudio>
    private guide!: ReturnType<typeof createGuide>
    private finger!: ReturnType<typeof createFinger>
    private spot!: ReturnType<typeof createSpotlight>
    /** No treino do tutorial, o toque vai para cá em vez do julgamento. */
    private lessonPress: ((kind: HitKind) => void) | null = null

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
        this.done = 0
        this.resolved = 0
        this.streak = 0
        this.clockMs = 0
        this.lastBeat = -1
        this.nextCue = 0
        this.live = []
        this.judging = null
        this.armed = false
        this.lessonPress = null
    }

    create() {
        this.input.topOnly = true

        this.stage = createStage(this, this.phase.routine.scenery)
        this.help = createHelpButton(this, () => this.replayTutorial())
        this.controls = createControls(this, kind => this.onPress(kind))
        this.recap = createRecap(this)
        this.audio = createAudio(this)
        this.guide = createGuide(this)
        this.finger = createFinger(this)
        this.spot = createSpotlight(this)
        this.strip = this.buildStrip()

        this.bindKeyboard()
        this.bindPlatform()

        EventBus.on('mute-audio', this.onMute, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', this.shutdownScene, this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.startLevel()

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

        // o mundo desenha mesmo parado: com a rodada travada o alvo continua
        // respirando, senão a tela morre justo quando a criança está pensando
        this.stage.update(step)
        if (this.state !== 'running') return

        this.clockMs += step
        const beat = Math.floor(this.clockMs / beatMs(this.phase))
        if (beat !== this.lastBeat) {
            this.lastBeat = beat
            this.audio.tick(beat)
        }

        this.spawnDue()
        this.moveFigures(step)
    }

    private shutdownScene() {
        this.gen++
        this.clearLive()
        this.stage?.destroy()
        this.strip?.destroy()
        this.help?.destroy()
        this.controls?.destroy()
        this.recap?.destroy()
        this.guide?.destroy()
        this.finger?.destroy()
        this.spot?.destroy()
        this.lessonPress = null
        EventBus.off('mute-audio', this.onMute, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
    }

    // ─────────────────────────────────────────────────────── as fases

    private buildStrip() {
        return createSequence(
            this,
            this.phase.routine,
            this.phaseIndex,
            this.levelDef.phases.length,
            this.levelDef.level,
        )
    }

    private startLevel() {
        this.armPhase()
        this.emitCheckpoint()
        this.controls.setHand(hasHand(this.levelDef))

        if (this.wasSeen(this.levelDef.level)) {
            this.runPhase()
            return
        }
        void this.runLesson()
    }

    /** Prepara a fase sem começar a contar o tempo. */
    private armPhase() {
        this.phase = this.levelDef.phases[this.phaseIndex]
        this.cues = buildCues(this.phase, Math.random)
        this.done = 0
        this.nextCue = 0
        this.clockMs = 0
        this.lastBeat = -1
        this.streak = 0
        this.stage.setScenery(this.phase.routine.scenery)
        this.strip.destroy()
        this.strip = this.buildStrip()
        this.strip.setCurrent(0)
    }

    private runPhase() {
        this.state = 'running'
        this.clockMs = 0
        this.lastBeat = -1
    }

    private async finishPhase() {
        const gen = ++this.gen
        this.state = 'recap'
        this.disarm()
        this.stage.hush()
        this.clearLive()
        this.audio.fanfare()
        void FX.confetti(this)

        await this.recap.play(
            this.phase.routine.steps,
            PHASE_CHEER[this.phaseIndex % PHASE_CHEER.length],
        )
        if (gen !== this.gen) return

        if (this.phaseIndex + 1 >= this.levelDef.phases.length) {
            void this.endLevel()
            return
        }

        this.phaseIndex += 1
        this.armPhase()
        this.emitCheckpoint()
        this.runPhase()
    }

    private clearLive() {
        this.live.forEach(item => item.icon.destroy())
        this.live = []
    }

    // ─────────────────────────────────────────────────────── tutorial

    private lessonKey(level: number) {
        return `ef01co02-ritmo-l${level}`
    }

    /** A mesma memória do `createTutorial`: as duas não podem se desencontrar. */
    private seenSet() {
        let seen = this.registry.get('__tutorialsSeen') as Set<string> | undefined
        if (!seen) {
            seen = new Set<string>()
            this.registry.set('__tutorialsSeen', seen)
        }
        return seen
    }

    private wasSeen(level: number) {
        return this.seenSet().has(this.lessonKey(level))
    }

    /**
     * ══════════════════════════════════════════════════════════════════
     *  O TUTORIAL É O COMEÇO DO DIA
     * ══════════════════════════════════════════════════════════════════
     *
     * Nada de painel de texto antes de jogar. O menino da rotina fala, e o
     * jogo de verdade acontece na frente da criança: primeiro ele MOSTRA (a
     * figura chega, o dedo bate, a peça sobe para a partitura), depois ELA
     * FAZ, com a figura parada no anel esperando o toque. Só então o dia anda
     * sozinho.
     *
     * Um nível, um assunto: o N1 ensina só o tambor, o N2 só a mãozinha, o N3
     * só o passo que chega antes da hora. Quem entra direto num nível alto
     * (a plataforma pode mandar `stage=3`) recebe antes, curto, o que ficou
     * para trás.
     *
     * O passo que o menino faz e o que a criança faz contam de verdade: a
     * fase continua de onde o tutorial parou.
     */
    private async runLesson() {
        const gen = this.gen
        const alive = () => gen === this.gen
        const level = this.levelDef.lesson
        this.state = 'lesson'
        this.help.setEnabled(false)

        const needsDrum = level === 'drum' || !this.wasSeen(1)
        const needsHand = level === 'hand' || (level === 'early' && !this.wasSeen(2))
        if (needsHand) this.controls.setHand(false)

        if (needsDrum) {
            void this.spot.show('strip')
            await this.guide.say('Oi! Me ajuda a fazer o meu dia na ordem?', {
                button: 'Vou ajudar!',
                ready: this.strip.parade(this.done),
            })
            if (!alive()) return
            void this.spot.show('strip', 'path', 'drum')
            await this.demo('yes', 'Olha: chegou no círculo, eu bato no tambor!')
            if (!alive()) return
            if (level === 'drum') {
                void this.spot.show('path', 'drum')
                await this.practice('yes', 'Agora você! Bata no tambor.')
                if (!alive()) return
            }
        }

        if (needsHand) {
            void this.spot.show('strip')
            await this.guide.say('Agora vai passar coisa que NÃO está lá em cima!', {
                button: 'E agora?',
            })
            if (!alive()) return
            void this.spot.show('hand')
            await this.guide.say('Para essas, tem a mãozinha!', {
                button: 'Próximo',
                ready: this.controls.revealHand(),
            })
            if (!alive()) return
            void this.spot.show('strip', 'path', 'hand')
            await this.demo('no', LESSON_FIGURES.demoLine, LESSON_FIGURES.demo)
            if (!alive()) return
            if (level === 'hand') {
                void this.spot.show('path', 'hand')
                await this.practice('no', 'Agora você! Aperte a mãozinha.', LESSON_FIGURES.practice)
                if (!alive()) return
            }
        }

        if (level === 'early') {
            void this.spot.show('strip')
            await this.guide.say('Agora o dia é maior, com mais passos!', { button: 'Oba!' })
            if (!alive()) return
            void this.spot.show('strip', 'path', 'hand')
            const turn = stepAt(this.phase, this.done)!
            await this.demo('no', `Ainda não! Primeiro: ${turn.label}. Mãozinha!`, this.earlyStep(0))
            if (!alive()) return
            await this.practice('no', 'Chegou antes da vez? Aperte a mãozinha!', this.earlyStep(1))
            if (!alive()) return
        }

        void this.spot.show('strip', 'drum', ...(this.controls.handShown ? ['hand' as const] : []))
        const last = {
            drum: 'Isso! Agora o dia vai andar sozinho.',
            hand: 'Está lá em cima? Tambor. Não está? Mãozinha!',
            early: 'Só o passo que BRILHA lá em cima vai no tambor!',
        }[level]
        await this.guide.say(last, { button: 'Vamos lá!' })
        if (!alive()) return

        this.seenSet().add(this.lessonKey(this.levelDef.level))
        void this.guide.hide()
        void this.spot.hide()
        this.finger.hide()
        this.help.setEnabled(true)

        this.cues = buildCues(this.phase, Math.random, this.done)
        this.nextCue = 0
        this.strip.setCurrent(this.done)
        this.emitCheckpoint()
        this.runPhase()
    }

    /** Um passo da rotina que ainda NÃO é a vez: ele mostra o que é "antes da hora". */
    private earlyStep(offset: number): StepDef {
        const steps = this.phase.routine.steps
        return steps[Math.min(steps.length - 1, this.done + 2 + offset)]
    }

    /**
     * A figura entra pela direita e para DENTRO do anel. Ela desacelera ao
     * chegar, para o olho ter tempo de ver que ela está no círculo.
     */
    private walkIn(step: StepDef): Promise<Phaser.GameObjects.Container> {
        const icon = createFigure(this, step, FIGURE.size)
        attachLabel(this, icon, step)
        icon.setPosition(FIGURE.spawnX, PATH.cy).setDepth(DEPTH.figure)

        return new Promise(resolve => {
            this.tweens.add({
                targets: icon,
                x: TARGET.x,
                duration: (TRAVEL / this.speed()) * 0.8,
                ease: 'Sine.easeOut',
                onUpdate: () => {
                    icon.setY(PATH.cy + Math.sin(icon.x * 0.03) * 7)
                    icon.setAngle(Math.sin(icon.x * 0.03) * 3)
                },
                onComplete: () => {
                    icon.setY(PATH.cy).setAngle(0)
                    this.stage.arm()
                    resolve(icon)
                },
            })
        })
    }

    /** O menino faz sozinho: o dedo vai até o botão e bate de verdade. */
    private async demo(kind: HitKind, caption: string, step?: StepDef) {
        const gen = this.gen
        const figure = step ?? stepAt(this.phase, this.done)!

        const show = (async () => {
            const icon = await this.walkIn(figure)
            if (gen !== this.gen) return
            // passo adiantado: o que pisca lá em cima é de quem é a vez
            if (kind === 'no' && this.phase.routine.steps.includes(figure)) this.strip.blink(this.done)
            await FX.wait(this, 450)
            if (gen !== this.gen) return

            if (kind === 'yes') this.controls.arm()
            else this.controls.hint('no')
            const at = this.controls.at(kind)
            await this.finger.tap(at.x, at.y, () => {
                this.controls.press(kind)
                kind === 'yes' ? this.audio.drum() : this.audio.refuse()
            })
            if (gen !== this.gen) return
            this.finger.hide()
            this.cheer(icon, kind, false)
            if (kind === 'yes') this.resolved += 1
            await this.land(icon, kind)
        })()

        await this.guide.say(caption, { button: 'Entendi!', ready: show })
    }

    /**
     * Ela faz: a figura para no anel e ESPERA. O botão certo acende e o dedo
     * fica batendo nele. O outro botão não pune — só lembra qual é.
     */
    private async practice(kind: HitKind, caption: string, step?: StepDef) {
        const gen = this.gen
        const figure = step ?? stepAt(this.phase, this.done)!

        void this.guide.say(caption)
        const icon = await this.walkIn(figure)
        if (gen !== this.gen) return

        this.controls.hint(kind)
        const at = this.controls.at(kind)
        this.finger.loop(at.x, at.y)

        await new Promise<void>(resolve => {
            this.lessonPress = pressed => {
                if (pressed !== kind) {
                    void FX.shake(this, fx(icon), { amount: 8, times: 2 })
                    this.controls.hint(kind)
                    return
                }
                this.lessonPress = null
                resolve()
            }
        })
        if (gen !== this.gen) return

        this.finger.hide()
        this.cheer(icon, kind, true)
        if (kind === 'yes') this.resolved += 1
        await this.land(icon, kind)
    }

    /**
     * Para onde a figura vai depois do toque certo: o passo sobe para a
     * partitura e ganha o visto; o que ficou de fora é engolido pela mão.
     */
    private async land(icon: Phaser.GameObjects.Container, kind: HitKind) {
        const gen = this.gen

        if (kind === 'yes') {
            // `done` anda JÁ, antes da animação: a próxima figura pode chegar
            // ao anel enquanto esta ainda voa, e é julgada pelo passo seguinte
            const index = this.done
            const slot = this.strip.at(index)
            this.done += 1
            await FX.to(this, fx(icon), { y: icon.y - 50, angle: 0 },
                { duration: 140, ease: Ease.back(3) })
            if (gen !== this.gen) return
            await FX.to(this, fx(icon),
                { x: slot.x, y: slot.y, scale: this.strip.miniScale / FIGURE.size },
                { duration: 360, ease: 'Quad.easeInOut' })
            if (gen !== this.gen) return
            icon.destroy()
            await this.strip.stamp(index)
            if (gen !== this.gen) return
            this.strip.setCurrent(this.done)
        } else {
            const at = this.controls.at('no')
            await FX.to(this, fx(icon),
                { x: at.x, y: at.y, scale: 0.2, alpha: 0, angle: 24 },
                { duration: 400, ease: 'Back.easeIn' })
            if (gen !== this.gen) return
            icon.destroy()
        }
        // outra figura pode ter acendido o anel enquanto esta voava
        if (!this.armed) this.stage.disarm()
    }

    /** O que todo acerto faz na hora do toque, no jogo e no tutorial. */
    private cheer(icon: Phaser.GameObjects.Container, kind: HitKind, withText: boolean) {
        this.stage.hush()
        this.stage.flashOk()
        this.controls.disarm()
        this.audio.reward()
        if (withText) {
            void FX.popText(this, icon.x, icon.y - 120,
                Phaser.Utils.Array.GetRandom(kind === 'yes' ? OK_YES : OK_NO), {
                color: CSS.okBright, size: SIZE.float, rise: 76,
            })
        }
        void FX.sparks(this, icon.x, icon.y, { color: C.ok, count: 20, spread: 180 })
    }

    /**
     * O "?" no meio do jogo. Aqui não dá para refazer a demonstração — o dia
     * está andando —, então ele volta a ser o painel de sempre, com as
     * mesmas palavras do menino.
     */
    private tutorialSteps(): TutorialStep[] {
        const steps: TutorialStep[] = [
            {
                text: 'Faça o dia nesta ordem, um passo de cada vez.',
                shape: 'rect', x: W / 2, y: MINI.cy, w: 900, h: 156,
                balloonX: W / 2, balloonY: PATH.cy,
            },
            {
                text: 'Chegou no círculo o passo que brilha? Bata no tambor!',
                shape: 'circle', x: TARGET.x, y: TARGET.y, w: TARGET.r * 2.5, h: TARGET.r * 2.5,
                balloonX: W / 2 + 200, balloonY: PATH.cy,
                pointer: {
                    fromX: TARGET.x, fromY: TARGET.y,
                    toX: DRUM.x, toY: DRUM.y - 50, tap: true,
                },
            },
        ]

        if (this.controls.handShown) {
            steps.push({
                text: this.levelDef.lesson === 'early'
                    ? 'Não está lá em cima, ou não é a vez dele? Mãozinha!'
                    : 'Não está lá em cima? Aperte a mãozinha!',
                shape: 'circle', x: REFUSE.x, y: REFUSE.y, w: REFUSE.r * 2.8, h: REFUSE.r * 2.8,
                balloonX: W / 2 - 150, balloonY: PATH.cy,
            })
        }

        steps[steps.length - 1].buttonLabel = 'Entendi!'
        return steps
    }

    private replayTutorial() {
        if (this.state !== 'running' && this.state !== 'locked') return
        const previous = this.state
        this.state = 'tutorial'
        this.help.setEnabled(false)
        createTutorial(this, {
            key: this.lessonKey(this.levelDef.level),
            once: false,
            accent: C.coral,
            safeTop: 12,
            textSize: 32,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.state = previous
                this.help.setEnabled(true)
            },
        })
    }

    // ─────────────────────────────────────────────────────── controles

    private bindKeyboard() {
        const keyboard = this.input.keyboard
        if (!keyboard) return
        const yes = () => this.onPress('yes')
        const no = () => this.onPress('no')
        keyboard.on('keydown-SPACE', yes)
        keyboard.on('keydown-F', yes)
        keyboard.on('keydown-J', yes)
        keyboard.on('keydown-D', no)
        keyboard.on('keydown-K', no)
        keyboard.on('keydown-LEFT', no)
        keyboard.on('keydown-RIGHT', no)
    }

    // ─────────────────────────────────────────────────────── as figuras

    private spawnDue() {
        this.refillIfDry()
        while (this.nextCue < this.cues.length) {
            const cue = this.cues[this.nextCue]
            if (cue.beat * beatMs(this.phase) > this.clockMs) break
            this.nextCue += 1

            const icon = createFigure(this, cue.step, FIGURE.size)
            attachLabel(this, icon, cue.step)
            icon.setPosition(FIGURE.spawnX, PATH.cy).setDepth(DEPTH.figure).setScale(0.7)
            void FX.to(this, fx(icon), { scale: 1 }, { duration: 260, ease: Ease.back(2.2) })

            this.live.push({
                cue: { ...cue, x: FIGURE.spawnX, mistakes: 0, settled: false },
                icon,
            })
        }
    }

    private moveFigures(dtMs: number) {
        const speed = this.speed()
        const step = speed * dtMs

        for (const item of this.live) {
            item.cue.x -= step
            item.icon.setX(item.cue.x)
            // andar de verdade: sobe e desce um pouquinho, como quem caminha
            item.icon.setY(PATH.cy + Math.sin(item.cue.x * 0.03) * 7)
            item.icon.setAngle(Math.sin(item.cue.x * 0.03) * 3)
        }

        const front = this.live[0]
        if (front) {
            const inWindow = Math.abs(front.cue.x - TARGET.x) <= this.phase.windowPx
            if (inWindow && !this.armed) {
                this.armed = true
                this.judging = front
                this.stage.arm()
                this.controls.arm()
            }
            if (!inWindow && this.armed && front.cue.x < TARGET.x) {
                this.disarm()
            }
        }

        /*
         * Escapou pela esquerda. Errar o TEMPO não trava: a figura volta ao
         * fim da fila e o dia segue. Travar aqui puniria o polegar, não o
         * raciocínio.
         */
        const escaped = this.live.filter(item => item.cue.x < -FIGURE.size)
        for (const item of escaped) {
            this.live.splice(this.live.indexOf(item), 1)
            item.icon.destroy()
            this.streak = 0
            /*
             * Deixar passar o que não era da hora NÃO é o mesmo que reconhecer
             * que não era: ignorar não é responder. Quem devia ser recusado e
             * passou conta como erro — e volta, para ser recusado de verdade.
             * Já quem devia ser pego e escapou é erro de dedo, não de cabeça:
             * volta sem penalidade.
             */
            const wanted = expectedHit(item.cue, this.done)
            if (wanted === 'no' && this.controls.handShown) this.missedRefusal(item.cue)
            if (wanted === 'yes' && this.levelDef.lesson !== 'early') this.rewind()
            else this.requeue(item.cue)
        }
    }

    /**
     * ══════════════════════════════════════════════════════════════════
     *  NO N1 E NO N2, NINGUÉM FURA A FILA
     * ══════════════════════════════════════════════════════════════════
     *
     * O passo da vez escapou — erro de dedo. Se ele simplesmente voltasse
     * para o fim da fila, os passos que vinham atrás dele chegariam ao anel
     * ANTES da hora, e a criança teria de recusar um passo adiantado: o
     * assunto do N3, cobrado no N1 sem a mãozinha nem existir, e cobrado
     * com vida.
     *
     * Então os passos que vinham depois saem do caminho, e a fila é refeita
     * na ordem, com o que escapou na frente. Distrator fica onde está.
     */
    private rewind() {
        const later = this.live.filter(item => item.cue.routineIndex > this.done)
        for (const item of later) {
            this.live.splice(this.live.indexOf(item), 1)
            if (this.judging === item) this.disarm()
            void FX.to(this, fx(item.icon), { alpha: 0, scale: 0.6, y: item.icon.y - 40 },
                { duration: 260 }).then(() => item.icon.destroy())
        }

        const steps = this.phase.routine.steps
        const distractors = this.cues.slice(this.nextCue).filter(cue => cue.routineIndex < 0)
        const ordered: Cue[] = []
        for (let i = this.done; i < steps.length; i++) {
            ordered.push({ step: steps[i], routineIndex: i, beat: 0 })
        }
        distractors.forEach((cue, k) => ordered.splice(Math.min(ordered.length, 1 + k * 2), 0, cue))

        this.cues = [...this.cues.slice(0, this.nextCue), ...ordered]
        this.reschedule()
    }

    private speed() {
        return TRAVEL / (TRAVEL_BEATS * beatMs(this.phase))
    }

    /**
     * Rede de segurança: se a fila secou com passos ainda por fazer, os que
     * faltam voltam. Nenhuma combinação de erro de tempo pode deixar a criança
     * numa fase sem saída.
     */
    private refillIfDry() {
        if (this.nextCue < this.cues.length || this.live.length > 0) return
        const steps = this.phase.routine.steps
        if (this.done >= steps.length) return

        for (let i = this.done; i < steps.length; i++) {
            this.cues.push({ step: steps[i], routineIndex: i, beat: 0 })
        }
        this.reschedule()
    }

    /**
     * O aviso sobe DO BOTÃO, e não num balão no meio do caminho: o jogo
     * continua andando aqui, e um balão no meio taparia a próxima figura —
     * justamente a que ela precisa olhar. Subindo da mãozinha, ele ainda
     * aponta para onde era o toque certo.
     */
    private missedRefusal(cue: Cue) {
        this.errors += 1
        this.audio.wrong()
        this.stage.flashBad()

        const at = this.controls.at('no')
        void FX.popText(this, at.x, at.y - REFUSE.r - 26, 'Esse não era agora!', {
            color: CSS.bad, size: SIZE.float, rise: 62,
        })
        this.controls.hint('no')
        // não apagar o brilho se outra figura já armou nesse meio tempo
        this.time.delayedCall(900, () => {
            if (!this.armed) this.controls.disarm()
        })
        void cue

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()
    }

    private disarm() {
        this.armed = false
        this.judging = null
        this.stage.disarm()
        this.controls.disarm()
    }

    private requeue(cue: FallingFigure) {
        this.cues.push({ step: cue.step, routineIndex: cue.routineIndex, beat: 0 })
        this.reschedule()
    }

    /**
     * ══════════════════════════════════════════════════════════════════
     *  O PASSO QUE FALTA NUNCA FICA LONGE
     * ══════════════════════════════════════════════════════════════════
     *
     * Antes a fila era um horário fixo montado no começo, e quem voltava ia
     * para o fim. Bastava a criança se distrair no primeiro passo para ter que
     * ver o dia inteiro passar antes de a chance voltar — que é exatamente
     * quando ela desiste.
     *
     * Agora, sempre que a fila muda, o passo esperado é trazido para no máximo
     * uma figura de distância, e os horários são recarimbados a partir de
     * agora. O que a rotina precisa vem logo; o resto continua atrás.
     */
    private reschedule() {
        const upcoming = this.cues.slice(this.nextCue)
        const wanted = upcoming.findIndex(cue => cue.routineIndex === this.done)
        if (wanted > 1) {
            const [cue] = upcoming.splice(wanted, 1)
            upcoming.splice(1, 0, cue)
        }

        // um tempo de folga basta quando o caminho está vazio; o espaço entre
        // figuras só conta a partir da última que nasceu
        const lastSpawned = this.nextCue > 0 ? this.cues[this.nextCue - 1].beat : -Infinity
        let beat = Math.max(this.clockMs / beatMs(this.phase) + 1, lastSpawned + this.phase.beatsBetween)
        for (const cue of upcoming) {
            cue.beat = beat
            beat += this.phase.beatsBetween
        }

        this.cues = [...this.cues.slice(0, this.nextCue), ...upcoming]
    }

    // ─────────────────────────────────────────────────────── o julgamento

    private onPress(kind: HitKind) {
        if (this.paused) return
        // o teclado também não chega a um botão que não está na tela
        if (kind === 'no' && !this.controls.handShown) return
        const practicing = this.state === 'lesson' && this.lessonPress
        if (!practicing && this.state !== 'running' && this.state !== 'locked') return
        if (this.time.now - this.lastPressMs < 130) return
        this.lastPressMs = this.time.now

        this.controls.press(kind)
        kind === 'yes' ? this.audio.drum() : this.audio.refuse()

        if (practicing) {
            this.lessonPress?.(kind)
            return
        }

        const target = this.judging
        if (!target) return

        const wanted = expectedHit(target.cue, this.done)
        if (kind === wanted) void this.succeed(target, kind)
        else void this.trip(target, kind)
    }

    private async succeed(item: Live, kind: HitKind) {
        const gen = this.gen
        this.armed = false
        this.judging = null
        this.live.splice(this.live.indexOf(item), 1)

        const first = item.cue.mistakes === 0
        const points = first ? 10 : 5
        this.score += points
        this.hits += 1
        this.resolved += 1
        this.streak = first ? this.streak + 1 : 0
        if (first) this.firstTry += 1

        this.state = 'running'
        this.cheer(item.icon, kind, true)

        // a explosão cresce com a sequência de acertos: acertar seguido tem que
        // PARECER melhor, senão nada convida a continuar
        if (this.streak >= 3) {
            void FX.sparks(this, item.icon.x, item.icon.y, { color: C.warn, count: 34, spread: 260 })
            this.audio.streak()
            void FX.ping(this, item.icon.x, item.icon.y, C.warn, { radius: 240 })
        }

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: points,
            stage: this.levelDef.level,
        })
        this.emitCheckpoint()

        /*
         * "AGORA NÃO" QUER DIZER DEPOIS, NÃO NUNCA.
         *
         * Um passo da rotina que chega antes da hora é recusado com razão
         * — mas se ele fosse descartado aqui, a rotina ficaria sem ele e a
         * fase não teria mais como terminar. Foi o que travou o nível 3:
         * a criança perdia um passo no tempo, os seguintes chegavam fora
         * de ordem, eram corretamente recusados, e o dia nunca fechava.
         *
         * Só distrator (sem índice na rotina) e passo já feito somem de
         * vez; o resto volta para o fim da fila.
         */
        if (kind === 'no' && item.cue.routineIndex >= this.done) this.requeue(item.cue)

        await this.land(item.icon, kind)
        if (gen !== this.gen) return
        if (kind === 'yes') this.reschedule()

        if (this.done >= this.phase.routine.steps.length) void this.finishPhase()
    }

    /**
     * A TRAVA. Só o erro de JULGAMENTO trava — o de tempo não. O dia para, a
     * figura fica presa no alvo, e o balão diz qual passo é a vez, nunca
     * "tente de novo".
     */
    private async trip(item: Live, kind: HitKind) {
        if (this.state === 'locked') return

        this.state = 'locked'
        item.cue.mistakes += 1
        this.errors += 1
        this.streak = 0

        this.audio.wrong()
        this.stage.flashBad()
        this.cameras.main.shake(200, 0.005)

        const next = stepAt(this.phase, this.done)
        void this.stage.say(mistakeSentence(item.cue, next, kind, this.done), C.bad)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        void FX.shake(this, fx(item.icon), { amount: 10, times: 3 })
    }

    // ─────────────────────────────────────────────────────── fim do nível

    private async endLevel() {
        const gen = ++this.gen
        this.state = 'ending'
        this.help.setEnabled(false)
        this.disarm()
        this.stage.hush()
        this.clearLive()

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
                subtitle: 'Todas as rotinas na ordem certa',
                accent: C.ok,
                panelColor: C.cream,
                overlayColor: C.ink,
                progress: { total: LEVELS.length, current: level },
                autoAdvance: {
                    delay: 2600,
                    label: 'Preparando o próximo dia...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.score }),
                },
            })
            return
        }

        showLevelComplete(this, {
            title: 'Você seguiu o dia todo!',
            subtitle: 'Cada passo na hora certa',
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
                    color: C.cyan,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    // ─────────────────────────────────────────────────────── plataforma

    private emitCheckpoint(complete = false) {
        const total = cuesInLevel(this.levelDef)
        const partial = cuesBefore(this.levelDef.level)
            + (complete ? total : Math.min(this.resolved, total))
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((partial / TOTAL_CUES) * 100),
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
