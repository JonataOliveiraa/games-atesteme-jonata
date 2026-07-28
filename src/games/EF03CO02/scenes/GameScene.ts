import Phaser from 'phaser'
import { EventBus } from '../../../shared/EventBus'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../shared/contracts/platformCommands'
import { LEVELS } from '../data/levels'
import { C, CSS } from '../data/theme'
import {
    ACTION_ICON,
    ACTION_LABELS,
    CONDITION_ICON,
    conditionSentence,
    simulate,
} from '../data/conditions'
import * as L from '../data/layout'
import type {
    ActionId,
    ConditionId,
    Coord,
    LevelConfig,
    MazeChallenge,
    Program,
    SimulationResult,
    TraceStep,
} from '../types'

const GAME_ID = 'labirinto-do-enquanto'
const MAX_CONSECUTIVE_ERRORS = 3

type Phase = 'montando' | 'prevendo' | 'rodando'

interface SlotView {
    rect: L.Rect
    bg: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
    label: Phaser.GameObjects.Text
}

export class GameScene extends Phaser.Scene {
    private levelConfig!: LevelConfig
    private challengeIndex = 0
    private hits = 0
    private errors = 0
    private consecutiveErrors = 0
    private points = 0
    private isMuted = false
    private phase: Phase = 'montando'
    private showIntro = false

    // ── Programa em construção ──
    private condition: ConditionId | null = null
    private setup: ActionId[] = []
    private body: ActionId[] = []
    private selectedSlot: { kind: 'setup' | 'body'; index: number } | null = null
    private predictedCell: Coord | null = null

    // ── Execução ──
    private trace: TraceStep[] = []
    private traceIndex = 0
    private result?: SimulationResult
    private robotAngle = 0

    // ── Camadas e objetos ──
    private boardLayer!: Phaser.GameObjects.Container
    private trailLayer!: Phaser.GameObjects.Container
    private trayLayer!: Phaser.GameObjects.Container
    private overlay: Phaser.GameObjects.GameObject[] = []

    private robot?: Phaser.GameObjects.Image
    private robotGlow?: Phaser.GameObjects.Image
    private badge?: Phaser.GameObjects.Image
    private predictFlag?: Phaser.GameObjects.Image
    private fogTiles = new Map<string, Phaser.GameObjects.Image>()

    private chipBg!: Phaser.GameObjects.Graphics
    private chipIcon!: Phaser.GameObjects.Image
    private chipText!: Phaser.GameObjects.Text
    private setupViews: SlotView[] = []
    private bodyViews: SlotView[] = []
    private runBtn?: Phaser.GameObjects.Container

    private unsubPlatform?: () => void

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; points?: number; showIntro?: boolean }) {
        const lvl = (data?.level ?? 1) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.challengeIndex = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.phase = 'montando'
        this.showIntro = data?.showIntro ?? false
        this.condition = null
        this.setup = []
        this.body = []
        this.selectedSlot = null
        this.predictedCell = null
        this.trace = []
        this.traceIndex = 0
        this.result = undefined
        this.robotAngle = 0
        this.setupViews = []
        this.bodyViews = []
        this.fogTiles = new Map()
        this.overlay = []
    }

    private get challenge(): MazeChallenge {
        return this.levelConfig.challenges[this.challengeIndex]
    }

    create() {
        this.drawBackground()

        this.boardLayer = this.add.container(0, 0).setDepth(10)
        this.trailLayer = this.add.container(0, 0).setDepth(11)
        this.trayLayer = this.add.container(0, 0).setDepth(21)

        this.buildPanelChrome()
        this.registerPlatformCommands()

        EventBus.on('mute-audio', (m: boolean) => { this.isMuted = m }, this)
        EventBus.on('show-tutorial', () => this.showTutorial(), this)

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        if (this.showIntro) {
            this.showLevelStart(() => this.startChallenge())
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
    //  CICLO DO DESAFIO
    // ══════════════════════════════════════════════════════════════════════

    private startChallenge() {
        const ch = this.challenge

        this.phase = ch.predictStop ? 'prevendo' : 'montando'
        this.condition = ch.mode === 'escolher-condicao' ? null : (ch.given?.condition ?? null)
        this.setup = [...(ch.given?.setup ?? [])]
        this.body = [...(ch.given?.body ?? [])]
        this.selectedSlot = null
        this.predictedCell = null
        this.trace = []
        this.traceIndex = 0
        this.result = undefined

        this.drawBoard()
        this.refreshProgram()
        this.buildTray()
        this.broadcastMission()
    }

    private broadcastMission() {
        const ch = this.challenge
        const instruction =
            ch.mode === 'prever-condicao' ? 'A condição é verdadeira ou falsa agora?'
                : ch.mode === 'escolher-condicao' ? 'Escolha a condição que para o robô na estrela'
                    : this.phase === 'prevendo' ? 'Plante a bandeirinha onde o robô vai parar'
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
    //  FUNDO E TABULEIRO
    // ══════════════════════════════════════════════════════════════════════

    private drawBackground() {
        const key = this.levelConfig.level === 3 ? 'bg-campo' : 'bg-oficina'
        const bg = this.add.image(L.W / 2, L.H / 2, key).setDepth(0)
        bg.setScale(Math.max(L.W / bg.width, L.H / bg.height))
        this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.46).setDepth(1)
    }

    private drawBoard() {
        this.boardLayer.removeAll(true)
        this.trailLayer.removeAll(true)
        this.fogTiles.clear()
        this.robot?.destroy()
        this.robotGlow?.destroy()
        this.badge?.destroy()
        this.predictFlag?.destroy()
        this.robot = undefined
        this.robotGlow = undefined
        this.badge = undefined
        this.predictFlag = undefined

        const ch = this.challenge
        const o = L.boardOrigin(ch)

        const frame = this.add.graphics()
        frame.fillStyle(C.borda, 0.55)
        frame.fillRoundedRect(o.x - L.TILE / 2 - 10, o.y - L.TILE / 2 - 10, o.boardW + 20, o.boardH + 20, 22)
        frame.lineStyle(4, C.claro, 0.5)
        frame.strokeRoundedRect(o.x - L.TILE / 2 - 10, o.y - L.TILE / 2 - 10, o.boardW + 20, o.boardH + 20, 22)
        this.boardLayer.add(frame)

        for (let r = 0; r < ch.height; r++) {
            for (let c = 0; c < ch.width; c++) {
                const p = L.cellCenter(ch, c, r)
                const isWall = ch.walls.some(w => w.c === c && w.r === r)
                const isGoal = ch.goal.c === c && ch.goal.r === r
                const isStart = ch.start.c === c && ch.start.r === r
                const isFog = ch.hidden?.some(w => w.c === c && w.r === r) ?? false

                const key = isWall ? 'tile-parede'
                    : isGoal ? 'tile-objetivo'
                        : isStart ? 'tile-partida'
                            : 'tile-piso'

                this.boardLayer.add(
                    this.add.image(p.x, p.y, key).setDisplaySize(L.TILE, L.TILE),
                )

                if (isGoal) {
                    const glow = this.add.image(p.x, p.y, 'fx-brilho')
                        .setDisplaySize(L.TILE * 1.5, L.TILE * 1.5)
                        .setTint(C.amarelo)
                        .setBlendMode(Phaser.BlendModes.ADD)
                        .setAlpha(0.32)
                    this.boardLayer.add(glow)
                    this.tweens.add({ targets: glow, alpha: 0.62, duration: 950, yoyo: true, repeat: -1 })
                }

                if (isFog) {
                    const fog = this.add.image(p.x, p.y, 'tile-oculto').setDisplaySize(L.TILE, L.TILE)
                    this.boardLayer.add(fog)
                    this.fogTiles.set(`${c},${r}`, fog)
                }

                // Tocar na célula só serve para plantar a bandeirinha do palpite
                const zone = this.add.zone(p.x, p.y, L.TILE, L.TILE).setInteractive({ useHandCursor: true })
                zone.on('pointerdown', () => this.onTileTap(c, r))
                this.boardLayer.add(zone)
            }
        }

        const start = L.cellCenter(ch, ch.start.c, ch.start.r)
        this.robotAngle = ch.startDir * 90

        this.robotGlow = this.add.image(start.x, start.y, 'fx-brilho')
            .setDisplaySize(L.TILE * 1.3, L.TILE * 1.3)
            .setTint(C.creme)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.22)
            .setDepth(12)

        this.robot = this.add.image(start.x, start.y, 'robot')
            .setDisplaySize(L.TILE * 0.78, L.TILE * 0.78)
            .setAngle(this.robotAngle)
            .setDepth(13)

        this.badge = this.add.image(start.x, start.y - L.TILE * 0.62, 'badge-verdadeiro')
            .setDisplaySize(48, 48)
            .setDepth(14)
            .setAlpha(0)
    }

    private onTileTap(c: number, r: number) {
        if (this.phase !== 'prevendo') return
        const ch = this.challenge
        if (ch.walls.some(w => w.c === c && w.r === r)) return

        this.predictedCell = { c, r }
        const p = L.cellCenter(ch, c, r)

        if (!this.predictFlag) {
            this.predictFlag = this.add.image(p.x, p.y - 14, 'marca-palpite')
                .setDisplaySize(50, 50).setDepth(12)
        }
        this.predictFlag.setPosition(p.x, p.y - 14)
        this.tweens.add({ targets: this.predictFlag, y: p.y - 24, duration: 170, yoyo: true })

        this.playTick()
        this.phase = 'montando'
        this.broadcastMission()
        this.refreshRunButton()
    }

    private revealFogAround(cell: { c: number; r: number }) {
        const keys = [
            `${cell.c + 1},${cell.r}`, `${cell.c - 1},${cell.r}`,
            `${cell.c},${cell.r + 1}`, `${cell.c},${cell.r - 1}`,
        ]
        keys.forEach(key => {
            const fog = this.fogTiles.get(key)
            if (!fog) return
            this.fogTiles.delete(key)
            this.tweens.add({
                targets: fog, alpha: 0, scale: fog.scale * 1.15, duration: 320,
                onComplete: () => fog.destroy(),
            })
        })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PAINEL DO PROGRAMA
    // ══════════════════════════════════════════════════════════════════════

    private buildPanelChrome() {
        const g = this.add.graphics().setDepth(19)
        g.fillStyle(C.borda, 0.30)
        g.fillRoundedRect(L.PANEL.x + 5, L.PANEL.y + 7, L.PANEL.w, L.PANEL.h, L.PANEL.r)
        g.fillStyle(C.escuro, 0.94)
        g.fillRoundedRect(L.PANEL.x, L.PANEL.y, L.PANEL.w, L.PANEL.h, L.PANEL.r)
        g.lineStyle(4, C.claro, 0.75)
        g.strokeRoundedRect(L.PANEL.x, L.PANEL.y, L.PANEL.w, L.PANEL.h, L.PANEL.r)

        this.add.text(L.PANEL.x + L.PANEL.w / 2, L.PANEL_TITLE_Y, 'PROGRAMA', {
            fontFamily: 'Arial Black, Arial', fontSize: '20px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 3,
        }).setOrigin(0.5).setDepth(20).setResolution(2)

        this.panelLabel(L.SETUP_LABEL_Y, 'ANTES DO LAÇO')

        const wb = this.add.graphics().setDepth(19)
        wb.fillStyle(C.normal, 0.55)
        wb.fillRoundedRect(L.WHILE_BLOCK.x, L.WHILE_BLOCK.y, L.WHILE_BLOCK.w, L.WHILE_BLOCK.h, 16)
        wb.lineStyle(3, C.amarelo, 0.8)
        wb.strokeRoundedRect(L.WHILE_BLOCK.x, L.WHILE_BLOCK.y, L.WHILE_BLOCK.w, L.WHILE_BLOCK.h, 16)

        this.buildChip()
        this.panelLabel(L.BODY_LABEL_Y, 'REPITA')
        this.panelLabel(L.TRAY_LABEL_Y, 'PEÇAS')

        L.SETUP_SLOTS.forEach((rect, i) => this.setupViews.push(this.buildSlot(rect, 'setup', i)))
        L.BODY_SLOTS.forEach((rect, i) => this.bodyViews.push(this.buildSlot(rect, 'body', i)))

        this.buildControls()
    }

    private panelLabel(y: number, label: string) {
        return this.add.text(L.PANEL.x + 34, y, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '14px', color: CSS.claro,
            stroke: CSS.borda, strokeThickness: 2,
        }).setOrigin(0, 0.5).setDepth(20).setResolution(2)
    }

    private buildChip() {
        this.chipBg = this.add.graphics().setDepth(20)

        this.chipIcon = this.add.image(L.CHIP.x + 32, L.cy(L.CHIP), 'icon-cond-caminho')
            .setDisplaySize(36, 36).setDepth(21).setVisible(false)

        this.chipText = this.add.text(L.CHIP.x + 60, L.cy(L.CHIP), '', {
            fontFamily: 'Arial Black, Arial', fontSize: '15px', color: CSS.creme,
            wordWrap: { width: L.CHIP.w - 76 },
        }).setOrigin(0, 0.5).setDepth(21).setResolution(2)

        const zone = this.add.zone(L.cx(L.CHIP), L.cy(L.CHIP), L.CHIP.w, L.CHIP.h)
            .setDepth(22).setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (this.phase === 'rodando') return
            if (this.challenge.mode !== 'montar-programa') return
            this.openConditionPicker()
        })
    }

    private paintChip() {
        const filled = this.condition !== null
        this.chipBg.clear()
        this.chipBg.fillStyle(filled ? C.amarelo : C.borda, filled ? 1 : 0.55)
        this.chipBg.fillRoundedRect(L.CHIP.x, L.CHIP.y, L.CHIP.w, L.CHIP.h, 14)
        this.chipBg.lineStyle(3, filled ? C.creme : C.claro, filled ? 0.95 : 0.5)
        this.chipBg.strokeRoundedRect(L.CHIP.x, L.CHIP.y, L.CHIP.w, L.CHIP.h, 14)

        if (filled) {
            this.chipIcon.setTexture(CONDITION_ICON[this.condition!]).setVisible(true)
            this.chipText.setText(conditionSentence(this.condition!))
                .setColor(CSS.borda)
                .setX(L.CHIP.x + 60)
        } else {
            this.chipIcon.setVisible(false)
            this.chipText.setText('Enquanto ...   toque para escolher')
                .setColor(CSS.claro)
                .setX(L.CHIP.x + 16)
        }
    }

    private buildSlot(rect: L.Rect, kind: 'setup' | 'body', index: number): SlotView {
        const bg = this.add.graphics().setDepth(20)

        const icon = this.add.image(rect.x + 26, L.cy(rect), 'icon-avancar')
            .setDisplaySize(28, 28).setDepth(21).setVisible(false)

        const label = this.add.text(rect.x + 48, L.cy(rect), '', {
            fontFamily: 'Arial Black, Arial', fontSize: '14px', color: CSS.creme,
            wordWrap: { width: rect.w - 60 },
        }).setOrigin(0, 0.5).setDepth(21).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setDepth(22).setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => this.onSlotTap(kind, index))

        return { rect, bg, icon, label }
    }

    /**
     * Toque em slot vazio seleciona (fica esperando uma peça da bandeja);
     * toque em slot cheio devolve a peça. Sem arrastar — funciona melhor no toque.
     */
    private onSlotTap(kind: 'setup' | 'body', index: number) {
        if (this.phase === 'rodando') return
        if (this.challenge.mode !== 'montar-programa') return

        const list = kind === 'setup' ? this.setup : this.body

        if (list[index] !== undefined) {
            list.splice(index, 1)
            this.selectedSlot = null
        } else {
            this.selectedSlot = { kind, index }
        }
        this.playTick()
        this.refreshProgram()
    }

    private paintSlot(view: SlotView, action: ActionId | undefined, selected: boolean) {
        const { rect, bg } = view
        bg.clear()

        if (action) {
            bg.fillStyle(C.claro, 1)
            bg.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 12)
            bg.lineStyle(3, C.creme, 0.85)
            bg.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 12)
            view.icon.setTexture(ACTION_ICON[action]).setVisible(true)
            view.label.setText(ACTION_LABELS[action]).setColor(CSS.borda).setX(rect.x + 48)
        } else {
            bg.fillStyle(C.borda, selected ? 0.75 : 0.42)
            bg.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 12)
            bg.lineStyle(selected ? 4 : 2, selected ? C.amarelo : C.claro, selected ? 1 : 0.45)
            bg.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 12)
            view.icon.setVisible(false)
            view.label.setText(selected ? 'escolha uma peça' : 'vazio')
                .setColor(CSS.claro).setX(rect.x + 16)
        }
    }

    private refreshProgram() {
        this.paintChip()
        this.setupViews.forEach((v, i) => this.paintSlot(
            v, this.setup[i],
            this.selectedSlot?.kind === 'setup' && this.selectedSlot.index === i,
        ))
        this.bodyViews.forEach((v, i) => this.paintSlot(
            v, this.body[i],
            this.selectedSlot?.kind === 'body' && this.selectedSlot.index === i,
        ))
        this.refreshRunButton()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  BANDEJA — o conteúdo muda conforme o modo do desafio
    // ══════════════════════════════════════════════════════════════════════

    private buildTray() {
        this.trayLayer.removeAll(true)
        const ch = this.challenge

        if (ch.mode === 'prever-condicao') {
            this.buildVFButtons()
            return
        }

        if (ch.mode === 'escolher-condicao') {
            const options = ch.conditionOptions ?? []
            options.forEach((cond, i) => this.buildTrayCard(
                L.TRAY_SLOTS[i], CONDITION_ICON[cond], conditionSentence(cond),
                () => { this.condition = cond; this.playTick(); this.refreshProgram() },
            ))
            return
        }

        const actions = ch.allowedActions ?? []
        actions.forEach((action, i) => this.buildTrayCard(
            L.TRAY_SLOTS[i], ACTION_ICON[action], ACTION_LABELS[action],
            () => this.placeAction(action),
        ))
    }

    private buildTrayCard(rect: L.Rect, iconKey: string, text: string, onTap: () => void) {
        const card = this.add.image(L.cx(rect), L.cy(rect), 'card-acao')
            .setDisplaySize(rect.w, rect.h)
        const icon = this.add.image(rect.x + 34, L.cy(rect), iconKey).setDisplaySize(34, 34)
        const label = this.add.text(rect.x + 62, L.cy(rect), text, {
            fontFamily: 'Arial Black, Arial', fontSize: '15px', color: CSS.borda,
            wordWrap: { width: rect.w - 78 },
        }).setOrigin(0, 0.5).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })

        zone.on('pointerover', () => this.tweens.add({ targets: [card, icon, label], y: '-=3', duration: 90 }))
        zone.on('pointerout', () => this.tweens.add({ targets: [card, icon, label], y: '+=3', duration: 90 }))
        zone.on('pointerdown', () => {
            if (this.phase === 'rodando') return
            this.tweens.add({ targets: card, scaleX: card.scaleX * 0.96, duration: 70, yoyo: true })
            onTap()
        })

        this.trayLayer.add([card, icon, label, zone])
    }

    private buildVFButtons() {
        const make = (rect: L.Rect, label: string, sub: string, color: number, answer: boolean) => {
            const g = this.add.graphics()
            g.fillStyle(color, 1)
            g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 18)
            g.lineStyle(4, C.creme, 0.9)
            g.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 18)

            const title = this.add.text(L.cx(rect), L.cy(rect) - 12, label, {
                fontFamily: 'Arial Black, Arial', fontSize: '24px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2)

            const desc = this.add.text(L.cx(rect), L.cy(rect) + 17, sub, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '15px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
            }).setOrigin(0.5).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (this.phase === 'rodando') return
                this.tweens.add({ targets: [title, desc], scale: 0.94, duration: 70, yoyo: true })
                this.answerCondition(answer)
            })

            this.trayLayer.add([g, title, desc, zone])
        }

        make(L.VF_BUTTONS[0], 'VERDADEIRA', 'o robô repete', C.verde, true)
        make(L.VF_BUTTONS[1], 'FALSA', 'o laço para', C.vermelho, false)
    }

    private placeAction(action: ActionId) {
        const target = this.selectedSlot ?? this.firstEmptySlot()
        if (!target) return

        const list = target.kind === 'setup' ? this.setup : this.body
        list[target.index] = action
        this.selectedSlot = null
        this.playTick()
        this.refreshProgram()
    }

    private firstEmptySlot(): { kind: 'setup' | 'body'; index: number } | null {
        for (let i = 0; i < L.MAX_BODY; i++) {
            if (this.body[i] === undefined) return { kind: 'body', index: i }
        }
        for (let i = 0; i < L.MAX_SETUP; i++) {
            if (this.setup[i] === undefined) return { kind: 'setup', index: i }
        }
        return null
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONTROLES
    // ══════════════════════════════════════════════════════════════════════

    private buildControls() {
        this.runBtn = this.makeButton(L.BTN_RUN, 'EXECUTAR', C.verde, () => this.run())
        this.makeButton(L.BTN_RESET, 'LIMPAR', C.normal, () => this.resetProgram())
    }

    private makeButton(rect: L.Rect, label: string, color: number, onClick: () => void) {
        const container = this.add.container(L.cx(rect), L.cy(rect)).setDepth(23)
        const g = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '19px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setData('bg', g)
        container.setData('color', color)
        container.setData('rect', rect)
        this.paintButton(container, true)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setDepth(24).setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (container.getData('disabled')) return
            this.tweens.add({ targets: container, scale: 0.96, duration: 70, yoyo: true })
            onClick()
        })
        container.setData('zone', zone)
        return container
    }

    private paintButton(btn: Phaser.GameObjects.Container, enabled: boolean) {
        const g = btn.getData('bg') as Phaser.GameObjects.Graphics
        const rect = btn.getData('rect') as L.Rect
        const color = btn.getData('color') as number
        btn.setData('disabled', !enabled)

        g.clear()
        g.fillStyle(enabled ? color : C.apagado, 1)
        g.fillRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, rect.h / 2)
        g.fillStyle(0xffffff, enabled ? 0.16 : 0.06)
        g.fillRoundedRect(-rect.w / 2 + 6, -rect.h / 2 + 5, rect.w - 12, rect.h * 0.34, rect.h / 4)
        g.lineStyle(3, C.creme, enabled ? 0.9 : 0.35)
        g.strokeRoundedRect(-rect.w / 2, -rect.h / 2, rect.w, rect.h, rect.h / 2)
    }

    private refreshRunButton() {
        if (!this.runBtn) return
        const ch = this.challenge

        // No nível 1 quem comanda são os botões V/F — o Executar sai de cena
        const hidden = ch.mode === 'prever-condicao'
        this.runBtn.setVisible(!hidden)
        const zone = this.runBtn.getData('zone') as Phaser.GameObjects.Zone | undefined
        if (zone) zone.setActive(!hidden).setVisible(!hidden)

        const needsPrediction = !!ch.predictStop && this.predictedCell === null
        const ready = this.condition !== null
            && this.body.filter(Boolean).length > 0
            && !needsPrediction
            && this.phase !== 'rodando'

        this.paintButton(this.runBtn, ready)
    }

    private resetProgram() {
        if (this.phase === 'rodando') return
        const ch = this.challenge

        if (ch.mode === 'montar-programa') {
            this.setup = []
            this.body = []
            this.condition = null
        }
        this.selectedSlot = null
        this.result = undefined
        this.trace = []
        this.traceIndex = 0
        this.playTick()

        const keepGuess = this.predictedCell
        this.drawBoard()
        this.predictedCell = keepGuess

        if (keepGuess) {
            const p = L.cellCenter(ch, keepGuess.c, keepGuess.r)
            this.predictFlag = this.add.image(p.x, p.y - 14, 'marca-palpite')
                .setDisplaySize(50, 50).setDepth(12)
        }
        this.refreshProgram()
    }

    // ══════════════════════════════════════════════════════════════════════
    //  EXECUÇÃO
    // ══════════════════════════════════════════════════════════════════════

    private buildProgram(): Program | null {
        if (this.condition === null) return null
        const body = this.body.filter(Boolean)
        if (!body.length) return null
        return { condition: this.condition, setup: this.setup.filter(Boolean), body }
    }

    private run() {
        if (this.phase === 'rodando') return
        const program = this.buildProgram()
        if (!program) return

        this.phase = 'rodando'
        this.refreshRunButton()

        this.result = simulate(this.challenge, program)
        this.trace = this.result.trace
        this.traceIndex = 0
        this.playTraceFrom(0)
    }

    /** Nível 1: a criança responde antes de cada verificação. */
    private answerCondition(answer: boolean) {
        if (this.phase === 'rodando') return

        if (!this.result) {
            const program = this.buildProgram()
            if (!program) return
            this.result = simulate(this.challenge, program)
            this.trace = this.result.trace
            this.traceIndex = 0

            // O setup roda antes da primeira pergunta
            while (this.trace[this.traceIndex] && this.trace[this.traceIndex].kind !== 'verificar') {
                this.traceIndex++
            }
        }

        const step = this.trace[this.traceIndex]
        if (!step || step.kind !== 'verificar') return

        if (answer === step.conditionValue) {
            this.phase = 'rodando'
            this.playTick()
            this.playTraceFrom(this.traceIndex)
            return
        }

        this.registerError()
        this.flashChip(!!step.conditionValue)
        this.showBadge(step.conditionValue ? 'badge-verdadeiro' : 'badge-falso')
        this.showToast(
            step.conditionValue
                ? 'Era VERDADEIRA — o robô ainda podia repetir o passo.'
                : 'Era FALSA — era exatamente aqui que o laço parava.',
            false,
        )

        this.time.delayedCall(2100, () => {
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
            else this.startChallenge()
        })
    }

    /**
     * Anima o trace a partir de um índice. No nível 1 devolve o controle à
     * criança na próxima verificação; nos outros vai direto até o fim.
     */
    private playTraceFrom(index: number) {
        const stepwise = this.challenge.mode === 'prever-condicao'

        const next = (i: number) => {
            if (i >= this.trace.length) {
                this.finish()
                return
            }

            const step = this.trace[i]
            this.traceIndex = i

            if (stepwise && step.kind === 'verificar' && i !== index) {
                this.phase = 'montando'
                this.broadcastMission()
                return
            }

            this.animateStep(step, () => next(i + 1))
        }

        next(index)
    }

    private animateStep(step: TraceStep, done: () => void) {
        const ch = this.challenge

        if (step.kind === 'verificar') {
            this.flashChip(!!step.conditionValue)
            this.showBadge(step.conditionValue ? 'badge-verdadeiro' : 'badge-falso')
            this.playNote(step.conditionValue ? 700 : 320)
            this.time.delayedCall(640, done)
            return
        }

        if (step.kind === 'virar') {
            this.robotAngle += step.action === 'virar-dir' ? 90 : -90
            this.playNote(520)
            this.tweens.add({
                targets: this.robot, angle: this.robotAngle, duration: 260, ease: 'Sine.easeInOut',
                onComplete: () => this.time.delayedCall(100, done),
            })
            return
        }

        if (step.kind === 'avancar') {
            const from = L.cellCenter(ch, step.before.c, step.before.r)
            const to = L.cellCenter(ch, step.after.c, step.after.r)

            this.dropTrail(from.x, from.y)
            this.revealFogAround(step.after)
            this.playNote(600)

            const followers = [this.robot, this.robotGlow].filter(Boolean)
            this.tweens.add({ targets: followers, x: to.x, y: to.y, duration: 280, ease: 'Sine.easeInOut' })
            this.tweens.add({
                targets: this.badge, x: to.x, y: to.y - L.TILE * 0.62,
                duration: 280, ease: 'Sine.easeInOut',
                onComplete: () => this.time.delayedCall(80, done),
            })
            return
        }

        // bater
        this.showBadge('badge-batida')
        this.cameras.main.shake(180, 0.006)
        this.spark(this.robot?.x ?? 0, this.robot?.y ?? 0)
        this.playNote(200, 'square', 0.22, 0.16)

        if (this.robot) {
            this.tweens.add({
                targets: this.robot, x: this.robot.x - 9, duration: 55, yoyo: true, repeat: 3,
                onComplete: () => this.time.delayedCall(280, done),
            })
        } else {
            this.time.delayedCall(420, done)
        }
    }

    private dropTrail(x: number, y: number) {
        const mark = this.add.image(x, y, 'marca-rastro')
            .setDisplaySize(L.TILE * 0.42, L.TILE * 0.42)
            .setAlpha(0)
        this.trailLayer.add(mark)
        this.tweens.add({ targets: mark, alpha: 0.55, duration: 200 })
    }

    private showBadge(key: string) {
        if (!this.badge) return
        this.tweens.killTweensOf(this.badge)
        this.badge.setTexture(key).setAlpha(0).setScale(1)
        this.badge.setDisplaySize(48, 48)

        this.tweens.add({
            targets: this.badge, alpha: 1, duration: 170, ease: 'Back.easeOut',
            onComplete: () => {
                this.tweens.add({ targets: this.badge, alpha: 0, duration: 260, delay: 440 })
            },
        })
    }

    private flashChip(isTrue: boolean) {
        const flash = this.add.graphics().setDepth(22)
        flash.fillStyle(isTrue ? C.verde : C.vermelho, 0.82)
        flash.fillRoundedRect(L.CHIP.x, L.CHIP.y, L.CHIP.w, L.CHIP.h, 14)
        this.tweens.add({
            targets: flash, alpha: 0, duration: 580, ease: 'Sine.easeIn',
            onComplete: () => flash.destroy(),
        })
    }

    private spark(x: number, y: number) {
        for (let i = 0; i < 8; i++) {
            const s = this.add.image(x, y, 'fx-faisca')
                .setDisplaySize(14, 14).setDepth(20)
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

    // ══════════════════════════════════════════════════════════════════════
    //  RESULTADO
    // ══════════════════════════════════════════════════════════════════════

    private finish() {
        const res = this.result
        if (!res) return
        const ch = this.challenge

        if (res.outcome === 'objetivo') {
            const guessed = !!ch.predictStop && !!this.predictedCell
                && this.predictedCell.c === res.final.c
                && this.predictedCell.r === res.final.r

            this.hits++
            this.consecutiveErrors = 0
            this.points += guessed ? 15 : 10
            this.playWin()

            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: guessed ? 15 : 10, stage: this.levelConfig.level,
            })
            this.emitCheckpoint()

            this.showToast(
                guessed ? `${ch.explanation}   +5 por acertar o palpite!` : ch.explanation,
                true,
            )
            this.time.delayedCall(2400, () => this.advance())
            return
        }

        this.registerError()

        const msg =
            res.outcome === 'bateu'
                ? 'O robô bateu. A condição ainda estava verdadeira e mandou ele andar para cima da parede.'
                : res.outcome === 'infinito'
                    ? 'Laço infinito! Do jeito que ficou, a condição nunca chega a ser falsa.'
                    : 'O laço parou, mas fora da estrela. Onde essa condição vira falsa?'

        this.showToast(msg, false)
        this.time.delayedCall(2400, () => {
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
            else this.startChallenge()
        })
    }

    private registerError() {
        this.errors++
        this.consecutiveErrors++
        this.points = Math.max(0, this.points - 3)
        this.playError()
        runtimeGameBridge.emit({
            type: 'WRONG_ANSWER', gameId: GAME_ID,
            pointsEarned: -3, stage: this.levelConfig.level,
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
        this.showLevelComplete(next)
    }

    // ══════════════════════════════════════════════════════════════════════
    //  OVERLAYS
    // ══════════════════════════════════════════════════════════════════════

    private keep<Obj extends Phaser.GameObjects.GameObject>(obj: Obj): Obj {
        this.overlay.push(obj)
        return obj
    }

    private clearOverlay() {
        this.overlay.forEach(o => { if (o.active) o.destroy() })
        this.overlay = []
    }

    /** Faixa curta sobre o tabuleiro. Não bloqueia a tela. */
    private showToast(message: string, good: boolean) {
        const bx = (L.BOARD_AREA.left + L.BOARD_AREA.right) / 2
        const panel = this.add.container(bx, L.BOARD_AREA.top + 48).setDepth(60)

        const text = this.add.text(0, 0, message, {
            fontFamily: 'Arial Black, Arial', fontSize: '18px', color: CSS.creme,
            align: 'center', wordWrap: { width: 660 },
        }).setOrigin(0.5).setResolution(2)

        const w = 720
        const h = Math.max(66, text.height + 34)
        const g = this.add.graphics()
        g.fillStyle(C.borda, 0.95)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
        g.lineStyle(4, good ? C.verde : C.vermelho, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)

        panel.add([g, text])
        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 200, ease: 'Back.easeOut' })
        this.tweens.add({
            targets: panel, alpha: 0, duration: 300, delay: 2000,
            onComplete: () => panel.destroy(),
        })
    }

    private openConditionPicker() {
        this.clearOverlay()
        const options = this.challenge.allowedConditions ?? []

        const shade = this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.72)
                .setDepth(200).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(201))

        const pw = 680
        const ph = 150 + options.length * 76

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 24)
        bg.lineStyle(5, C.amarelo, 0.9)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 24)

        const title = this.add.text(0, -ph / 2 + 46, 'Escolha a condição do laço', {
            fontFamily: 'Arial Black, Arial', fontSize: '25px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        options.forEach((cond, i) => {
            const y = -ph / 2 + 106 + i * 76

            const row = this.add.graphics()
            row.fillStyle(C.normal, 1)
            row.fillRoundedRect(-pw / 2 + 30, y, pw - 60, 62, 16)
            row.lineStyle(3, C.claro, 0.85)
            row.strokeRoundedRect(-pw / 2 + 30, y, pw - 60, 62, 16)

            const icon = this.add.image(-pw / 2 + 74, y + 31, CONDITION_ICON[cond])
                .setDisplaySize(38, 38)

            const label = this.add.text(-pw / 2 + 110, y + 31, conditionSentence(cond), {
                fontFamily: 'Arial Black, Arial', fontSize: '18px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
                wordWrap: { width: pw - 190 },
            }).setOrigin(0, 0.5).setResolution(2)

            const zone = this.add.zone(0, y + 31, pw - 60, 62).setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                this.condition = cond
                this.playTick()
                this.clearOverlay()
                this.refreshProgram()
            })

            panel.add([row, icon, label, zone])
        })

        shade.on('pointerdown', () => this.clearOverlay())
        panel.setAlpha(0).setScale(0.94)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private showTutorial() {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.8)
                .setDepth(200).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(201))

        const pw = 700, ph = 440

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.lineStyle(5, C.amarelo, 0.92)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.fillStyle(C.amarelo, 1)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, 14, { tl: 26, tr: 26, bl: 0, br: 0 })

        const title = this.add.text(0, -ph / 2 + 58, 'O laço ENQUANTO', {
            fontFamily: 'Arial Black, Arial', fontSize: '30px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title])

        const lines = [
            'Antes de cada volta, o robô testa a condição.',
            'Se ela é verdadeira, ele faz o que está dentro do laço.',
            'Se é falsa, o laço para na hora — não importa onde ele esteja.',
            'Ninguém sabe de antemão quantas voltas vão acontecer.',
        ]

        lines.forEach((line, i) => {
            const y = -ph / 2 + 122 + i * 58
            const dot = this.add.graphics()
            dot.fillStyle(C.amarelo, 1)
            dot.fillCircle(-pw / 2 + 60, y, 9)
            const text = this.add.text(-pw / 2 + 88, y, line, {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: CSS.creme,
                wordWrap: { width: pw - 150 },
            }).setOrigin(0, 0.5).setResolution(2)
            panel.add([dot, text])
        })

        panel.add(this.modalButton(0, ph / 2 - 56, 'Vamos testar!', C.verde, () => this.clearOverlay()))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showLevelStart(onStart: () => void) {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.84)
                .setDepth(200).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(201))

        const pw = 640, ph = 390

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.lineStyle(5, C.amarelo, 0.92)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)

        const badge = this.add.text(0, -ph / 2 + 52, `NÍVEL ${this.levelConfig.level} DE 3`, {
            fontFamily: 'Arial Black, Arial', fontSize: '22px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -ph / 2 + 116, this.levelConfig.title, {
            fontFamily: 'Arial Black, Arial', fontSize: '32px', color: CSS.creme,
            align: 'center', wordWrap: { width: pw - 90 },
        }).setOrigin(0.5).setResolution(2)

        const obj = this.add.text(0, -ph / 2 + 192, this.levelConfig.objective, {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: CSS.claro,
            align: 'center', wordWrap: { width: pw - 110 },
        }).setOrigin(0.5).setResolution(2)

        const tip = this.add.text(0, -ph / 2 + 268, this.levelConfig.tip, {
            fontFamily: 'Arial', fontSize: '16px', color: CSS.amarelo,
            align: 'center', wordWrap: { width: pw - 120 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, badge, title, obj, tip])
        panel.add(this.modalButton(0, ph / 2 - 54, 'Começar', C.verde, () => {
            this.clearOverlay()
            onStart()
        }))

        panel.setAlpha(0).setScale(0.92)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private showLevelComplete(next: 2 | 3 | null) {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.82)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 620, ph = 360

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.lineStyle(5, C.amarelo, 0.92)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)

        const title = this.add.text(0, -ph / 2 + 76, next ? 'Nível concluído!' : 'Jogo concluído!', {
            fontFamily: 'Arial Black, Arial', fontSize: '36px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, -ph / 2 + 138, next
            ? this.levelConfig.title
            : 'Você programou laços com condição do começo ao fim.', {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: CSS.creme,
            align: 'center', wordWrap: { width: pw - 110 },
        }).setOrigin(0.5).setResolution(2)

        const stats = this.add.text(0, -ph / 2 + 196,
            `${this.points} pontos  ·  ${this.hits} acertos  ·  ${this.errors} erros`, {
            fontFamily: 'Arial Black, Arial', fontSize: '17px', color: CSS.claro,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, sub, stats])

        if (next) {
            panel.add(this.add.text(0, ph / 2 - 58, 'Preparando o próximo nível...', {
                fontFamily: 'Arial', fontStyle: 'bold', fontSize: '16px', color: CSS.amarelo,
            }).setOrigin(0.5).setResolution(2))

            this.time.delayedCall(2500, () => {
                this.scene.restart({ level: next, points: this.points, showIntro: true })
            })
        } else {
            panel.add(this.modalButton(-140, ph / 2 - 60, 'Jogar de novo', C.verde,
                () => this.scene.restart({ level: 1, points: 0 })))
            panel.add(this.modalButton(140, ph / 2 - 60, 'Sair', C.normal,
                () => EventBus.emit('exit-game')))
        }

        panel.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private showGameOver() {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.82)
                .setDepth(300).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(301))

        const pw = 620, ph = 344

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.lineStyle(5, C.vermelho, 0.9)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)

        const title = this.add.text(0, -ph / 2 + 76, 'Quase lá!', {
            fontFamily: 'Arial Black, Arial', fontSize: '34px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const reason = this.add.text(0, -ph / 2 + 134, 'Três tentativas seguidas sem acertar.', {
            fontFamily: 'Arial', fontStyle: 'bold', fontSize: '19px', color: CSS.claro,
            align: 'center', wordWrap: { width: pw - 110 },
        }).setOrigin(0.5).setResolution(2)

        const hint = this.add.text(0, -ph / 2 + 192, this.challenge.explanation, {
            fontFamily: 'Arial', fontSize: '16px', color: CSS.amarelo,
            align: 'center', wordWrap: { width: pw - 110 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, reason, hint])
        panel.add(this.modalButton(-140, ph / 2 - 58, 'Tentar de novo', C.verde,
            () => this.scene.restart({ level: this.levelConfig.level, points: this.points })))
        panel.add(this.modalButton(140, ph / 2 - 58, 'Sair', C.normal,
            () => EventBus.emit('exit-game')))

        panel.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })

        runtimeGameBridge.emit({ type: 'GAME_OVER', gameId: GAME_ID, stage: this.levelConfig.level })
    }

    private modalButton(x: number, y: number, label: string, color: number, onClick: () => void) {
        const w = 236, h = 54
        const container = this.add.container(x, y)

        const g = this.add.graphics()
        g.fillStyle(color, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.lineStyle(4, C.creme, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)

        const text = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial', fontSize: '18px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        container.add([g, text])
        container.setSize(w, h)
        container.setInteractive({ useHandCursor: true })
        container.on('pointerover', () => this.tweens.add({ targets: container, scale: 1.04, duration: 90 }))
        container.on('pointerout', () => this.tweens.add({ targets: container, scale: 1, duration: 90 }))
        container.on('pointerdown', () => { this.playTick(); onClick() })
        return container
    }

    // ══════════════════════════════════════════════════════════════════════
    //  ÁUDIO
    // ══════════════════════════════════════════════════════════════════════

    private audioCtx(): AudioContext | null {
        if (this.isMuted) return null
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

    private playTick() {
        this.playNote(540, 'sine', 0.04, 0.08)
    }

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
                this.scene.restart({ level: cmd.stage as 1 | 2 | 3, points: this.points, showIntro: true })
            })
        })
    }
}