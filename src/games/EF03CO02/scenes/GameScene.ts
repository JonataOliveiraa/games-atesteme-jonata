import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import type {
    ActionId,
    ConditionId,
    Coord,
    Direction,
    LevelConfig,
    MazeChallenge,
    Program,
    RobotState,
    SimulationResult,
    TraceStep,
} from '../types'
import { LEVELS } from '../data/levels'
import {
    ACTION_ICON,
    ACTION_LABELS,
    CONDITION_ICON,
    conditionHolds,
    conditionSentence,
    simulate,
} from '../data/conditions'
import { C, CSS } from '../data/theme'
import {
    BOARD_AREA,
    CONTROLS,
    H,
    PANEL,
    PANEL_HEADER_H,
    SETUP,
    TILE,
    TRAY,
    W,
    WHILE_BLOCK,
    cellCenter,
} from '../data/layout'

const GAME_ID = 'labirinto-do-enquanto'
const MAX_CONSECUTIVE_ERRORS = 3

/** Ritmo da animação do trace. */
const T = {
    check: 620,
    move: 300,
    turn: 240,
    bump: 520,
}

type Phase =
    | 'montando'      // criança mexendo no programa
    | 'prevendo'      // N1: esperando VERDADEIRA/FALSA
    | 'palpite'       // N3: esperando a bandeirinha
    | 'rodando'       // animação em curso
    | 'encerrado'

interface SlotView {
    kind: 'setup' | 'body'
    index: number
    x: number
    y: number
    w: number
    h: number
    zone: Phaser.GameObjects.Zone
}

export class GameScene extends Phaser.Scene {
    // ── progresso ──
    private levelConfig!: LevelConfig
    private challengeIndex = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private points = 0
    private isMuted = false
    private phase: Phase = 'montando'
    private ended = false
    private showLevelIntro = false

    // ── programa em construção ──
    private condition: ConditionId | null = null
    private setup: ActionId[] = []
    private body: ActionId[] = []
    private selectedSlot: { kind: 'setup' | 'body'; index: number } | null = null
    private prediction: Coord | null = null

    // ── execução ──
    private trace: TraceStep[] = []
    private traceIdx = 0
    private result?: SimulationResult
    private live!: RobotState
    private revealed = new Set<string>()

    // ── objetos de cena ──
    private boardLayer!: Phaser.GameObjects.Container
    private trailLayer!: Phaser.GameObjects.Container
    private robot?: Phaser.GameObjects.Image
    private robotGlow?: Phaser.GameObjects.Image
    private predictionFlag?: Phaser.GameObjects.Image
    private fogTiles = new Map<string, Phaser.GameObjects.Image>()

    private panelLayer!: Phaser.GameObjects.Container
    private trayLayer!: Phaser.GameObjects.Container
    private slots: SlotView[] = []
    private conditionStrip?: Phaser.GameObjects.Graphics
    private conditionText?: Phaser.GameObjects.Text
    private runBtn?: Phaser.GameObjects.Container
    private stepCounter?: Phaser.GameObjects.Text

    private overlayObjects: Phaser.GameObjects.GameObject[] = []
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; showLevelIntro?: boolean }) {
        const lvl = (data?.level ?? 1) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.challengeIndex = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.isMuted = false
        this.phase = 'montando'
        this.ended = false
        this.showLevelIntro = data?.showLevelIntro ?? false
        this.condition = null
        this.setup = []
        this.body = []
        this.selectedSlot = null
        this.prediction = null
        this.trace = []
        this.traceIdx = 0
        this.result = undefined
        this.revealed = new Set()
        this.slots = []
        this.fogTiles = new Map()
        this.overlayObjects = []
    }

    private get challenge(): MazeChallenge {
        return this.levelConfig.challenges[this.challengeIndex]
    }

    create() {
        this.drawBackground()

        this.boardLayer = this.add.container(0, 0).setDepth(2)
        this.trailLayer = this.add.container(0, 0).setDepth(3)
        this.panelLayer = this.add.container(0, 0).setDepth(20)
        this.trayLayer = this.add.container(0, 0).setDepth(20)

        EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)
        EventBus.on('show-tutorial', () => this.showTutorial(), this)
        this.registerPlatformCommands()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.showLevelIntro) {
            this.showLevelIntroPanel(() => this.startChallenge())
        } else {
            this.startChallenge()
            if (this.levelConfig.level === 1) this.showTutorial()
        }
    }

    shutdown() {
        this.clearOverlay()
        EventBus.off('mute-audio', undefined, this)
        EventBus.off('show-tutorial', undefined, this)
        this.unsubPlatform?.()
        this.unsubPlatform = undefined
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CICLO DE UM DESAFIO
    // ══════════════════════════════════════════════════════════════════════

    private startChallenge() {
        const ch = this.challenge

        this.condition = ch.given?.condition ?? null
        this.setup = [...(ch.given?.setup ?? [])]
        this.body = [...(ch.given?.body ?? [])]
        this.prediction = null
        this.selectedSlot = null
        this.trace = []
        this.traceIdx = 0
        this.result = undefined
        this.revealed = new Set()
        this.live = { c: ch.start.c, r: ch.start.r, dir: ch.startDir, steps: 0 }

        this.buildBoard()
        this.buildPanel()
        this.buildTray()

        if (ch.mode === 'prever-condicao') {
            // O trace já é conhecido: a criança prevê cada verificação dele.
            this.result = simulate(ch, ch.given!)
            this.trace = this.result.trace
            this.traceIdx = 0
            this.runSetupThenAsk()
        } else if (ch.mode === 'montar-programa' && ch.predictStop) {
            this.phase = 'palpite'
        } else {
            this.phase = 'montando'
        }

        this.refreshRunButton()
        this.broadcast()
    }

    private broadcast() {
        const ch = this.challenge
        const instruction =
            ch.mode === 'prever-condicao' ? 'A condição é verdadeira ou falsa agora?'
                : ch.mode === 'escolher-condicao' ? 'Escolha a condição que para o robô na estrela'
                    : this.phase === 'palpite' ? 'Toque na casa onde você acha que o robô vai parar'
                        : 'Monte o programa e execute'

        EventBus.emit('mission-update', {
            level: this.levelConfig.level,
            challengeIndex: this.challengeIndex,
            totalChallenges: this.levelConfig.challenges.length,
            instruction,
        })
    }

    private emitCheckpoint() {
        const progress = Math.round((this.challengeIndex / this.levelConfig.challenges.length) * 100)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT', gameId: GAME_ID,
            progress, score: this.points, stage: this.levelConfig.level,
            hits: this.hits, errors: this.errors,
        })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  FUNDO
    // ══════════════════════════════════════════════════════════════════════

    private drawBackground() {
        const key = this.levelConfig.level === 3 ? 'bg-campo' : 'bg-oficina'
        const bg = this.add.image(W / 2, H / 2, key).setDepth(-2)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-1)
        veil.fillStyle(C.borda, 0.58)
        veil.fillRect(0, 0, W, H)
    }

    // ══════════════════════════════════════════════════════════════════════
    //  TABULEIRO
    // ══════════════════════════════════════════════════════════════════════

    private key(c: number, r: number) {
        return `${c},${r}`
    }

    private buildBoard() {
        this.boardLayer.removeAll(true)
        this.trailLayer.removeAll(true)
        this.fogTiles.clear()
        this.predictionFlag = undefined

        const ch = this.challenge

        for (let r = 0; r < ch.height; r++) {
            for (let c = 0; c < ch.width; c++) {
                const p = cellCenter(ch, c, r)
                const isWall = ch.walls.some(w => w.c === c && w.r === r)
                const isGoal = ch.goal.c === c && ch.goal.r === r
                const isStart = ch.start.c === c && ch.start.r === r
                const isFog = ch.hidden?.some(h => h.c === c && h.r === r) ?? false

                const base = isWall ? 'tile-parede' : isGoal ? 'tile-objetivo' : isStart ? 'tile-partida' : 'tile-piso'
                this.boardLayer.add(
                    this.add.image(p.x, p.y, base).setDisplaySize(TILE, TILE),
                )

                if (isFog) {
                    const fog = this.add.image(p.x, p.y, 'tile-oculto').setDisplaySize(TILE, TILE)
                    this.boardLayer.add(fog)
                    this.fogTiles.set(this.key(c, r), fog)
                }

                if (isGoal) {
                    const glow = this.add.image(p.x, p.y, 'fx-brilho')
                        .setDisplaySize(TILE * 1.5, TILE * 1.5)
                        .setBlendMode(Phaser.BlendModes.ADD)
                        .setTint(C.amarelo)
                        .setAlpha(0.35)
                    this.boardLayer.add(glow)
                    this.tweens.add({
                        targets: glow, alpha: 0.6, duration: 900,
                        yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
                    })
                }

                // Zona de toque — só usada quando a criança planta a bandeirinha
                const zone = this.add.zone(p.x, p.y, TILE, TILE).setDepth(6)
                zone.setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => this.onTapCell(c, r))
                this.boardLayer.add(zone)
            }
        }

        // Contorno do tabuleiro
        const first = cellCenter(ch, 0, 0)
        const frame = this.add.graphics()
        frame.lineStyle(4, C.borda, 0.9)
        frame.strokeRoundedRect(
            first.x - TILE / 2 - 4, first.y - TILE / 2 - 4,
            ch.width * TILE + 8, ch.height * TILE + 8, 14,
        )
        this.boardLayer.add(frame)

        this.buildRobot()
    }

    private buildRobot() {
        const ch = this.challenge
        const p = cellCenter(ch, ch.start.c, ch.start.r)

        this.robotGlow?.destroy()
        this.robot?.destroy()

        this.robotGlow = this.add.image(p.x, p.y, 'fx-brilho')
            .setDisplaySize(TILE * 1.4, TILE * 1.4)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setTint(C.claro)
            .setAlpha(0.28)
            .setDepth(7)

        this.robot = this.add.image(p.x, p.y, 'robot')
            .setDisplaySize(TILE * 0.78, TILE * 0.78)
            .setAngle(ch.startDir * 90)
            .setDepth(8)
    }

    /** Tira a névoa das células vizinhas — o robô "enxerga" ao chegar perto. */
    private revealAround(state: RobotState) {
        const ch = this.challenge
        if (!ch.hidden) return

        for (const h of ch.hidden) {
            const dist = Math.abs(h.c - state.c) + Math.abs(h.r - state.r)
            const k = this.key(h.c, h.r)
            if (dist > 1 || this.revealed.has(k)) continue

            this.revealed.add(k)
            const fog = this.fogTiles.get(k)
            if (!fog) continue
            this.tweens.add({
                targets: fog, alpha: 0, scale: fog.scale * 1.2, duration: 320,
                onComplete: () => fog.destroy(),
            })
            this.playTone(700, 0.06, 'sine', 0.08)
        }
    }

    private dropTrail(cell: Coord) {
        const p = cellCenter(this.challenge, cell.c, cell.r)
        const mark = this.add.image(p.x, p.y, 'marca-rastro')
            .setDisplaySize(TILE * 0.42, TILE * 0.42)
            .setAlpha(0)
        this.trailLayer.add(mark)
        this.tweens.add({ targets: mark, alpha: 0.55, duration: 240 })
    }

    private onTapCell(c: number, r: number) {
        if (this.phase !== 'palpite') return

        const ch = this.challenge
        if (ch.walls.some(w => w.c === c && w.r === r)) {
            this.playError()
            return
        }

        this.prediction = { c, r }
        const p = cellCenter(ch, c, r)

        if (!this.predictionFlag) {
            this.predictionFlag = this.add.image(p.x, p.y - 12, 'marca-palpite')
                .setDisplaySize(TILE * 0.5, TILE * 0.5)
                .setDepth(9)
        } else {
            this.predictionFlag.setPosition(p.x, p.y - 12)
        }

        this.tweens.add({
            targets: this.predictionFlag,
            scale: this.predictionFlag.scale * 1.2,
            duration: 130, yoyo: true,
        })

        this.playTick()
        this.phase = 'montando'
        this.refreshRunButton()
        this.broadcast()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PAINEL DO PROGRAMA
    // ══════════════════════════════════════════════════════════════════════

    private buildPanel() {
        this.panelLayer.removeAll(true)
        this.slots = []

        const g = this.add.graphics()
        g.fillStyle(C.borda, 0.55)
        g.fillRoundedRect(PANEL.x + 5, PANEL.y + 6, PANEL.w, PANEL.h, PANEL.r)
        g.fillStyle(C.escuro, 0.94)
        g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
        g.lineStyle(4, C.claro, 0.85)
        g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
        g.fillStyle(C.normal, 1)
        g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL_HEADER_H, {
            tl: PANEL.r, tr: PANEL.r, bl: 0, br: 0,
        })
        this.panelLayer.add(g)

        this.panelLayer.add(
            this.add.text(PANEL.x + PANEL.w / 2, PANEL.y + PANEL_HEADER_H / 2, 'PROGRAMA DO ROBÔ', {
                fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
            }).setOrigin(0.5).setResolution(2),
        )

        this.buildSetupRow()
        this.buildWhileBlock()
        this.buildControls()
    }

    private buildSetupRow() {
        const ch = this.challenge
        const editable = ch.mode === 'montar-programa'
        const cx = PANEL.x + PANEL.w / 2
        const w = PANEL.w - 40

        this.panelLayer.add(
            this.add.text(PANEL.x + 22, SETUP.top, 'ANTES DE REPETIR', {
                fontFamily: 'Arial Black, Arial', fontSize: '13px', color: CSS.claro,
            }).setOrigin(0, 0).setResolution(2),
        )

        const slotY = SETUP.top + 40
        const slotH = 44
        const selected = this.selectedSlot?.kind === 'setup'

        this.drawSlot(cx, slotY, w, slotH, this.setup[0], selected, editable)

        if (editable) {
            const zone = this.add.zone(cx, slotY, w, slotH).setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => this.onTapSlot('setup', 0))
            this.panelLayer.add(zone)
            this.slots.push({ kind: 'setup', index: 0, x: cx, y: slotY, w, h: slotH, zone })
        }
    }

    private buildWhileBlock() {
        const ch = this.challenge
        const editable = ch.mode === 'montar-programa'
        const pickable = editable || ch.mode === 'escolher-condicao'

        const bodyCount = Math.max(this.body.length, editable ? WHILE_BLOCK.maxBody : this.body.length)
        const blockH = WHILE_BLOCK.headerH
            + bodyCount * WHILE_BLOCK.slotH
            + (bodyCount - 1) * WHILE_BLOCK.slotGap
            + 16

        const bx = PANEL.x + 14
        const bw = PANEL.w - 28

        const g = this.add.graphics()
        g.fillStyle(C.normal, 0.92)
        g.fillRoundedRect(bx, WHILE_BLOCK.top, bw, blockH, 16)
        g.lineStyle(3, C.amarelo, 0.9)
        g.strokeRoundedRect(bx, WHILE_BLOCK.top, bw, blockH, 16)
        // Faixa lateral: marca visualmente o que está "dentro" do laço
        g.fillStyle(C.amarelo, 0.9)
        g.fillRoundedRect(bx + 6, WHILE_BLOCK.top + WHILE_BLOCK.headerH, 6, blockH - WHILE_BLOCK.headerH - 10, 3)
        this.panelLayer.add(g)

        this.panelLayer.add(
            this.add.text(bx + 16, WHILE_BLOCK.top + 16, '🔁  ENQUANTO', {
                fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
            }).setOrigin(0, 0.5).setResolution(2),
        )

        // ── tira da condição ──
        const stripY = WHILE_BLOCK.top + 52
        const stripW = bw - 28
        const stripH = 40
        const stripX = bx + 14

        this.conditionStrip = this.add.graphics()
        this.paintConditionStrip(false)
        this.panelLayer.add(this.conditionStrip)

        this.conditionText = this.add.text(stripX + 14, stripY + stripH / 2, this.conditionCaption(), {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px',
            color: this.condition ? CSS.creme : CSS.amarelo,
            wordWrap: { width: stripW - 28 },
        }).setOrigin(0, 0.5).setResolution(2)
        this.panelLayer.add(this.conditionText)

        if (pickable && ch.mode === 'montar-programa') {
            const zone = this.add.zone(stripX + stripW / 2, stripY + stripH / 2, stripW, stripH)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => this.showConditionPicker())
            this.panelLayer.add(zone)
        }

        // ── slots do corpo ──
        for (let i = 0; i < bodyCount; i++) {
            const y = WHILE_BLOCK.top + WHILE_BLOCK.headerH + WHILE_BLOCK.slotH / 2
                + i * (WHILE_BLOCK.slotH + WHILE_BLOCK.slotGap)
            const w = bw - 40
            const cx = bx + 20 + w / 2
            const selected = this.selectedSlot?.kind === 'body' && this.selectedSlot.index === i

            this.drawSlot(cx, y, w, WHILE_BLOCK.slotH - 6, this.body[i], selected, editable)

            if (editable) {
                const zone = this.add.zone(cx, y, w, WHILE_BLOCK.slotH - 6)
                    .setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => this.onTapSlot('body', i))
                this.panelLayer.add(zone)
                this.slots.push({ kind: 'body', index: i, x: cx, y, w, h: WHILE_BLOCK.slotH - 6, zone })
            }
        }
    }

    private conditionCaption() {
        return this.condition ? conditionSentence(this.condition) : 'toque para escolher a condição'
    }

    private paintConditionStrip(highlight: boolean, value?: boolean) {
        const g = this.conditionStrip
        if (!g) return

        const bx = PANEL.x + 14
        const bw = PANEL.w - 28
        const x = bx + 14
        const y = WHILE_BLOCK.top + 52
        const w = bw - 28
        const h = 40

        const fill = highlight
            ? (value ? C.verde : C.vermelho)
            : C.escuro

        g.clear()
        g.fillStyle(fill, highlight ? 1 : 0.85)
        g.fillRoundedRect(x, y, w, h, 12)
        g.lineStyle(3, highlight ? C.creme : C.claro, 0.9)
        g.strokeRoundedRect(x, y, w, h, 12)
    }

    /** Um slot do programa: vazio mostra tracejado, cheio mostra ícone + texto. */
    private drawSlot(
        cx: number, cy: number, w: number, h: number,
        action: ActionId | undefined, selected: boolean, editable: boolean,
    ) {
        const g = this.add.graphics()
        g.fillStyle(action ? C.claro : C.escuro, action ? 1 : 0.7)
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10)
        g.lineStyle(selected ? 4 : 2, selected ? C.amarelo : C.borda, selected ? 1 : 0.7)
        g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10)
        this.panelLayer.add(g)

        if (action) {
            this.panelLayer.add(
                this.add.image(cx - w / 2 + 26, cy, ACTION_ICON[action]).setDisplaySize(30, 30),
            )
            this.panelLayer.add(
                this.add.text(cx - w / 2 + 50, cy, ACTION_LABELS[action], {
                    fontFamily: 'Arial Black, Arial', fontSize: '15px', color: CSS.borda,
                }).setOrigin(0, 0.5).setResolution(2),
            )
        } else {
            this.panelLayer.add(
                this.add.text(cx, cy, editable ? 'toque e escolha uma peça' : '—', {
                    fontFamily: 'Arial', fontSize: '13px', color: CSS.claro,
                }).setOrigin(0.5).setResolution(2),
            )
        }
    }

    private buildControls() {
        const ch = this.challenge
        const cx = PANEL.x + PANEL.w / 2

        if (ch.mode === 'prever-condicao') {
            this.stepCounter = this.add.text(cx, CONTROLS.y, 'Passos: 0', {
                fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.amarelo,
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2)
            this.panelLayer.add(this.stepCounter)
            return
        }

        this.runBtn = this.makeButton(cx - 74, CONTROLS.y, 152, CONTROLS.h, 'EXECUTAR', C.verde, () => {
            this.execute()
        })
        this.panelLayer.add(this.runBtn)

        const reset = this.makeButton(cx + 88, CONTROLS.y, 116, CONTROLS.h, 'Limpar', C.normal, () => {
            if (this.phase === 'rodando') return
            this.playTick()
            this.startChallenge()
        })
        this.panelLayer.add(reset)
    }

    private refreshRunButton() {
        if (!this.runBtn) return
        const ch = this.challenge
        const needsPrediction = ch.mode === 'montar-programa' && ch.predictStop
        const ok =
            this.phase !== 'rodando' &&
            this.condition !== null &&
            this.body.length > 0 &&
            (!needsPrediction || this.prediction !== null)

        const g = this.runBtn.getData('bg') as Phaser.GameObjects.Graphics
        this.paintButton(g, 152, CONTROLS.h, ok ? C.verde : C.apagado)
        if (ok) this.runBtn.setInteractive({ useHandCursor: true })
        else this.runBtn.disableInteractive()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  BANDEJA DE PEÇAS
    // ══════════════════════════════════════════════════════════════════════

    private buildTray() {
        this.trayLayer.removeAll(true)
        const ch = this.challenge

        if (ch.mode === 'prever-condicao') this.buildPredictionButtons()
        else if (ch.mode === 'escolher-condicao') this.buildConditionChips()
        else this.buildActionCards()
    }

    /** N1: os dois botões de resposta. */
    private buildPredictionButtons() {
        const w = 380
        const h = TRAY.cardH
        const gap = 40
        const left = W / 2 - (w + gap / 2)
        const right = W / 2 + (w + gap / 2)

        const make = (x: number, label: string, sub: string, color: number, answer: boolean) => {
            const btn = this.add.container(x, TRAY.y)
            const g = this.add.graphics()
            this.paintButton(g, w, h, color, 24)
            const title = this.add.text(0, -20, label, {
                fontFamily: 'Arial Black, Arial', fontSize: '30px', color: '#ffffff',
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2)
            const desc = this.add.text(0, 22, sub, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: '#ffffffdd',
            }).setOrigin(0.5).setResolution(2)

            btn.add([g, title, desc])
            btn.setSize(w, h)
            btn.setData('bg', g)
            btn.setInteractive({ useHandCursor: true })
            btn.on('pointerover', () => {
                if (this.phase === 'prevendo') this.tweens.add({ targets: btn, scale: 1.03, duration: 90 })
            })
            btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 90 }))
            btn.on('pointerdown', () => this.onPredict(answer))
            this.trayLayer.add(btn)
            return btn
        }

        make(left, 'VERDADEIRA', 'o robô repete o passo', C.verde, true)
        make(right, 'FALSA', 'o laço para agora', C.vermelho, false)
    }

    /** N2: as três pastilhas de condição, no tamanho natural do PNG. */
    private buildConditionChips() {
        const ch = this.challenge
        const options = ch.conditionOptions ?? []
        const total = options.length * TRAY.chipW + (options.length - 1) * TRAY.gap
        const startX = W / 2 - total / 2 + TRAY.chipW / 2

        options.forEach((opt, i) => {
            const x = startX + i * (TRAY.chipW + TRAY.gap)
            const chip = this.add.container(x, TRAY.y)

            const bg = this.add.image(0, 0, 'chip-condicao')
                .setDisplaySize(TRAY.chipW, TRAY.chipH)
            const icon = this.add.image(-TRAY.chipW / 2 + 46, 0, CONDITION_ICON[opt])
                .setDisplaySize(52, 52)
            const label = this.add.text(-TRAY.chipW / 2 + 84, 0, conditionSentence(opt), {
                fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.borda,
                wordWrap: { width: TRAY.chipW - 106 },
            }).setOrigin(0, 0.5).setResolution(2)

            const ring = this.add.graphics()
            chip.add([bg, ring, icon, label])
            chip.setSize(TRAY.chipW, TRAY.chipH)
            chip.setData('ring', ring)
            chip.setData('condition', opt)
            chip.setInteractive({ useHandCursor: true })
            chip.on('pointerdown', () => this.onPickCondition(opt))
            chip.on('pointerover', () => {
                if (this.phase !== 'rodando') this.tweens.add({ targets: chip, scale: 1.03, duration: 90 })
            })
            chip.on('pointerout', () => this.tweens.add({ targets: chip, scale: 1, duration: 90 }))

            this.trayLayer.add(chip)
        })

        this.paintChipSelection()
    }

    private paintChipSelection() {
        this.trayLayer.each((child: Phaser.GameObjects.GameObject) => {
            const chip = child as Phaser.GameObjects.Container
            const ring = chip.getData('ring') as Phaser.GameObjects.Graphics | undefined
            if (!ring) return
            const selected = chip.getData('condition') === this.condition
            ring.clear()
            if (!selected) return
            ring.lineStyle(6, C.amarelo, 1)
            ring.strokeRoundedRect(-TRAY.chipW / 2 + 3, -TRAY.chipH / 2 + 3, TRAY.chipW - 6, TRAY.chipH - 6, 18)
        })
    }

    /** N3: as cartas de ação liberadas no desafio. */
    private buildActionCards() {
        const ch = this.challenge
        const actions = ch.allowedActions ?? ['avancar', 'virar-dir', 'virar-esq']
        const total = actions.length * TRAY.cardW + (actions.length - 1) * TRAY.gap
        const startX = W / 2 - total / 2 + TRAY.cardW / 2

        actions.forEach((action, i) => {
            const x = startX + i * (TRAY.cardW + TRAY.gap)
            const card = this.add.container(x, TRAY.y)

            const bg = this.add.image(0, 0, 'card-acao').setDisplaySize(TRAY.cardW, TRAY.cardH)
            const icon = this.add.image(-TRAY.cardW / 2 + 52, 0, ACTION_ICON[action]).setDisplaySize(62, 62)
            const label = this.add.text(-TRAY.cardW / 2 + 94, 0, ACTION_LABELS[action], {
                fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.borda,
                wordWrap: { width: TRAY.cardW - 116 },
            }).setOrigin(0, 0.5).setResolution(2)

            card.add([bg, icon, label])
            card.setSize(TRAY.cardW, TRAY.cardH)
            card.setInteractive({ useHandCursor: true })
            card.on('pointerdown', () => this.onPickAction(action))
            card.on('pointerover', () => {
                if (this.phase !== 'rodando') this.tweens.add({ targets: card, scale: 1.04, duration: 90 })
            })
            card.on('pointerout', () => this.tweens.add({ targets: card, scale: 1, duration: 90 }))

            this.trayLayer.add(card)
        })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  INTERAÇÃO — MONTAGEM
    // ══════════════════════════════════════════════════════════════════════

    private onTapSlot(kind: 'setup' | 'body', index: number) {
        if (this.phase === 'rodando') return

        const list = kind === 'setup' ? this.setup : this.body
        if (list[index]) {
            // Slot cheio: tocar devolve a peça
            list.splice(index, 1)
            this.playTick()
        } else {
            this.selectedSlot = { kind, index }
            this.playTick()
        }

        this.rebuildPanel()
    }

    private onPickAction(action: ActionId) {
        if (this.phase === 'rodando') return

        const target = this.selectedSlot ?? this.firstEmptySlot()
        if (!target) {
            this.playError()
            return
        }

        if (target.kind === 'setup') this.setup[target.index] = action
        else this.body[target.index] = action

        this.playTick()
        this.selectedSlot = this.firstEmptySlot()
        this.rebuildPanel()
    }

    private firstEmptySlot(): { kind: 'setup' | 'body'; index: number } | null {
        if (!this.setup[0]) return { kind: 'setup', index: 0 }
        for (let i = 0; i < WHILE_BLOCK.maxBody; i++) {
            if (!this.body[i]) return { kind: 'body', index: i }
        }
        return null
    }

    private onPickCondition(cond: ConditionId) {
        if (this.phase === 'rodando') return
        this.condition = cond
        this.playTick()
        this.conditionText?.setText(this.conditionCaption()).setColor(CSS.creme)
        this.paintChipSelection()
        this.refreshRunButton()
    }

    private rebuildPanel() {
        this.buildPanel()
        this.refreshRunButton()
        this.broadcast()
    }

    private showConditionPicker() {
        if (this.phase === 'rodando') return

        const ch = this.challenge
        const options = ch.allowedConditions ?? []
        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.76).setDepth(300).setInteractive(),
        )
        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(301))

        const PW = 700
        const PH = 160 + options.length * 84

        const bg = this.add.graphics()
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 26)
        bg.fillStyle(C.amarelo, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 14, { tl: 26, tr: 26, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 54, 'Qual condição o laço vai usar?', {
            fontFamily: 'Arial Black, Arial', fontSize: '27px', color: CSS.borda,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        options.forEach((opt, i) => {
            const y = -PH / 2 + 118 + i * 84
            const btn = this.makeButton(0, y, PW - 90, 66, conditionSentence(opt), C.normal, () => {
                overlay.destroy()
                panel.destroy()
                this.onPickCondition(opt)
                this.rebuildPanel()
            })
            panel.add(btn)
        })

        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EXECUÇÃO — N2 e N3
    // ══════════════════════════════════════════════════════════════════════

    private currentProgram(): Program {
        return {
            condition: this.condition!,
            setup: this.setup.filter(Boolean),
            body: this.body.filter(Boolean),
        }
    }

    private execute() {
        if (this.phase === 'rodando' || !this.condition || this.body.length === 0) return

        this.phase = 'rodando'
        this.refreshRunButton()

        this.result = simulate(this.challenge, this.currentProgram())
        this.trace = this.result.trace
        this.traceIdx = 0

        this.playTrace(() => this.finish())
    }

    /** Anima o trace do índice atual até o fim. */
    private playTrace(onDone: () => void) {
        const next = () => {
            if (this.traceIdx >= this.trace.length) {
                onDone()
                return
            }
            const step = this.trace[this.traceIdx++]
            this.animateStep(step, next)
        }
        next()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EXECUÇÃO — N1, passo a passo com previsão
    // ══════════════════════════════════════════════════════════════════════

    /** Roda o setup (se houver) e para na primeira verificação. */
    private runSetupThenAsk() {
        this.phase = 'rodando'
        const step = () => {
            if (this.traceIdx >= this.trace.length) { this.finish(); return }
            const s = this.trace[this.traceIdx]
            if (s.kind === 'verificar') {
                this.phase = 'prevendo'
                this.broadcast()
                return
            }
            this.traceIdx++
            this.animateStep(s, step)
        }
        step()
    }

    private onPredict(answer: boolean) {
        if (this.phase !== 'prevendo') return

        const step = this.trace[this.traceIdx]
        if (!step || step.kind !== 'verificar') return

        const actual = step.conditionValue!
        const correct = answer === actual

        this.phase = 'rodando'

        if (correct) {
            this.hits++
            this.consecutiveErrors = 0
            this.points += 5
            this.playCorrect()
        } else {
            this.errors++
            this.consecutiveErrors++
            this.points = Math.max(0, this.points - 2)
            this.playError()
            this.cameras.main.shake(120, 0.004)
            runtimeGameBridge.emit({
                type: 'WRONG_ANSWER', gameId: GAME_ID,
                pointsEarned: -2, stage: this.levelConfig.level,
            })
            this.flashMessage(
                actual ? 'Era VERDADEIRA — o caminho ainda dava.' : 'Era FALSA — aqui o laço para.',
                C.vermelho,
            )
        }
        this.emitCheckpoint()

        // Independente do palpite, a simulação segue pelo valor real.
        this.traceIdx++
        this.animateStep(step, () => {
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
                this.gameOver()
                return
            }
            this.runSetupThenAsk()
        })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  ANIMAÇÃO DE UM PASSO DO TRACE
    // ══════════════════════════════════════════════════════════════════════

    private animateStep(step: TraceStep, done: () => void) {
        this.live = step.after

        switch (step.kind) {
            case 'verificar':
                this.animateCheck(step, done)
                return
            case 'avancar':
                this.animateMove(step, done)
                return
            case 'virar':
                this.animateTurn(step, done)
                return
            case 'bater':
                this.animateBump(step, done)
                return
        }
    }

    private animateCheck(step: TraceStep, done: () => void) {
        const value = !!step.conditionValue

        this.paintConditionStrip(true, value)
        this.conditionText?.setColor('#ffffff')

        const badge = this.showBadge(value ? 'badge-verdadeiro' : 'badge-falso')
        this.playTone(value ? 720 : 300, 0.09, value ? 'sine' : 'square', 0.12)

        this.time.delayedCall(T.check, () => {
            this.paintConditionStrip(false)
            this.conditionText?.setColor(CSS.creme)
            badge.destroy()
            done()
        })
    }

    private animateMove(step: TraceStep, done: () => void) {
        const target = step.target!
        const p = cellCenter(this.challenge, target.c, target.r)

        this.dropTrail({ c: step.before.c, r: step.before.r })
        this.stepCounter?.setText(`Passos: ${step.after.steps}`)

        this.tweens.add({
            targets: [this.robot, this.robotGlow],
            x: p.x, y: p.y,
            duration: T.move,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.revealAround(step.after)
                done()
            },
        })
        this.playTone(520, 0.05, 'sine', 0.07)
    }

    private animateTurn(step: TraceStep, done: () => void) {
        // Gira pelo caminho curto: virar à esquerda de 0 para 3 é -90, não +270.
        const delta = step.action === 'virar-dir' ? 90 : -90
        this.tweens.add({
            targets: this.robot,
            angle: (this.robot?.angle ?? 0) + delta,
            duration: T.turn,
            ease: 'Sine.easeInOut',
            onComplete: done,
        })
        this.playTone(440, 0.06, 'triangle', 0.08)
    }

    private animateBump(step: TraceStep, done: () => void) {
        const badge = this.showBadge('badge-batida')
        this.cameras.main.shake(160, 0.006)
        this.playError()

        const dx = (step.target!.c - step.before.c) * 10
        const dy = (step.target!.r - step.before.r) * 10

        this.tweens.add({
            targets: [this.robot, this.robotGlow],
            x: (this.robot?.x ?? 0) + dx,
            y: (this.robot?.y ?? 0) + dy,
            duration: 60, yoyo: true, repeat: 2,
            onComplete: () => {
                this.time.delayedCall(T.bump - 360, () => {
                    badge.destroy()
                    done()
                })
            },
        })
    }

    private showBadge(key: string) {
        const x = this.robot?.x ?? W / 2
        const y = (this.robot?.y ?? H / 2) - TILE * 0.7

        const badge = this.add.image(x, y, key)
            .setDisplaySize(56, 56)
            .setDepth(12)
            .setAlpha(0)
            .setScale(0.6)

        this.tweens.add({
            targets: badge,
            alpha: 1,
            scaleX: badge.scaleX * 1.7, scaleY: badge.scaleY * 1.7,
            y: y - 12,
            duration: 200, ease: 'Back.easeOut',
        })
        return badge
    }

    private flashMessage(text: string, color: number) {
        const y = BOARD_AREA.top + 34
        const cx = (BOARD_AREA.left + BOARD_AREA.right) / 2

        const box = this.add.container(cx, y).setDepth(60)
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black, Arial', fontSize: '20px', color: '#ffffff',
            align: 'center', wordWrap: { width: 640 },
        }).setOrigin(0.5).setResolution(2)

        const g = this.add.graphics()
        g.fillStyle(color, 0.96)
        g.fillRoundedRect(-label.width / 2 - 22, -label.height / 2 - 12, label.width + 44, label.height + 24, 14)
        g.lineStyle(3, C.creme, 0.9)
        g.strokeRoundedRect(-label.width / 2 - 22, -label.height / 2 - 12, label.width + 44, label.height + 24, 14)

        box.add([g, label])
        box.setAlpha(0)
        this.tweens.add({ targets: box, alpha: 1, y: y + 6, duration: 200 })
        this.time.delayedCall(1900, () => {
            this.tweens.add({ targets: box, alpha: 0, duration: 240, onComplete: () => box.destroy() })
        })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  DESFECHO DO DESAFIO
    // ══════════════════════════════════════════════════════════════════════

    private finish() {
        const res = this.result
        if (!res) return

        const ch = this.challenge
        const won = res.outcome === 'objetivo'
        const predictionOk = !ch.predictStop || (
            this.prediction?.c === res.final.c && this.prediction?.r === res.final.r
        )

        if (won && predictionOk) {
            this.hits++
            this.consecutiveErrors = 0
            this.points += ch.predictStop ? 15 : 10
            this.playFanfare()
            this.robot?.setTint(0xffffff)
            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: ch.predictStop ? 15 : 10, stage: this.levelConfig.level,
            })
            this.emitCheckpoint()
            this.showResult(true, ch.predictStop
                ? `${ch.explanation}  Você também acertou onde ele ia parar!`
                : ch.explanation)
            return
        }

        this.errors++
        this.consecutiveErrors++
        this.points = Math.max(0, this.points - 2)
        this.playError()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: -2, stage: this.levelConfig.level,
        })
        this.emitCheckpoint()

        this.showResult(false, this.failureMessage(res, won, predictionOk))
    }

    private failureMessage(res: SimulationResult, won: boolean, predictionOk: boolean): string {
        if (res.outcome === 'bateu') {
            return 'O robô bateu na parede. A condição continuou verdadeira quando já não dava para andar.'
        }
        if (res.outcome === 'infinito') {
            return 'O laço nunca parou! A condição precisa virar falsa em algum momento.'
        }
        if (won && !predictionOk) {
            return 'O robô chegou na estrela, mas parou em outra casa do seu palpite. Repare em qual verificação a condição virou falsa.'
        }
        return 'O laço parou, mas fora da estrela. Pense em qual condição vira falsa exatamente ali.'
    }

    private showResult(correct: boolean, message: string) {
        this.phase = 'encerrado'
        this.clearOverlay()

        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.72).setDepth(300).setInteractive(),
        )
        void overlay

        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(301))

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '21px', color: CSS.borda,
            align: 'center', wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PW = 640
        const PH = 220 + text.height

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.4)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 26)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 26)
        bg.fillStyle(correct ? C.verde : C.vermelho, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 14, { tl: 26, tr: 26, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 62, correct ? 'Conseguiu!' : 'Quase lá!', {
            fontFamily: 'Arial Black, Arial', fontSize: '38px',
            color: correct ? CSS.verde : CSS.vermelho,
        }).setOrigin(0.5).setResolution(2)

        text.setY(-PH / 2 + 62 + 40 + text.height / 2)

        const btn = this.makeButton(0, PH / 2 - 50, 280, 56,
            correct ? 'Continuar' : 'Tentar de novo',
            correct ? C.verde : C.normal,
            () => {
                this.clearOverlay()
                if (correct) this.advance()
                else if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.gameOver()
                else this.startChallenge()
            })

        panel.add([bg, title, text, btn])
        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private advance() {
        this.challengeIndex++
        if (this.challengeIndex >= this.levelConfig.challenges.length) {
            this.endLevel()
            return
        }
        this.startChallenge()
    }

    private endLevel() {
        this.ended = true
        this.playFanfare()
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
        this.emitCheckpoint()

        const next = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null
        this.showLevelDone(next)
    }

    // ══════════════════════════════════════════════════════════════════════
    //  TELAS DE NÍVEL
    // ══════════════════════════════════════════════════════════════════════

    private showLevelIntroPanel(onStart: () => void) {
        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.86).setDepth(400).setInteractive(),
        )
        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(401))

        const PW = 660
        const PH = 400

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.4)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.amarelo, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 72, { tl: 28, tr: 28, bl: 0, br: 0 })

        const badge = this.add.text(0, -PH / 2 + 36, `NÍVEL ${this.levelConfig.level} DE 3`, {
            fontFamily: 'Arial Black, Arial', fontSize: '24px', color: CSS.borda,
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -PH / 2 + 124, this.levelConfig.title, {
            fontFamily: 'Arial Black, Arial', fontSize: '34px', color: CSS.borda,
            align: 'center', wordWrap: { width: PW - 90 },
        }).setOrigin(0.5).setResolution(2)

        const objective = this.add.text(0, -PH / 2 + 196, this.levelConfig.objective, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: CSS.escuro,
            align: 'center', wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)

        const tip = this.add.text(0, 76, this.levelConfig.tip, {
            fontFamily: 'Arial', fontSize: '17px', color: CSS.normal,
            align: 'center', wordWrap: { width: PW - 130 },
        }).setOrigin(0.5).setResolution(2)

        const btn = this.makeButton(0, 150, 280, 58, 'Começar', C.verde, () => {
            this.tweens.add({
                targets: [overlay, panel], alpha: 0, duration: 240,
                onComplete: () => { this.clearOverlay(); onStart() },
            })
        })

        panel.add([bg, badge, title, objective, tip, btn])
        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showLevelDone(next: 2 | 3 | null) {
        this.clearOverlay()

        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.8).setDepth(400).setInteractive(),
        )
        void overlay
        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(401))

        const PW = 640
        const PH = 380

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.4)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.verde, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 14, { tl: 28, tr: 28, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 78, next ? 'Nível concluído!' : 'Jogo concluído!', {
            fontFamily: 'Arial Black, Arial', fontSize: '38px', color: CSS.borda,
        }).setOrigin(0.5).setResolution(2)

        const msg: Record<number, string> = {
            1: 'Você já sabe dizer quando a condição é verdadeira e quando ela para o laço.',
            2: 'Você escolheu a condição certa para cada corredor.',
            3: 'Você montou os próprios programas e previu onde o laço ia parar.',
        }
        const sub = this.add.text(0, -20, msg[this.levelConfig.level] ?? '', {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '20px', color: CSS.escuro,
            align: 'center', wordWrap: { width: PW - 120 },
        }).setOrigin(0.5).setResolution(2)

        const score = this.add.text(0, 48, `Acertos: ${this.hits}   ·   Erros: ${this.errors}   ·   Pontos: ${this.points}`, {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.normal,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, sub, score])

        if (next) {
            const btn = this.makeButton(0, PH / 2 - 54, 300, 58, `Ir para o nível ${next}`, C.verde, () => {
                this.clearOverlay()
                this.scene.restart({ level: next, points: this.points, showLevelIntro: true })
            })
            panel.add(btn)
        } else {
            panel.add(this.makeButton(-146, PH / 2 - 54, 260, 58, 'Jogar de novo', C.verde, () => {
                this.clearOverlay()
                this.scene.restart({ level: 1, points: 0 })
            }))
            panel.add(this.makeButton(146, PH / 2 - 54, 260, 58, 'Outros jogos', C.amarelo, () => {
                EventBus.emit('exit-game')
            }))
        }

        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private gameOver() {
        if (this.ended) return
        this.ended = true
        this.phase = 'encerrado'
        this.clearOverlay()

        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.8).setDepth(400).setInteractive(),
        )
        void overlay
        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(401))

        const PW = 620
        const PH = 340

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.4)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.vermelho, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 14, { tl: 28, tr: 28, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 76, 'Vamos recomeçar', {
            fontFamily: 'Arial Black, Arial', fontSize: '34px', color: CSS.borda,
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, -14, 'Três erros seguidos. Sem problema — reveja a condição com calma e tente de novo.', {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: CSS.escuro,
            align: 'center', wordWrap: { width: PW - 110 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, sub])
        panel.add(this.makeButton(-136, PH / 2 - 52, 244, 56, 'Tentar de novo', C.verde, () => {
            this.clearOverlay()
            this.scene.restart({ level: this.levelConfig.level, points: this.points })
        }))
        panel.add(this.makeButton(136, PH / 2 - 52, 244, 56, 'Sair', C.amarelo, () => {
            EventBus.emit('exit-game')
        }))

        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showTutorial() {
        if (this.phase === 'rodando') return
        this.clearOverlay()

        const overlay = this.addOverlay(
            this.add.rectangle(W / 2, H / 2, W, H, C.borda, 0.8).setDepth(400).setInteractive(),
        )
        void overlay
        const panel = this.addOverlay(this.add.container(W / 2, H / 2).setDepth(401))

        const steps: Array<[string, string]> = [
            ['🔁', 'O laço ENQUANTO repete a ação enquanto a condição for verdadeira.'],
            ['✅', 'Antes de cada repetição, o robô testa a condição. Verdadeira: ele age.'],
            ['🛑', 'Falsa: o laço para na hora, mesmo que ainda houvesse caminho.'],
            ['💡', 'Ninguém sabe de antemão quantas voltas vão acontecer — depende do que ele encontrar.'],
        ]

        const PW = 700
        const PH = 150 + steps.length * 66

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.4)
        bg.fillRoundedRect(-PW / 2 + 6, -PH / 2 + 8, PW, PH, 28)
        bg.fillStyle(C.creme, 0.99)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, PH, 28)
        bg.fillStyle(C.amarelo, 1)
        bg.fillRoundedRect(-PW / 2, -PH / 2, PW, 60, { tl: 28, tr: 28, bl: 0, br: 0 })

        const title = this.add.text(0, -PH / 2 + 30, 'Como funciona o ENQUANTO', {
            fontFamily: 'Arial Black, Arial', fontSize: '25px', color: CSS.borda,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        steps.forEach(([icon, text], i) => {
            const y = -PH / 2 + 100 + i * 66
            panel.add(this.add.text(-PW / 2 + 52, y, icon, { fontSize: '30px' }).setOrigin(0.5))
            panel.add(this.add.text(-PW / 2 + 88, y, text, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: CSS.escuro,
                wordWrap: { width: PW - 150 },
            }).setOrigin(0, 0.5).setResolution(2))
        })

        panel.add(this.makeButton(0, PH / 2 - 46, 280, 56, 'Entendi', C.verde, () => this.clearOverlay()))

        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  WIDGETS E UTILITÁRIOS
    // ══════════════════════════════════════════════════════════════════════

    private addOverlay<Obj extends Phaser.GameObjects.GameObject>(obj: Obj): Obj {
        this.overlayObjects.push(obj)
        return obj
    }

    private clearOverlay() {
        this.overlayObjects.forEach(o => { if (o.active) o.destroy() })
        this.overlayObjects = []
    }

    private paintButton(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number, r?: number) {
        const radius = r ?? h / 2
        g.clear()
        g.fillStyle(C.borda, 0.35)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, radius)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, radius)
        g.fillStyle(0xffffff, 0.16)
        g.fillRoundedRect(-w / 2 + 6, -h / 2 + 6, w - 12, h * 0.3, radius / 2)
        g.lineStyle(3, C.creme, 0.9)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, radius)
    }

    private makeButton(
        x: number, y: number, w: number, h: number,
        label: string, color: number, onClick: () => void,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()
        this.paintButton(g, w, h, color)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: label.length > 26 ? '17px' : '20px',
            color: '#ffffff',
            stroke: CSS.borda, strokeThickness: 3,
            align: 'center', wordWrap: { width: w - 28 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, text])
        btn.setSize(w, h)
        btn.setData('bg', g)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.04, duration: 90 }))
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 90 }))
        btn.on('pointerdown', () => {
            this.tweens.add({ targets: btn, scale: 0.96, duration: 70, yoyo: true })
            this.playTick()
            onClick()
        })
        return btn
    }

    // ── áudio ──

    private ctx(): AudioContext | null {
        if (this.isMuted) return null
        try { return (this.sound as Phaser.Sound.WebAudioSoundManager).context } catch { return null }
    }

    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.2) {
        const ctx = this.ctx()
        if (!ctx) return
        const osc = ctx.createOscillator()
        const g = ctx.createGain()
        osc.connect(g); g.connect(ctx.destination)
        osc.type = type
        osc.frequency.setValueAtTime(freq, ctx.currentTime)
        g.gain.setValueAtTime(gain, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        osc.start(); osc.stop(ctx.currentTime + dur)
    }

    private playTick() { this.playTone(560, 0.04, 'sine', 0.08) }
    private playCorrect() {
        this.playTone(660, 0.09, 'sine', 0.16)
        this.time.delayedCall(95, () => this.playTone(880, 0.11, 'sine', 0.14))
    }
    private playError() { this.playTone(300, 0.2, 'square', 0.14) }
    private playFanfare() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 120, () => this.playTone(f, 0.22, 'sine', 0.28)),
        )
    }

    // ── bridge ──

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type === 'START_GAME') {
                this.points = cmd.points ?? 0
            }
        })
    }
}