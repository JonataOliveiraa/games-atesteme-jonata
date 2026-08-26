import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { LEVELS } from '../data/levels'
import { C, CSS } from '../data/theme'
import {
    ACTION_ICON,
    ACTION_LABELS,
    ahead,
    CONDITION_HELP,
    CONDITION_ICON,
    conditionSentence,
    simulate,
} from '../data/conditions'
import * as L from '../data/layout'
import type {
    ActionId,
    ConditionId,
    LevelConfig,
    MazeChallenge,
    Program,
    SimulationResult,
    RobotState,
    TraceStep,
} from '../types'

const GAME_ID = 'labirinto-do-enquanto'
const MAX_CONSECUTIVE_ERRORS = 3

type Phase = 'montando' | 'rodando'
type SlotKind = 'setup' | 'body'

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
    private phase: Phase = 'montando'

    // ── Programa em construção ──
    private condition: ConditionId | null = null
    private setup: ActionId[] = []
    private body: ActionId[] = []
    private selectedSlot: { kind: SlotKind; index: number } | null = null

    // ── Execução ──
    private trace: TraceStep[] = []
    private traceIndex = 0
    private result?: SimulationResult
    private robotAngle = 0

    // ── Camadas e objetos ──
    private boardLayer!: Phaser.GameObjects.Container
    private trailLayer!: Phaser.GameObjects.Container
    private panelLayer!: Phaser.GameObjects.Container
    private overlay: Phaser.GameObjects.GameObject[] = []

    private robot?: Phaser.GameObjects.Image
    private robotGlow?: Phaser.GameObjects.Image
    private badge?: Phaser.GameObjects.Image
    private conditionFocus?: Phaser.GameObjects.Container

    private lay!: L.ProgramLayout
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

    init(data: { level?: number; points?: number }) {
        const lvl = (data?.level ?? 1) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(l => l.level === lvl) ?? LEVELS[0]
        this.challengeIndex = 0
        this.hits = 0
        this.errors = 0
        this.consecutiveErrors = 0
        this.points = data?.points ?? 0
        this.phase = 'montando'
        this.condition = null
        this.setup = []
        this.body = []
        this.selectedSlot = null
        this.trace = []
        this.traceIndex = 0
        this.result = undefined
        this.robotAngle = 0
        this.setupViews = []
        this.bodyViews = []
        this.overlay = []
    }

    private get challenge(): MazeChallenge {
        return this.levelConfig.challenges[this.challengeIndex]
    }

    create() {
        this.drawBackground()

        this.boardLayer = this.add.container(0, 0).setDepth(10)
        this.trailLayer = this.add.container(0, 0).setDepth(11)
        this.panelLayer = this.add.container(0, 0).setDepth(20)

        this.registerPlatformCommands()
        EventBus.on('show-tutorial', () => this.runTutorial(true, () => { }), this)

        this.events.once('shutdown', () => {
            this.clearOverlay()
            EventBus.off('show-tutorial', undefined, this)
            this.unsubPlatform?.()
            this.unsubPlatform = undefined
        })

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        // Desenha o desafio primeiro: o tutorial aponta para peças reais na tela.
        this.startChallenge()
        this.showLevelStart(() => this.runTutorial(false, () => { }))
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CICLO DO DESAFIO
    // ══════════════════════════════════════════════════════════════════════

    private startChallenge() {
        const ch = this.challenge

        this.phase = 'montando'
        this.condition = ch.mode === 'escolher-condicao' ? null : (ch.given?.condition ?? null)
        this.setup = [...(ch.given?.setup ?? [])]
        this.body = [...(ch.given?.body ?? [])]
        this.selectedSlot = null
        this.trace = []
        this.traceIndex = 0
        this.result = undefined

        this.drawBoard()
        this.buildPanel()

        // No nível 1 o programa já está pronto: a simulação roda de saída e a
        // criança só responde às verificações, uma de cada vez.
        if (ch.mode === 'prever-condicao') this.prepareStepwiseRun()

        this.broadcastMission()
    }

    private prepareStepwiseRun() {
        const program = this.buildProgram()
        if (!program) return
        this.result = simulate(this.challenge, program)
        this.trace = this.result.trace
        this.traceIndex = 0
        while (this.trace[this.traceIndex] && this.trace[this.traceIndex].kind !== 'verificar') {
            this.traceIndex++
        }
    }

    private broadcastMission() {
        const mode = this.challenge.mode
        const instruction =
            mode === 'prever-condicao' ? 'Veja o robô agora: a condição é V ou F?'
                : mode === 'escolher-condicao' ? 'Escolha uma condição e toque em EXECUTAR'
                    : 'Monte: ANTES DO LAÇO + ENQUANTO + REPITA'

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

    private plannedPathCells(ch: MazeChallenge) {
        const path = new Set<string>()
        path.add(ch.start.c + ',' + ch.start.r)

        const result = simulate(ch, ch.solution)
        result.trace.forEach(step => {
            if (step.kind === 'avancar') {
                path.add(step.after.c + ',' + step.after.r)
            }
        })

        return path
    }

    private drawBoard() {
        this.boardLayer.removeAll(true)
        this.trailLayer.removeAll(true)
        this.robot?.destroy()
        this.robotGlow?.destroy()
        this.badge?.destroy()
        this.conditionFocus?.destroy()
        this.robot = undefined
        this.robotGlow = undefined
        this.badge = undefined

        const ch = this.challenge
        const plannedPath = this.plannedPathCells(ch)
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
                const isGoal = ch.goal.c === c && ch.goal.r === r
                const isStart = ch.start.c === c && ch.start.r === r
                const isPath = plannedPath.has(c + ',' + r)

                const key = isGoal ? 'tile-objetivo'
                    : isStart ? 'tile-partida'
                        : isPath ? 'tile-parede'
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
            .setDisplaySize(54, 54)
            .setDepth(14)
            .setAlpha(0)

        this.showConditionFocus({ c: ch.start.c, r: ch.start.r, dir: ch.startDir, steps: 0 })
    }

    // ══════════════════════════════════════════════════════════════════════
    //  PAINEL DO PROGRAMA — redesenhado a cada desafio, só com o necessário
    // ══════════════════════════════════════════════════════════════════════

    private showConditionFocus(state: RobotState, value?: boolean) {
        this.conditionFocus?.destroy()
        this.conditionFocus = undefined
        if (!this.condition) return

        const ch = this.challenge
        const current = L.cellCenter(ch, state.c, state.r)
        const focus = this.add.container(0, 0).setDepth(16)
        const g = this.add.graphics()
        const color = value === undefined ? C.amarelo : value ? C.verde : C.vermelho

        if (this.condition === 'caminho_livre') {
            const target = ahead(state)
            const dx = target.c - state.c
            const dy = target.r - state.r
            const inside = target.c >= 0 && target.c < ch.width && target.r >= 0 && target.r < ch.height
            const p = inside
                ? L.cellCenter(ch, target.c, target.r)
                : { x: current.x + dx * L.TILE, y: current.y + dy * L.TILE }
            const isFree = inside && !ch.walls.some(w => w.c === target.c && w.r === target.r)
            const markColor = value === undefined ? (isFree ? C.verde : C.vermelho) : color

            g.lineStyle(7, markColor, 1)
            g.strokeRoundedRect(p.x - L.TILE / 2 + 8, p.y - L.TILE / 2 + 8, L.TILE - 16, L.TILE - 16, 16)
            g.fillStyle(markColor, 0.18)
            g.fillRoundedRect(p.x - L.TILE / 2 + 8, p.y - L.TILE / 2 + 8, L.TILE - 16, L.TILE - 16, 16)
            g.lineStyle(8, C.amarelo, 0.95)
            g.lineBetween(current.x + dx * L.TILE * 0.24, current.y + dy * L.TILE * 0.24, current.x + dx * L.TILE * 0.44, current.y + dy * L.TILE * 0.44)
            g.fillStyle(C.amarelo, 1)
            g.fillCircle(current.x + dx * L.TILE * 0.5, current.y + dy * L.TILE * 0.5, 9)

            const label = this.add.text(p.x, p.y - L.TILE / 2 - 16, isFree ? 'CASA LIVRE' : 'BLOQUEADO', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)
            focus.add([g, label])
        } else if (this.condition === 'nao_no_objetivo') {
            g.lineStyle(7, color, 1)
            g.strokeRoundedRect(current.x - L.TILE / 2 + 8, current.y - L.TILE / 2 + 8, L.TILE - 16, L.TILE - 16, 16)
            g.fillStyle(color, 0.15)
            g.fillRoundedRect(current.x - L.TILE / 2 + 8, current.y - L.TILE / 2 + 8, L.TILE - 16, L.TILE - 16, 16)
            const atGoal = state.c === ch.goal.c && state.r === ch.goal.r
            const label = this.add.text(current.x, current.y - L.TILE / 2 - 16, atGoal ? 'NA CASA' : 'AINDA FORA', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 5,
            }).setOrigin(0.5).setResolution(2)
            focus.add([g, label])
        } else {
            g.fillStyle(C.borda, 0.9)
            g.fillRoundedRect(current.x - 84, current.y - L.TILE / 2 - 46, 168, 42, 18)
            g.lineStyle(3, color, 1)
            g.strokeRoundedRect(current.x - 84, current.y - L.TILE / 2 - 46, 168, 42, 18)
            const label = this.add.text(current.x, current.y - L.TILE / 2 - 25, `${state.steps} PASSOS`, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2)
            focus.add([g, label])
        }

        this.conditionFocus = focus
        this.boardLayer.add(focus)
    }
    private buildPanel() {
        this.panelLayer.removeAll(true)
        this.setupViews = []
        this.bodyViews = []
        this.runBtn = undefined

        const ch = this.challenge
        this.lay = L.programLayout(ch.mode)
        const lay = this.lay

        const g = this.add.graphics()
        g.fillStyle(C.borda, 0.30)
        g.fillRoundedRect(L.PANEL.x + 5, L.PANEL.y + 7, L.PANEL.w, L.PANEL.h, L.PANEL.r)
        g.fillStyle(C.escuro, 0.94)
        g.fillRoundedRect(L.PANEL.x, L.PANEL.y, L.PANEL.w, L.PANEL.h, L.PANEL.r)
        g.lineStyle(4, C.claro, 0.75)
        g.strokeRoundedRect(L.PANEL.x, L.PANEL.y, L.PANEL.w, L.PANEL.h, L.PANEL.r)
        this.panelLayer.add(g)

        this.panelLayer.add(
            this.add.text(L.PANEL.x + L.PANEL.w / 2, L.PANEL_TITLE_Y, 'PAINEL DO ROBÔ', {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '25px', color: CSS.amarelo,
                stroke: CSS.borda, strokeThickness: 3,
            }).setOrigin(0.5).setResolution(2),
        )

        this.buildMissionGuide()

        if (lay.setupSlots.length) {
            this.panelLabel(lay.setupLabelY, 'ANTES DO LAÇO')
            lay.setupSlots.forEach((rect, i) => this.setupViews.push(this.buildSlot(rect, 'setup', i)))
        }

        const wb = this.add.graphics()
        wb.fillStyle(C.normal, 0.55)
        wb.fillRoundedRect(lay.whileBlock.x, lay.whileBlock.y, lay.whileBlock.w, lay.whileBlock.h, 16)
        wb.lineStyle(3, C.amarelo, 0.8)
        wb.strokeRoundedRect(lay.whileBlock.x, lay.whileBlock.y, lay.whileBlock.w, lay.whileBlock.h, 16)
        this.panelLayer.add(wb)

        this.buildChip()
        this.panelLabel(lay.bodyLabelY, 'REPITA')
        lay.bodySlots.forEach((rect, i) => this.bodyViews.push(this.buildSlot(rect, 'body', i)))

        this.panelLabel(lay.trayLabelY, lay.trayLabel)
        this.buildTray()
        this.buildControls()

        this.refreshProgram()
    }

    private buildMissionGuide() {
        const mode = this.challenge.mode
        const text = mode === 'prever-condicao'
            ? `Olhe o robô e teste: ${this.condition ? CONDITION_HELP[this.condition] : 'a condição vale agora?'}`
            : mode === 'escolher-condicao'
                ? 'Escolha a condição que fica falsa quando o robô chega na casa.'
                : 'Toque em um encaixe, toque na peça e execute o programa.'

        const x = L.PANEL.x + 18
        const y = L.PANEL.y + 48
        const w = L.PANEL.w - 36
        const h = 50

        const bg = this.add.graphics()
        bg.fillStyle(C.borda, 0.46)
        bg.fillRoundedRect(x, y, w, h, 14)
        bg.lineStyle(2, C.amarelo, 0.72)
        bg.strokeRoundedRect(x, y, w, h, 14)

        const label = this.add.text(x + 16, y + h / 2, text, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '15px', color: CSS.creme,
            wordWrap: { width: w - 32 },
        }).setOrigin(0, 0.5).setResolution(2)

        this.panelLayer.add([bg, label])
    }
    private panelLabel(y: number, label: string) {
        const t = this.add.text(L.PANEL.x + 34, y, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.claro,
            stroke: CSS.borda, strokeThickness: 2,
        }).setOrigin(0, 0.5).setResolution(2)
        this.panelLayer.add(t)
        return t
    }

    private buildChip() {
        const chip = this.lay.chip

        this.chipBg = this.add.graphics()
        this.chipIcon = this.add.image(chip.x + 32, L.cy(chip), 'icon-cond-caminho')
            .setDisplaySize(44, 44).setVisible(false)
        this.chipText = this.add.text(chip.x + 60, L.cy(chip), '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '19px', color: CSS.creme,
            wordWrap: { width: chip.w - 96 },
        }).setOrigin(0, 0.5).setResolution(2)

        const zone = this.add.zone(L.cx(chip), L.cy(chip), chip.w, chip.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (this.phase === 'rodando') return
            if (this.challenge.mode !== 'montar-programa') return
            this.openConditionPicker()
        })

        this.panelLayer.add([this.chipBg, this.chipIcon, this.chipText, zone])
    }

    private paintChip() {
        const chip = this.lay.chip
        const filled = this.condition !== null

        this.chipBg.clear()
        this.chipBg.fillStyle(filled ? C.amarelo : C.borda, filled ? 1 : 0.55)
        this.chipBg.fillRoundedRect(chip.x, chip.y, chip.w, chip.h, 14)
        this.chipBg.lineStyle(3, filled ? C.creme : C.claro, filled ? 0.95 : 0.5)
        this.chipBg.strokeRoundedRect(chip.x, chip.y, chip.w, chip.h, 14)

        if (filled) {
            this.chipIcon.setTexture(CONDITION_ICON[this.condition!]).setVisible(true)
            this.chipText.setText(conditionSentence(this.condition!))
                .setColor(CSS.borda)
                .setX(chip.x + 70)
        } else {
            this.chipIcon.setVisible(false)
            this.chipText.setText('Toque para escolher a condição')
                .setColor(CSS.claro)
                .setX(chip.x + 16)
        }
    }

    private buildSlot(rect: L.Rect, kind: SlotKind, index: number): SlotView {
        const bg = this.add.graphics()
        const icon = this.add.image(rect.x + 26, L.cy(rect), 'icon-avancar')
            .setDisplaySize(34, 34).setVisible(false)
        const label = this.add.text(rect.x + 48, L.cy(rect), '', {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.creme,
            wordWrap: { width: rect.w - 76 },
        }).setOrigin(0, 0.5).setResolution(2)

        const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => this.onSlotTap(kind, index))

        this.panelLayer.add([bg, icon, label, zone])
        return { rect, bg, icon, label }
    }

    /**
     * Toque em slot vazio seleciona (fica esperando uma peça da bandeja);
     * toque em slot cheio devolve a peça. Sem arrastar — funciona melhor no toque.
     */
    private onSlotTap(kind: SlotKind, index: number) {
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
            view.label.setText(selected ? 'agora toque na peça' : 'toque aqui')
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
        const ch = this.challenge

        if (ch.mode === 'prever-condicao') {
            this.buildVFButtons()
            return
        }

        if (ch.mode === 'escolher-condicao') {
            const options = ch.conditionOptions ?? []
            options.forEach((cond, i) => this.buildTrayCard(
                this.lay.traySlots[i], CONDITION_ICON[cond], conditionSentence(cond),
                () => { this.condition = cond; this.playTick(); this.refreshProgram() },
            ))
            return
        }

        const actions = ch.allowedActions ?? []
        actions.forEach((action, i) => this.buildTrayCard(
            this.lay.traySlots[i], ACTION_ICON[action], ACTION_LABELS[action],
            () => this.placeAction(action),
        ))
    }

    private buildTrayCard(rect: L.Rect | undefined, iconKey: string, text: string, onTap: () => void) {
        if (!rect) return

        const card = this.add.image(L.cx(rect), L.cy(rect), 'card-acao')
            .setDisplaySize(rect.w, rect.h)
        const icon = this.add.image(rect.x + 38, L.cy(rect), iconKey).setDisplaySize(40, 40)
        const label = this.add.text(rect.x + 70, L.cy(rect), text, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.borda,
            wordWrap: { width: rect.w - 92 },
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

        this.panelLayer.add([card, icon, label, zone])
    }

    private buildVFButtons() {
        const make = (rect: L.Rect, label: string, sub: string, color: number, answer: boolean) => {
            const g = this.add.graphics()
            g.fillStyle(color, 1)
            g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, 18)
            g.lineStyle(4, C.creme, 0.9)
            g.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, 18)

            const title = this.add.text(L.cx(rect), L.cy(rect) - 14, label, {
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '34px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 4,
            }).setOrigin(0.5).setResolution(2)

            const desc = this.add.text(L.cx(rect), L.cy(rect) + 19, sub, {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '19px', color: CSS.creme,
                stroke: CSS.borda, strokeThickness: 3,
            }).setOrigin(0.5).setResolution(2)

            const zone = this.add.zone(L.cx(rect), L.cy(rect), rect.w, rect.h)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (this.phase === 'rodando') return
                this.tweens.add({ targets: [title, desc], scale: 0.94, duration: 70, yoyo: true })
                this.answerCondition(answer)
            })

            this.panelLayer.add([g, title, desc, zone])
        }

        const [first, second] = this.lay.vfButtons
        make(first, 'VERDADEIRA', 'continua o laço', C.verde, true)
        make(second, 'FALSA', 'para agora', C.vermelho, false)
    }

    private placeAction(action: ActionId) {
        const target = this.selectedSlot ?? this.defaultSlot(action)
        if (!target) return

        const list = target.kind === 'setup' ? this.setup : this.body
        list[target.index] = action
        this.selectedSlot = null
        this.playTick()
        this.refreshProgram()
    }

    /** Curva cai naturalmente antes do laço; andar cai dentro dele. */
    private defaultSlot(action: ActionId): { kind: SlotKind; index: number } | null {
        const bodyFree = this.body[0] === undefined && this.bodyViews.length > 0
        const setupFree = this.setup[0] === undefined && this.setupViews.length > 0

        if (action === 'avancar') {
            if (bodyFree) return { kind: 'body', index: 0 }
            if (setupFree) return { kind: 'setup', index: 0 }
            return null
        }
        if (setupFree) return { kind: 'setup', index: 0 }
        if (bodyFree) return { kind: 'body', index: 0 }
        return null
    }

    // ══════════════════════════════════════════════════════════════════════
    //  CONTROLES
    // ══════════════════════════════════════════════════════════════════════

    private buildControls() {
        if (this.lay.btnRun) {
            this.runBtn = this.makeButton(this.lay.btnRun, 'EXECUTAR', C.verde, () => this.run())
        }
        if (this.lay.btnReset) {
            this.makeButton(this.lay.btnReset, 'LIMPAR', C.normal, () => this.resetProgram())
        }
    }

    private makeButton(rect: L.Rect, label: string, color: number, onClick: () => void) {
        const container = this.add.container(L.cx(rect), L.cy(rect))
        const g = this.add.graphics()
        const text = this.add.text(0, 0, label, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '22px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 4,
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
        const ready = this.condition !== null
            && this.body.filter(Boolean).length > 0
            && this.phase !== 'rodando'
        this.paintButton(this.runBtn, ready)
    }

    private resetProgram() {
        if (this.phase === 'rodando') return

        if (this.challenge.mode === 'montar-programa') {
            this.setup = []
            this.body = []
            this.condition = null
        }
        this.selectedSlot = null
        this.result = undefined
        this.trace = []
        this.traceIndex = 0
        this.playTick()
        this.drawBoard()
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
                this.showConditionFocus(step.before, step.conditionValue)
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
            this.showConditionFocus(step.before, step.conditionValue)
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
        const chip = this.lay.chip
        const flash = this.add.graphics().setDepth(22)
        flash.fillStyle(isTrue ? C.verde : C.vermelho, 0.82)
        flash.fillRoundedRect(chip.x, chip.y, chip.w, chip.h, 14)
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

        if (res.outcome === 'objetivo') {
            this.hits++
            this.consecutiveErrors = 0
            this.points += 10
            this.playWin()

            runtimeGameBridge.emit({
                type: 'CORRECT_ANSWER', gameId: GAME_ID,
                pointsEarned: 10, stage: this.levelConfig.level,
            })
            this.emitCheckpoint()

            this.showToast(this.challenge.explanation, true)
            this.time.delayedCall(2400, () => this.advance())
            return
        }

        this.registerError()

        const msg =
            res.outcome === 'bateu'
                ? 'O robô bateu. A condição ainda estava verdadeira e mandou ele andar para cima da parede.'
                : res.outcome === 'infinito'
                    ? 'Laço infinito! Do jeito que ficou, a condição nunca chega a ser falsa.'
                    : 'O laço parou, mas fora da casa. Onde essa condição vira falsa?'

        this.showToast(msg, false)
        this.time.delayedCall(2400, () => {
            if (this.consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) this.showGameOver()
            else this.startChallenge()
        })
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
        this.showLevelComplete(next)
    }

    // ══════════════════════════════════════════════════════════════════════
    //  TUTORIAL
    // ══════════════════════════════════════════════════════════════════════

    private tutorialSteps(): TutorialStep[] {
        const lay = this.lay
        const chip = lay.chip
        const bodySlot = lay.bodySlots[0]
        const pad = 16

        const around = (r: L.Rect): Partial<TutorialStep> => ({
            shape: 'rect',
            x: L.cx(r), y: L.cy(r),
            w: r.w + pad, h: r.h + pad,
        })

        if (this.levelConfig.level === 1) {
            const vf = lay.vfButtons
            const vfArea: L.Rect = {
                x: vf[0].x, y: vf[0].y,
                w: vf[0].w, h: vf[1].y + vf[1].h - vf[0].y,
            }
            return [
                {
                    text: 'Esta é a condição do laço. O robô testa ela antes de cada volta.',
                    ...around(chip),
                } as TutorialStep,
                {
                    text: 'E isto é o que ele repete enquanto a condição for verdadeira.',
                    ...around(bodySlot),
                } as TutorialStep,
                {
                    text: 'Sua vez: olhe o robô no tabuleiro e diga se a condição é verdadeira ou falsa agora.',
                    ...around(vfArea),
                } as TutorialStep,
                {
                    text: 'Verdadeira, ele dá mais um passo. Falsa, o laço para na hora — não importa onde ele esteja.',
                    shape: 'none',
                    balloonY: 380,
                    buttonLabel: 'Vamos testar!',
                } as TutorialStep,
            ]
        }

        if (this.levelConfig.level === 2) {
            const tray = lay.traySlots
            const trayArea: L.Rect = {
                x: tray[0].x, y: tray[0].y,
                w: tray[0].w, h: tray[2].y + tray[2].h - tray[0].y,
            }
            return [
                {
                    text: 'Agora o laço está sem condição, e é você quem escolhe.',
                    ...around(chip),
                } as TutorialStep,
                {
                    text: 'Toque em uma destas três. Cada uma vira falsa num lugar diferente do caminho.',
                    ...around(trayArea),
                    pointer: {
                        fromX: L.cx(tray[0]), fromY: L.cy(tray[0]),
                        toX: L.cx(chip), toY: L.cy(chip),
                    },
                } as TutorialStep,
                {
                    text: 'Escolheu? Toque em EXECUTAR e veja se o robô para em cima da casa.',
                    ...around(lay.btnRun!),
                } as TutorialStep,
            ]
        }

        const tray = lay.traySlots
        const setupSlot = lay.setupSlots[0]
        return [
            {
                text: 'Aqui você monta o programa inteiro. Estas são as peças disponíveis.',
                ...around({ x: tray[0].x, y: tray[0].y, w: tray[0].w, h: tray[2].y + tray[2].h - tray[0].y }),
            } as TutorialStep,
            {
                text: 'A curva entra aqui: ela roda uma vez só, antes do laço, para apontar o robô.',
                ...around(setupSlot),
                pointer: {
                    fromX: L.cx(tray[1]), fromY: L.cy(tray[1]),
                    toX: L.cx(setupSlot), toY: L.cy(setupSlot),
                },
            } as TutorialStep,
            {
                text: 'Dentro do laço vai o passo que se repete.',
                ...around(bodySlot),
                pointer: {
                    fromX: L.cx(tray[0]), fromY: L.cy(tray[0]),
                    toX: L.cx(bodySlot), toY: L.cy(bodySlot),
                },
            } as TutorialStep,
            {
                text: 'Toque na faixa amarela para escolher a condição. Depois é só EXECUTAR.',
                ...around(chip),
            } as TutorialStep,
        ]
    }

    private runTutorial(force: boolean, onDone: () => void) {
        createTutorial(this, {
            key: `enquanto-l${this.levelConfig.level}`,
            accent: C.verde,
            safeTop: L.UI_BAR_H,
            once: !force,
            steps: this.tutorialSteps(),
            onFinish: onDone,
        })
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '22px', color: CSS.creme,
            align: 'center', wordWrap: { width: 700 },
        }).setOrigin(0.5).setResolution(2)

        const w = 760
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '30px', color: CSS.amarelo,
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
                fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '21px', color: CSS.creme,
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

    private showLevelStart(onStart: () => void) {
        this.clearOverlay()
        this.keep(
            this.add.rectangle(L.W / 2, L.H / 2, L.W, L.H, C.borda, 0.84)
                .setDepth(200).setInteractive(),
        )
        const panel = this.keep(this.add.container(L.W / 2, L.H / 2).setDepth(201))

        const pw = 760, ph = 430

        const bg = this.add.graphics()
        bg.fillStyle(C.escuro, 0.99)
        bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)
        bg.lineStyle(5, C.amarelo, 0.92)
        bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 26)

        const badge = this.add.text(0, -ph / 2 + 52, `NÍVEL ${this.levelConfig.level} DE 3`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '25px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 4,
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, -ph / 2 + 122, this.levelConfig.title, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '38px', color: CSS.creme,
            align: 'center', wordWrap: { width: pw - 100 },
        }).setOrigin(0.5).setResolution(2)

        const obj = this.add.text(0, -ph / 2 + 210, this.levelConfig.objective, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '22px', color: CSS.claro,
            align: 'center', wordWrap: { width: pw - 130 },
        }).setOrigin(0.5).setResolution(2)

        const tip = this.add.text(0, -ph / 2 + 302, this.levelConfig.tip, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontSize: '19px', color: CSS.amarelo,
            align: 'center', wordWrap: { width: pw - 130 },
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, badge, title, obj, tip])
        panel.add(this.modalButton(0, ph / 2 - 58, 'Começar', C.verde, () => {
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '36px', color: CSS.amarelo,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, -ph / 2 + 138, next
            ? this.levelConfig.title
            : 'Você programou laços com condição do começo ao fim.', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '19px', color: CSS.creme,
            align: 'center', wordWrap: { width: pw - 130 },
        }).setOrigin(0.5).setResolution(2)

        const stats = this.add.text(0, -ph / 2 + 196,
            `${this.points} pontos  ·  ${this.hits} acertos  ·  ${this.errors} erros`, {
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '17px', color: CSS.claro,
        }).setOrigin(0.5).setResolution(2)

        panel.add([bg, title, sub, stats])

        if (next) {
            panel.add(this.add.text(0, ph / 2 - 58, 'Preparando o próximo nível...', {
                fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '16px', color: CSS.amarelo,
            }).setOrigin(0.5).setResolution(2))

            this.time.delayedCall(2500, () => {
                this.scene.restart({ level: next, points: this.points })
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '34px', color: CSS.creme,
            stroke: CSS.borda, strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        const reason = this.add.text(0, -ph / 2 + 134, 'Três tentativas seguidas sem acertar.', {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontStyle: 'bold', fontSize: '22px', color: CSS.claro,
            align: 'center', wordWrap: { width: pw - 130 },
        }).setOrigin(0.5).setResolution(2)

        const hint = this.add.text(0, -ph / 2 + 210, this.challenge.explanation, {
            fontFamily: 'DynaPuff, Arial, sans-serif', fontSize: '19px', color: CSS.amarelo,
            align: 'center', wordWrap: { width: pw - 130 },
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
            fontFamily: '"DynaPuff Black", "Arial Black", Arial, sans-serif', fontSize: '18px', color: CSS.creme,
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
                this.scene.restart({ level: cmd.stage as 1 | 2 | 3, points: this.points })
            })
        })
    }
}