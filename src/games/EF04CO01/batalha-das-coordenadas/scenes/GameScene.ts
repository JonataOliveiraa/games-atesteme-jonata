import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete, type LevelCompleteHandle } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'

import { LEVELS, TOTAL_CASES, survivorOf, sameCell } from '../data/levels'
import { C, hex, cellName, colName, rowName } from '../data/theme'
import { HUD, GRID, PANEL } from '../data/layout'
import type { Caso, CaseState, Cell, Level } from '../types'

import {
    createScene, createHud, createGrid, createPanel, showToast,
    type Hud, type GridView, type Panel,
} from './effects'
import { createLives, type Lives } from '../../../../shared/hud/createLives'
import { vidasIniciais } from '../../../../shared/level/vidasIniciais'

const GAME_ID = 'batalha-das-coordenadas'

const POINTS = {
    find: 20,
    discard: 10,
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
    private panel!: Panel
    private modal?: LevelCompleteHandle

    /* ── tabuleiro do caso ─────────────────────────────────────────── */

    private grid?: GridView
    /** `coordenada`: qual alvo da sequência está valendo. */
    private targetIdx = 0
    /** `descartar`: índices de `chests` já riscados. */
    private cut = new Set<number>()

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
        this.targetIdx = 0
        this.cut = new Set()
        this.modal = undefined
    }

    create() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdownScene, this)

        createScene(this)

        this.hud = createHud(this, { onHelp: () => this.replayTutorial() })
        this.hud.setLevel(this.level.level)
        this.hud.setTitle(this.level.title)

        this.panel = createPanel(this)

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

    private get currentTarget(): Cell | undefined {
        return this.caso.targets?.[this.targetIdx]
    }

    /* ═══════════════════════════════════════════════════ ciclo do caso */

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
        this.targetIdx = 0
        this.cut = new Set()

        this.grid?.destroy()
        this.grid = createGrid(this, {
            cols: caso.cols, rows: caso.rows,
            onTap: (col, row) => void this.onTap(col, row),
        })
        FX.popIn(this, this.grid.container, { from: 0.92, duration: 380 })

        this.hud.setProgress(this.caseIdx, this.level.cases.length)
        this.hud.setHint(caso.hint)
        this.panel.setMood('sorridente')
        this.emitCheckpoint()

        if (caso.kind === 'coordenada') {
            this.panel.setCount(0, caso.targets?.length ?? 0)
            await this.panel.showBig(cellName(
                this.currentTarget?.col ?? 0, this.currentTarget?.row ?? 0))
        } else if (caso.kind === 'cruzar') {
            this.panel.setCount(0, 1)
            await this.panel.showClues(caso.clues ?? [])
        } else {
            // os baús entram antes das pistas: a criança precisa ver o que está
            // em jogo para as frases significarem alguma coisa
            caso.chests?.forEach(c => this.grid?.putChest(c.col, c.row))
            this.panel.setCount(0, caso.discard?.length ?? 0)
            await this.panel.showClues(caso.clues ?? [])
        }
        if (gen !== this.gen) return

        if (withTutorial) {
            const steps = this.buildTutorialSteps()
            if (steps.length) {
                this.runTutorial(steps, false, () => {
                    if (gen !== this.gen) return
                    this.state = 'jogando'
                })
                return
            }
        }

        this.state = 'jogando'
    }

    /* ═══════════════════════════════════════════════════ tocar na grade */

    private async onTap(col: number, row: number) {
        if (this.state !== 'jogando' || this.locked || this.ended) return

        if (this.caso.kind === 'descartar') { await this.onDiscardTap(col, row); return }

        const target = this.caso.kind === 'coordenada' ? this.currentTarget : this.caso.target
        if (!target) return

        const gen = this.gen

        // ── errou o cruzamento ─────────────────────────────────────────
        if (!sameCell({ col, row }, target)) {
            this.errors += 1
            this.points += POINTS.miss
            this.panel.setMood('duvida')
            this.playSoft()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
            this.emitCheckpoint()

            await this.grid?.dig(col, row)
            if (gen !== this.gen) return
            showToast(this, this.missLine(col, row, target), C.warn, 2600)
            return
        }

        // ── achou ──────────────────────────────────────────────────────
        this.hits += 1
        this.points += POINTS.find
        this.state = 'revelando'
        this.locked = true
        this.grid?.setEnabled(false)
        this.panel.setMood('feliz')
        this.playFound()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.find, stage: this.level.level,
        })
        this.emitCheckpoint()

        const p = this.grid?.posOf(col, row)
        if (p) FX.popText(this, p.x, p.y - 70, `+${POINTS.find}`, {
            color: hex(C.gold), size: '34px',
        })

        await this.grid?.reveal(col, row)
        if (gen !== this.gen) return

        // ── `coordenada`: ainda há alvos na sequência? ──────────────────
        if (this.caso.kind === 'coordenada') {
            const total = this.caso.targets?.length ?? 0
            this.targetIdx += 1
            this.panel.setCount(this.targetIdx, total)

            if (this.targetIdx < total) {
                const next = this.currentTarget!
                await FX.wait(this, 500)
                if (gen !== this.gen) return
                this.panel.setMood('sorridente')
                await this.panel.showBig(cellName(next.col, next.row))
                if (gen !== this.gen) return
                this.state = 'jogando'
                this.locked = false
                this.grid?.setEnabled(true)
                return
            }
        } else {
            this.panel.setCount(1, 1)
        }

        void this.solve()
    }

    /**
     * Por que aquela célula não era a certa.
     *
     * Diz QUAL das duas metades da coordenada está errada, e não só "errou":
     * confundir a letra com o número é o erro clássico de quem está aprendendo
     * matriz, e a frase é o que separa um do outro.
     */
    private missLine(col: number, row: number, target: Cell): string {
        const here = cellName(col, row)

        if (this.caso.kind === 'cruzar') {
            return col !== target.col
                ? `Você cavou em ${here}. A coluna não bate: releia a pista que fala de coluna.`
                : `Você cavou em ${here}. A linha não bate: releia a pista que fala de linha.`
        }

        const want = cellName(target.col, target.row)
        if (col !== target.col && row === target.row) {
            return `Essa é a coluna ${colName(col)}. O mapa pede a coluna ${colName(target.col)}.`
        }
        if (row !== target.row && col === target.col) {
            return `Essa é a linha ${rowName(row)}. O mapa pede a linha ${rowName(target.row)}.`
        }
        return `Você cavou em ${here}. O mapa pede ${want}.`
    }

    /* ═══════════════════════════════════════════ nível 3: descartar */

    private async onDiscardTap(col: number, row: number) {
        const caso = this.caso
        const chests = caso.chests ?? []
        const index = chests.findIndex(c => sameCell(c, { col, row }))

        // areia sem baú: não é engano, é mira. Não custa ponto.
        if (index < 0) {
            void this.grid?.nudge(col, row)
            showToast(this, 'Só os baús podem ser riscados.', C.off, 1600)
            return
        }
        if (this.cut.has(index)) return

        const gen = this.gen
        const shouldCut = (caso.discard ?? []).includes(index)

        // ── baú que as pistas NÃO eliminam ─────────────────────────────
        if (!shouldCut) {
            this.errors += 1
            this.points += POINTS.miss
            this.panel.setMood('duvida')
            this.playSoft()
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: POINTS.miss, stage: this.level.level,
            })
                this.lives.lose(); this.livesLeft = this.lives.remaining
            this.emitCheckpoint()

            await this.grid?.nudge(col, row)
            if (gen !== this.gen) return
            showToast(this, `Nenhuma pista risca o baú de ${cellName(col, row)}. Confira de novo.`,
                C.warn, 2600)
            return
        }

        // ── registro de descarte ───────────────────────────────────────
        this.cut.add(index)
        this.hits += 1
        this.points += POINTS.discard
        this.locked = true
        this.grid?.setEnabled(false)
        this.playCut()
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.discard, stage: this.level.level,
        })
        this.emitCheckpoint()

        await this.grid?.discard(col, row)
        if (gen !== this.gen) return

        const total = caso.discard?.length ?? 0
        this.panel.setCount(this.cut.size, total)

        if (this.cut.size < total) {
            this.panel.setMood('sorridente')
            this.locked = false
            this.grid?.setEnabled(true)
            return
        }

        // ── sobrou um: o tesouro se revela sozinho ─────────────────────
        const left = survivorOf(caso)
        if (!left) { this.locked = false; this.grid?.setEnabled(true); return }

        this.state = 'revelando'
        this.panel.setMood('feliz')
        this.playFound()

        await FX.wait(this, 400)
        if (gen !== this.gen) return

        const p = this.grid?.posOf(left.col, left.row)
        if (p) FX.popText(this, p.x, p.y - 70, `+${POINTS.find}`, {
            color: hex(C.gold), size: '34px',
        })
        this.points += POINTS.find
        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: POINTS.find, stage: this.level.level,
        })

        await this.grid?.reveal(left.col, left.row)
        if (gen !== this.gen) return

        void this.solve()
    }

    /* ═══════════════════════════════════════════════════ resolvido */

    private async solve() {
        const gen = this.gen
        this.state = 'solved'
        this.locked = true
        this.grid?.setEnabled(false)
        this.playSolved()

        showToast(this, this.caso.successLine, C.ok, 3000)
        await FX.wait(this, 2600)
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

        this.panel.setMood('feliz')
        await FX.wait(this, 300)

        const lvl = this.level.level
        const next = lvl < 3 ? (lvl + 1) as 2 | 3 : null

        if (next) {
            this.modal = showLevelComplete(this, {
                title: 'Tesouro encontrado!',
                subtitle: `Nível ${lvl} concluído`,
                message: this.level.objective,
                accent: C.gold,
                panelColor: C.paper,
                overlayColor: C.ink,
                progress: { total: 3, current: lvl },
                autoAdvance: {
                    delay: 2300,
                    label: 'Preparando o próximo mapa...',
                    onComplete: () => this.scene.restart({ lives: this.livesLeft, level: next, points: this.points }),
                },
            })
            return
        }

        FX.confetti(this, { colors: [C.gold, C.ok, C.water, C.paper] })
        this.modal = showLevelComplete(this, {
            title: 'Capitão das coordenadas!',
            subtitle: 'Você lê qualquer matriz',
            message: `Tesouros: ${this.hits}  ·  Enganos: ${this.errors}  ·  Pontos: ${Math.max(0, this.points)}`,
            accent: C.ok,
            panelColor: C.paper,
            overlayColor: C.ink,
            progress: { total: 3, current: 3 },
            buttons: [
                {
                    label: 'Jogar de novo',
                    color: C.ok,
                    onClick: () => this.scene.restart({ lives: this.livesLeft, level: 1, points: 0 }),
                },
                {
                    label: 'Escolher jogo',
                    color: C.gold,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })
    }

    /* ═══════════════════════════════════════════════════════ tutorial */

    /**
     * Todo passo fixa `balloonY`. A heurística automática do `createTutorial`
     * mede a altura do texto e escolhe acima/abaixo; com o holofote na grade,
     * que ocupa quase a tela inteira à esquerda, a conta cai em cima dela.
     */
    private buildTutorialSteps(): TutorialStep[] {
        const gridSpot = {
            x: GRID.cx, y: 430,
            w: this.caso.cols * (GRID.cell + GRID.gap) + 90,
            h: this.caso.rows * (GRID.cell + GRID.gap) + 90,
        }
        const panelSpot = { x: PANEL.cx, y: PANEL.cardY, w: PANEL.cardW + 30, h: PANEL.cardH + 30 }

        if (this.level.level === 2) {
            return [{
                text: 'Agora são duas pistas. Ache a célula onde as duas se cruzam.',
                shape: 'rect', ...panelSpot, balloonX: 420, balloonY: 420,
            }]
        }

        if (this.level.level === 3) {
            return [{
                text: 'Toque nos baús que as pistas ELIMINAM. O que sobrar é o tesouro.',
                shape: 'rect', ...panelSpot, balloonX: 420, balloonY: 420,
            }]
        }

        return [
            {
                text: 'O mapa diz a coordenada: a letra é a coluna, o número é a linha.',
                shape: 'rect', ...panelSpot, balloonX: 420, balloonY: 420,
            },
            {
                text: 'Ache o cruzamento na grade e cave.',
                shape: 'rect', ...gridSpot, balloonX: 1020, balloonY: 540,
            },
        ]
    }

    private runTutorial(steps: TutorialStep[], force: boolean, onFinish: () => void) {
        this.locked = true
        this.hud.setHelpEnabled(false)

        createTutorial(this, {
            key: `ef04co01-l${this.level.level}`,
            once: !force,
            accent: C.gold,
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
        if (this.state !== 'jogando') return

        const gen = this.gen
        const steps = this.buildTutorialSteps()
        if (!steps.length) return

        this.runTutorial(steps, true, () => {
            if (gen !== this.gen || this.ended) return
            this.state = 'jogando'
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

    /** Cavar no lugar errado é pá na areia, não buzina de erro. */
    private playSoft() { this.playTone(280, 0.12, 'sine', 0.07) }
    private playCut() { this.playTone(420, 0.06, 'triangle', 0.07) }
    private playFound() {
        this.playTone(660, 0.08, 'sine', 0.12)
        this.time.delayedCall(85, () => this.playTone(880, 0.1, 'sine', 0.1))
    }
    private playSolved() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 110, () => this.playTone(f, 0.18, 'sine', 0.13)))
    }
}
