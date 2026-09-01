import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import {
    BEAT_MS, LEVELS, OK_NO, OK_YES, PHASE_CHEER, TOTAL_CUES, TRAVEL_BEATS,
    buildCues, cuesBefore, cuesInLevel, expectedHit, mistakeSentence, stepAt,
} from '../data/routines'
import { C, CSS, SIZE } from '../data/theme'
import {
    DEPTH, DRUM, FIGURE, MINI, PATH, REFUSE, TARGET, TRAVEL, W,
} from '../data/layout'
import type {
    Cue, FallingFigure, HitKind, LevelDef, LevelNumber, PhaseDef, PlayState,
} from '../types'
import { createAudio } from './audio'
import { createControls } from './controls'
import { attachLabel, createFigure } from './figures'
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
    }

    create() {
        this.input.topOnly = true

        this.stage = createStage(this, this.phase.routine.scenery)
        this.help = createHelpButton(this, () => this.replayTutorial())
        this.controls = createControls(this, kind => this.onPress(kind))
        this.recap = createRecap(this)
        this.audio = createAudio(this)
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
        const beat = Math.floor(this.clockMs / BEAT_MS)
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
        )
    }

    private startLevel() {
        this.state = 'tutorial'
        this.armPhase()
        this.emitCheckpoint()

        this.runTutorial(true, () => this.runPhase())
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

    private tutorialSteps(): TutorialStep[] {
        const steps: TutorialStep[] = [
            {
                text: 'Esta é a sua rotina. Siga a ordem!',
                shape: 'rect', x: W / 2, y: MINI.cy, w: 900, h: 156,
                balloonX: W / 2, balloonY: PATH.cy,
            },
            {
                text: 'Bata no tambor quando o próximo passo chegar aqui.',
                shape: 'circle', x: TARGET.x, y: TARGET.y, w: TARGET.r * 2.5, h: TARGET.r * 2.5,
                balloonX: W / 2 + 220, balloonY: PATH.cy,
                pointer: {
                    fromX: TARGET.x, fromY: TARGET.y,
                    toX: DRUM.x, toY: DRUM.y - 50, tap: true,
                },
            },
        ]

        const hasDistractor = this.levelDef.phases.some(
            p => p.distractors.length > 0 || p.outOfOrder > 0,
        )

        if (hasDistractor) {
            steps.push({
                text: 'Se não for a hora dele, aperte a mãozinha vermelha.',
                shape: 'circle', x: REFUSE.x, y: REFUSE.y, w: REFUSE.r * 2.8, h: REFUSE.r * 2.8,
                balloonX: W / 2 - 120, balloonY: PATH.cy,
                buttonLabel: 'Vamos lá!',
            })
        } else {
            steps[steps.length - 1].buttonLabel = 'Vamos lá!'
        }

        return steps
    }

    private runTutorial(once: boolean, onFinish: () => void) {
        createTutorial(this, {
            key: `ef01co02-ritmo-l${this.levelDef.level}`,
            once,
            accent: C.coral,
            safeTop: 12,
            steps: this.tutorialSteps(),
            onFinish,
        })
    }

    private replayTutorial() {
        if (this.state === 'ending' || this.state === 'tutorial' || this.state === 'recap') return
        const previous = this.state
        this.state = 'tutorial'
        this.help.setEnabled(false)
        this.runTutorial(false, () => {
            this.state = previous
            this.help.setEnabled(true)
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
            if (cue.beat * BEAT_MS > this.clockMs) break
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
        const speed = TRAVEL / (TRAVEL_BEATS * BEAT_MS)
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
            if (expectedHit(item.cue, this.done) === 'no') this.missedRefusal(item.cue)
            this.requeue(item.cue)
        }
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

        const lastSpawned = this.nextCue > 0 ? this.cues[this.nextCue - 1].beat : -Infinity
        let beat = Math.max(this.clockMs / BEAT_MS, lastSpawned) + this.phase.beatsBetween
        for (const cue of upcoming) {
            cue.beat = beat
            beat += this.phase.beatsBetween
        }

        this.cues = [...this.cues.slice(0, this.nextCue), ...upcoming]
    }

    // ─────────────────────────────────────────────────────── o julgamento

    private onPress(kind: HitKind) {
        if (this.paused) return
        if (this.state !== 'running' && this.state !== 'locked') return
        if (this.time.now - this.lastPressMs < 130) return
        this.lastPressMs = this.time.now

        this.controls.press(kind)
        kind === 'yes' ? this.audio.drum() : this.audio.refuse()

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
        this.stage.hush()
        this.stage.flashOk()
        this.controls.disarm()
        this.audio.reward()

        void FX.popText(this, item.icon.x, item.icon.y - 120,
            Phaser.Utils.Array.GetRandom(kind === 'yes' ? OK_YES : OK_NO), {
            color: CSS.okBright, size: SIZE.float, rise: 76,
        })

        // a explosão cresce com a sequência de acertos: acertar seguido tem que
        // PARECER melhor, senão nada convida a continuar
        const big = this.streak >= 3
        void FX.sparks(this, item.icon.x, item.icon.y, {
            color: big ? C.warn : C.ok,
            count: big ? 34 : 20,
            spread: big ? 260 : 180,
        })
        if (big) {
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

        if (kind === 'yes') {
            const index = this.done
            const slot = this.strip.at(index)
            this.done += 1
            await FX.to(this, fx(item.icon), { y: item.icon.y - 50, angle: 0 },
                { duration: 140, ease: Ease.back(3) })
            if (gen !== this.gen) return
            await FX.to(this, fx(item.icon),
                { x: slot.x, y: slot.y, scale: this.strip.miniScale / FIGURE.size },
                { duration: 360, ease: 'Quad.easeInOut' })
            if (gen !== this.gen) return
            item.icon.destroy()
            await this.strip.stamp(index)
            if (gen !== this.gen) return
            this.strip.setCurrent(this.done)
            this.reschedule()
        } else {
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
            if (item.cue.routineIndex >= this.done) this.requeue(item.cue)

            const at = this.controls.at('no')
            await FX.to(this, fx(item.icon),
                { x: at.x, y: at.y, scale: 0.2, alpha: 0, angle: 24 },
                { duration: 400, ease: 'Back.easeIn' })
            if (gen !== this.gen) return
            item.icon.destroy()
        }

        this.stage.disarm()

        if (this.done >= this.phase.routine.steps.length) void this.finishPhase()
    }

    /**
     * A TRAVA. Só o erro de JULGAMENTO trava — o de tempo não. O dia para, a
     * figura fica presa no alvo, e o balão diz qual passo é a vez, nunca
     * "tente de novo".
     */
    private async trip(item: Live, kind: HitKind) {
        if (this.state === 'locked') return
        const gen = this.gen

        this.state = 'locked'
        item.cue.mistakes += 1
        this.errors += 1
        this.streak = 0

        this.audio.wrong()
        this.stage.flashBad()
        this.cameras.main.shake(200, 0.005)

        const next = stepAt(this.phase, this.done)
        void this.stage.say(mistakeSentence(item.cue, next, kind), C.bad)

        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: 0,
            stage: this.levelDef.level,
        })
            this.lives.lose(); this.livesLeft = this.lives.remaining
        this.emitCheckpoint()

        void FX.shake(this, fx(item.icon), { amount: 10, times: 3 })

        if (item.cue.mistakes >= 2) {
            this.strip.blink(this.done)
            this.controls.hint(expectedHit(item.cue, this.done))
        }

        await FX.wait(this, 260)
        if (gen !== this.gen) return
        this.stage.arm()
        this.controls.arm()
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
