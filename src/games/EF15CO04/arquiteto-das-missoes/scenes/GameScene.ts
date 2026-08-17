import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { MISSIONS } from '../data/missions'
import {
    canPlace,
    orderExplains,
    partOf,
    scoreMission,
    simulate,
    stars,
    trackOf,
} from '../data/planner'
import {
    C,
    A,
    TEX,
    SCORE_LABEL,
    SCORE_COLOR,
    TRACK_LABEL,
    TRACK_COLOR,
    blockColor,
    hex,
    minutesLabel,
} from '../data/theme'
import {
    W,
    H,
    TOPBAR,
    HEADER,
    STAGE,
    BOARD,
    CARD,
    SLOT,
    TRAY,
    STEPS,
    TIMELINE,
    SHELF,
    CLOCK,
    BOX,
    PANEL,
    DOCK,
    TOAST,
    REPORT,
    MODAL,
} from '../data/layout'
import {
    buildProblemCard,
    createMissionScene,
    drawClockHand,
    fadeLayer,
    flyToSlot,
    foldIntoModule,
    pinBoard,
    popFromBox,
    rejectShake,
    stampApproved,
    sweepTimeline,
    veilIn,
    type MissionSceneView,
    type TornCard,
} from './effects'
import type {
    Candidate,
    CombinePhase,
    LevelConfig,
    MissionId,
    MissionResult,
    PhaseConfig,
    PlanTrace,
    SolvePhase,
    SplitPhase,
    TrackId,
} from '../types'

const GAME_ID = 'arquiteto-das-missoes'

interface SlotView {
    container: Phaser.GameObjects.Container
    x: number
    y: number
    fill: (label: string, detail: string, minutes: number) => void
    filled: boolean
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private stepTextById = new Map<string, string>()
    private stepNums: Phaser.GameObjects.Text[] = []

    private inputBlocker?: Phaser.GameObjects.Rectangle
    private unblockTimer?: Phaser.Time.TimerEvent
    private inputBlockedUntil = 0
    private typeTimer?: Phaser.Time.TimerEvent
    private stageTypeTimer?: Phaser.Time.TimerEvent

    private reuseBox: string[] = []
    private result: MissionResult = this.emptyResult('cafe')

    private stageLayer?: Phaser.GameObjects.Container
    private workLayer?: Phaser.GameObjects.Container
    private missionView?: MissionSceneView

    private panelText?: Phaser.GameObjects.Text
    private panelIcon?: Phaser.GameObjects.Graphics
    private helpBtn?: Phaser.GameObjects.Container

    private card?: TornCard
    private slots: SlotView[] = []
    private slotFilled = 0
    private trayCards = new Map<string, Phaser.GameObjects.Container>()
    private secondPassDone = false

    private stepSlots: Phaser.GameObjects.Graphics[] = []
    private stepTexts: Phaser.GameObjects.Text[] = []
    private stepPlaced: string[] = []
    private stepCards = new Map<string, Phaser.GameObjects.Container>()

    private order: string[] = []
    private laneLayer?: Phaser.GameObjects.Graphics
    private blockLayer?: Phaser.GameObjects.Container
    private sweepLayer?: Phaser.GameObjects.Graphics
    private clockLayer?: Phaser.GameObjects.Graphics
    private clockText?: Phaser.GameObjects.Text
    private shelfCards = new Map<string, Phaser.GameObjects.Container>()
    private runBtn?: Phaser.GameObjects.Container
    private trace?: PlanTrace

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: {
        level?: number
        phase?: number
        points?: number
        reuse?: string[]
        result?: MissionResult
    }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.reuseBox = data.reuse ? [...data.reuse] : []
        this.locked = true
        this.ended = false

        this.unblockTimer?.remove()
        this.unblockTimer = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0
        this.typeTimer?.remove()
        this.typeTimer = undefined
        this.stageTypeTimer?.remove()
        this.stageTypeTimer = undefined

        this.stageLayer = undefined
        this.workLayer = undefined
        this.missionView = undefined
        this.panelText = undefined
        this.panelIcon = undefined
        this.helpBtn = undefined

        this.card = undefined
        this.slots = []
        this.slotFilled = 0
        this.trayCards = new Map()
        this.secondPassDone = false

        this.stepSlots = []
        this.stepTexts = []
        this.stepPlaced = []
        this.stepCards = new Map()

        this.order = []
        this.laneLayer = undefined
        this.blockLayer = undefined
        this.sweepLayer = undefined
        this.clockLayer = undefined
        this.clockText = undefined
        this.shelfCards = new Map()
        this.runBtn = undefined
        this.trace = undefined

        const mission = LEVELS[this.levelIdx].phases[this.phaseIdx].mission
        this.result = data.result && data.result.mission === mission
            ? data.result
            : this.emptyResult(mission)
    }

    private emptyResult(mission: MissionId): MissionResult {
        return {
            mission,
            wrongPicks: 0,
            wrongOrder: 0,
            reusedCount: 0,
            minutes: 0,
            bestMinutes: 0,
        }
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    private get mission() {
        return MISSIONS[this.phase.mission]
    }

    private isMissionStart() {
        if (this.phaseIdx === 0) return true
        return this.level.phases[this.phaseIdx - 1].mission !== this.phase.mission
    }

    create() {
        this.buildBackground()
        this.buildHeader()
        this.buildPanel()
        this.buildMissionScene()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()

        EventBus.on('timer-end', this.onTimeUp, this)
        this.events.once('shutdown', () => EventBus.off('timer-end', this.onTimeUp, this))

        veilIn(this)

        if (this.phaseIdx === 0) {
            this.showLevelIntro(() => this.openBrief())
            return
        }
        if (this.isMissionStart()) {
            this.openBrief()
            return
        }
        this.enterWork(() => this.runTutorial())
    }

    // ------------------------------------------------------------- cenário

    private buildBackground() {
        const bg = this.add.image(W / 2, H / 2, TEX.central).setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.night, A.veil)
        veil.fillRect(0, 0, W, H)

        this.stageLayer = this.add.container(0, 0).setDepth(4)
        this.workLayer = this.add.container(0, 0).setDepth(10)
        this.workLayer.setAlpha(0).setVisible(false)
    }

    private buildMissionScene() {
        this.missionView = createMissionScene(
            this,
            this.stageLayer!,
            this.mission.before,
            this.mission.after,
        )
        this.missionView.container.setAlpha(0)
        this.tweens.add({
            targets: this.missionView.container,
            alpha: 1,
            duration: 520,
            delay: 160,
        })
    }

    // ------------------------------------------------------------- cabeçalho

    private buildHeader() {
        const bar = this.add.graphics().setDepth(40)
        bar.fillStyle(C.nightDeep, 0.95)
        bar.fillRect(0, 0, W, TOPBAR)
        bar.lineStyle(3, C.amber, 1)
        bar.lineBetween(0, TOPBAR, W, TOPBAR)

        const pill = this.add.graphics().setDepth(41)
        pill.fillStyle(C.teal, 1)
        pill.fillRoundedRect(HEADER.pillX, HEADER.pillY - HEADER.pillH / 2, HEADER.pillW, HEADER.pillH, HEADER.pillH / 2)
        pill.fillStyle(C.paper, A.gloss)
        pill.fillRoundedRect(HEADER.pillX + 7, HEADER.pillY - HEADER.pillH / 2 + 6, HEADER.pillW - 14, 11, 6)

        this.add.text(HEADER.pillX + HEADER.pillW / 2, HEADER.pillY, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2).setDepth(42)

        const dots = this.add.graphics().setDepth(41)
        this.level.phases.forEach((_, i) => {
            const x = HEADER.dotsX + i * HEADER.dotGap
            const done = i < this.phaseIdx
            const now = i === this.phaseIdx
            dots.fillStyle(now ? C.amber : done ? C.green : C.grey, now || done ? 1 : 0.4)
            if (now) dots.fillRoundedRect(x - 14, HEADER.dotsY - HEADER.dotR, 28, HEADER.dotR * 2, HEADER.dotR)
            else dots.fillCircle(x, HEADER.dotsY, HEADER.dotR)
        })

        this.add.text(HEADER.missionX, HEADER.missionY, `MISSÃO: ${this.mission.name.toUpperCase()}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: hex(C.gold),
        }).setOrigin(0, 0.5).setResolution(2).setDepth(41)

        this.helpBtn = this.buildHelpButton()
        this.helpBtn.setVisible(false)
    }

    private buildHelpButton() {
        const btn = this.add.container(HEADER.helpX, HEADER.helpY).setDepth(42)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.24)
        g.fillCircle(0, 6, HEADER.helpR)
        g.fillStyle(C.amber, 1)
        g.fillCircle(0, 0, HEADER.helpR)
        g.fillStyle(C.paper, A.gloss)
        g.fillEllipse(0, -9, 28, 12)

        const t = this.add.text(0, 0, '?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.night),
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(HEADER.helpR * 2 + 12, HEADER.helpR * 2 + 12)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            if (this.isInputBlocked() || this.ended) return
            this.tweens.add({ targets: btn, scale: 0.9, duration: 80, yoyo: true })
            this.replayTutorial()
        })
        return btn
    }

    // --------------------------------------------------------------- painel

    private buildPanel() {
        const g = this.add.graphics().setDepth(20)
        g.fillStyle(C.shadow, 0.28)
        g.fillRoundedRect(PANEL.x + 4, PANEL.y + 10, PANEL.w, PANEL.h, PANEL.r)
        g.fillStyle(C.nightDeep, 0.96)
        g.fillRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)
        g.lineStyle(4, C.amber, 1)
        g.strokeRoundedRect(PANEL.x, PANEL.y, PANEL.w, PANEL.h, PANEL.r)

        this.panelIcon = this.add.graphics().setDepth(21)
        this.paintPanelIcon(C.teal)

        this.panelText = this.add.text(PANEL.iconX + PANEL.iconR + 26, PANEL.y + PANEL.h / 2, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: PANEL.fontSize,
            color: hex(C.paper),
            align: 'left',
            wordWrap: { width: PANEL.w - 190 },
        }).setOrigin(0, 0.5).setResolution(2).setDepth(21)

        g.setAlpha(0)
        this.panelIcon.setAlpha(0)
        this.panelText.setAlpha(0)
        this.registry.set('panel-parts', [g, this.panelIcon, this.panelText])
    }

    private showPanel(on: boolean) {
        const parts = this.registry.get('panel-parts') as Phaser.GameObjects.GameObject[]
        this.tweens.add({ targets: parts, alpha: on ? 1 : 0, duration: 300 })
    }

    private paintPanelIcon(tone: number) {
        const g = this.panelIcon!
        const cx = PANEL.iconX
        const cy = PANEL.y + PANEL.h / 2
        g.clear()
        g.fillStyle(tone, 0.25)
        g.fillCircle(cx, cy, PANEL.iconR + 8)
        g.fillStyle(tone, 1)
        g.fillCircle(cx, cy, PANEL.iconR)
        g.fillStyle(C.paper, 0.92)
        g.fillRoundedRect(cx - 13, cy - 15, 26, 30, 4)
        g.fillStyle(tone, 1)
        g.fillRect(cx - 8, cy - 9, 16, 3)
        g.fillRect(cx - 8, cy - 2, 16, 3)
        g.fillRect(cx - 8, cy + 5, 10, 3)
    }

    private say(text: string, tone = C.teal) {
        this.paintPanelIcon(tone)
        this.typeTimer?.remove()
        const target = this.panelText!
        target.setText('')
        let i = 0
        this.typeTimer = this.time.addEvent({
            delay: PANEL.typeDelay,
            repeat: text.length - 1,
            callback: () => {
                if (!target.active) return
                i++
                target.setText(text.slice(0, i))
            },
        })
    }

    // ---------------------------------------------------------- modo palco

    private openBrief() {
        this.locked = true
        this.missionView?.toStage()
        this.showStageCard(this.mission.brief, 'Começar', () => this.enterWork(() => this.runTutorial()))
    }

    private showStageCard(lines: string[], label: string, onDone: () => void) {
        const card = this.add.container(W / 2, STAGE.cardY).setDepth(70)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.3)
        g.fillRoundedRect(-STAGE.cardW / 2 + 4, -STAGE.cardH / 2 + 10, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.fillStyle(C.nightDeep, 0.95)
        g.fillRoundedRect(-STAGE.cardW / 2, -STAGE.cardH / 2, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.lineStyle(4, C.amber, 1)
        g.strokeRoundedRect(-STAGE.cardW / 2, -STAGE.cardH / 2, STAGE.cardW, STAGE.cardH, STAGE.cardR)
        g.fillStyle(C.teal, 1)
        g.fillRoundedRect(-STAGE.cardW / 2 + 18, -STAGE.cardH / 2 + 18, 8, STAGE.cardH - 36, 4)

        const text = this.add.text(0, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: STAGE.fontSize,
            color: hex(C.paper),
            align: 'center',
            wordWrap: { width: STAGE.cardW - 130 },
        }).setOrigin(0.5).setResolution(2)

        const dots = this.add.graphics()
        const paintDots = (active: number) => {
            dots.clear()
            if (lines.length < 2) return
            const startX = -((lines.length - 1) * 20) / 2
            for (let i = 0; i < lines.length; i++) {
                dots.fillStyle(i <= active ? C.amber : C.inkSoft, i <= active ? 1 : 0.6)
                dots.fillCircle(startX + i * 20, STAGE.cardH / 2 - 18, 5)
            }
        }
        paintDots(0)

        card.add([g, text, dots])
        card.setAlpha(0).setY(STAGE.cardY + 40)
        this.tweens.add({ targets: card, alpha: 1, y: STAGE.cardY, duration: 420, ease: 'Back.easeOut' })

        let idx = 0
        let typing = false
        let btn: Phaser.GameObjects.Container | undefined

        const finish = () => {
            this.blockInput()
            this.stageTypeTimer?.remove()
            const parts = btn ? [card, btn] : [card]
            this.tweens.add({
                targets: parts,
                alpha: 0,
                y: '+=26',
                duration: 260,
                ease: 'Sine.easeIn',
                onComplete: () => {
                    card.destroy()
                    btn?.destroy()
                    onDone()
                },
            })
        }

        const showButton = () => {
            const isLast = idx >= lines.length - 1
            btn?.destroy()
            btn = this.button(W / 2, STAGE.btnY, 280, 68, isLast ? label : 'Próximo', isLast ? C.green : C.teal, () => {
                if (typing) {
                    this.stageTypeTimer?.remove()
                    text.setText(lines[idx])
                    typing = false
                    showButton()
                    return
                }
                if (isLast) {
                    finish()
                    return
                }
                idx++
                paintDots(idx)
                typeLine()
            }, '22px', true).setDepth(71)
            btn.setAlpha(0)
            this.tweens.add({ targets: btn, alpha: 1, duration: 240 })
            this.tweens.add({
                targets: btn,
                scale: 1.04,
                duration: 620,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        }

        const typeLine = () => {
            const full = lines[idx]
            let i = 0
            typing = true
            text.setText('')
            btn?.destroy()
            btn = undefined

            this.stageTypeTimer?.remove()
            this.stageTypeTimer = this.time.addEvent({
                delay: STAGE.typeDelay,
                repeat: full.length - 1,
                callback: () => {
                    if (!text.active) return
                    i++
                    text.setText(full.slice(0, i))
                    if (i < full.length) return
                    typing = false
                    showButton()
                },
            })
        }

        this.time.delayedCall(500, typeLine)
    }

    private enterWork(onDone: () => void) {
        this.missionView?.toCorner(1120, 148, 0.3)
        this.buildWork()
        this.showPanel(true)
        fadeLayer(this, this.workLayer!, 1, 460, onDone)
    }

    private exitWork(onDone: () => void) {
        this.showPanel(false)
        fadeLayer(this, this.workLayer!, 0, 320, () => {
            this.missionView?.toStage(onDone)
        })
    }

    private buildWork() {
        const board = this.add.graphics()
        pinBoard(board, BOARD.x, BOARD.y, BOARD.w, BOARD.h, BOARD.r, BOARD.pinR)
        this.workLayer!.add(board)

        const dock = this.add.graphics()
        dock.fillStyle(C.nightDeep, 0.88)
        dock.fillRect(0, DOCK.top, W, H - DOCK.top)
        dock.lineStyle(3, C.woodDark, 0.8)
        dock.lineBetween(0, DOCK.top, W, DOCK.top)
        this.workLayer!.add(dock)

        const p = this.phase
        if (p.kind === 'partir') this.buildSplit(p)
        if (p.kind === 'resolver') this.buildSolve(p)
        if (p.kind === 'combinar') this.buildCombine(p)
    }

    private buildSplit(phase: SplitPhase) {
        this.card = buildProblemCard(this, this.workLayer!, phase.task.cardTitle, phase.task.cardText)
        this.showPanel(false)

        const btn = this.button(W / 2, DOCK.cy, DOCK.btnWide, DOCK.btnH, 'PARTIR', C.coral, () => {
            this.blockInput()
            this.tweens.add({
                targets: btn,
                alpha: 0,
                duration: 200,
                onComplete: () => btn.destroy(),
            })
            this.card?.tear(phase.task.slots, () => {
                this.showPanel(true)
                this.openSlots(phase.task.slots, phase.task.candidates, false)
            })
        }, '30px', true)
        this.workLayer!.add(btn)
    }

    private openSlots(count: number, candidates: Candidate[], second: boolean) {
        this.slots = []
        this.slotFilled = 0

        const total = count * SLOT.w + (count - 1) * SLOT.gap
        const startX = W / 2 - total / 2 + SLOT.w / 2

        for (let i = 0; i < count; i++) {
            const x = startX + i * (SLOT.w + SLOT.gap)
            this.slots.push(this.buildSlot(x, SLOT.y, i))
        }

        this.say(second
            ? 'Esta parte ainda é grande. Parta ela também.'
            : 'Toque nas partes que cabem dentro deste pedido.', C.teal)

        this.buildTray(candidates)
    }

    private buildSlot(x: number, y: number, index: number): SlotView {
        const container = this.add.container(x, y)
        const g = this.add.graphics()

        const paintEmpty = () => {
            g.clear()
            g.fillStyle(C.paperSoft, 0.32)
            g.fillRoundedRect(-SLOT.w / 2, -SLOT.h / 2, SLOT.w, SLOT.h, SLOT.r)
            g.lineStyle(5, C.paperEdge, 0.9)
            g.strokeRoundedRect(-SLOT.w / 2, -SLOT.h / 2, SLOT.w, SLOT.h, SLOT.r)
            g.fillStyle(C.paperEdge, 0.6)
            g.fillCircle(0, 0, 26)
            g.fillStyle(C.cork, 1)
            g.fillRoundedRect(-4, -14, 8, 28, 4)
            g.fillRoundedRect(-14, -4, 28, 8, 4)
        }
        paintEmpty()

        const num = this.add.text(-SLOT.w / 2 + 24, -SLOT.h / 2 + 22, `${index + 1}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.paperEdge),
        }).setOrigin(0.5).setResolution(2)

        const label = this.add.text(0, SLOT.labelDY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: SLOT.w - 44 },
        }).setOrigin(0.5).setResolution(2)

        const detail = this.add.text(0, SLOT.detailDY, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: SLOT.w - 44 },
        }).setOrigin(0.5).setResolution(2)

        const minutes = this.add.text(0, SLOT.minutesDY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '17px',
            color: hex(C.coralDark),
        }).setOrigin(0.5).setResolution(2)

        container.add([g, num, label, detail, minutes])
        this.workLayer!.add(container)

        container.setAlpha(0).setScale(0.8)
        this.tweens.add({
            targets: container,
            alpha: 1,
            scale: 1,
            duration: 420,
            delay: 90 * index,
            ease: 'Back.easeOut',
        })

        const view: SlotView = {
            container,
            x,
            y,
            filled: false,
            fill: (l: string, d: string, m: number) => {
                g.clear()
                g.fillStyle(C.shadow, A.shadow)
                g.fillRoundedRect(-SLOT.w / 2 + 4, -SLOT.h / 2 + 9, SLOT.w, SLOT.h, SLOT.r)
                g.fillStyle(C.paper, 1)
                g.fillRoundedRect(-SLOT.w / 2, -SLOT.h / 2, SLOT.w, SLOT.h, SLOT.r)
                g.fillStyle(C.greenSoft, 1)
                g.fillRoundedRect(-SLOT.w / 2, -SLOT.h / 2, SLOT.w, 38, { tl: SLOT.r, tr: SLOT.r, bl: 0, br: 0 })
                g.lineStyle(5, C.green, 1)
                g.strokeRoundedRect(-SLOT.w / 2, -SLOT.h / 2, SLOT.w, SLOT.h, SLOT.r)
                num.setColor(hex(C.greenDark))
                label.setText(l)
                detail.setText(d)
                minutes.setText(m > 0 ? minutesLabel(m) : '')
                view.filled = true
            },
        }
        return view
    }

    private buildTray(candidates: Candidate[]) {
        const shuffled = Phaser.Utils.Array.Shuffle([...candidates])
        const total = shuffled.length * TRAY.cardW + (shuffled.length - 1) * TRAY.gap
        const startX = W / 2 - total / 2 + TRAY.cardW / 2

        shuffled.forEach((cand, i) => {
            const x = startX + i * (TRAY.cardW + TRAY.gap)
            const card = this.buildTrayCard(cand, x, TRAY.y)
            this.trayCards.set(cand.id, card)
            card.setAlpha(0).setY(TRAY.y + 40)
            this.tweens.add({
                targets: card,
                alpha: 1,
                y: TRAY.y,
                duration: 400,
                delay: 140 + i * 80,
                ease: 'Back.easeOut',
            })
        })
    }

    private buildTrayCard(cand: Candidate, x: number, y: number) {
        const container = this.add.container(x, y)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-TRAY.cardW / 2 + 3, -TRAY.cardH / 2 + 8, TRAY.cardW, TRAY.cardH, TRAY.r)
        g.fillStyle(C.paper, 1)
        g.fillRoundedRect(-TRAY.cardW / 2, -TRAY.cardH / 2, TRAY.cardW, TRAY.cardH, TRAY.r)
        g.fillStyle(C.paperSoft, 1)
        g.fillRoundedRect(-TRAY.cardW / 2, -TRAY.cardH / 2, TRAY.cardW, 28, { tl: TRAY.r, tr: TRAY.r, bl: 0, br: 0 })
        g.lineStyle(4, C.paperEdge, 1)
        g.strokeRoundedRect(-TRAY.cardW / 2, -TRAY.cardH / 2, TRAY.cardW, TRAY.cardH, TRAY.r)

        const label = this.add.text(0, TRAY.labelDY, cand.label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: TRAY.labelSize,
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: TRAY.cardW - 24 },
        }).setOrigin(0.5).setResolution(2)

        const detail = this.add.text(0, TRAY.detailDY, cand.detail, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: TRAY.detailSize,
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: TRAY.cardW - 24 },
        }).setOrigin(0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, TRAY.cardW, TRAY.cardH, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => this.onCandidatePick(cand))

        container.add([g, label, detail, hit])
        this.workLayer!.add(container)
        return container
    }

    private onCandidatePick(cand: Candidate) {
        if (this.isInputBlocked() || this.locked) return
        const card = this.trayCards.get(cand.id)
        if (!card) return

        const phase = this.phase as SplitPhase
        const task = this.secondPassDone && phase.task.secondPass ? phase.task.secondPass : phase.task

        if (!cand.fits) {
            this.result.wrongPicks++
            rejectShake(this, card)
            this.toast(cand.reason, C.coral)
            return
        }

        const slot = this.slots.find(s => !s.filled)
        if (!slot) return

        this.locked = true
        card.disableInteractive()
        card.list.forEach(child => {
            const target = child as Phaser.GameObjects.Rectangle
            if (target.disableInteractive) target.disableInteractive()
        })

        flyToSlot(this, card, { x: slot.x, y: slot.y }, () => {
            card.destroy()
            this.trayCards.delete(cand.id)

            const part = partOf(this.phase.mission, cand.id)
            slot.fill(cand.label, cand.detail, part?.minutes ?? 0)
            this.slotFilled++

            stampApproved(this, this.workLayer!, slot.x + SLOT.w / 2 - 40, slot.y - SLOT.h / 2 + 34, () => {
                if (this.slotFilled < this.slots.length) {
                    this.locked = false
                    return
                }
                this.onSlotsComplete(task.explain)
            })
        })
    }

    private onSlotsComplete(explain: string) {
        const phase = this.phase as SplitPhase
        const second = phase.task.secondPass

        this.trayCards.forEach(card => {
            this.tweens.add({
                targets: card,
                alpha: 0,
                y: card.y + 40,
                duration: 280,
                onComplete: () => card.destroy(),
            })
        })
        this.trayCards = new Map()

        if (second && !this.secondPassDone) {
            this.secondPassDone = true
            this.say(explain, C.green)
            this.time.delayedCall(1400, () => {
                this.slots.forEach(s => {
                    this.tweens.add({
                        targets: s.container,
                        alpha: 0,
                        scale: 0.85,
                        duration: 300,
                        onComplete: () => s.container.destroy(),
                    })
                })
                this.time.delayedCall(360, () => {
                    this.card = buildProblemCard(this, this.workLayer!, 'PARTE GRANDE', second.cardText)
                    this.say('Esta parte ainda guarda outras dentro. Toque em PARTIR de novo.', C.amber)

                    const btn = this.button(W / 2, DOCK.cy, DOCK.btnWide, DOCK.btnH, 'PARTIR', C.coral, () => {
                        this.blockInput()
                        this.tweens.add({ targets: btn, alpha: 0, duration: 200, onComplete: () => btn.destroy() })
                        this.card?.tear(second.slots, () => {
                            this.openSlots(second.slots, second.candidates, true)
                            this.locked = false
                        })
                    }, '30px', true)
                    this.workLayer!.add(btn)
                })
            })
            return
        }

        this.say(explain, C.green)
        const readTime = explain.length * PANEL.typeDelay + 2200
        this.time.delayedCall(readTime, () => this.finishPhase(explain))
    }

    // ------------------------------------------------------------ resolver

    private buildSolve(phase: SolvePhase) {
        const task = phase.task
        this.say(phase.ask, C.teal)

        this.add.existing(this.add.graphics())

        const title = this.add.text(W / 2, BOARD.y + 46, task.title.toUpperCase(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.nightDeep),
        }).setOrigin(0.5).setResolution(2)
        this.workLayer!.add(title)

        task.answer.forEach((_, i) => {
            const y = STEPS.listY + 60 + i * (STEPS.slotH + STEPS.slotGap)
            const g = this.add.graphics()
            this.paintStepSlot(g, y, i, '')
            this.workLayer!.add(g)
            this.stepSlots.push(g)

            const t = this.add.text(STEPS.listX + STEPS.numR * 2 + 30, y, '', {
                fontFamily: 'Arial Black, Arial',
                fontSize: STEPS.fontSize,
                color: hex(C.ink),
                wordWrap: { width: STEPS.slotW - 110 },
            }).setOrigin(0, 0.5).setResolution(2)
            this.workLayer!.add(t)
            this.stepTexts.push(t)
            const num = this.add.text(STEPS.listX + 20 + STEPS.numR, y, '', {
                fontFamily: 'Arial Black, Arial',
                fontSize: '20px',
                color: '#ffffff',
            }).setOrigin(0.5).setResolution(2)
            this.workLayer!.add(num)
            this.stepNums.push(num)

            const hit = this.add.rectangle(STEPS.listX + STEPS.slotW / 2, y, STEPS.slotW, STEPS.slotH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerdown', () => this.onStepUndo(i))
            this.workLayer!.add(hit)
        })

        const shuffled = Phaser.Utils.Array.Shuffle([...task.steps])
        const total = shuffled.length * STEPS.trayW + (shuffled.length - 1) * STEPS.trayGap
        const startX = W / 2 - total / 2 + STEPS.trayW / 2

        shuffled.forEach((step, i) => {
            this.stepTextById.set(step.id, step.text)

            const x = startX + i * (STEPS.trayW + STEPS.trayGap)
            const card = this.buildStepCard(step.id, step.text, x, STEPS.trayY)
            this.stepCards.set(step.id, card)
            card.setAlpha(0).setY(STEPS.trayY + 36)
            this.tweens.add({
                targets: card,
                alpha: 1,
                y: STEPS.trayY,
                duration: 400,
                delay: 120 + i * 90,
                ease: 'Back.easeOut',
            })
        })
    }

    private paintStepSlot(g: Phaser.GameObjects.Graphics, y: number, index: number, _text: string) {
        const done = index < this.stepPlaced.length
        g.clear()
        g.fillStyle(done ? C.paper : C.paperSoft, done ? 1 : 0.3)
        g.fillRoundedRect(STEPS.listX, y - STEPS.slotH / 2, STEPS.slotW, STEPS.slotH, STEPS.r)
        g.lineStyle(4, done ? C.green : C.paperEdge, done ? 1 : 0.85)
        g.strokeRoundedRect(STEPS.listX, y - STEPS.slotH / 2, STEPS.slotW, STEPS.slotH, STEPS.r)
        g.fillStyle(done ? C.green : C.paperEdge, 1)
        g.fillCircle(STEPS.listX + 20 + STEPS.numR, y, STEPS.numR)
    }

    private repaintStepSlots() {
        this.stepSlots.forEach((g, i) => {
            const y = STEPS.listY + 60 + i * (STEPS.slotH + STEPS.slotGap)
            this.paintStepSlot(g, y, i, '')
        })
    }

    private buildStepCard(id: string, text: string, x: number, y: number) {
        const container = this.add.container(x, y)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-STEPS.trayW / 2 + 3, -STEPS.trayH / 2 + 7, STEPS.trayW, STEPS.trayH, STEPS.r)
        g.fillStyle(C.blueSoft, 1)
        g.fillRoundedRect(-STEPS.trayW / 2, -STEPS.trayH / 2, STEPS.trayW, STEPS.trayH, STEPS.r)
        g.lineStyle(4, C.blue, 1)
        g.strokeRoundedRect(-STEPS.trayW / 2, -STEPS.trayH / 2, STEPS.trayW, STEPS.trayH, STEPS.r)

        const t = this.add.text(0, 0, text, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: STEPS.trayW - 26 },
        }).setOrigin(0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, STEPS.trayW, STEPS.trayH, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => this.onStepPick(id, text))

        container.add([g, t, hit])
        this.workLayer!.add(container)
        return container
    }

    private onStepUndo(index: number) {
        if (this.isInputBlocked() || this.locked) return
        if (index >= this.stepPlaced.length) return

        const phase = this.phase as SolvePhase
        if (this.stepPlaced.length >= phase.task.answer.length) return

        const last = this.stepPlaced.length - 1
        if (index !== last) {
            this.toast('Só dá para tirar o último passo da lista.', C.amber)
            return
        }

        const id = this.stepPlaced.pop()!
        const text = this.stepTextById.get(id) ?? ''
        const y = STEPS.listY + 60 + last * (STEPS.slotH + STEPS.slotGap)

        this.stepTexts[last].setText('')
        this.stepNums[last].setText('')
        this.repaintStepSlots()

        const total = phase.task.steps.length
        const rowW = total * STEPS.trayW + (total - 1) * STEPS.trayGap
        const slotIdx = phase.task.steps.findIndex(s => s.id === id)
        const x = W / 2 - rowW / 2 + STEPS.trayW / 2 + slotIdx * (STEPS.trayW + STEPS.trayGap)

        const card = this.buildStepCard(id, text, STEPS.listX + STEPS.slotW / 2, y)
        this.stepCards.set(id, card)

        this.tweens.add({ targets: card, x, y: STEPS.trayY, duration: 380, ease: 'Back.easeOut' })
    }

    private onStepPick(id: string, text: string) {
        if (this.isInputBlocked() || this.locked) return
        const phase = this.phase as SolvePhase
        const card = this.stepCards.get(id)
        if (!card) return

        const expected = phase.task.answer[this.stepPlaced.length]
        if (id !== expected) {
            this.result.wrongOrder++
            rejectShake(this, card)
            const step = phase.task.steps.find(s => s.id === expected)
            this.toast(step?.hint ?? phase.task.hint, C.amber)
            return
        }

        this.locked = true
        card.disableInteractive()
        const index = this.stepPlaced.length
        const y = STEPS.listY + 60 + index * (STEPS.slotH + STEPS.slotGap)

        flyToSlot(this, card, { x: STEPS.listX + STEPS.slotW / 2, y }, () => {
            card.destroy()
            this.stepCards.delete(id)
            this.stepPlaced.push(id)
            this.repaintStepSlots()

            this.stepTexts[index].setText(text)
            this.stepTexts[index].setAlpha(0)
            this.tweens.add({ targets: this.stepTexts[index], alpha: 1, duration: 220 })

            this.stepNums[index].setText(`${index + 1}`)

            if (this.stepPlaced.length < phase.task.answer.length) {
                this.locked = false
                return
            }

            this.say(phase.task.explain, C.green)
            if (!this.reuseBox.includes(phase.task.partId)) this.reuseBox.push(phase.task.partId)

            this.time.delayedCall(900, () => {
                const box = this.add.container(STEPS.listX + STEPS.slotW / 2, STEPS.listY + 140)
                this.workLayer!.add(box)
                foldIntoModule(this, box, { x: BOX.x, y: BOX.y }, C.blue, () => {
                    this.finishPhase(phase.task.explain)
                })
            })
        })
    }

    private buildCombine(phase: CombinePhase) {
        const task = phase.task
        this.say('Toque em cada parte para colocar no plano.', C.amber)

        this.laneLayer = this.add.graphics()
        this.blockLayer = this.add.container(0, 0)
        this.sweepLayer = this.add.graphics().setDepth(30)
        this.clockLayer = this.add.graphics()

        this.clockText = this.add.text(CLOCK.x, CLOCK.y + CLOCK.labelDY, '0 min', {
            fontFamily: 'Arial Black, Arial',
            fontSize: CLOCK.fontSize,
            color: hex(C.paper),
            stroke: hex(C.nightDeep),
            strokeThickness: 5,
        }).setOrigin(0.5).setResolution(2)

        drawClockHand(this.clockLayer, CLOCK.x, CLOCK.y, CLOCK.r, 0)
        this.workLayer!.add([this.laneLayer, this.blockLayer, this.sweepLayer, this.clockLayer, this.clockText])

        if (!this.level.useClock) {
            this.clockLayer.setVisible(false)
            this.clockText.setVisible(false)
        }

        this.drawLanes(task.tracks)

        const total = task.blocks.length * SHELF.cardW + (task.blocks.length - 1) * SHELF.gap
        const startX = W / 2 - total / 2 + SHELF.cardW / 2

        task.blocks.forEach((id, i) => {
            const x = startX + i * (SHELF.cardW + SHELF.gap)
            const card = this.buildShelfCard(id, i, x, SHELF.y)
            this.shelfCards.set(id, card)
            card.setAlpha(0).setY(SHELF.y + 36)
            this.tweens.add({
                targets: card,
                alpha: 1,
                y: SHELF.y,
                duration: 400,
                delay: 120 + i * 80,
                ease: 'Back.easeOut',
            })
        })
    }

    private laneTop(tracks: TrackId[]) {
        return tracks.length > 1 ? TIMELINE.twoLaneY : TIMELINE.y
    }

    private drawLanes(tracks: TrackId[]) {
        const g = this.laneLayer!
        const top = this.laneTop(tracks)
        g.clear()

        tracks.forEach((track, i) => {
            const y = top + i * (TIMELINE.laneH + TIMELINE.laneGap)
            g.fillStyle(C.nightDeep, 0.3)
            g.fillRoundedRect(TIMELINE.x - TIMELINE.labelW, y, TIMELINE.w + TIMELINE.labelW, TIMELINE.laneH, TIMELINE.r)
            g.fillStyle(TRACK_COLOR[track], 0.9)
            g.fillRoundedRect(TIMELINE.x - TIMELINE.labelW, y, TIMELINE.labelW, TIMELINE.laneH, { tl: TIMELINE.r, bl: TIMELINE.r, tr: 0, br: 0 })
            g.lineStyle(3, C.paperEdge, 0.6)
            g.strokeRoundedRect(TIMELINE.x - TIMELINE.labelW, y, TIMELINE.w + TIMELINE.labelW, TIMELINE.laneH, TIMELINE.r)

            for (let t = 0; t <= TIMELINE.w; t += TIMELINE.tickGap) {
                g.lineStyle(2, C.paperEdge, 0.22)
                g.lineBetween(TIMELINE.x + t, y + 8, TIMELINE.x + t, y + TIMELINE.laneH - 8)
            }
        })

        if (this.blockLayer && this.blockLayer.length === 0) {
            tracks.forEach((track, i) => {
                const y = top + i * (TIMELINE.laneH + TIMELINE.laneGap)
                const label = this.add.text(TIMELINE.x - TIMELINE.labelW / 2, y + TIMELINE.laneH / 2, TRACK_LABEL[track], {
                    fontFamily: 'Arial Black, Arial',
                    fontSize: '18px',
                    color: '#ffffff',
                }).setOrigin(0.5).setResolution(2)
                this.workLayer!.add(label)
            })
        }
    }

    private buildShelfCard(id: string, index: number, x: number, y: number) {
        const part = partOf(this.phase.mission, id)
        const reused = this.level.useReuse && this.reuseBox.includes(id)
        const container = this.add.container(x, y)
        const g = this.add.graphics()
        const tone = blockColor(index)

        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(-SHELF.cardW / 2 + 3, -SHELF.cardH / 2 + 8, SHELF.cardW, SHELF.cardH, SHELF.r)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-SHELF.cardW / 2, -SHELF.cardH / 2, SHELF.cardW, SHELF.cardH, SHELF.r)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-SHELF.cardW / 2 + 8, -SHELF.cardH / 2 + 7, SHELF.cardW - 16, 16, 8)
        g.lineStyle(4, reused ? C.gold : C.paperEdge, 1)
        g.strokeRoundedRect(-SHELF.cardW / 2, -SHELF.cardH / 2, SHELF.cardW, SHELF.cardH, SHELF.r)

        const label = this.add.text(0, -8, part?.label ?? id, {
            fontFamily: 'Arial Black, Arial',
            fontSize: SHELF.fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: SHELF.cardW - 22 },
        }).setOrigin(0.5).setResolution(2)

        const minutes = this.add.text(0, SHELF.cardH / 2 - 18, reused
            ? `${minutesLabel(Math.max(1, Math.round((part?.minutes ?? 0) / 2)))} · pronto`
            : minutesLabel(part?.minutes ?? 0), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '14px',
            color: reused ? hex(C.gold) : hex(C.paperSoft),
        }).setOrigin(0.5).setResolution(2)

        const hit = this.add.rectangle(0, 0, SHELF.cardW, SHELF.cardH, C.white, 0.001)
        hit.setInteractive({ useHandCursor: true })
        hit.on('pointerdown', () => this.onBlockPick(id, index, reused))

        container.add([g, label, minutes, hit])
        container.setData('tone', tone)
        this.workLayer!.add(container)
        return container
    }

    private onBlockPick(id: string, index: number, reused: boolean) {
        if (this.isInputBlocked() || this.locked) return
        const phase = this.phase as CombinePhase
        const card = this.shelfCards.get(id)
        if (!card) return

        if (this.level.useDeps && !canPlace(this.phase.mission, this.order, id)) {
            this.result.wrongOrder++
            rejectShake(this, card)
            const part = partOf(this.phase.mission, id)
            const need = partOf(this.phase.mission, part.needs[0])
            this.toast(`${part.label} só depois de ${need?.label.toLowerCase() ?? part.needs[0]}.`, C.coral)
            return
        }

        this.locked = true
        card.disableInteractive()
        this.order.push(id)

        const place = () => {
            this.shelfCards.delete(id)
            this.redrawBlocks(phase, index)
            this.locked = this.order.length >= phase.task.blocks.length
            if (this.order.length >= phase.task.blocks.length) this.showRunButton(phase)
            else this.locked = false
        }

        if (reused) {
            this.result.reusedCount++
            card.destroy()
            popFromBox(this, this.workLayer!, { x: BOX.x, y: BOX.y }, { x: W / 2, y: this.laneTop(phase.task.tracks) }, partOf(this.phase.mission, id).label, place)
            return
        }

        this.tweens.add({
            targets: card,
            y: this.laneTop(phase.task.tracks) + 40,
            alpha: 0,
            scale: 0.8,
            duration: 380,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                card.destroy()
                place()
            },
        })
    }

    private redrawBlocks(phase: CombinePhase, lastIndex: number) {
        const reused = new Set(this.level.useReuse ? this.reuseBox : [])
        const trace = simulate(this.phase.mission, this.order, phase.task.tracks, reused)
        this.trace = trace

        this.blockLayer!.removeAll(true)
        const top = this.laneTop(phase.task.tracks)

        trace.blocks.forEach((block, i) => {
            const laneIdx = phase.task.tracks.indexOf(block.track)
            const y = top + laneIdx * (TIMELINE.laneH + TIMELINE.laneGap) + TIMELINE.laneH / 2
            const x = TIMELINE.x + block.start * TIMELINE.unit
            const w = Math.max(56, block.minutes * TIMELINE.unit)
            const tone = blockColor(phase.task.blocks.indexOf(block.partId))

            const container = this.add.container(x + w / 2, y)
            const g = this.add.graphics()
            g.fillStyle(C.shadow, 0.26)
            g.fillRoundedRect(-w / 2 + 3, -TIMELINE.laneH / 2 + 18, w, TIMELINE.laneH - 26, TIMELINE.blockR)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-w / 2, -TIMELINE.laneH / 2 + 12, w, TIMELINE.laneH - 26, TIMELINE.blockR)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 7, -TIMELINE.laneH / 2 + 18, w - 14, 13, 7)
            g.lineStyle(3, block.reused ? C.gold : C.paperEdge, 1)
            g.strokeRoundedRect(-w / 2, -TIMELINE.laneH / 2 + 12, w, TIMELINE.laneH - 26, TIMELINE.blockR)

            const label = this.add.text(0, -6, block.label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: TIMELINE.blockFont,
                color: '#ffffff',
                align: 'center',
                wordWrap: { width: w - 16 },
            }).setOrigin(0.5).setResolution(2)

            const mins = this.add.text(0, 20, minutesLabel(block.minutes), {
                fontFamily: 'Arial Black, Arial',
                fontSize: TIMELINE.minutesFont,
                color: hex(C.paperSoft),
            }).setOrigin(0.5).setResolution(2)

            container.add([g, label, mins])
            container.setData('partId', block.partId)
            this.blockLayer!.add(container)

            if (i !== trace.blocks.length - 1) return
            container.setScale(0.7).setAlpha(0)
            this.tweens.add({ targets: container, scale: 1, alpha: 1, duration: 320, ease: 'Back.easeOut' })
        })

        if (!this.level.useClock) return
        this.updateClock(trace.totalMinutes, phase.task.bestMinutes)
    }

    private updateClock(minutes: number, best: number) {
        const ratio = best > 0 ? Math.min(1, minutes / (best * 1.6)) : 0
        drawClockHand(this.clockLayer!, CLOCK.x, CLOCK.y, CLOCK.r, ratio)
        this.clockText?.setText(`${minutes} min`)
        this.tweens.add({ targets: this.clockText, scale: 1.18, duration: 140, yoyo: true })
    }

    private showRunButton(phase: CombinePhase) {
        this.runBtn = this.button(W / 2, DOCK.cy + 18, DOCK.btnWide, DOCK.btnH, 'SIMULAR', C.green, () => {
            this.blockInput()
            this.runBtn?.disableInteractive()
            this.tweens.add({
                targets: this.runBtn,
                alpha: 0,
                duration: 220,
                onComplete: () => this.runBtn?.destroy(),
            })
            this.runSimulation(phase)
        }, '30px', true)
        this.workLayer!.add(this.runBtn)
        this.runBtn.setAlpha(0)
        this.tweens.add({ targets: this.runBtn, alpha: 1, duration: 300 })
        this.say('O plano está montado. Toque em SIMULAR para ver ele acontecer.', C.green)
    }

    private runSimulation(phase: CombinePhase) {
        const trace = this.trace
        if (!trace) return

        this.locked = true
        this.result.minutes = trace.totalMinutes
        this.result.bestMinutes = trace.bestMinutes

        this.missionView?.toCorner(W / 2, 148, 0.44)
        this.say('O plano está rodando...', C.amber)

        const ends = new Map<number, number>()
        trace.blocks.forEach((b, i) => ends.set(b.end, i + 1))

        this.time.delayedCall(700, () => {
            sweepTimeline(
                this,
                this.sweepLayer!,
                trace.totalMinutes,
                phase.task.tracks.length,
                (minute) => {
                    const done = ends.get(minute)
                    if (done === undefined) return
                    this.missionView?.reveal(done / trace.blocks.length)
                    if (this.level.useClock) this.updateClock(minute, phase.task.bestMinutes)
                },
                () => {
                    this.missionView?.celebrate(() => {
                        this.say(this.mission.doneLine, C.green)
                        this.time.delayedCall(700, () => this.showReport(phase))
                    })
                },
            )
        })
    }

    // -------------------------------------------------------------- término

    private finishPhase(explain: string) {
        const clean = this.result.wrongPicks + this.result.wrongOrder === 0
        const earned = clean ? 10 : 6
        this.points += earned

        runtimeGameBridge.emit({
            type: clean ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })
        this.emitCheckpoint()

        this.time.delayedCall(300, () => {
            this.showFeedback(clean, explain, earned, () => this.completePhase())
        })
    }

    private showReport(phase: CombinePhase) {
        EventBus.emit('timer-stop')

        const card = scoreMission(this.result, this.level.useReuse)
        const starCount = stars(card, this.level.useReuse)
        const earned = 10 + starCount * 4
        this.points += earned

        runtimeGameBridge.emit({
            type: 'CORRECT_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(500).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(501)

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-REPORT.w / 2 + 4, -REPORT.h / 2 + 12, REPORT.w, REPORT.h, REPORT.r)
        bg.fillStyle(C.paper, 1)
        bg.fillRoundedRect(-REPORT.w / 2, -REPORT.h / 2, REPORT.w, REPORT.h, REPORT.r)
        bg.lineStyle(5, C.amber, 1)
        bg.strokeRoundedRect(-REPORT.w / 2, -REPORT.h / 2, REPORT.w, REPORT.h, REPORT.r)
        bg.fillStyle(C.teal, 1)
        bg.fillRoundedRect(-170, -REPORT.h / 2 - 13, 340, 26, 13)

        const title = this.add.text(0, -REPORT.h / 2 + 56, 'Ficha do Arquiteto', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        const sub = this.add.text(0, -REPORT.h / 2 + 98, this.mission.name, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        modal.add([bg, title, sub])

        const keys: Array<keyof typeof SCORE_LABEL> = this.level.useReuse
            ? ['completo', 'limpo', 'rapido', 'reuso']
            : ['completo', 'limpo', 'rapido']

        keys.forEach((key, i) => {
            const y = -REPORT.h / 2 + REPORT.rowY + i * REPORT.rowGap
            const ratio = card[key] as number

            const label = this.add.text(-REPORT.w / 2 + 56, y, SCORE_LABEL[key], {
                fontFamily: 'Arial Black, Arial',
                fontSize: REPORT.labelSize,
                color: hex(C.ink),
            }).setOrigin(0, 0.5).setResolution(2)

            const bar = this.add.graphics()
            bar.fillStyle(C.greySoft, 1)
            bar.fillRoundedRect(REPORT.barX - REPORT.w / 2 + 60, y - REPORT.barH / 2, REPORT.barW, REPORT.barH, REPORT.barH / 2)

            const fill = this.add.graphics()
            const paintFill = (v: number) => {
                fill.clear()
                const w = Math.max(24, REPORT.barW * v)
                fill.fillStyle(SCORE_COLOR[key], 1)
                fill.fillRoundedRect(REPORT.barX - REPORT.w / 2 + 60, y - REPORT.barH / 2, w, REPORT.barH, REPORT.barH / 2)
                fill.fillStyle(C.white, 0.4)
                fill.fillRoundedRect(REPORT.barX - REPORT.w / 2 + 65, y - REPORT.barH / 2 + 5, Math.max(10, w - 12), 7, 4)
            }
            paintFill(0)

            const counter = { v: 0 }
            this.tweens.add({
                targets: counter,
                v: ratio,
                duration: 620,
                delay: 260 + i * 180,
                onUpdate: () => paintFill(counter.v),
            })

            modal.add([label, bar, fill])
        })

        const starsG = this.add.graphics()
        for (let i = 0; i < 3; i++) {
            const x = -46 + i * 46
            const y = REPORT.h / 2 - 168
            const on = i < starCount
            starsG.fillStyle(on ? C.gold : C.greySoft, 1)
            const pts: Phaser.Geom.Point[] = []
            for (let k = 0; k < 10; k++) {
                const ang = -Math.PI / 2 + (k * Math.PI) / 5
                const rad = k % 2 === 0 ? 20 : 9
                pts.push(new Phaser.Geom.Point(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad))
            }
            starsG.fillPoints(pts, true)
        }

        const summary = this.add.text(0, REPORT.h / 2 - 116, card.summary, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '20px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: REPORT.w - 120 },
        }).setOrigin(0.5).setResolution(2)

        const btn = this.button(0, REPORT.h / 2 - 58, MODAL.btnW, 70, 'Continuar', C.teal, () => {
            this.closeModalSafely(overlay, modal, () => this.completePhase())
        }, '23px', true)

        modal.add([starsG, summary, btn])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            EventBus.emit('curtain', () => this.scene.restart({
                level: this.level.level,
                phase: this.phaseIdx + 1,
                points: this.points,
                reuse: this.reuseBox,
                result: this.result,
            }))
            return
        }

        if (!isLastLevel) {
            EventBus.emit('stage-flash', C.paper)
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} completo`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.amber,
                overlayColor: C.night,
                titleColor: hex(C.ink),
                subtitleColor: hex(C.tealDark),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2400,
                    onComplete: () => this.scene.restart({
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                        reuse: this.reuseBox,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })

        showLevelComplete(this, {
            title: 'Central fechada!',
            subtitle: `${this.points} pontos`,
            message: 'Problema grande vira possível quando é partido em partes menores.',
            accent: C.green,
            overlayColor: C.night,
            titleColor: hex(C.ink),
            subtitleColor: hex(C.greenDark),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.showFeedback(false, 'O tempo acabou. Vamos seguir para a próxima parte do plano.', 0, () => this.completePhase())
    }

    // -------------------------------------------------------------- modais

    private showFeedback(clean: boolean, message: string, earned: number, onDone: () => void) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 316
        const top = -PH / 2
        const tone = clean ? C.green : C.teal

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-MODAL.w / 2 + 4, top + 12, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.paper, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-150, top - 13, 300, 26, 13)

        const markBg = this.add.graphics()
        markBg.fillStyle(tone, 1)
        markBg.fillCircle(0, top + 64, 38)
        markBg.fillStyle(C.white, A.gloss)
        markBg.fillEllipse(0, top + 52, 42, 17)

        const mark = this.add.graphics()
        mark.lineStyle(8, C.white, 1)
        mark.lineBetween(-15, top + 64, -4, top + 77)
        mark.lineBetween(-4, top + 77, 17, top + 49)

        const title = this.add.text(0, top + 132, clean ? 'Parte resolvida!' : 'Boa, resolvido!', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 176 + body.height / 2)

        const pointsText = this.add.text(0, top + 188 + body.height + 16, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.tealDark),
        }).setOrigin(0.5).setResolution(2)

        let counterTween: Phaser.Tweens.Tween | undefined
        if (earned > 0) {
            const counter = { v: 0 }
            counterTween = this.tweens.add({
                targets: counter,
                v: earned,
                duration: 620,
                delay: 300,
                onUpdate: () => {
                    if (!pointsText.active) return
                    pointsText.setText(`+${Math.round(counter.v)} pontos`)
                },
            })
        }

        const btn = this.button(0, PH / 2 - 60, MODAL.btnW, MODAL.btnH, 'Continuar', C.teal, () => {
            counterTween?.remove()
            pointsText.setText(earned > 0 ? `+${earned} pontos` : '')
            this.closeModalSafely(overlay, modal, onDone)
        }, '24px', true)

        modal.add([bg, markBg, mark, title, body, pointsText, btn])
        modal.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 280, ease: 'Back.easeOut' })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.night, A.overlay).setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 320
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(-MODAL.w / 2 + 4, top + 12, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.paper, 1)
        bg.fillRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.lineStyle(5, C.amber, 1)
        bg.strokeRoundedRect(-MODAL.w / 2, top, MODAL.w, PH, MODAL.r)
        bg.fillStyle(C.teal, 1)
        bg.fillRoundedRect(-150, top - 13, 300, 26, 13)

        const badge = this.add.text(0, top + 58, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.tealDark),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 112, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '38px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: MODAL.w - MODAL.pad * 2 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 170 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 60, MODAL.btnW, MODAL.btnH, 'Abrir a prancheta', C.teal, () => {
            this.closeModalSafely(overlay, panel, onStart)
        }, '24px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.9).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 300, ease: 'Back.easeOut' })
    }

    private toast(message: string, tone: number) {
        const parts = this.registry.get('panel-parts') as Phaser.GameObjects.GameObject[]
        this.tweens.add({ targets: parts, alpha: 0.25, duration: 180 })

        const container = this.add.container(W / 2, TOAST.y).setDepth(60)
        const t = this.add.text(0, 0, message, {
            fontFamily: 'Arial Black, Arial',
            fontSize: TOAST.fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: TOAST.w - 60 },
        }).setOrigin(0.5).setResolution(2)

        const w = Math.max(320, t.width + 56)
        const h = Math.max(TOAST.h, t.height + 30)
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.26)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(tone, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 12, -h / 2 + 7, w - 24, h * 0.3, h / 4)

        container.add([g, t])
        container.setAlpha(0).setScale(0.9)
        this.tweens.add({ targets: container, alpha: 1, scale: 1, y: TOAST.y - 14, duration: 260, ease: 'Back.easeOut' })
        this.time.delayedCall(TOAST.life, () => {
            this.tweens.add({ targets: parts, alpha: 1, duration: 220 })
            this.tweens.add({
                targets: container,
                alpha: 0,
                y: container.y - 12,
                duration: 240,
                onComplete: () => container.destroy(),
            })
        })
    }

    private runTutorial() {
        if (!this.isMissionStart()) {
            this.helpBtn?.setVisible(true)
            this.locked = false
            return
        }
        this.playTutorial(true, () => { this.locked = false })
    }

    private replayTutorial() {
        const wasLocked = this.locked
        this.locked = true
        this.playTutorial(false, () => { this.locked = wasLocked })
    }

    private playTutorial(once: boolean, onDone: () => void) {
        createTutorial(this, {
            key: `arquiteto-l${this.level.level}-${this.phase.kind}`,
            once,
            accent: C.amber,
            safeTop: 92,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.helpBtn?.setVisible(true)
                onDone()
            },
        })
    }

    private tutorialSteps(): TutorialStep[] {
        const boardRect = { shape: 'rect' as const, x: BOARD.x + BOARD.w / 2, y: BOARD.y + BOARD.h / 2, w: BOARD.w + 20, h: BOARD.h + 20, balloonY: 600 }
        const dockRect = { shape: 'rect' as const, x: W / 2, y: DOCK.cy, w: 1180, h: 150, balloonY: 300 }
        const panelRect = { shape: 'rect' as const, x: PANEL.x + PANEL.w / 2, y: PANEL.y + PANEL.h / 2, w: PANEL.w + 20, h: PANEL.h + 20, balloonY: 240 }

        if (this.phase.kind === 'partir') {
            const base: TutorialStep[] = [
                { text: 'Este é o pedido inteiro. Ele é grande demais para resolver de uma vez.', ...boardRect },
                { text: 'Toque em PARTIR. O cartão se divide e abrem encaixes vazios.', ...dockRect },
                { text: 'Depois toque nas partes que cabem dentro do pedido. As que não cabem voltam.', ...dockRect },
            ]
            if (this.level.level === 3) {
                base.push({ text: 'Aqui uma das partes ainda é grande. Ela vai se partir de novo.', ...boardRect })
            }
            return base
        }

        if (this.phase.kind === 'resolver') {
            return [
                { text: 'Agora você resolve uma parte por vez, sem pensar no resto.', ...boardRect },
                { text: 'Toque nos passos na ordem certa. Eles sobem para a lista.', ...dockRect },
                { text: 'Parte resolvida vira um módulo guardado na caixa.', ...panelRect },
            ]
        }

        const steps: TutorialStep[] = [
            { text: 'Aqui você junta as partes resolvidas em um plano só.', ...boardRect },
            { text: 'Toque em cada parte para colocar na faixa do plano.', ...dockRect },
        ]
        if (this.level.useDeps) {
            steps.push({ text: 'Algumas partes só podem entrar depois de outras. O plano avisa quando não dá.', ...boardRect })
        }
        if (this.level.useTracks) {
            steps.push({ text: 'São duas faixas: você e um colega. Partes independentes correm ao mesmo tempo.', ...boardRect })
        }
        steps.push({ text: 'No fim, toque em SIMULAR para o plano acontecer de verdade.', ...dockRect })
        return steps
    }

    // ---------------------------------------------------------- utilitários

    private emitCheckpoint() {
        let done = 0
        for (let i = 0; i < this.levelIdx; i++) done += LEVELS[i].phases.length
        done += this.phaseIdx
        const total = LEVELS.reduce((acc, l) => acc + l.phases.length, 0)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            stage: this.level.level,
            progress: Math.round((done / total) * 100),
            score: this.points,
        })
    }

    private isInputBlocked() {
        return this.time.now < this.inputBlockedUntil
    }

    private blockInput(ms = 320) {
        this.inputBlockedUntil = Math.max(this.inputBlockedUntil, this.time.now + ms)

        if (!this.inputBlocker?.active) {
            this.inputBlocker = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.001)
                .setDepth(9999)
                .setInteractive()
            this.inputBlocker.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
            this.inputBlocker.on('pointerup', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
        }

        this.unblockTimer?.remove()
        this.unblockTimer = this.time.delayedCall(ms + 40, () => {
            this.unblockTimer = undefined
            this.inputBlockedUntil = 0
            this.inputBlocker?.destroy()
            this.inputBlocker = undefined
        })
    }

    private closeModalSafely(
        overlay: Phaser.GameObjects.Rectangle,
        modal: Phaser.GameObjects.Container,
        onClosed?: () => void,
    ) {
        this.blockInput()
        overlay.disableInteractive()
        modal.each((child: Phaser.GameObjects.GameObject) => {
            if ('disableInteractive' in child) (child as Phaser.GameObjects.Container).disableInteractive()
        })

        this.tweens.add({ targets: modal, alpha: 0, scale: 0.94, duration: 180, ease: 'Sine.easeIn' })
        this.tweens.add({ targets: overlay, alpha: 0, duration: 180 })
        this.time.delayedCall(190, () => {
            overlay.destroy()
            modal.destroy()
            onClosed?.()
        })
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '20px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.26)
            g.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 9, -h / 2 + 8, w - 18, h * 0.32, h / 4)
        }
        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 26 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerover', () => this.tweens.add({ targets: btn, scale: 1.03, duration: 120 }))
        btn.on('pointerout', () => this.tweens.add({ targets: btn, scale: 1, duration: 120 }))
        btn.on('pointerdown', (_p: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            if (this.isInputBlocked() || (!ignoreLock && this.locked)) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}