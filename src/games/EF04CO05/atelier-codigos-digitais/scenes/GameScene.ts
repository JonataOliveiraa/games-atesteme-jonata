import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES } from '../data/levels'
import { TINTAS, PORQUE, FORMATOS } from '../data/tintas'
import { C } from '../data/theme'
import { HUD, GRID, LEGENDA, CARDS } from '../data/layout'
import type { Caso, CaseState, Face, Formato, Level } from '../types'

import {
    createRoom, createHud, createQuestionLine, createGrid, createGridLabel,
    createLegenda, createCards, showToast, paintFlowArrow, ACCENT,
    type Cards, type GridView, type Hud, type Legenda, type QuestionLine,
} from './effects'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'atelier-codigos-digitais'

const POINTS = {
    solve: 25,
    /** Escolher o formato errado no Nível 3. */
    miss: -5,
} as const

export class GameScene extends Phaser.Scene {
    private lives!: Lives
    private livesTotal = 3
    private livesLeft = 3

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

    /* ── o que nasce e morre a cada caso ───────────────────────────── */

    private encomenda?: GridView
    private quadro?: GridView
    private legenda?: Legenda
    private cards?: Cards
    private arrow?: Phaser.GameObjects.Graphics
    private labels: Phaser.GameObjects.Text[] = []

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
    init(data: { level?: number; phase?: number; points?: number; lives?: number }) {
        this.livesTotal = vidasIniciais(this, 3)
        this.livesLeft = data?.lives ?? this.livesTotal
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
        this.labels = []
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createRoom(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)
        this.hud.setOficinas(this.level.oficinas)

        this.question = createQuestionLine(this)

        EventBus.on('mute-audio', this.onMuteAudio, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // O tutorial é a abertura do NÍVEL, não de um caso qualquer.
        void this.playCase(this.caseIdx === 0)

        /* AJUSTE A POSIÇÃO COM A TECLA M (dev). Ver shared/hud/createLives.ts */
        this.lives = createLives(this, {
            total: this.livesTotal,
            remaining: this.livesLeft,
            gameId: GAME_ID,
            x: 40,
            y: 40,
            size: 30,
            stage: () => this.level.level,
        })
        this.events.once('shutdown', () => this.lives.destroy())
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

    /**
     * De que lado cada grade se mostra.
     *
     *   decodificar → a encomenda é o código, o quadro é a imagem
     *   codificar   → a encomenda é a imagem, o quadro é o código
     *
     * Uma pergunta, uma resposta, um lugar. As duas grades e a revelação do
     * fim leem daqui, então é impossível uma delas discordar das outras.
     */
    private faces(caso: Caso): { encomenda: Face; quadro: Face } {
        return caso.direcao === 'decodificar'
            ? { encomenda: 'codigo', quadro: 'imagem' }
            : { encomenda: 'imagem', quadro: 'codigo' }
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

    private clearBoard() {
        this.encomenda?.destroy(); this.encomenda = undefined
        this.quadro?.destroy(); this.quadro = undefined
        this.legenda?.destroy(); this.legenda = undefined
        this.cards?.destroy(); this.cards = undefined
        this.arrow?.destroy(); this.arrow = undefined
        this.labels.forEach(t => t.destroy())
        this.labels = []
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

        /*
         * O TABULEIRO ENTRA ANTES DO TUTORIAL.
         *
         * O tutorial aponta para a legenda, para o quadro e para as cartas com
         * um recorte na tela. Quando ele rodava primeiro, recortava tela vazia:
         * a criança via um buraco iluminado em cima de nada e um balão falando
         * de peças que ainda não existiam.
         */
        if (this.level.escolhe) this.openCards()
        else this.openAtelier()

        // guarda o estado real do tabuleiro para devolver no fim do tutorial
        const back = this.state
        if (withTutorial) this.locked = true

        await this.question.show(caso.question)
        if (gen !== this.gen) return

        if (!withTutorial) return

        const steps = this.buildTutorialSteps()
        if (!steps.length) {
            this.locked = false
            return
        }

        this.runTutorial(steps, false, () => {
            if (gen !== this.gen) return
            this.state = back
        })
    }

    /* ═══════════════════════════════════════════════ escolha do formato */

    private openCards() {
        const caso = this.caso
        this.state = 'escolhendo'
        this.cards = createCards(this, {
            pedido: caso.pedido ?? '',
            onPick: f => void this.onPickFormat(f),
        })
    }

    private async onPickFormat(escolhido: Formato) {
        if (this.state !== 'escolhendo' || this.locked || this.ended) return

        const gen = this.gen
        const caso = this.caso

        if (escolhido !== caso.formato) {
            this.locked = true
            this.cards?.setEnabled(false)
            this.errors += 1
            this.points += POINTS.miss
            this.playError()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
            this.emitCheckpoint()

            await this.cards?.reject(escolhido)
            if (gen !== this.gen) return

            showToast(this, PORQUE[escolhido], C.warn, 3400)

            await FX.wait(this, 400)
            if (gen !== this.gen) return

            this.locked = false
            this.cards?.setEnabled(true)
            return
        }

        this.locked = true
        this.cards?.setEnabled(false)
        this.playPick()

        const cards = this.cards
        if (cards) {
            FX.kill(this, cards.container)
            await FX.to(this, cards.container, { alpha: 0, y: -40 }, { duration: 300 })
        }
        if (gen !== this.gen) return

        this.cards?.destroy()
        this.cards = undefined
        this.locked = false
        this.openAtelier()
    }

    /* ═══════════════════════════════════════════════════════ o ateliê */

    private openAtelier() {
        const caso = this.caso
        const tintas = TINTAS[caso.formato]
        const face = this.faces(caso)
        const accent = ACCENT[caso.formato]

        /*
         * O quadro começa VAZIO, e não no índice 0.
         *
         * O índice 0 não é "vazio" em oficina nenhuma: no bitmap ele é branco,
         * no cinza é preto, na cor é vermelho. Um quadro que começasse no 0
         * daria linhas certas de graça — a primeira linha do coração é
         * `000000` — antes de a criança tocar em nada.
         */
        const empty = Array.from({ length: caso.rows }, () =>
            new Array<number>(caso.cols).fill(-1))

        // as letras precisam de célula maior que os dígitos
        const maxCell = caso.formato === 'ascii' ? GRID.asciiCell : GRID.maxCell

        this.encomenda = createGrid(this, {
            cx: GRID.encomendaCX, cy: GRID.cy,
            cols: caso.cols, rows: caso.rows,
            tintas, face: face.encomenda, values: caso.art, maxCell,
        })

        this.quadro = createGrid(this, {
            cx: GRID.quadroCX, cy: GRID.cy,
            cols: caso.cols, rows: caso.rows,
            tintas, face: face.quadro, values: empty, maxCell,
            onTap: (r, c) => this.onPaint(r, c),
        })

        this.arrow = this.add.graphics()
            .setPosition(GRID.arrowX, GRID.cy)
            .setDepth(24)
        paintFlowArrow(this.arrow, accent)

        this.labels = [
            createGridLabel(this, GRID.encomendaCX, 'A ENCOMENDA', C.idle),
            createGridLabel(this, GRID.quadroCX, 'SEU QUADRO', accent),
        ]

        const oficina = FORMATOS.find(f => f.key === caso.formato)
        this.legenda = createLegenda(this, {
            tintas, accent,
            titulo: `LEGENDA · ${oficina?.nome ?? ''}`,
            onPick: () => this.playPick(),
        })

        FX.popIn(this, this.encomenda.container, { from: 0.94, duration: 320 })
        FX.popIn(this, this.quadro.container, { from: 0.94, duration: 320 })
        FX.popIn(this, this.arrow, { from: 0.4, duration: 380 })
        FX.slideIn(this, this.legenda.container, { dy: 30, duration: 340 })

        this.checkRows()
        this.state = 'montando'
    }

    private onPaint(r: number, c: number) {
        if (this.state !== 'montando' || this.locked || this.ended) return
        if (!this.quadro || !this.legenda) return

        const index = this.legenda.picked()
        if (this.quadro.get(r, c) === index) return

        this.quadro.set(r, c, index)
        this.playPaint()
        this.checkRows()
    }

    /**
     * Confere linha por linha, e é a comparação com o original que o briefing
     * pede — só que contínua, em vez de um botão no fim.
     *
     * Sem botão a criança nunca "entrega errado": ela vê a linha acender no
     * instante em que acerta, e o caso fecha sozinho quando todas acendem.
     */
    private checkRows() {
        if (!this.quadro) return
        const caso = this.caso
        const mine = this.quadro.values()

        let allOk = true
        for (let r = 0; r < caso.rows; r += 1) {
            const ok = caso.art[r].every((v, c) => mine[r][c] === v)
            this.quadro.markRow(r, ok)
            this.encomenda?.markRow(r, ok)
            if (!ok) allOk = false
        }

        if (allOk && this.state === 'montando') void this.solve()
    }

    /* ═══════════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.quadro?.setEnabled(false)
        this.legenda?.setEnabled(false)

        this.hits += 1
        this.points += POINTS.solve
        this.playSolved()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.solve, stage: this.level.level,
        })
        this.emitCheckpoint()

        /*
         * O "antes e depois" do briefing.
         *
         * Quando a criança CODIFICOU, o quadro está cheio de números — e é aí
         * que a imagem nasce por cima deles, célula a célula. É a única hora do
         * jogo em que ela vê o código virar desenho sem tocar em nada.
         */
        await this.quadro?.reveal()
        if (gen !== this.gen) return

        void FX.sparks(this, GRID.quadroCX, GRID.cy, { color: C.ok, count: 26, spread: 280 })
        void FX.flash(this, C.white, { duration: 260, peak: 0.18 })

        showToast(this, `${this.caso.titulo}. ${this.caso.successLine}`, C.ok, 3200)
        await FX.wait(this, 2900)
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
            type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level, totalStages: LEVELS.length,
        })
        this.emitCheckpoint(true)

        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            showLevelComplete(this, {
                title: 'Encomenda entregue!',
                subtitle: `Oficina ${lvl} concluída`,
                message: this.level.objective,
                accent: ACCENT[this.level.oficinas[0]],
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Abrindo a próxima oficina...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.bitmap, C.cinza, C.cor, C.ascii] })
        showLevelComplete(this, {
            title: 'Mestre do ateliê!',
            subtitle: 'Preto e branco, tons, cores e letras: cada informação com o código que serve',
            message: `Encomendas: ${this.hits}  ·  Trocas de formato: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesTotal, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.bitmap,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`, e nunca abaixo de 540: o botão "Próximo"
     * nasce 46px ABAIXO do balão, e mais do que isso o joga para fora da tela.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const legendaSpot = {
            x: 640, y: LEGENDA.cy,
            w: LEGENDA.barW, h: LEGENDA.barH,
        }
        const quadroSpot = {
            x: GRID.quadroCX, y: GRID.cy,
            w: GRID.box + 60, h: GRID.box + 60,
        }
        const cardsSpot = {
            x: 640, y: CARDS.cy,
            w: FORMATOS.length * CARDS.w + (FORMATOS.length - 1) * CARDS.gap + 30,
            h: CARDS.h + 30,
        }

        if (this.level.level === 2) {
            return [{
                text: 'Agora o número não é aceso nem apagado: é um TOM. Quanto maior, mais claro — 0 é preto, 255 é branco.',
                shape: 'rect', ...legendaSpot, balloonX: 640, balloonY: 300,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Leia a encomenda e escolha o código que dá conta dela sem desperdício. Depois é só pintar como você já sabe.',
                shape: 'rect', ...cardsSpot, balloonX: 640, balloonY: 190,
            }]
        }

        return [
            {
                text: 'Escolha uma tinta na legenda e toque no quadro. É a regra do ateliê inteiro.',
                shape: 'rect', ...legendaSpot, balloonX: 640, balloonY: 300,
            },
            {
                text: 'A encomenda está à esquerda e o seu quadro à direita, na mesma posição. A linha acende quando as duas batem.',
                shape: 'rect', ...quadroSpot, balloonX: 330, balloonY: 200,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co05-l${this.level.level}`,
            once: !force,
            accent: ACCENT[this.level.oficinas[0]],
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
        if (this.state !== 'montando' && this.state !== 'escolhendo') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        const back = this.state
        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = back
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

    private playPaint() { this.playTone(540, 0.05, 'triangle', 0.05) }
    private playPick() { this.playTone(720, 0.06, 'sine', 0.06) }
    private playError() { this.playTone(210, 0.18, 'square', 0.07) }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
