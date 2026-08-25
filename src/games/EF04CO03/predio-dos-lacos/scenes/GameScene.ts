import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES, simulate, plan } from '../data/casos'
import { C } from '../data/theme'
import { HUD, SITE, EDITOR } from '../data/layout'
import { TOP, type Caso, type CaseState, type Level } from '../types'

import {
    createScene, createHud, createQuestionLine, createBuilding, createEditor,
    showToast,
    type Hud, type QuestionLine, type BuildingView, type Editor,
} from './effects'

const GAME_ID = 'predio-dos-lacos'

const POINTS = {
    solve: 25,
    miss: -5,
} as const

/** Teto dos contadores. Fixo, para o próprio limite não entregar a resposta. */
const MAX_OUTER = 12
const MAX_INNER = 10

export class GameScene extends Phaser.Scene {

    /* ── partida ───────────────────────────────────────────────────── */

    private levelIdx = 0
    private caseIdx = 0
    private points = 0
    private hits = 0
    private errors = 0
    private isMuted = false
    private state: CaseState = 'briefing'
    private locked = false
    private ended = false

    /** Todo callback atrasado captura este valor e desiste se ele mudou. */
    private gen = 0

    /* ── interface fixa ────────────────────────────────────────────── */

    private hud!: Hud
    private question!: QuestionLine

    /* ── tabuleiro do caso ─────────────────────────────────────────── */

    private building?: BuildingView
    private editor?: Editor

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    /**
     * `level` é 1-based e `phase` é 0-based. Os dois são grampeados ao que
     * existe de verdade: um `phase: 7` num nível de três casos faria
     * `this.caso` devolver `undefined`, e o estouro apareceria três telas
     * adiante sem nenhuma pista de que veio daqui.
     */
    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = Phaser.Math.Clamp(data?.level ?? 1, 1, LEVELS.length) - 1
        this.caseIdx = Phaser.Math.Clamp(
            data?.phase ?? 0, 0, LEVELS[this.levelIdx].cases.length - 1,
        )
        this.points = data?.points ?? 0
        this.hits = 0
        this.errors = 0
        this.isMuted = false
        this.state = 'briefing'
        this.locked = false
        this.ended = false
        this.gen = 0
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        // o céu muda por nível: dia, pôr do sol, noite
        createScene(this, this.level.sky)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.question = createQuestionLine(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer.
        void this.playCase(this.caseIdx === 0)
    }

    private shutdownScene() {
        this.gen += 1
        EventBus.off('mute-audio', this.onMuteAudio, this)
        EventBus.off('show-tutorial', this.replayTutorial, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
        this.input.setDefaultCursor('default')
    }

    /* ═══════════════════════════════════════════════ atalhos de estado */

    private get level(): Level { return LEVELS[this.levelIdx] }
    private get caso(): Caso { return this.level.cases[this.caseIdx] }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearBoard() {
        this.building?.destroy()
        this.building = undefined
        this.editor?.destroy()
        this.editor = undefined
    }

    private async playCase(withTutorial: boolean) {
        const gen = ++this.gen
        const caso = this.caso

        this.state = 'briefing'
        /*
         * `locked` é estado de MOMENTO, não de caso. Sem zerar aqui, o caso que
         * termina bem deixa a trava ligada e o seguinte monta a tela inteira
         * sem aceitar um toque.
         */
        this.locked = false
        this.clearBoard()

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.emitCheckpoint()

        this.building = createBuilding(this, {
            floors: caso.floors, windows: caso.windows,
        })
        FX.popIn(this, this.building.container, { from: 0.94, duration: 400 })

        this.editor = createEditor(this, {
            nested: caso.nested,
            allowTop: caso.allowTop,
            maxOuter: MAX_OUTER,
            maxInner: MAX_INNER,
            onRun: () => void this.onRun(),
        })
        FX.slideIn(this, this.editor.container, { dx: 40, duration: 380 })

        await this.question.show(caso.question)
        if (gen !== this.gen) return

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'montando'
                })
                return
            }
        }

        this.state = 'montando'
    }

    /* ═══════════════════════════════════════════════════════ executar */

    /**
     * Roda o programa.
     *
     * A simulação decide o resultado ANTES da animação começar (`simulate` em
     * casos.ts). A animação só mostra o que já foi decidido — assim uma troca de
     * caso no meio do percurso não deixa o placar dependendo de quantos quadros
     * deu tempo de desenhar.
     */
    private async onRun() {
        if (this.state !== 'montando' || this.locked || this.ended) return
        if (!this.building || !this.editor) return

        const gen = this.gen
        const caso = this.caso
        const outer = caso.nested ? this.editor.outer() : 1
        const inner = this.editor.inner()

        this.state = 'rodando'
        this.locked = true
        this.editor.setEnabled(false)
        this.editor.setReport('', C.paper)
        this.editor.beginRun()
        this.building.resetWindows()
        this.building.parkCleaner()

        const result = simulate(caso, outer, inner)
        const steps = plan(caso, outer, inner)

        /*
         * O passo encolhe conforme o prédio cresce.
         *
         * Sessenta janelas a 200ms dariam doze segundos de animação, e a criança
         * larga o jogo no meio. A 55ms o percurso inteiro cabe em pouco mais de
         * três segundos e ainda dá para ver o laço de dentro correndo.
         */
        const stepMs = Phaser.Math.Clamp(Math.round(2600 / Math.max(1, steps.length)), 55, 230)

        let lastFloor = -1
        let stopped = false

        for (const step of steps) {
            if (gen !== this.gen) return

            if (step.floor >= caso.floors) {
                this.playBump()
                await this.building.bumpTop()
                stopped = true
                break
            }
            if (step.win >= caso.windows) {
                this.playBump()
                await this.building.bumpSide(step.floor)
                stopped = true
                break
            }

            // ── laço de FORA: troca de andar ───────────────────────────
            if (step.floor !== lastFloor) {
                lastFloor = step.floor
                this.building.highlightFloor(step.floor, true)
                this.editor.newFloor(step.floor)
                this.playFloor()
                await FX.wait(this, stepMs)
                if (gen !== this.gen) return
            }

            // ── laço de DENTRO: uma janela ─────────────────────────────
            this.editor.washWindow(step.win)
            this.building.setWindow(step.floor, step.win, 'washing')
            /*
             * A pose de esfregar entra ANTES do trajeto, não ao chegar.
             *
             * Num prédio de dez andares o passo cai para 55ms, e uma pose que só
             * aparecesse na parada duraria menos que um piscar. Chegar já
             * esfregando é o que faz o boneco parecer trabalhando.
             */
            this.building.setWashing(true)
            await this.building.moveCleaner(step.floor, step.win, stepMs)
            if (gen !== this.gen) return

            this.building.setWindow(step.floor, step.win, 'clean')
            this.playWash()
            await FX.wait(this, Math.round(stepMs * 0.35))
            if (gen !== this.gen) return
        }

        this.building.highlightFloor(0, false)
        this.building.setWashing(false)
        void stopped

        // ── relatório ──────────────────────────────────────────────────
        if (result.exact) {
            this.hits += 1
            this.points += POINTS.solve
            this.playSolved()
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.solve, stage: this.level.level,
            })
            this.emitCheckpoint()

            /*
             * O bônus por "laço esperto" saiu junto com o número do Nível 3:
             * ali o laço indefinido virou o único caminho, e um prêmio que
             * ninguém tem como perder não é prêmio, é ruído no relatório.
             */
            this.editor.setReport(
                `${result.washed} de ${result.total} janelas`
                + (result.usedTop ? '  ·  sem contar andar' : ''),
                C.ok,
            )
            void FX.sparks(this, SITE.cx, 420, { color: C.ok, count: 24, spread: 240 })
            void FX.flash(this, C.white, { duration: 280, peak: 0.24 })

            this.state = 'solved'
            void this.solve()
            return
        }

        this.errors += 1
        this.points += POINTS.miss
        this.playError()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.miss, stage: this.level.level,
        })
        this.emitCheckpoint()

        const line = this.explain(caso, outer, inner, result.washed, result.total)
        this.editor.setReport(`${result.washed} de ${result.total} janelas`, C.bump)
        showToast(this, line, C.bump, 3000)

        await FX.wait(this, 600)
        if (gen !== this.gen) return

        this.state = 'montando'
        this.locked = false
        this.editor.setEnabled(true)
    }

    /**
     * Por que o programa não fechou.
     *
     * Diz QUAL dos dois laços está errado e para que lado — "sobrou" e "faltou"
     * são correções diferentes, e um "tente de novo" genérico obrigaria a
     * criança a descobrir isso no chute.
     */
    private explain(caso: Caso, outer: number, inner: number, washed: number, total: number): string {
        if (outer !== TOP && outer > caso.floors) {
            return `Ele bateu no telhado: você mandou subir ${outer} andares e o prédio tem ${caso.floors}.`
        }
        if (inner > caso.windows) {
            return `Ele passou da última janela: ${inner} lavagens num andar de ${caso.windows}.`
        }
        if (inner < caso.windows) {
            return `Sobrou janela suja em cada andar. O laço de dentro deu ${inner} voltas.`
        }
        if (outer !== TOP && outer < caso.floors) {
            return `Faltou andar: o laço de fora deu ${outer} voltas num prédio de ${caso.floors}.`
        }
        return `Lavou ${washed} de ${total}. Confira os dois números.`
    }

    /* ═══════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.locked = true
        this.editor?.setEnabled(false)

        showToast(this, this.caso.successLine, C.ok, 3200)
        await FX.wait(this, 2800)
        if (gen !== this.gen) return

        this.caseIdx += 1
        if (this.caseIdx >= this.level.cases.length) {
            void this.endLevel()
            return
        }
        void this.playCase(false)
    }

    /* ═══════════════════════════════════════════════ avanço de nível */

    private async endLevel() {
        this.ended = true
        this.locked = true
        this.gen += 1
        this.hud.setProgress(this.level.cases.length, this.level.cases.length)
        this.hud.setHelpEnabled(false)

        runtimeGameBridge.emit({
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Prédio limpo!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.outer,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Subindo o andaime do próximo prédio...',
                    onComplete: () => this.scene.restart({ level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.outer, C.inner, C.ok, C.paper] })
        showLevelComplete(this, {
            title: 'Mestre dos laços!',
            subtitle: 'Um laço dentro do outro resolve prédio de qualquer tamanho',
            message: `Prédios: ${this.hits}  ·  Ajustes: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.outer,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`, e nunca acima de 540: o botão "Próximo" nasce
     * 46px ABAIXO do balão, e mais do que isso o joga para fora da tela.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const nested = this.caso.nested
        const editorSpot = nested
            ? {
                x: EDITOR.cx, y: EDITOR.outerCY,
                w: EDITOR.outerW + 40, h: EDITOR.outerH + 40,
            }
            : {
                x: EDITOR.cx, y: EDITOR.soloCY,
                w: EDITOR.outerW + 40, h: EDITOR.soloH + 40,
            }

        if (this.level.level === 2) {
            return [{
                text: 'Agora são dois laços, um DENTRO do outro. O roxo sobe andares, o laranja lava janelas — e as bolinhas de dentro recomeçam a cada andar.',
                shape: 'rect', ...editorSpot, balloonX: 440, balloonY: 210,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Repare no bloco roxo: ele não tem número, está escrito "até o topo". Ele sobe sozinho até acabar o prédio. Você só diz quantas janelas tem um andar.',
                shape: 'rect', ...editorSpot, balloonX: 440, balloonY: 210,
            }]
        }

        return [{
            text: 'Use − e + para escolher quantas vezes. As bolinhas mostram o número. Depois aperte EXECUTAR.',
            shape: 'rect', ...editorSpot, balloonX: 440, balloonY: 210,
        }]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co03-l${this.level.level}`,
            once: !force,
            accent: C.outer,
            safeTop: HUD.y + HUD.h + 12,
            steps,
            onFinish: () => {
                this.locked = false
                this.hud.setHelpEnabled(true)
                onFinish()
            },
        })
    }

    private replayTutorial = () => {
        if (this.ended || this.locked) return
        if (this.state !== 'montando') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'montando'
        })
    }

    /* ═══════════════════════════════════════════════════════ plataforma */

    private emitCheckpoint(forceComplete = false) {
        const before = LEVELS.slice(0, this.levelIdx).reduce((s, l) => s + l.cases.length, 0)
        const done = before + this.caseIdx + (forceComplete ? 1 : 0)

        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress: Math.round((done / TOTAL_CASES) * 100),
            score: Math.max(0, this.points),
            stage: this.level.level,
            hits: this.hits,
            errors: this.errors,
        })
    }

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            this.points = cmd.points ?? this.points
        })
    }

    private onMuteAudio = (muted: boolean) => { this.isMuted = muted }

    /* ═══════════════════════════════════════════════════════════ áudio */

    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.1) {
        const ctx = this.getAudioCtx()
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g)
        g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start()
        osc.stop(ctx.currentTime + dur)
    }

    /**
     * Cada janela dá uma notinha e cada andar dá outra, mais grave.
     *
     * O ouvido pega o padrão antes dos olhos: a criança escuta o laço de dentro
     * correndo rápido e o de fora batendo devagar, e é a mesma estrutura que
     * está desenhada nos blocos.
     */
    private playWash() { this.playTone(720, 0.04, 'triangle', 0.05) }
    private playFloor() { this.playTone(360, 0.08, 'sine', 0.08) }
    private playBump() { this.playTone(190, 0.16, 'square', 0.09) }
    private playError() { this.playTone(260, 0.14, 'sine', 0.07) }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
