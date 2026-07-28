import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete as showLevelCompleteModal } from '../../../shared/level/showLevelComplete'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import { LEVELS } from '../data/levels'
import { C, CSS } from '../data/theme'
import { POSE } from './BootScene'
import {
    ACTION_ICON,
    ACTION_LABELS,
    CONDITION_ICON,
    CONDITION_LABELS,
    ITEM_FRAME,
    TILE_FRAME,
    conditionQuestion,
    conditionSentence,
    evaluate,
    outcomeMessage,
    simulate,
    visibleProps,
} from '../data/conditions'
import * as L from '../data/layout'
import type {
    ActionId,
    CityChallenge,
    ConditionId,
    ItemId,
    LevelConfig,
    Program,
    PropDef,
    SeStmt,
    SimulationResult,
    TraceStep,
    WorldState,
} from '../types'

const GAME_ID = 'cidade-das-decisoes'
const MAX_CONSECUTIVE_ERRORS = 3

type Phase = 'montando' | 'rodando'

type Slot = 'entao' | 'senao' | 'corpo'
type Path = { stmt: number; slot: Slot } | null

type Row =
    | { kind: 'acao'; depth: number; action: ActionId; path: Path; index: number }
    | { kind: 'se-head'; depth: number; stmt: number }
    | { kind: 'branch'; depth: number; stmt: number; slot: 'entao' | 'senao' }
    | { kind: 'repita-head'; depth: number; stmt: number }

interface PropView {
    def: PropDef
    obj: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
}

export class GameScene extends Phaser.Scene {
    private levelConfig!: LevelConfig
    private challengeIndex = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private points = 0
    private phase: Phase = 'montando'

    private program: Program = []
    private selected: Path = null
    private editingStmt = -1

    private envNow!: WorldState
    private scenarioIdx = 0

    private trace: TraceStep[] = []
    private traceIndex = 0
    private result?: SimulationResult
    private allResults: SimulationResult[] = []

    private boardLayer!: Phaser.GameObjects.Container
    private trailLayer!: Phaser.GameObjects.Container
    private propLayer!: Phaser.GameObjects.Container
    private panelLayer!: Phaser.GameObjects.Container
    private scriptLayer!: Phaser.GameObjects.Container
    private overlay: Phaser.GameObjects.GameObject[] = []

    private propViews: PropView[] = []
    private player?: Phaser.GameObjects.Sprite
    private playerShadow?: Phaser.GameObjects.Image
    private bubble?: Phaser.GameObjects.Container
    private bagIcons: Phaser.GameObjects.Image[] = []

    private lay!: L.ProgramLayout
    private rows: Row[] = []
    private rowGraphics: Phaser.GameObjects.Graphics[] = []
    private scriptMask?: Phaser.Display.Masks.GeometryMask
    private maskShape?: Phaser.GameObjects.Graphics
    private scrollBar?: Phaser.GameObjects.Graphics
    private scrollY = 0
    private scrollMax = 0
    private dragging = false
    private dragMoved = false
    private dragStartY = 0
    private dragStartScroll = 0

    private runBtn?: Phaser.GameObjects.Container
    private tutorialOpen = false
    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number }) {
        const lvl = (data?.level ?? 1) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.challengeIndex = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.phase = 'montando'
        this.program = []
        this.selected = null
        this.editingStmt = -1
        this.trace = []
        this.traceIndex = 0
        this.result = undefined
        this.allResults = []
        this.propViews = []
        this.rows = []
        this.rowGraphics = []
        this.overlay = []
        this.bagIcons = []
        this.scrollY = 0
        this.tutorialOpen = false
    }

    private get challenge(): CityChallenge {
        return this.levelConfig.challenges[this.challengeIndex]
    }

    create() {
        this.drawBackground()

        this.boardLayer = this.add.container(0, 0).setDepth(5)
        this.trailLayer = this.add.container(0, 0).setDepth(6)
        this.propLayer = this.add.container(0, 0).setDepth(10)
        this.panelLayer = this.add.container(0, 0).setDepth(30)

        this.scriptLayer = this.add.container(0, 0).setDepth(31)
        this.maskShape = this.make.graphics({ x: 0, y: 0 }, false)
        this.maskShape.fillStyle(0xffffff)
        this.maskShape.fillRoundedRect(L.SCRIPT.x, L.SCRIPT.y, L.SCRIPT.w, L.SCRIPT.h, 20)
        this.scriptMask = this.maskShape.createGeometryMask()
        this.scriptLayer.setMask(this.scriptMask)

        this.input.topOnly = true

        this.registerPlatformCommands()
        this.registerScroll()
        EventBus.on('show-tutorial', () => this.runTutorial(true, () => { }), this)

        this.events.once('shutdown', () => {
            this.clearOverlay()
            this.scriptLayer?.clearMask()
            this.scriptMask?.destroy()
            this.maskShape?.destroy()
            this.scriptMask = undefined
            this.maskShape = undefined
            EventBus.off('show-tutorial', undefined, this)
            this.unsubPlatform?.()
            this.unsubPlatform = undefined
        })

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        this.startChallenge(false)
        this.showLevelStart(() => this.runTutorial(false, () => this.beginPlay()))
    }
    private startChallenge(autoStart = true) {
        const ch = this.challenge

        this.phase = 'rodando'
        this.selected = null
        this.editingStmt = -1
        this.trace = []
        this.traceIndex = 0
        this.result = undefined
        this.allResults = []
        this.scrollY = 0

        this.program = ch.given ? this.cloneProgram(ch.given) : []
        this.scenarioIdx = ch.mode === 'prever-decisao'
            ? Phaser.Math.Between(0, ch.scenarios.length - 1)
            : 0
        this.envNow = { ...ch.scenarios[this.scenarioIdx] }

        this.drawBoard()
        this.buildPanel()

        if (autoStart) this.beginPlay()
        else this.broadcastMission()
    }

    private beginPlay() {
        this.broadcastMission()

        if (this.challenge.mode !== 'prever-decisao') {
            this.phase = 'montando'
            this.refreshRunButton()
            return
        }

        this.phase = 'rodando'
        this.time.delayedCall(700, () => this.prepareStepwiseRun())
    }

    private cloneProgram(p: Program): Program {
        return p.map(s =>
            s.kind === 'se' ? { ...s, entao: [...s.entao], senao: [...s.senao] }
                : s.kind === 'repita' ? { ...s, corpo: [...s.corpo] }
                    : { ...s },
        )
    }

    private prepareStepwiseRun() {
        this.result = simulate(this.challenge, this.program, this.envNow)
        this.trace = this.result.trace
        this.traceIndex = 0
        this.phase = 'rodando'
        this.time.delayedCall(300, () => this.playTraceFrom(0))
    }

    private broadcastMission() {
        const mode = this.challenge.mode
        const instruction =
            mode === 'prever-decisao' ? 'O programa roda sozinho. Você só responde às perguntas do SE.'
                : mode === 'escolher-condicao' ? 'Escolha a condição que funciona nos dois cenários'
                    : 'Monte o programa e toque em EXECUTAR'

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
    //  DESENHO BASE
    // ══════════════════════════════════════════════════════════════════════

    private drawBackground() {
        const bg = this.add.image(L.W / 2, L.H / 2, 'bg-cidade').setDepth(0)
        bg.setScale(Math.max(L.W / bg.width, L.H / bg.height))
        this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.42).setDepth(1)
    }

    /** Moldura chibi: sombra deslocada, base, brilho no topo e contorno grosso. */
    private drawCard(
        g: Phaser.GameObjects.Graphics,
        r: L.Rect, fill: number, stroke: number, radius = 18, glossy = true,
    ) {
        g.fillStyle(C.borda, 0.45)
        g.fillRoundedRect(r.x, r.y + 6, r.w, r.h, radius)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(r.x, r.y, r.w, r.h, radius)
        if (glossy) {
            g.fillStyle(0xffffff, 0.18)
            g.fillRoundedRect(r.x + 5, r.y + 4, r.w - 10, r.h * 0.36, radius * 0.6)
        }
        g.lineStyle(4, stroke, 0.95)
        g.strokeRoundedRect(r.x, r.y, r.w, r.h, radius)
    }

    private drawBoard() {
        this.boardLayer.removeAll(true)
        this.trailLayer.removeAll(true)
        this.propLayer.removeAll(true)
        this.propViews = []
        this.bagIcons = []
        this.player?.destroy()
        this.playerShadow?.destroy()
        this.bubble?.destroy()
        this.player = undefined
        this.playerShadow = undefined
        this.bubble = undefined

        const ch = this.challenge
        const o = L.boardOrigin(ch)
        const t = o.tile

        const frame = this.add.graphics()
        this.drawCard(frame, {
            x: o.x - t / 2 - 12, y: o.y - t / 2 - 12,
            w: o.boardW + 24, h: o.boardH + 24,
        }, C.escuro, C.claro, 26, false)
        this.boardLayer.add(frame)

        const stripes = this.add.graphics()

        for (let r = 0; r < ch.height; r++) {
            for (let c = 0; c < ch.width; c++) {
                const p = L.cellCenter(ch, c, r)
                const kind = ch.tiles[r * ch.width + c]
                this.boardLayer.add(
                    this.add.image(p.x, p.y, 'tileset-cidade', TILE_FRAME[kind])
                        .setDisplaySize(t, t),
                )
                if (kind === 'asfalto' && c === ch.start.c) {
                    stripes.fillStyle(0xffffff, 0.55)
                    for (let i = 0; i < 3; i++) {
                        stripes.fillRoundedRect(
                            p.x - t * 0.34 + i * (t * 0.26), p.y - t * 0.36,
                            t * 0.14, t * 0.72, 4,
                        )
                    }
                }
            }
        }
        this.boardLayer.add(stripes)

        const goal = L.cellCenter(ch, ch.goal.c, ch.goal.r)
        const glow = this.add.image(goal.x, goal.y, 'fx-brilho')
            .setDisplaySize(t * 1.6, t * 1.6)
            .setTint(C.amarelo)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.3)
        this.boardLayer.add(glow)
        this.tweens.add({ targets: glow, alpha: 0.62, duration: 950, yoyo: true, repeat: -1 })

        this.buildProps()
        this.buildPlayer()
        this.buildGoalLabel()
    }

    private buildProps() {
        const ch = this.challenge
        const t = L.tileSize(ch)

        ch.props.forEach(def => {
            const p = L.cellCenter(ch, def.at.c, def.at.r)
            const scale = L.PROP_SCALE[def.kind] ?? 1
            const size = t * scale

            const shadow = this.add.image(p.x, p.y + t * 0.34, 'fx-sombra')
                .setDisplaySize(size * 0.8, size * 0.3)
                .setAlpha(0.45)

            const obj = this.add.image(p.x, p.y, this.propTexture(def))
                .setOrigin(0.5, 1)
                .setDisplaySize(size, size)
            obj.y = p.y + t * 0.42

            if (def.kind === 'item' && def.item) obj.setFrame(ITEM_FRAME[def.item])

            obj.setDepth(def.at.r * 2 + 1)
            shadow.setDepth(def.at.r * 2)

            this.propLayer.add([shadow, obj])
            this.propViews.push({ def, obj, shadow })
        })

        this.refreshProps()
    }

    private propTexture(def: PropDef): string {
        if (def.kind === 'porta') return this.envNow?.portaAberta ? 'porta-aberta' : 'porta-fechada'
        if (def.kind === 'semaforo') return this.envNow?.semaforoVerde ? 'semaforo-verde' : 'semaforo-vermelho'
        if (def.kind === 'item') return 'itens'
        return def.kind
    }

    private refreshProps() {
        const vis = visibleProps(this.challenge, this.envNow)

        this.propViews.forEach(v => {
            const on = vis.includes(v.def)
            v.obj.setVisible(on)
            v.shadow.setVisible(on)

            if (v.def.kind === 'porta' || v.def.kind === 'semaforo') {
                v.obj.setTexture(this.propTexture(v.def))
            }
        })

        this.paintRain()
    }

    private paintRain() {
        const key = 'rain-emitter'
        const old = this.children.getByName(key)
        if (old) old.destroy()
        if (!this.envNow.chovendo) return

        const ch = this.challenge
        const o = L.boardOrigin(ch)
        const zone = new Phaser.Geom.Rectangle(
            o.x - o.tile / 2, o.y - o.tile / 2 - 40, o.boardW, 40,
        )

        const em = this.add.particles(0, 0, 'gota', {
            x: { min: zone.x, max: zone.x + zone.width },
            y: zone.y,
            lifespan: 900,
            speedY: { min: 340, max: 460 },
            scale: { start: 0.16, end: 0.1 },
            alpha: { start: 0.75, end: 0.2 },
            quantity: 2,
            frequency: 60,
        })
        em.setName(key).setDepth(28)

        const veil = this.add.graphics().setDepth(27)
        veil.fillStyle(0x2f6fbf, 0.12)
        veil.fillRect(o.x - o.tile / 2, o.y - o.tile / 2, o.boardW, o.boardH)
        this.boardLayer.add(veil)
    }

    private buildPlayer() {
        const ch = this.challenge
        const t = L.tileSize(ch)
        const p = L.cellCenter(ch, ch.start.c, ch.start.r)

        this.playerShadow = this.add.image(p.x, p.y + t * 0.3, 'fx-sombra')
            .setDisplaySize(t * 0.6, t * 0.22)
            .setAlpha(0.5)
            .setDepth(200)

        this.player = this.add.sprite(p.x, p.y, 'personagem', POSE.parado)
            .setOrigin(0.5, 0.88)
            .setDisplaySize(t * 0.86, t * 0.86)
            .setDepth(201)
        this.player.y = p.y + t * 0.28
        this.player.setFlipX(ch.startDir === 3)
    }

    private buildGoalLabel() {
        const g = this.add.graphics()
        const label = this.add.text(0, 0, this.challenge.goalLabel, {
            fontFamily: 'Arial Black, Arial', fontSize: '20px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const w = label.width + 56
        const rect: L.Rect = {
            x: L.BOARD_CX - w / 2,
            y: L.boardBottom(this.challenge) + 18,
            w, h: 44,
        }
        this.drawCard(g, rect, C.escuro, C.amarelo, 22)
        label.setPosition(L.cx(rect), L.cy(rect))

        this.boardLayer.add([g, label])
    }

    private trayCount(): number {
        const ch = this.challenge
        if (ch.mode === 'escolher-condicao') return (ch.conditionOptions ?? []).length
        if (ch.mode === 'montar-programa') {
            return (ch.allowedActions ?? []).length + 1 + (ch.allowRepeat ? 1 : 0)
        }
        return 0
    }

    private buildPanel() {
        this.panelLayer.removeAll(true)
        this.scriptLayer.removeAll(true)
        this.rowGraphics = []
        this.runBtn = undefined

        this.lay = L.programLayout(this.challenge.mode, this.trayCount())

        const g = this.add.graphics()
        this.drawCard(g, L.PANEL, C.escuro, C.claro, L.PANEL.r, false)
        g.fillStyle(0xffffff, 0.08)
        g.fillRoundedRect(L.PANEL.x + 8, L.PANEL.y + 6, L.PANEL.w - 16, 70, 22)
        this.panelLayer.add(g)

        this.panelLayer.add(
            this.add.text(L.PANEL.x + L.PANEL.w / 2, L.PANEL_TITLE_Y, 'PROGRAMA', {
                fontFamily: 'Arial Black, Arial', fontSize: '20px', color: CSS.amarelo,
                stroke: CSS.borda, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2),
        )

        const well = this.add.graphics()
        well.fillStyle(C.borda, 0.55)
        well.fillRoundedRect(L.SCRIPT.x, L.SCRIPT.y, L.SCRIPT.w, L.SCRIPT.h, 20)
        well.lineStyle(3, C.normal, 0.7)
        well.strokeRoundedRect(L.SCRIPT.x, L.SCRIPT.y, L.SCRIPT.w, L.SCRIPT.h, 20)
        this.panelLayer.add(well)

        this.scrollBar = this.add.graphics().setDepth(33)
        this.panelLayer.add(this.scrollBar)

        this.panelLabel(L.TRAY_LABEL_Y, this.lay.trayLabel)

        this.buildTray()
        this.buildControls()

        this.refreshScript()
    }

    private panelLabel(y: number, label: string) {
        const t = this.add.text(L.PANEL.x + 30, y, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '16px', color: CSS.claro,
            stroke: CSS.borda, strokeThickness: 3,
        }).setOrigin(0, 0.5).setResolution(2)
        this.panelLayer.add(t)
        return t
    }

    // ── Script ────────────────────────────────────────────────────────────

    private buildRows(): Row[] {
        const rows: Row[] = []
        this.program.forEach((stmt, si) => {
            if (stmt.kind === 'acao') {
                rows.push({ kind: 'acao', depth: 0, action: stmt.action, path: null, index: si })
                return
            }
            if (stmt.kind === 'se') {
                rows.push({ kind: 'se-head', depth: 0, stmt: si })
                rows.push({ kind: 'branch', depth: 0, stmt: si, slot: 'entao' })
                stmt.entao.forEach((a, i) =>
                    rows.push({ kind: 'acao', depth: 1, action: a, path: { stmt: si, slot: 'entao' }, index: i }))
                rows.push({ kind: 'branch', depth: 0, stmt: si, slot: 'senao' })
                stmt.senao.forEach((a, i) =>
                    rows.push({ kind: 'acao', depth: 1, action: a, path: { stmt: si, slot: 'senao' }, index: i }))
                return
            }
            rows.push({ kind: 'repita-head', depth: 0, stmt: si })
            stmt.corpo.forEach((a, i) =>
                rows.push({ kind: 'acao', depth: 1, action: a, path: { stmt: si, slot: 'corpo' }, index: i }))
        })
        return rows
    }

    private refreshScript() {
        this.scriptLayer.removeAll(true)
        this.rowGraphics = []
        this.rows = this.buildRows()

        const editable = this.challenge.mode === 'montar-programa'
        const total = this.rows.length + (editable ? 1 : 0)

        this.scrollMax = Math.max(0, L.scriptContentHeight(total) - L.SCRIPT.h)
        this.scrollY = Phaser.Math.Clamp(this.scrollY, 0, this.scrollMax)

        this.rows.forEach((row, i) => this.paintRow(row, i))
        if (editable) this.paintAddRow(this.rows.length)

        this.scriptLayer.setY(-this.scrollY)
        this.paintScrollBar()
        this.refreshRunButton()
    }

    private paintScrollBar() {
        const g = this.scrollBar
        if (!g) return

        g.clear()
        if (this.scrollMax <= 0) return

        const b = L.SCROLLBAR

        g.fillStyle(C.borda, 0.75)
        g.fillRoundedRect(b.x, b.y, b.w, b.h, b.w / 2)

        const visible = L.SCRIPT.h / (L.SCRIPT.h + this.scrollMax)
        const thumbH = Math.max(46, b.h * visible)
        const t = this.scrollY / this.scrollMax
        const thumbY = b.y + (b.h - thumbH) * t

        g.fillStyle(C.claro, 0.35)
        g.fillRoundedRect(b.x, thumbY + 3, b.w, thumbH, b.w / 2)
        g.fillStyle(C.amarelo, 1)
        g.fillRoundedRect(b.x, thumbY, b.w, thumbH, b.w / 2)
        g.fillStyle(0xffffff, 0.4)
        g.fillRoundedRect(b.x + 2, thumbY + 4, b.w - 4, thumbH * 0.3, b.w / 2)
    }

    private paintRow(row: Row, i: number) {
        const rect = L.rowRect(i, row.depth)
        const g = this.add.graphics()
        this.rowGraphics.push(g)

        const parts: Phaser.GameObjects.GameObject[] = [g]

        if (row.kind === 'acao') {
            const color = row.action === 'pegar' || row.action === 'abrir' ? C.verde : C.normal
            this.drawCard(g, rect, color, C.creme, 14)
            parts.push(this.rowIcon(rect, row.action))
            parts.push(this.rowText(rect, ACTION_LABELS[row.action], CSS.creme))
        }

        if (row.kind === 'se-head') {
            const stmt = this.program[row.stmt] as SeStmt
            const filled = !!stmt.condition
            this.drawCard(g, rect, filled ? C.laranja : C.borda, filled ? C.creme : C.claro, 14)
            this.paintHexSlot(g, rect, stmt.condition)
            const label = filled ? conditionSentence(stmt.condition!) : 'Se ...  toque para escolher'
            parts.push(this.rowText(rect, label, CSS.creme, 58))
            if (stmt.condition) {
                parts.push(this.hexIcon(rect, stmt.condition))
            }
        }

        if (row.kind === 'branch') {
            const active = this.selected?.stmt === row.stmt && this.selected.slot === row.slot
            const tone = row.slot === 'entao' ? C.verde : C.vermelho
            this.drawCard(g, rect, active ? tone : C.borda, active ? C.creme : tone, 14)
            parts.push(this.rowText(rect, row.slot === 'entao' ? 'ENTÃO' : 'SENÃO', CSS.creme, 22))
        }

        if (row.kind === 'repita-head') {
            const stmt = this.program[row.stmt]
            const times = stmt.kind === 'repita' ? stmt.times : 2
            this.drawCard(g, rect, C.laranja, C.creme, 14)
            parts.push(this.rowText(rect, `Repita ${times} vezes`, CSS.creme, 22))
        }

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerup', () => this.onRowTap(row))
        parts.push(zone)

        this.scriptLayer.add(parts)
    }

    private paintAddRow(i: number) {
        const ch = this.challenge
        const max = ch.maxStatements ?? 4
        if (this.program.length >= max && !this.selected) return

        const rect = L.rowRect(i, this.selected ? 1 : 0)
        const g = this.add.graphics()

        g.fillStyle(C.borda, this.selected ? 0.7 : 0.4)
        g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 14)
        g.lineStyle(3, this.selected ? C.amarelo : C.claro, this.selected ? 1 : 0.45)
        g.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 14)

        const label = this.selected
            ? 'escolha uma peça da bandeja'
            : 'toque numa peça para começar'

        const text = this.add.text(L.cx(rect), L.cy(rect), label, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '14px', color: CSS.claro,
        }).setOrigin(0.5).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerup', () => {
            if (this.dragMoved) return
            this.selected = null
            this.playTick()
            this.refreshScript()
        })

        this.scriptLayer.add([g, text, zone])
    }

    private rowIcon(rect: L.Rect, action: ActionId) {
        const icon = ACTION_ICON[action]
        const x = rect.x + 28
        const y = L.cy(rect)

        if (icon.kind === 'seta') {
            return this.add.image(x, y, 'icon-seta')
                .setDisplaySize(32, 32)
                .setAngle(icon.angle)
        }
        const img = this.add.image(x, y, icon.key).setDisplaySize(34, 34)
        if (icon.frame !== undefined) img.setFrame(icon.frame)
        return img
    }

    private rowText(rect: L.Rect, label: string, color: string, left = 52) {
        return this.add.text(rect.x + left, L.cy(rect), label, {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color,
            stroke: CSS.borda, strokeThickness: 3,
            wordWrap: { width: rect.w - left - 16 },
        }).setOrigin(0, 0.5).setResolution(2)
    }

    /** Encaixe hexagonal do SE — vazio fica tracejado, cheio fica creme. */
    private paintHexSlot(g: Phaser.GameObjects.Graphics, rect: L.Rect, cond: ConditionId | null) {
        const cxp = rect.x + 30
        const cyp = L.cy(rect)
        const rw = 24
        const rh = 18

        const pts = [
            { x: cxp - rw, y: cyp },
            { x: cxp - rw * 0.5, y: cyp - rh },
            { x: cxp + rw * 0.5, y: cyp - rh },
            { x: cxp + rw, y: cyp },
            { x: cxp + rw * 0.5, y: cyp + rh },
            { x: cxp - rw * 0.5, y: cyp + rh },
        ]

        g.fillStyle(C.borda, 0.5)
        g.fillPoints(pts.map(p => ({ x: p.x, y: p.y + 3 })), true)
        g.fillStyle(cond ? C.creme : C.escuro, 1)
        g.fillPoints(pts, true)
        g.lineStyle(3, cond ? C.borda : C.claro, 0.9)
        g.strokePoints(pts, true, true)
    }

    private hexIcon(rect: L.Rect, cond: ConditionId) {
        const icon = CONDITION_ICON[cond]
        const img = this.add.image(rect.x + 30, L.cy(rect), icon.key).setDisplaySize(28, 28)
        if (icon.frame !== undefined) img.setFrame(icon.frame)
        return img
    }

    private onRowTap(row: Row) {
        if (this.dragMoved) return
        if (this.phase === 'rodando') return

        const mode = this.challenge.mode

        if (row.kind === 'se-head') {
            if (mode === 'prever-decisao') return
            this.editingStmt = row.stmt
            this.openConditionPicker()
            return
        }

        if (mode !== 'montar-programa') return

        if (row.kind === 'branch') {
            const same = this.selected?.stmt === row.stmt && this.selected.slot === row.slot
            this.selected = same ? null : { stmt: row.stmt, slot: row.slot }
            this.playTick()
            this.refreshScript()
            return
        }

        if (row.kind === 'repita-head') {
            const stmt = this.program[row.stmt]
            if (stmt.kind === 'repita') stmt.times = stmt.times >= 4 ? 2 : stmt.times + 1
            this.playTick()
            this.refreshScript()
            return
        }

        if (row.path === null) this.program.splice(row.index, 1)
        else {
            const list = this.listAt(row.path)
            list?.splice(row.index, 1)
        }
        this.playTick()
        this.refreshScript()
    }

    private listAt(path: Path): ActionId[] | null {
        if (!path) return null
        const stmt = this.program[path.stmt]
        if (!stmt) return null
        if (stmt.kind === 'se') return path.slot === 'senao' ? stmt.senao : stmt.entao
        if (stmt.kind === 'repita') return stmt.corpo
        return null
    }

    private registerScroll() {
        const inScript = (p: Phaser.Input.Pointer) =>
            p.x >= L.SCRIPT.x && p.x <= L.SCRIPT.x + L.SCRIPT.w &&
            p.y >= L.SCRIPT.y && p.y <= L.SCRIPT.y + L.SCRIPT.h

        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            if (!inScript(p)) return
            this.dragging = true
            this.dragMoved = false
            this.dragStartY = p.y
            this.dragStartScroll = this.scrollY
        })

        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.dragging) return
            const dy = p.y - this.dragStartY
            if (Math.abs(dy) > 8) this.dragMoved = true
            if (!this.dragMoved) return
            this.scrollY = Phaser.Math.Clamp(this.dragStartScroll - dy, 0, this.scrollMax)
            this.scriptLayer?.setY(-this.scrollY)
            this.paintScrollBar()
        })

        this.input.on('pointerup', () => {
            this.dragging = false
            this.time.delayedCall(20, () => { this.dragMoved = false })
        })

        this.input.on('wheel', (p: Phaser.Input.Pointer, _o: unknown, _dx: number, dy: number) => {
            if (!inScript(p) || this.scrollMax <= 0) return
            this.scrollY = Phaser.Math.Clamp(this.scrollY + dy * 0.5, 0, this.scrollMax)
            this.scriptLayer?.setY(-this.scrollY)
            this.paintScrollBar()
        })
    }

    // ── Bandeja ───────────────────────────────────────────────────────────

    private buildTray() {
        const ch = this.challenge

        if (ch.mode === 'prever-decisao') {
            this.buildBranchButtons()
            return
        }

        if (ch.mode === 'escolher-condicao') {
            const options = ch.conditionOptions ?? []
            options.forEach((cond, i) => {
                const icon = CONDITION_ICON[cond]
                this.buildTrayCard(this.lay.traySlots[i], icon.key, icon.frame, CONDITION_LABELS[cond], C.laranja, () => {
                    const target = this.program.findIndex(s => s.kind === 'se')
                    if (target >= 0) (this.program[target] as SeStmt).condition = cond
                    this.playTick()
                    this.refreshScript()
                })
            })
            return
        }

        const actions = ch.allowedActions ?? []
        let slot = 0

        actions.forEach(action => {
            const icon = ACTION_ICON[action]
            const color = action === 'pegar' || action === 'abrir' ? C.verde : C.normal
            const key = icon.kind === 'seta' ? 'icon-seta' : icon.key
            const frame = icon.kind === 'tex' ? icon.frame : undefined
            const angle = icon.kind === 'seta' ? icon.angle : 0

            this.buildTrayCard(
                this.lay.traySlots[slot++], key, frame, ACTION_LABELS[action], color,
                () => this.placeAction(action), angle,
            )
        })

        this.buildTrayCard(this.lay.traySlots[slot++], 'icon-seta', undefined, 'SE / SENÃO', C.laranja,
            () => this.placeSe(), 0, true)

        if (ch.allowRepeat) {
            this.buildTrayCard(this.lay.traySlots[slot++], 'icon-seta', undefined, 'REPITA', C.laranja,
                () => this.placeRepita(), 0, true)
        }
    }

    private buildTrayCard(
        rect: L.Rect | undefined,
        iconKey: string, iconFrame: number | undefined,
        text: string, color: number,
        onTap: () => void,
        angle = 0, hideIcon = false,
    ) {
        if (!rect) return

        const g = this.add.graphics()
        this.drawCard(g, rect, color, C.creme, 18)

        const parts: Phaser.GameObjects.GameObject[] = [g]
        const left = hideIcon ? 16 : 46

        if (!hideIcon) {
            const icon = this.add.image(rect.x + 28, L.cy(rect), iconKey)
                .setDisplaySize(34, 34).setAngle(angle)
            if (iconFrame !== undefined) icon.setFrame(iconFrame)
            parts.push(icon)
        }

        const label = this.add.text(rect.x + left, L.cy(rect), text, {
            fontFamily: 'Arial Black, Arial', fontSize: '16px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4,
            wordWrap: { width: rect.w - left - 12 },
        }).setOrigin(0, 0.5).setResolution(2)
        parts.push(label)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (this.phase === 'rodando') return
            this.tweens.add({ targets: label, scale: 0.94, duration: 70, yoyo: true })
            onTap()
        })
        parts.push(zone)

        this.panelLayer.add(parts)
    }

    private buildBranchButtons() {
        const make = (rect: L.Rect, title: string, sub: string, color: number, branch: 'entao' | 'senao') => {
            const g = this.add.graphics()
            this.drawCard(g, rect, color, C.creme, 24)

            const t1 = this.add.text(L.cx(rect), L.cy(rect) - 26, title, {
                fontFamily: 'Arial Black, Arial', fontSize: '38px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 7,
            }).setOrigin(0.5).setResolution(2)

            const t2 = this.add.text(L.cx(rect), L.cy(rect) + 28, sub, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '17px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3, align: 'center',
                wordWrap: { width: rect.w - 30 },
            }).setOrigin(0.5).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (this.phase === 'rodando') return
                this.tweens.add({ targets: [t1, t2], scale: 0.94, duration: 70, yoyo: true })
                this.answerBranch(branch)
            })

            this.panelLayer.add([g, t1, t2, zone])
        }

        const [a, b] = this.lay.vfButtons
        make(a, 'SIM', 'roda o ENTÃO', C.verde, 'entao')
        make(b, 'NÃO', 'roda o SENÃO', C.vermelho, 'senao')
    }

    private placeAction(action: ActionId) {
        const list = this.listAt(this.selected)

        if (list) {
            if (list.length >= 8) return
            list.push(action)
        } else {
            const max = this.challenge.maxStatements ?? 4
            if (this.program.length >= max) {
                this.showToast('O programa já está cheio. Apague uma peça antes.', false)
                return
            }
            this.program.push({ kind: 'acao', action })
        }

        this.playTick()
        this.refreshScript()
    }

    private placeSe() {
        const max = this.challenge.maxStatements ?? 4
        if (this.program.length >= max) {
            this.showToast('O programa já está cheio. Apague uma peça antes.', false)
            return
        }
        this.program.push({ kind: 'se', condition: null, entao: [], senao: [] })
        this.editingStmt = this.program.length - 1
        this.selected = { stmt: this.editingStmt, slot: 'entao' }
        this.playTick()
        this.refreshScript()
        this.openConditionPicker()
    }

    private placeRepita() {
        const max = this.challenge.maxStatements ?? 4
        if (this.program.length >= max) {
            this.showToast('O programa já está cheio. Apague uma peça antes.', false)
            return
        }
        this.program.push({ kind: 'repita', times: 2, corpo: [] })
        this.selected = { stmt: this.program.length - 1, slot: 'corpo' }
        this.playTick()
        this.refreshScript()
    }

    // ── Controles ─────────────────────────────────────────────────────────

    private buildControls() {
        if (this.lay.btnRun) {
            this.runBtn = this.makeButton(this.lay.btnRun, '▶  EXECUTAR', C.verde, () => this.run())
        }
        if (this.lay.btnReset) {
            this.makeButton(this.lay.btnReset, 'LIMPAR', C.normal, () => this.resetProgram())
        }
    }

    private makeButton(rect: L.Rect, label: string, color: number, onClick: () => void) {
        const container = this.add.container(L.cx(rect), L.cy(rect))
        const g = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setData('bg', g)
        container.setData('color', color)
        container.setData('rect', rect)
        this.paintButton(container, true)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (container.getData('disabled')) return
            this.tweens.add({ targets: container, scale: 0.96, duration: 70, yoyo: true })
            onClick()
        })

        this.panelLayer.add([container, zone])
        return container
    }

    private paintButton(btn: Phaser.GameObjects.Container, enabled: boolean) {
        const g = btn.getData('bg') as Phaser.GameObjects.Graphics
        const rect = btn.getData('rect') as L.Rect
        const color = btn.getData('color') as number
        btn.setData('disabled', !enabled)

        const r = rect.h / 2
        g.clear()
        g.fillStyle(C.borda, 0.55)
        g.fillRoundedRect(-rect.w / 2, -rect.h / 2 + 7, rect.w, rect.h, r)
        g.fillStyle(enabled ? color : C.apagado, 1)
        g.fillRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, r)
        g.fillStyle(0xffffff, enabled ? 0.24 : 0.08)
        g.fillRoundedRect(-rect.w / 2 + 7, -rect.h / 2 + 5, rect.w - 14, rect.h * 0.34, r * 0.7)
        g.lineStyle(4, C.creme, enabled ? 0.95 : 0.35)
        g.strokeRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, r)
    }

    private refreshRunButton() {
        if (!this.runBtn) return
        const pronto = this.program.length > 0
            && !this.program.some(s => s.kind === 'se' && !s.condition)
            && this.phase !== 'rodando'
        this.paintButton(this.runBtn, pronto)
    }

    private resetProgram() {
        if (this.phase === 'rodando') return

        const ch = this.challenge
        this.program = ch.given ? this.cloneProgram(ch.given) : []
        this.selected = null
        this.scrollY = 0
        this.envNow = { ...ch.scenarios[0] }
        this.playTick()
        this.drawBoard()
        this.refreshScript()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EXECUÇÃO
    // ══════════════════════════════════════════════════════════════════════

    private run() {
        if (this.phase === 'rodando') return

        const verdict = evaluate(this.challenge, this.program)
        if (verdict.reason === 'incompleto') {
            this.showToast('Falta preencher a condição do SE.', false)
            return
        }

        this.allResults = verdict.results
        this.phase = 'rodando'
        this.refreshRunButton()
        this.runScenario(0)
    }

    private runScenario(i: number) {
        const ch = this.challenge
        this.scenarioIdx = i
        this.envNow = { ...ch.scenarios[i] }

        this.result = this.allResults[i]
        this.trace = this.result.trace
        this.traceIndex = 0

        this.drawBoard()
        this.showScenarioBanner(i, ch.scenarios.length, () => this.playTraceFrom(0))
    }

    private showScenarioBanner(i: number, total: number, onDone: () => void) {
        if (total <= 1) {
            this.time.delayedCall(600, onDone)
            return
        }

        const y = L.boardTop(this.challenge) + 24
        const g = this.add.graphics().setDepth(80)
        const rect: L.Rect = { x: L.BOARD_CX - 160, y, w: 320, h: 60 }

        const t = this.add.text(L.cx(rect), L.cy(rect), `Cenário ${i + 1} de ${total}`, {
            fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setDepth(81).setResolution(2)

        const kill = () => { g.destroy(); t.destroy() }
        this.tweens.add({ targets: [g, t], alpha: 0, duration: 300, delay: 1200, onComplete: kill })
        this.time.delayedCall(1400, onDone)
    }

    private answerBranch(branch: 'entao' | 'senao') {
        if (this.phase === 'rodando') return

        const step = this.trace[this.traceIndex]
        if (!step || step.kind !== 'verificar') return

        if (branch === step.branch) {
            this.phase = 'rodando'
            this.playTick()
            const answered = this.traceIndex
            this.time.delayedCall(260, () => this.playTraceFrom(answered, answered))
            return
        }

        this.registerError()
        this.showThought(step, true)
        this.setPose(POSE.confuso)
        this.showToast(
            step.conditionValue
                ? `${conditionQuestion(step.condition!)} SIM — então rodava o ENTÃO.`
                : `${conditionQuestion(step.condition!)} NÃO — então rodava o SENÃO.`,
            false,
        )

        this.time.delayedCall(2300, () => {
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
            else this.startChallenge()
        })
    }

    private playTraceFrom(start: number, answered = -1) {
        const stepwise = this.challenge.mode === 'prever-decisao'

        const next = (i: number) => {
            if (i >= this.trace.length) {
                this.finishScenario()
                return
            }

            const step = this.trace[i]
            this.traceIndex = i

            if (stepwise && step.kind === 'verificar' && i !== answered) {
                this.phase = 'montando'
                this.setPose(POSE.pensativo)
                this.showQuestionBubble(step)
                this.broadcastMission()
                return
            }

            this.animateStep(step, () => next(i + 1))
        }

        next(start)
    }

    private animateStep(step: TraceStep, done: () => void) {
        const ch = this.challenge
        const t = L.tileSize(ch)

        if (step.kind === 'verificar') {
            this.setPose(POSE.pensativo)
            this.showThought(step, false)
            this.highlightDecisionRow(step)
            this.playNote(step.conditionValue ? 720 : 340)
            this.time.delayedCall(1600, () => { this.hideBubble(); done() })
            return
        }

        if (step.kind === 'virar') {
            const dir = step.after.dir
            this.player?.setFlipX(dir === 3)
            this.playNote(520)
            this.showTurnArrow(dir)
            this.tweens.add({
                targets: this.player, scaleX: (this.player?.scaleX ?? 1) * 0.86,
                duration: 110, yoyo: true,
                onComplete: () => this.time.delayedCall(120, done),
            })
            return
        }

        if (step.kind === 'esperar') {
            this.envNow.semaforoVerde = true
            this.refreshProps()
            this.setPose(POSE.parado)
            this.playNote(430)
            this.tweens.add({
                targets: this.player, y: (this.player?.y ?? 0) - 10,
                duration: 180, yoyo: true, repeat: 1,
                onComplete: () => this.time.delayedCall(120, done),
            })
            return
        }

        if (step.kind === 'abrir') {
            this.envNow.portaAberta = true
            this.refreshProps()
            this.playNote(660)
            this.spark(this.player?.x ?? 0, (this.player?.y ?? 0) - t * 0.4)
            this.time.delayedCall(450, done)
            return
        }

        if (step.kind === 'pegar') {
            this.collectItem(step.item)
            this.setPose(POSE.feliz)
            this.playNote(780)
            this.time.delayedCall(480, () => { this.setPose(POSE.parado); done() })
            return
        }

        if (step.kind === 'andar') {
            const to = L.cellCenter(ch, step.after.c, step.after.r)
            this.dropTrail(this.player?.x ?? to.x, (this.player?.y ?? to.y) + 4)
            this.playNote(600)
            this.player?.play('andar', true)

            this.tweens.add({
                targets: this.playerShadow, x: to.x, y: to.y + t * 0.3,
                duration: 460, ease: 'Sine.easeInOut',
            })
            this.tweens.add({
                targets: this.player, x: to.x, y: to.y + t * 0.28,
                duration: 460, ease: 'Sine.easeInOut',
                onComplete: () => {
                    this.player?.stop()
                    this.setPose(POSE.parado)
                    this.time.delayedCall(200, done)
                },
            })
            return
        }

        this.setPose(POSE.confuso)
        this.cameras.main.shake(200, 0.007)
        this.spark(this.player?.x ?? 0, (this.player?.y ?? 0) - t * 0.3)
        this.playNote(200, 'square', 0.24, 0.16)
        this.tweens.add({
            targets: this.player, x: (this.player?.x ?? 0) - 10,
            duration: 55, yoyo: true, repeat: 3,
            onComplete: () => this.time.delayedCall(320, done),
        })
    }

    private setPose(frame: number) {
        this.player?.stop()
        this.player?.setFrame(frame)
    }

    private dropTrail(x: number, y: number) {
        const t = L.tileSize(this.challenge)
        const mark = this.add.image(x, y, 'fx-faisca')
            .setDisplaySize(t * 0.2, t * 0.2)
            .setTint(C.creme)
            .setAlpha(0)
        this.trailLayer.add(mark)
        this.tweens.add({ targets: mark, alpha: 0.4, duration: 200 })
    }

    private showTurnArrow(dir: number) {
        if (!this.player) return
        const arrow = this.add.image(this.player.x, this.player.y - 58, 'icon-seta')
            .setDisplaySize(32, 32)
            .setAngle(dir * 90)
            .setDepth(210)
        this.tweens.add({
            targets: arrow, y: arrow.y - 18, alpha: 0, duration: 480,
            onComplete: () => arrow.destroy(),
        })
    }

    private collectItem(item?: ItemId) {
        if (!item) return
        const view = this.propViews.find(v => v.def.kind === 'item' && v.def.item === item)
        if (view) {
            this.tweens.add({
                targets: [view.obj, view.shadow], alpha: 0, y: '-=30', duration: 320,
                onComplete: () => { view.obj.setVisible(false); view.shadow.setVisible(false) },
            })
        }

        const o = L.boardOrigin(this.challenge)
        const x = o.x - o.tile / 2 + o.boardW - 32 - this.bagIcons.length * 46
        const icon = this.add.image(x, L.boardTop(this.challenge) + 32, 'itens', ITEM_FRAME[item])
            .setDisplaySize(42, 42).setDepth(220).setScale(0)
        this.bagIcons.push(icon)
        this.tweens.add({ targets: icon, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showQuestionBubble(step: TraceStep) {
        this.hideBubble()
        if (!step.condition || !this.player) return
        this.bubble = this.speechBubble(conditionQuestion(step.condition), C.amarelo, step.condition)
    }

    private showThought(step: TraceStep, big: boolean) {
        this.hideBubble()
        if (!step.condition || !this.player) return

        const answer = step.conditionValue ? 'SIM' : 'NÃO'
        const ramo = step.branch === 'entao' ? 'ENTÃO' : 'SENÃO'
        const color = step.conditionValue ? C.verde : C.vermelho
        this.bubble = this.speechBubble(`${answer} → ${ramo}`, color, step.condition, big)
    }

    private liveIcon(cond: ConditionId): { key: string; frame?: number } {
        if (cond === 'semaforo_verde') {
            return { key: this.envNow.semaforoVerde ? 'semaforo-verde' : 'semaforo-vermelho' }
            }
        if (cond === 'porta_aberta') {
            return { key: this.envNow.portaAberta ? 'porta-aberta' : 'porta-fechada' }
        }
        return CONDITION_ICON[cond]
    }

    private speechBubble(text: string, color: number, cond: ConditionId, big = false) {
        const box = this.add.container(0, 0).setDepth(230)
        const label = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black, Arial', fontSize: big ? '24x' : '20px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4, align: 'center',
            wordWrap: { width: 300 },
        }).setOrigin(0.5).setResolution(2)

        const w = Math.max(180, label.width + 74)
        const h = Math.max(56, label.height + 28)

        const g = this.add.graphics()
        this.drawCard(g, { x: -w / 2, y: -h / 2, w, h }, color, C.creme, 20)
        g.fillStyle(color, 1)
        g.fillTriangle(-12, h / 2 - 2, 12, h / 2 - 2, 0, h / 2 + 16)
        g.lineStyle(4, C.creme, 0.95)
        g.lineBetween(-12, h / 2, 0, h / 2 + 16)
        g.lineBetween(12, h / 2, 0, h / 2 + 16)

        const li = this.liveIcon(cond)
        const icon = this.add.image(-w / 2 + 30, 0, li.key).setDisplaySize(34, 34)
        if (li.frame !== undefined) icon.setFrame(li.frame)
        label.setX(14)

        box.add([g, icon, label])
        box.setPosition(
            Phaser.Math.Clamp(this.player!.x, L.BOARD_AREA.left + w / 2, L.BOARD_AREA.right - w / 2),
            this.player!.y - L.tileSize(this.challenge) * 0.95,
        )
        box.setScale(0.8).setAlpha(0)
        this.tweens.add({ targets: box, scale: 1, alpha: 1, duration: 200, ease: 'Back.easeOut' })
        return box
    }

    private hideBubble() {
        this.bubble?.destroy()
        this.bubble = undefined
    }

    private highlightDecisionRow(step: TraceStep) {
        const idx = this.rows.findIndex(r =>
            r.kind === 'se-head' && (this.program[r.stmt] as SeStmt).condition === step.condition)
        if (idx < 0) return

        const rect = L.rowRect(idx, 0)

        const relY = rect.y - L.SCRIPT.y - this.scrollY
        if (relY < 0 || relY + rect.h > L.SCRIPT.h) {
            this.scrollY = Phaser.Math.Clamp(
                rect.y - L.SCRIPT.y - L.SCRIPT.h / 2 + rect.h / 2, 0, this.scrollMax,
            )
            this.scriptLayer.setY(-this.scrollY)
            this.paintScrollBar()
        }

        const flash = this.add.graphics().setDepth(32)

        flash.fillStyle(step.conditionValue ? C.verde : C.vermelho, 0.75)
        flash.fillRoundedRect(rect.x, rect.y - this.scrollY, rect.w, rect.h, 14)
        this.panelLayer.add(flash)
        this.tweens.add({
            targets: flash, alpha: 0, duration: 800,
            onComplete: () => flash.destroy(),
        })
    }

    private spark(x: number, y: number) {
        for (let i = 0; i < 8; i++) {
            const s = this.add.image(x, y, 'fx-faisca')
                .setDisplaySize(16, 16).setDepth(240)
                .setTint(C.amarelo)
                .setBlendMode(Phaser.BlendModes.ADD)
            const a = (Math.PI * 2 * i) / 8
            this.tweens.add({
                targets: s, x: x + Math.cos(a) * 62, y: y + Math.sin(a) * 62,
                alpha: 0, duration: 460, ease: 'Cubic.easeOut',
                onComplete: () => s.destroy(),
            })
        }
    }

private finishScenario() {
        const res = this.result
        if (!res) return

        this.hideBubble()

        const stepwise = this.challenge.mode === 'prever-decisao'

        if (res.outcome !== 'chegou' && !stepwise) {
            this.setPose(POSE.confuso)
            this.registerError()
            this.showToast(outcomeMessage(res.outcome), false)
            this.time.delayedCall(2500, () => {
                if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
                else { this.phase = 'montando'; this.resetBoardOnly(); this.refreshScript() }
            })
            return
        }

        this.setPose(POSE.feliz)
        this.playWin()

        const last = this.scenarioIdx >= this.allResults.length - 1
        if (this.challenge.mode === 'prever-decisao' || last) {
            this.time.delayedCall(700, () => this.finishChallenge())
            return
        }

        this.time.delayedCall(900, () => this.runScenario(this.scenarioIdx + 1))
    }

    private finishChallenge() {
        const ch = this.challenge

        if (ch.mode !== 'prever-decisao') {
            const verdict = evaluate(ch, this.program)
            if (verdict.reason === 'condicao-constante') {
                this.registerError()
                this.showToast(
                    'Deu certo, mas essa pergunta responde igual nos dois cenários — o SE nem chegou a decidir nada.',
                    false,
                )
                this.time.delayedCall(3000, () => {
                    if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
                    else { this.phase = 'montando'; this.resetBoardOnly(); this.refreshScript() }
                })
                return
            }
        }

        this.hits++
        this.consecutiveErrors = 0
        this.points += 10

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER', gameId: GAME_ID,
            pointsEarned: 10, stage: this.levelConfig.level,
        })
        this.emitCheckpoint()

        this.showDecisionMap(() => this.advance())
    }

    private resetBoardOnly() {
        this.envNow = { ...this.challenge.scenarios[0] }
        this.drawBoard()
    }

    private registerError() {
        this.errors++
        this.consecutiveErrors++
        this.playError()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: 0, stage: this.levelConfig.level,
        })
        this.emitCheckpoint()
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
        this.playFanfare()
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
        this.emitCheckpoint()

        const next = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 2 | 3 : null

        showLevelCompleteModal(this, {
            title: next ? 'Nível concluído!' : 'Jogo concluído!',
            subtitle: next ? this.levelConfig.title : 'Você programou decisões do começo ao fim.',
            message: `${this.points} pontos  ·  ${this.hits} acertos  ·  ${this.errors} erros`,
            accent: C.amarelo,
            progress: { total: 3, current: this.levelConfig.level },
            ...(next
                ? {
                    autoAdvance: {
                        delay: 2600,
                        onComplete: () => this.scene.restart({ level: next, points: this.points }),
                    },
                }
                : {
                    buttons: [
                        {
                            label: 'Jogar de novo', color: C.verde,
                            onClick: () => this.scene.restart({ level: 1, points: 0 }),
                        },
                        {
                            label: 'Sair', color: C.normal,
                            onClick: () => EventBus.emit('exit-game'),
                        },
                    ],
                }),
        })
    }

    private showDecisionMap(onDone: () => void) {
        const decisions = this.result?.decisions ?? []
        if (!decisions.length) {
            onDone()
            return
        }

        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.86)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 640
        const ph = 230 + decisions.length * 92

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.escuro, C.amarelo, 30, false)

        const title = this.add.text(0, -ph / 2 + 52, 'MAPA DE DECISÕES', {
            fontFamily: 'Arial Black, Arial', fontSize: '28px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 6,
        }).setOrigin(0.5).setResolution(2)

        panel.add([g, title])

        decisions.forEach((d, i) => {
            const y = -ph / 2 + 112 + i * 92
            const rect: L.Rect = { x: -pw / 2 + 32, y, w: pw - 64, h: 78 }
            const tone = d.value ? C.verde : C.vermelho

            const row = this.add.graphics()
            this.drawCard(row, rect, C.normal, tone, 18)

            const icon = this.add.image(rect.x + 42, y + 39, CONDITION_ICON[d.condition].key)
                .setDisplaySize(38, 38)
            if (CONDITION_ICON[d.condition].frame !== undefined) {
                icon.setFrame(CONDITION_ICON[d.condition].frame!)
            }

            const q = this.add.text(rect.x + 78, y + 24, conditionQuestion(d.condition), {
                fontFamily: 'Arial Black, Arial', fontSize: '16px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
                wordWrap: { width: rect.w - 100 },
            }).setOrigin(0, 0.5).setResolution(2)

            const a = this.add.text(rect.x + 78, y + 54,
                `${d.value ? 'SIM' : 'NÃO'}  →  ${d.branch === 'entao' ? 'ENTÃO' : 'SENÃO'}`, {
                fontFamily: 'Arial Black, Arial', fontSize: '17px',
                color: d.value ? CSS.verde : CSS.vermelho,
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0, 0.5).setResolution(2)

            panel.add([row, icon, q, a])
        })

        panel.add(this.add.text(0, ph / 2 - 108, this.challenge.explanation, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '16px', color: CSS.claro,
            align: 'center', wordWrap: { width: pw - 90 },
        }).setOrigin(0.5).setResolution(2))

        panel.add(this.modalButton(0, ph / 2 - 52, 'Continuar', C.verde, () => {
            this.clearOverlay()
            onDone()
        }))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  TUTORIAL
    // ══════════════════════════════════════════════════════════════════════

    private tutorialSteps(): TutorialStep[] {
        const pad = 16
        const around = (r: L.Rect): Partial<TutorialStep> => ({
            shape: 'rect', x: L.cx(r), y: L.cy(r), w: r.w + pad, h: r.h + pad,
        })

        const boardRect: L.Rect = {
            x: L.BOARD_AREA.left, y: L.BOARD_AREA.top,
            w: L.BOARD_AREA.right - L.BOARD_AREA.left,
            h: L.BOARD_AREA.bottom - L.BOARD_AREA.top,
        }

        if (this.levelConfig.level === 1) {
            const vf: L.Rect = {
                x: this.lay.vfButtons[0].x, y: this.lay.vfButtons[0].y,
                w: this.lay.vfButtons[1].x + this.lay.vfButtons[1].w - this.lay.vfButtons[0].x,
                h: this.lay.vfButtons[0].h,
            }
            return [
                { text: 'Esta é a cidade. Olhe bem o que está acontecendo nela.', ...around(boardRect) } as TutorialStep,
                { text: 'O programa já está pronto. A faixa laranja é a condição do SE.', ...around(L.SCRIPT) } as TutorialStep,
                { text: 'Quando o programa chegar no SE, ele para e pergunta. Você responde SIM ou NÃO.', ...around(vf) } as TutorialStep,
                {
                    text: 'SIM roda o ENTÃO. NÃO roda o SENÃO. Só um dos dois acontece.',
                    shape: 'none', balloonY: 540, buttonLabel: 'Entendi!'
                } as TutorialStep,
            ]
        }

        if (this.levelConfig.level === 2) {
            const tray = this.lay.traySlots
            const trayArea: L.Rect = {
                x: tray[0].x, y: tray[0].y,
                w: L.PANEL.w - 32,
                h: tray[tray.length - 1].y + tray[tray.length - 1].h - tray[0].y,
            }
            return [
                { text: 'Agora o SE está sem pergunta. É você quem escolhe.', ...around(L.SCRIPT) } as TutorialStep,
                {
                    text: 'Toque numa destas. Cuidado: a pergunta certa é a que responde diferente em cada cenário.',
                    ...around(trayArea),
                } as TutorialStep,
                { text: 'Depois toque em EXECUTAR. O programa roda em TODOS os cenários, um de cada vez.', ...around(L.BTN_RUN) } as TutorialStep,
            ]
        }

        const tray = this.lay.traySlots
        const trayArea: L.Rect = {
            x: tray[0].x, y: tray[0].y,
            w: L.PANEL.w - 32,
            h: tray[tray.length - 1].y + tray[tray.length - 1].h - tray[0].y,
        }
        return [
            { text: 'Aqui estão as peças. Toque numa delas para colocar no programa.', ...around(trayArea) } as TutorialStep,
            { text: 'A peça SE cria os dois ramos. Toque em ENTÃO ou SENÃO para escolher onde a próxima peça entra.', ...around(L.SCRIPT) } as TutorialStep,
            {
                text: 'Toque numa peça já colocada para apagar. Arraste a lista para rolar.',
                ...around(L.SCRIPT),
            } as TutorialStep,
            { text: 'Quando estiver pronto, EXECUTAR testa o programa em todos os cenários.', ...around(L.BTN_RUN) } as TutorialStep,
        ]
    }

    private runTutorial(_force: boolean, onDone: () => void) {
        if (this.tutorialOpen) return
        this.tutorialOpen = true

        const wasPhase = this.phase
        this.phase = 'rodando'

        createTutorial(this, {
            key: `cidade-l${this.levelConfig.level}`,
            accent: C.amarelo,
            safeTop: L.UI_BAR_H,
            once: false,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.phase = wasPhase
                onDone()
            },
        })
    }

    private keep<Obj extends Phaser.GameObjects.GameObject>(obj: Obj): Obj {
        this.overlay.push(obj)
        return obj
    }

    private clearOverlay() {
        this.overlay.forEach(o => { if (o.active) o.destroy() })
        this.overlay = []
    }

    private showToast(message: string, good: boolean) {
        const panel = this.add
            .container(L.BOARD_CX, L.boardBottom(this.challenge) - 58)
            .setDepth(90)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial Black, Arial', fontSize: '18px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4,
            align: 'center', wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        const w = 660
        const h = Math.max(66, text.height + 34)
        const g = this.add.graphics()
        this.drawCard(g, { x: -w / 2, y: -h / 2, w, h }, C.escuro, good ? C.verde : C.vermelho, 20, false)

        panel.add([g, text])
        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: panel, alpha: 0, duration: 300, delay: 2300,
            onComplete: () => panel.destroy(),
        })
    }

    private openConditionPicker() {
        this.clearOverlay()
        const options = this.challenge.allowedConditions ?? this.challenge.conditionOptions ?? []
        if (!options.length) return

        const shade = this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.78)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 620
        const ph = 160 + options.length * 88

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.escuro, C.amarelo, 28, false)

        const title = this.add.text(0, -ph / 2 + 48, 'Escolha a condição', {
            fontFamily: 'Arial Black, Arial', fontSize: '26px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        panel.add([g, title])

        options.forEach((cond, i) => {
            const y = -ph / 2 + 106 + i * 88
            const rect: L.Rect = { x: -pw / 2 + 32, y, w: pw - 64, h: 74 }

            const row = this.add.graphics()
            this.drawCard(row, rect, C.laranja, C.creme, 20)

            const icon = this.add.image(rect.x + 44, y + 37, CONDITION_ICON[cond].key)
                .setDisplaySize(40, 40)
            if (CONDITION_ICON[cond].frame !== undefined) icon.setFrame(CONDITION_ICON[cond].frame!)

            const label = this.add.text(rect.x + 84, y + 37, conditionQuestion(cond), {
                fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 4,
                wordWrap: { width: rect.w - 110 },
            }).setOrigin(0, 0.5).setResolution(2)

            const zone = this.add.zone(0, y + 37, rect.w, rect.h).setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                const target = this.editingStmt >= 0
                    ? this.editingStmt
                    : this.program.findIndex(s => s.kind === 'se')
                if (target >= 0) (this.program[target] as SeStmt).condition = cond
                this.editingStmt = -1
                this.playTick()
                this.clearOverlay()
                this.refreshScript()
            })

            panel.add([row, icon, label, zone])
        })

        shade.on('pointerdown', () => { this.editingStmt = -1; this.clearOverlay() })
        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private showLevelStart(onStart: () => void) {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.88)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 620, ph = 470

        const g = this.add.graphics()
        this.drawCard(g, { x: -pw / 2, y: -ph / 2, w: pw, h: ph }, C.escuro, C.amarelo, 30, false)

        panel.add([
            g,
            this.add.text(0, -ph / 2 + 54, `NÍVEL ${this.levelConfig.level} DE 3`, {
                fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.amarelo,
                stroke: CSS.borda, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 128, this.levelConfig.title, {
                fontFamily: 'Arial Black, Arial', fontSize: '32px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 6,
                align: 'center', wordWrap: { width: pw - 80 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 226, this.levelConfig.objective, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '18px', color: CSS.claro,
                align: 'center', wordWrap: { width: pw - 100 },
            }).setOrigin(0.5).setResolution(2),
            this.add.text(0, -ph / 2 + 336, this.levelConfig.tip, {
                fontFamily: 'Arial', fontSize: '16px', color: CSS.amarelo,
                align: 'center', wordWrap: { width: pw - 110 },
            }).setOrigin(0.5).setResolution(2),
        ])

        panel.add(this.modalButton(0, ph / 2 - 56, 'Começar', C.verde, () => {
            this.clearOverlay()
            onStart()
        }))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }


    private showGameOver() {
        this.clearOverlay()

        showLevelCompleteModal(this, {
            title: 'Quase lá!',
            subtitle: 'Três tentativas seguidas sem acertar.',
            message: this.challenge.explanation,
            accent: C.vermelho,
            buttons: [
                {
                    label: 'Tentar de novo', color: C.verde,
                    onClick: () => this.scene.restart({
                        level: this.levelConfig.level, points: this.points,
                    }),
                },
                {
                    label: 'Sair', color: C.normal,
                    onClick: () => EventBus.emit('exit-game'),
                },
            ],
        })

        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.levelConfig.level })
    }

    private modalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
        const w = 240, h = 60
        const container = this.add.container(x, y)

        const g = this.add.graphics()
        g.fillStyle(C.borda, 0.55)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(0xffffff, 0.24)
        g.fillRoundedRect(-w / 2 + 7, -h / 2 + 5, w - 14, h * 0.34, h / 4)
        g.lineStyle(4, C.creme, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setSize(w, h)
        container.setInteractive({ useHandCursor: true })

        let armed = false
        container.on('pointerdown', () => {
            armed = true
            this.tweens.add({ targets: container, scale: 0.95, duration: 70, yoyo: true })
        })
        container.on('pointerup', () => {
            if (!armed) return
            armed = false
            this.playTick()
            this.time.delayedCall(60, onClick)
        })
        return container
    }

    private audioCtx(): AudioContext | null {
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }

    private playNote(freq: number, type: OscillatorType = 'sine', dur = 0.1, gain = 0.14) {
        const ctx = this.audioCtx()
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

    private playTick() { this.playNote(540, 'sine', 0.04, 0.08) }

    private playError() {
        this.playNote(300, 'square', 0.18, 0.14)
        this.time.delayedCall(140, () => this.playNote(220, 'square', 0.22, 0.12))
    }

    private playWin() {
        [523, 659, 784].forEach((f, i) =>
            this.time.delayedCall(i * 105, () => this.playNote(f, 'sine', 0.16, 0.18)))
    }

    private playFanfare() {
        [523, 659, 784, 1047].forEach((f, i) =>
            this.time.delayedCall(i * 130, () => this.playNote(f, 'sine', 0.22, 0.22)))
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PONTE DA PLATAFORMA
    // ══════════════════════════════════════════════════════════════════════

    private registerPlatformCommands() {
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type !== 'START_GAME') return
            if (cmd.gameId !== GAME_ID) return
            if (cmd.stage === this.levelConfig.level) return
            this.time.delayedCall(100, () => {
                this.scene.restart({ level: cmd.stage as 1 | 2 | 3, points: this.points })
            })
        })
    }
}