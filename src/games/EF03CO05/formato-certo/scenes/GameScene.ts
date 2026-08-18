import Phaser from 'phaser'
import { EventBus } from '../../../../shared/EventBus'
import { runtimeGameBridge } from '../../../../shared/bridge/runtimeGameBridge'
import type { PlatformCommand } from '../../../../shared/contracts/platformCommands'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../../shared/level/showLevelComplete'
import { FX } from '../../../../shared/effects/FX'
import { FORMAT_OPTIONS, LEVELS, shufflePieces } from '../data/levels'
import type { DataPiece, DataPieceId, FormatId, FormatLevel, SlotId } from '../types'
const W = 1280
const H = 720
const GAME_ID = 'formato-certo'
const C = {
    ink: 0x0d1b2a,
    inkMid: 0x26364a,
    navy: 0x102a43,
    blue: 0x2563eb,
    cyan: 0x38bdf8,
    yellow: 0xf0b429,
    cream: 0xfffbeb,
    panel: 0xf8fbff,
    purple: 0x7c3aed,
    green: 0x22c55e,
    red: 0xef4444,
    slate: 0x64748b,
    white: 0xffffff,
    shadow: 0x000000,
}
const HUD = { x: 16, y: 12, w: 1248, h: 66, cy: 45 }
const BOARD = { x: 48, y: 106, w: 1184, h: 562, cx: 640 }
const CARD = { w: 136, h: 126 }
const SLOT = { w: 188, h: 132 }
const FORMAT_CARD = { w: 286, h: 156 }
const PLACED_SCALE = 0.78
const BACKGROUND_BY_MODE: Record<FormatLevel['mode'], string> = {
    date: 'bg-date-format',
    pixels: 'bg-pixel-format',
    text: 'bg-text-format',
}
const FORMAT_ASSET_BY_ID: Record<FormatId, string> = {
    date: 'format-date-box',
    pixels: 'format-pixel-grid',
    text: 'format-text-sequence',
}
const PIECE_ASSET_BY_ID: Partial<Record<DataPieceId, string>> = {
    'day-18': 'data-day-18',
    'month-june': 'data-month-june',
    'year-2026': 'data-year-2026',
    'color-red': 'data-color-red',
    'color-blue': 'data-color-blue',
    'color-yellow': 'data-color-yellow',
    'letter-a': 'data-letter-a',
    dash: 'data-dash',
    'number-1': 'data-number-1',
    'number-2': 'data-number-2',
    'extra-place': 'data-room-4',
    'extra-street': 'data-street-sign',
    'extra-star': 'data-star-extra',
}
type PlayPhase = 'choose' | 'build'
type SlotPaintState = 'empty' | 'filled' | 'hover' | 'success' | 'warning'
interface CardRecord {
    id: DataPieceId
    piece: DataPiece
    card: Phaser.GameObjects.Container
    homeX: number
    homeY: number
    slotId: SlotId | null
}
interface SlotView {
    id: SlotId
    x: number
    y: number
    w: number
    h: number
    bg: Phaser.GameObjects.Graphics
    box: Phaser.GameObjects.Container
    helper: Phaser.GameObjects.Text
}
export class GameScene extends Phaser.Scene {
    private levelConfig!: FormatLevel
    private pieces: DataPiece[] = []
    private phase: PlayPhase = 'choose'
    private selectedFormat: FormatId | null = null
    private formatOptions = FORMAT_OPTIONS
    private cards = new Map<DataPieceId, CardRecord>()
    private formatCards = new Map<FormatId, Phaser.GameObjects.Container>()
    private slots = new Map<SlotId, DataPieceId | null>()
    private slotViews = new Map<SlotId, SlotView>()
    private slotRects = new Map<SlotId, Phaser.Geom.Rectangle>()
    private feedbackObjects: Phaser.GameObjects.GameObject[] = []
    private points = 0
    private hits = 0
    private errors = 0
    private locked = false
    private ended = false
    private tutorialOpen = false
    private initialApplied = false
    private isMuted = false
    private stage?: Phaser.GameObjects.Container
    private hud?: Phaser.GameObjects.Container
    private unsubPlatform?: () => void
    constructor() {
        super({ key: 'GameScene' })
    }
    init(data: { level?: number; points?: number; hits?: number; errors?: number }) {
        const level = Phaser.Math.Clamp(data.level ?? 1, 1, 3) as 1 | 2 | 3
        this.levelConfig = LEVELS.find(item => item.level === level) ?? LEVELS[0]
        this.pieces = shufflePieces(this.levelConfig.pieces)
        this.formatOptions = Phaser.Utils.Array.Shuffle([...FORMAT_OPTIONS])
        this.phase = 'choose'
        this.selectedFormat = null
        this.cards = new Map()
        this.formatCards = new Map()
        this.slots = new Map()
        this.slotViews = new Map()
        this.slotRects = new Map()
        this.feedbackObjects = []
        this.points = data.points ?? 0
        this.hits = data.hits ?? 0
        this.errors = data.errors ?? 0
        this.locked = false
        this.ended = false
        this.tutorialOpen = false
        this.initialApplied = false
    }
    create() {
        this.drawBackground()
        this.renderHud()
        this.renderStage()
        this.registerPlatformCommands()
        EventBus.on('show-tutorial', this.replayTutorial, this)
        EventBus.on('mute-audio', this.onMuteAudio, this)
        this.events.once('shutdown', this.shutdownScene, this)
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })
        this.emitCheckpoint()
        this.time.delayedCall(320, () => this.runTutorial(false))
    }
    private shutdownScene() {
        EventBus.off('show-tutorial', this.replayTutorial, this)
        EventBus.off('mute-audio', this.onMuteAudio, this)
        this.unsubPlatform?.()
        this.clearFeedback()
        this.input.setDefaultCursor('default')
    }
    private registerPlatformCommands() {
        this.unsubPlatform?.()
        this.unsubPlatform = runtimeGameBridge.onCommand((cmd: PlatformCommand) => {
            if (cmd.type === 'START_GAME') {
                this.points = cmd.points ?? this.points
                const stage = Phaser.Math.Clamp(cmd.stage ?? this.levelConfig.level, 1, 3)
                if (stage !== this.levelConfig.level) {
                    this.scene.restart({ level: stage, points: this.points, hits: this.hits, errors: this.errors })
                }
            }
            if (cmd.type === 'PAUSE_GAME') this.scene.pause()
            if (cmd.type === 'RESUME_GAME') this.scene.resume()
        })
    }
    private onMuteAudio(muted: boolean) {
        this.isMuted = muted
    }
    private drawBackground() {
        const bg = this.add.graphics().setDepth(-30)
        bg.fillGradientStyle(0xdff7ff, 0xfff2b7, 0xeef2ff, 0xb9f6e5, 1)
        bg.fillRect(0, 0, W, H)
        const assetKey = BACKGROUND_BY_MODE[this.levelConfig.mode]
        if (this.textures.exists(assetKey)) {
            const image = this.add.image(W / 2, H / 2, assetKey).setDepth(-28).setAlpha(0.18)
            image.setScale(Math.max(W / image.width, H / image.height))
        }
        const g = this.add.graphics().setDepth(-27)
        const colors = [C.blue, C.yellow, C.cyan, C.purple, C.green]
        for (let i = 0; i < 12; i += 1) {
            const x = Phaser.Math.Between(48, 1188)
            const y = Phaser.Math.Between(112, 650)
            g.fillStyle(colors[i % colors.length], 0.075)
            if (i % 2 === 0) g.fillCircle(x, y, Phaser.Math.Between(18, 34))
            else g.fillRoundedRect(x, y, Phaser.Math.Between(42, 86), Phaser.Math.Between(18, 38), 10)
        }
    }
    private renderHud() {
        this.hud?.destroy()
        this.hud = this.add.container(0, 0).setDepth(70)
        const bg = this.add.graphics()
        bg.fillStyle(C.navy, 0.96)
        bg.fillRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 22)
        bg.fillStyle(C.white, 0.08)
        bg.fillRoundedRect(HUD.x + 16, HUD.y + 10, HUD.w - 32, 16, 8)
        bg.lineStyle(3, C.yellow, 0.86)
        bg.strokeRoundedRect(HUD.x, HUD.y, HUD.w, HUD.h, 22)
        this.hud.add(bg)
        const pill = this.add.container(106, HUD.cy)
        const pillBg = this.add.graphics()
        pillBg.fillStyle(C.yellow, 1)
        pillBg.fillRoundedRect(-70, -23, 140, 46, 23)
        pill.add([
            pillBg,
            this.add.text(0, 0, `NÍVEL ${this.levelConfig.level}`, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '19px',
                color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2),
        ])
        this.hud.add(pill)
        this.hud.add(this.add.text(626, 34, this.hudTitle(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '26px',
            color: hex(C.cream),
            align: 'center',
            wordWrap: { width: 700 },
        }).setOrigin(0.5).setResolution(2))
        this.hud.add(this.add.text(626, 59, this.hudHint(), {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '16px',
            color: '#dbeafe',
            align: 'center',
            wordWrap: { width: 760 },
        }).setOrigin(0.5).setResolution(2))
        const dots = this.add.graphics()
        for (let i = 0; i < 3; i += 1) {
            const x = 1038 + i * 30
            const now = i === this.levelConfig.level - 1
            dots.fillStyle(now ? C.yellow : C.cream, now ? 1 : 0.32)
            if (now) dots.fillRoundedRect(x - 14, HUD.cy - 9, 28, 18, 9)
            else dots.fillCircle(x, HUD.cy, 8)
        }
        this.hud.add(dots)
        this.hud.add(this.createRoundButton(1198, HUD.cy, 22, '?', C.cyan, () => this.replayTutorial()))
    }
    private renderStage() {
        this.stage?.destroy()
        this.stage = this.add.container(0, 0).setDepth(5)
        this.cards.clear()
        this.formatCards.clear()
        this.slotViews.clear()
        this.slotRects.clear()
        if (this.phase === 'choose') this.drawChooseScreen()
        else this.drawBuildScreen()
        this.animateStageEntry()
        this.renderHud()
    }
    private drawChooseScreen() {
        this.drawBoardShell('Escolha o formato', 'Uma informação só fica legível na caixa certa.')
        this.drawMissionPanel(640, 228, 860, 156, false)
        this.drawFormatChoices()
    }
    private drawBuildScreen() {
        this.drawBoardShell('Monte os dados', this.levelConfig.instruction)
        this.drawMissionPanel(640, 178, 900, 112, true)
        this.drawSlots()
        this.drawDataBank()
        if (this.levelConfig.initialSlots && !this.initialApplied) {
            ;(Object.entries(this.levelConfig.initialSlots) as Array<[SlotId, DataPieceId]>).forEach(([slotId, pieceId]) => {
                this.slots.set(slotId, pieceId)
                const record = this.cards.get(pieceId)
                if (record) record.slotId = slotId
            })
            this.initialApplied = true
        }
        this.restorePlacedCards()
        this.refreshSlots()
        this.drawBuildButtons()
    }
    private drawBoardShell(title: string, subtitle: string) {
        if (!this.stage) return
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.14)
        g.fillRoundedRect(BOARD.x + 8, BOARD.y + 12, BOARD.w, BOARD.h, 30)
        g.fillStyle(C.panel, 0.97)
        g.fillRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 30)
        g.fillStyle(0xe0f2fe, 0.7)
        g.fillRoundedRect(BOARD.x + 14, BOARD.y + 14, BOARD.w - 28, 64, 22)
        g.lineStyle(4, C.white, 0.96)
        g.strokeRoundedRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 30)
        this.stage.add(g)
        this.stage.add(this.add.text(BOARD.x + 44, BOARD.y + 38, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '27px',
            color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2))
        this.stage.add(this.add.text(BOARD.x + BOARD.w - 44, BOARD.y + 38, subtitle, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkMid),
            align: 'right',
            wordWrap: { width: 560 },
        }).setOrigin(1, 0.5).setResolution(2))
    }
    private drawMissionPanel(x: number, y: number, w: number, h: number, compact: boolean) {
        if (!this.stage) return
        const box = this.add.container(x, y)
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.12)
        bg.fillRoundedRect(-w / 2 + 5, -h / 2 + 8, w, h, 22)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 22)
        bg.fillStyle(this.currentAccent(), 0.18)
        bg.fillRoundedRect(-w / 2 + 16, -h / 2 + 12, w - 32, 18, 9)
        bg.lineStyle(4, this.currentAccent(), 0.88)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 22)
        const icon = this.add.graphics()
        icon.fillStyle(this.currentAccent(), 0.14)
        icon.fillCircle(-w / 2 + 78, 4, compact ? 35 : 44)
        this.drawFormatSymbol(icon, this.levelConfig.requiredFormat, -w / 2 + 78, 4, compact ? 0.82 : 1.02, this.currentAccent())
        const title = this.add.text(-w / 2 + 146, compact ? -16 : -24, this.levelConfig.scenario, {
            fontFamily: 'Arial Black, Arial',
            fontSize: compact ? '19px' : '23px',
            color: hex(C.ink),
            wordWrap: { width: w - 190 },
        }).setOrigin(0, 0.5).setResolution(2)
        const body = this.add.text(-w / 2 + 146, compact ? 18 : 20, compact ? this.levelConfig.instruction : this.shortInstruction(), {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: compact ? '16px' : '19px',
            color: hex(C.inkMid),
            wordWrap: { width: w - 190 },
        }).setOrigin(0, 0.5).setResolution(2)
        box.add([bg, icon, title, body])
        this.stage.add(box)
        void FX.slideIn(this, box as unknown as FXTarget, { dy: 24, duration: 360 })
    }
    private drawFormatChoices() {
        if (!this.stage) return
        const label = this.add.text(BOARD.cx, 354, 'Toque em uma caixa', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2)
        this.stage.add(label)
        const gap = 54
        const total = FORMAT_CARD.w * 3 + gap * 2
        const start = BOARD.cx - total / 2 + FORMAT_CARD.w / 2
        this.formatOptions.forEach((option, index) => {
            const x = start + index * (FORMAT_CARD.w + gap)
            const card = this.createFormatCard(option.id, x, 474)
            this.formatCards.set(option.id, card)
            this.stage?.add(card)
            void FX.popIn(this, card as unknown as FXTarget, { from: 0.76, delay: 100 + index * 90, duration: 380 })
            FX.float(this, card as unknown as FXTarget, { amount: 5, duration: 1900 + index * 180, delay: index * 130 })
        })
    }
    private createFormatCard(id: FormatId, x: number, y: number) {
        const option = FORMAT_OPTIONS.find(item => item.id === id)!
        const card = this.add.container(x, y)
        const w = FORMAT_CARD.w
        const h = FORMAT_CARD.h
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.13)
        bg.fillRoundedRect(-w / 2 + 6, -h / 2 + 10, w, h, 24)
        bg.fillStyle(C.white, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 24)
        bg.fillStyle(option.color, 0.18)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 12, w - 28, 22, 11)
        bg.lineStyle(5, option.color, 0.85)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 24)
        const halo = this.add.graphics()
        halo.fillStyle(option.color, 0.16)
        halo.fillCircle(0, -24, 48)
        const asset = FORMAT_ASSET_BY_ID[id]
        const icon = this.textures.exists(asset)
            ? this.fitImage(this.add.image(0, -24, asset), 94, 72)
            : this.add.container(0, -24)
        if (!this.textures.exists(asset)) {
            const drawn = this.add.graphics()
            this.drawFormatSymbol(drawn, id, 0, 0, 1, option.color)
            ;(icon as Phaser.GameObjects.Container).add(drawn)
        }
        const title = this.add.text(0, 40, option.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '25px',
            color: hex(C.ink),
            align: 'center',
        }).setOrigin(0.5).setResolution(2)
        const sub = this.add.text(0, 68, option.subtitle, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '15px',
            color: hex(C.slate),
            align: 'center',
            wordWrap: { width: w - 42 },
        }).setOrigin(0.5).setResolution(2)
        card.add([bg, halo, icon, title, sub])
        this.enableButton(card, w, h, () => this.selectFormat(id))
        return card
    }
    private drawSlots() {
        if (!this.stage) return
        this.stage.add(this.add.text(BOARD.cx, 270, this.levelConfig.level === 3 ? 'Arrume a ordem' : 'Coloque nos espaços', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2))
        const slots = this.levelConfig.slots
        const gap = slots.length <= 3 ? 74 : 36
        const w = slots.length <= 3 ? 204 : SLOT.w
        const total = slots.length * w + (slots.length - 1) * gap
        const start = BOARD.cx - total / 2 + w / 2
        slots.forEach((slot, index) => {
            const x = start + index * (w + gap)
            const y = 376
            const box = this.add.container(x, y)
            const bg = this.add.graphics()
            paintSlot(bg, w, SLOT.h, [C.blue, C.yellow, C.purple, C.green][index % 4], 'empty')
            const label = this.add.text(0, -SLOT.h / 2 + 24, slot.label, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '18px',
                color: hex(C.ink),
            }).setOrigin(0.5).setResolution(2)
            const helper = this.add.text(0, SLOT.h / 2 - 24, 'solte aqui', {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '14px',
                color: hex(C.slate),
            }).setOrigin(0.5).setResolution(2)
            box.add([bg, label, helper])
            this.stage?.add(box)
            this.slotViews.set(slot.id, { id: slot.id, x, y, w, h: SLOT.h, bg, box, helper })
            this.slotRects.set(slot.id, new Phaser.Geom.Rectangle(x - w / 2, y - SLOT.h / 2, w, SLOT.h))
            void FX.popIn(this, box as unknown as FXTarget, { from: 0.84, delay: 120 + index * 70, duration: 340 })
        })
    }
    private drawDataBank() {
        if (!this.stage) return
        this.stage.add(this.add.text(BOARD.cx, 505, 'Dados disponíveis', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: hex(C.ink),
        }).setOrigin(0.5).setResolution(2))
        const n = this.pieces.length
        const gap = n <= 5 ? 34 : 20
        const total = n * CARD.w + (n - 1) * gap
        const start = BOARD.cx - total / 2 + CARD.w / 2
        this.pieces.forEach((piece, index) => {
            const x = start + index * (CARD.w + gap)
            const card = this.createDataCard(piece, x, 592)
            this.cards.set(piece.id, { id: piece.id, piece, card, homeX: x, homeY: 592, slotId: null })
            this.stage?.add(card)
            void FX.popIn(this, card as unknown as FXTarget, { from: 0.82, delay: 160 + index * 44, duration: 320 })
        })
    }
    private createDataCard(piece: DataPiece, x: number, y: number) {
        const card = this.add.container(x, y).setDepth(22)
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.14)
        bg.fillRoundedRect(-CARD.w / 2 + 5, -CARD.h / 2 + 8, CARD.w, CARD.h, 18)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 18)
        bg.fillStyle(piece.color, 0.16)
        bg.fillRoundedRect(-CARD.w / 2 + 10, -CARD.h / 2 + 10, CARD.w - 20, 20, 10)
        bg.lineStyle(4, piece.color, 0.9)
        bg.strokeRoundedRect(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h, 18)
        const asset = PIECE_ASSET_BY_ID[piece.id]
        const icon = asset && this.textures.exists(asset)
            ? this.fitImage(this.add.image(0, -22, asset), 84, 68)
            : this.add.container(0, -22)
        if (!asset || !this.textures.exists(asset)) {
            const drawn = this.add.graphics()
            this.drawPieceSymbol(drawn, piece, 0, 0, 0.86)
            ;(icon as Phaser.GameObjects.Container).add(drawn)
        }
        const label = this.add.text(0, 45, piece.shortLabel, {
            fontFamily: 'Arial Black, Arial',
            fontSize: labelSize(piece.shortLabel),
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: CARD.w - 16 },
        }).setOrigin(0.5).setResolution(2)
        card.add([bg, icon, label])
        card.setSize(CARD.w, CARD.h)
        card.setInteractive(new Phaser.Geom.Rectangle(-CARD.w / 2, -CARD.h / 2, CARD.w, CARD.h), Phaser.Geom.Rectangle.Contains)
        if (card.input) card.input.cursor = 'pointer'
        this.input.setDraggable(card)
        card.on('dragstart', () => {
            if (this.locked || this.phase !== 'build') return
            this.removeFromSlot(piece.id, false)
            this.stage?.bringToTop(card)
            this.tweens.add({ targets: card, scale: 1.04, duration: 90, ease: 'Sine.easeOut' })
            this.refreshSlots()
        })
        card.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            if (this.locked || this.phase !== 'build') return
            card.setPosition(dragX, dragY)
            this.highlightDropAt(dragX, dragY)
        })
        card.on('dragend', (pointer: Phaser.Input.Pointer) => {
            if (this.locked || this.phase !== 'build') {
                this.returnCardHome(piece.id)
                return
            }
            this.dropCard(piece.id, pointer.x, pointer.y)
        })
        return card
    }
    private drawBuildButtons() {
        if (!this.stage) return
        const back = this.createWideButton(248, 646, 250, 58, 'Trocar caixa', C.slate, () => this.backToChoose())
        const read = this.createWideButton(1030, 646, 270, 58, 'Ler dados', C.green, () => this.validateFormat())
        this.stage.add([back, read])
    }
    private selectFormat(id: FormatId) {
        if (this.locked || this.ended) return
        this.playClick()
        if (id !== this.levelConfig.requiredFormat) {
            this.errors += 1
            runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level })
            this.emitCheckpoint()
            const card = this.formatCards.get(id)
            if (card) void FX.shake(this, card as unknown as FXTarget, { amount: 10, times: 3 })
            this.playError()
            this.showFeedback('fail', 'Não é essa caixa', this.levelConfig.hint, 'Tentar outra', () => undefined)
            return
        }
        this.selectedFormat = id
        this.phase = 'build'
        this.initialApplied = false
        this.slots = new Map(this.levelConfig.slots.map(slot => [slot.id, null]))
        this.locked = true
        void FX.curtain(this, () => {
            this.renderStage()
            this.emitCheckpoint()
        }, C.navy).then(() => {
            this.locked = false
            this.time.delayedCall(220, () => this.runTutorial(false))
        })
    }
    private backToChoose() {
        if (this.locked) return
        this.phase = 'choose'
        this.selectedFormat = null
        this.initialApplied = false
        this.slots.clear()
        this.renderStage()
        this.emitCheckpoint()
    }
    private dropCard(id: DataPieceId, pointerX: number, pointerY: number) {
        const target = [...this.slotRects.entries()].find(([, rect]) => rect.contains(pointerX, pointerY))
        if (!target) {
            this.returnCardHome(id)
            this.refreshSlots()
            return
        }
        this.placeCardInSlot(id, target[0], true)
    }
    private placeCardInSlot(id: DataPieceId, slotId: SlotId, animate = true) {
        const record = this.cards.get(id)
        const slot = this.slotViews.get(slotId)
        if (!record || !slot) return
        const current = this.slots.get(slotId)
        if (current && current !== id) this.returnCardHome(current, false)
        this.removeFromSlot(id, false)
        this.slots.set(slotId, id)
        record.slotId = slotId
        this.stage?.bringToTop(record.card)
        record.card.setDepth(30)
        const target = { x: slot.x, y: slot.y + 16 }
        if (animate) {
            void FX.arcTo(this, record.card as unknown as FXTarget, target, { height: 42, duration: 260 })
            this.tweens.add({ targets: record.card, scale: PLACED_SCALE, duration: 170, ease: 'Sine.easeOut' })
            this.playDrop()
        } else {
            record.card.setPosition(target.x, target.y).setScale(PLACED_SCALE)
        }
        this.refreshSlots()
        this.emitCheckpoint()
    }
    private restorePlacedCards() {
        this.slots.forEach((pieceId, slotId) => {
            if (!pieceId) return
            const record = this.cards.get(pieceId)
            const slot = this.slotViews.get(slotId)
            if (!record || !slot) return
            record.slotId = slotId
            record.card.setPosition(slot.x, slot.y + 16).setScale(PLACED_SCALE)
            this.stage?.bringToTop(record.card)
        })
    }
    private removeFromSlot(id: DataPieceId, emit = true) {
        const record = this.cards.get(id)
        if (!record?.slotId) return
        this.slots.set(record.slotId, null)
        record.slotId = null
        if (emit) this.emitCheckpoint()
    }
    private returnCardHome(id: DataPieceId, emit = true) {
        const record = this.cards.get(id)
        if (!record) return
        this.removeFromSlot(id, false)
        this.tweens.add({
            targets: record.card,
            x: record.homeX,
            y: record.homeY,
            scale: 1,
            duration: 180,
            ease: 'Sine.easeOut',
        })
        if (emit) this.emitCheckpoint()
    }
    private highlightDropAt(x: number, y: number) {
        this.slotViews.forEach(view => {
            const inside = this.slotRects.get(view.id)?.contains(x, y)
            paintSlot(view.bg, view.w, view.h, C.blue, inside ? 'hover' : this.slots.get(view.id) ? 'filled' : 'empty')
        })
    }
    private refreshSlots(state: SlotPaintState | 'normal' = 'normal', target?: SlotId) {
        this.slotViews.forEach(view => {
            let status: SlotPaintState = this.slots.get(view.id) ? 'filled' : 'empty'
            if (target === view.id && state !== 'normal') status = state
            else if (!target && state === 'success') status = 'success'
            paintSlot(view.bg, view.w, view.h, C.blue, status)
            view.helper.setAlpha(this.slots.get(view.id) ? 0 : 1)
        })
    }
    private validateFormat() {
        if (this.locked || this.phase !== 'build' || this.ended) return
        this.playClick()
        const empty = this.levelConfig.slots.find(slot => !this.slots.get(slot.id))
        if (empty) {
            this.playError()
            this.refreshSlots('warning', empty.id)
            const view = this.slotViews.get(empty.id)
            if (view) void FX.shake(this, view.box as unknown as FXTarget, { amount: 8, times: 3 })
            this.showFeedback('fail', 'Falta um dado', `Preencha o espaço ${empty.label}.`, 'Continuar', () => undefined)
            return
        }
        const wrong = this.levelConfig.slots.find(slot => this.slots.get(slot.id) !== slot.accepts)
        if (wrong) {
            this.errors += 1
            runtimeGameBridge.emit({ type: 'WRONG_ANSWER', gameId: GAME_ID, pointsEarned: -2, stage: this.levelConfig.level })
            this.emitCheckpoint()
            this.playError()
            this.refreshSlots('warning', wrong.id)
            const pieceId = this.slots.get(wrong.id)
            const card = pieceId ? this.cards.get(pieceId)?.card : undefined
            if (card) void FX.shake(this, card as unknown as FXTarget, { amount: 12, times: 4 })
            this.showFeedback('fail', 'Não leu direito', this.levelConfig.hint, 'Arrumar', () => undefined)
            return
        }
        this.completeLevel()
    }
    private completeLevel() {
        this.locked = true
        this.hits += 1
        this.points += 25
        runtimeGameBridge.emit({ type: 'CORRECT_ANSWER', gameId: GAME_ID, pointsEarned: 25, stage: this.levelConfig.level })
        this.emitCheckpoint(true)
        this.refreshSlots('success')
        this.playCorrect()
        void FX.flash(this, C.cream, { duration: 260, peak: 0.25 })
        void FX.sparks(this, BOARD.cx, 386, { color: C.yellow, count: 28, spread: 220 })
        this.showFeedback('success', this.levelConfig.resultTitle, this.levelConfig.successMessage, 'Continuar', () => this.endLevel(), true)
    }
    private endLevel() {
        if (this.ended) return
        this.ended = true
        this.clearFeedback()
        const next = this.levelConfig.level < 3 ? (this.levelConfig.level + 1) as 1 | 2 | 3 : null
        if (next) {
            showLevelComplete(this, {
                title: `Nível ${this.levelConfig.level} completo`,
                subtitle: this.levelConfig.resultTitle,
                message: this.levelConfig.successMessage,
                accent: C.yellow,
                panelColor: C.cream,
                overlayColor: C.navy,
                progress: { total: 3, current: this.levelConfig.level },
                autoAdvance: {
                    delay: 1700,
                    label: `Preparando nível ${next}...`,
                    onComplete: () => this.scene.restart({
                        level: next,
                        points: this.points,
                        hits: this.hits,
                        errors: this.errors,
                    }),
                },
            })
            return
        }
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.levelConfig.level })
        void FX.confetti(this, { colors: [C.yellow, C.blue, C.green, C.purple] })
        showLevelComplete(this, {
            title: 'Formatos completos',
            subtitle: 'Formato Certo',
            message: 'Você guardou imagem, data e texto usando o formato certo.',
            accent: C.green,
            panelColor: C.cream,
            overlayColor: C.navy,
            progress: { total: 3, current: 3 },
            buttons: [
                { label: 'Jogar de novo', color: C.green, onClick: () => this.scene.restart({ level: 1, points: 0, hits: 0, errors: 0 }) },
                { label: 'Escolher jogo', color: C.yellow, onClick: () => EventBus.emit('exit-game') },
            ],
        })
    }
    private showFeedback(kind: 'fail' | 'success', title: string, message: string, buttonLabel: string, onClose: () => void, withPreview = false) {
        this.clearFeedback()
        this.locked = true
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.navy, 0.5).setDepth(500).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(501)
        const accent = kind === 'success' ? C.green : C.red
        const w = 560
        const h = withPreview ? 358 : 286
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.18)
        bg.fillRoundedRect(-w / 2 + 8, -h / 2 + 14, w, h, 28)
        bg.fillStyle(C.cream, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
        bg.fillStyle(accent, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, 42, { tl: 28, tr: 28, bl: 0, br: 0 })
        bg.lineStyle(4, C.white, 0.92)
        bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 28)
        const titleText = this.add.text(0, -h / 2 + 78, title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '32px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: w - 72 },
        }).setOrigin(0.5).setResolution(2)
        const msgY = withPreview ? 72 : 18
        const body = this.add.text(0, msgY, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.inkMid),
            align: 'center',
            wordWrap: { width: w - 92 },
            lineSpacing: 5,
        }).setOrigin(0.5).setResolution(2)
        const parts: Phaser.GameObjects.GameObject[] = [bg, titleText, body]
        if (withPreview) parts.splice(2, 0, this.createResultPreview(0, -20))
        const button = this.createWideButton(0, h / 2 - 54, 250, 56, buttonLabel, kind === 'success' ? C.green : C.blue, () => {
            this.clearFeedback()
            this.locked = false
            onClose()
        }, true)
        modal.add([...parts, button])
        this.feedbackObjects.push(overlay, modal)
        void FX.popIn(this, modal as unknown as FXTarget, { from: 0.82, duration: 280 })
    }
    private clearFeedback() {
        this.feedbackObjects.forEach(obj => obj.destroy())
        this.feedbackObjects = []
    }
    private createResultPreview(x: number, y: number) {
        const preview = this.add.container(x, y)
        if (this.levelConfig.mode === 'pixels') {
            const g = this.add.graphics()
            ;[0xef4444, 0x38bdf8, 0xfacc15].forEach((color, index) => {
                const px = -82 + index * 82
                g.fillStyle(color, 1)
                g.fillRoundedRect(px - 30, -30, 60, 60, 10)
                g.lineStyle(4, C.white, 0.95)
                g.strokeRoundedRect(px - 30, -30, 60, 60, 10)
            })
            preview.add(g)
            return preview
        }
        const g = this.add.graphics()
        g.fillStyle(this.currentAccent(), 1)
        g.fillRoundedRect(-138, -40, 276, 80, 18)
        g.fillStyle(C.white, 0.22)
        g.fillRoundedRect(-118, -28, 236, 14, 7)
        const text = this.add.text(0, 8, this.levelConfig.resultText, {
            fontFamily: 'Arial Black, Arial',
            fontSize: this.levelConfig.mode === 'text' ? '46px' : '27px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        preview.add([g, text])
        return preview
    }
    private runTutorial(force: boolean) {
        if (this.tutorialOpen || this.ended || this.feedbackObjects.length) return
        this.tutorialOpen = true
        this.locked = true
        createTutorial(this, {
            key: `formato-certo-${this.levelConfig.level}-${this.phase}`,
            once: !force,
            accent: C.yellow,
            safeTop: HUD.y + HUD.h + 12,
            steps: this.tutorialSteps(),
            onFinish: () => {
                this.tutorialOpen = false
                this.locked = false
            },
        })
    }
    private replayTutorial() {
        this.runTutorial(true)
    }
    private tutorialSteps(): TutorialStep[] {
        if (this.phase === 'choose') {
            return [
                {
                    text: 'Veja o que precisa guardar.',
                    shape: 'rect',
                    x: 640,
                    y: 228,
                    w: 900,
                    h: 178,
                    balloonY: 440,
                },
                {
                    text: 'Toque na caixa certa.',
                    shape: 'rect',
                    x: 640,
                    y: 474,
                    w: 1000,
                    h: 190,
                    balloonY: 246,
                    pointer: { fromX: 640, fromY: 612, toX: 640, toY: 486 },
                },
            ]
        }
        if (this.levelConfig.level === 3) {
            return [
                {
                    text: 'O código está fora de ordem.',
                    shape: 'rect',
                    x: 640,
                    y: 376,
                    w: 920,
                    h: 172,
                    balloonY: 578,
                },
                {
                    text: 'Troque os pedaços até formar A-12.',
                    shape: 'rect',
                    x: 640,
                    y: 592,
                    w: 960,
                    h: 150,
                    balloonY: 276,
                    pointer: { fromX: 340, fromY: 596, toX: 522, toY: 386 },
                },
                {
                    text: 'Depois toque em Ler dados.',
                    shape: 'rect',
                    x: 1030,
                    y: 646,
                    w: 300,
                    h: 86,
                    balloonX: 710,
                    balloonY: 534,
                },
            ]
        }
        return [
            {
                text: 'Solte cada dado no espaço certo.',
                shape: 'rect',
                x: 640,
                y: 376,
                w: 920,
                h: 172,
                balloonY: 578,
                pointer: { fromX: 420, fromY: 590, toX: 520, toY: 386 },
            },
            {
                text: 'Use apenas os dados que combinam.',
                shape: 'rect',
                x: 640,
                y: 592,
                w: 960,
                h: 150,
                balloonY: 276,
            },
            {
                text: 'Toque em Ler dados.',
                shape: 'rect',
                x: 1030,
                y: 646,
                w: 300,
                h: 86,
                balloonX: 710,
                balloonY: 534,
            },
        ]
    }
    private animateStageEntry() {
        if (!this.stage) return
        this.stage.list.forEach((obj, index) => {
            if (index > 18) return
            const target = obj as Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.AlphaSingle
            target.setAlpha(0)
            this.tweens.add({ targets: target, alpha: 1, duration: 220, delay: index * 14 })
        })
    }
    private emitCheckpoint(forceComplete = false) {
        const slotCount = Math.max(1, this.levelConfig.slots.length)
        const filled = [...this.slots.values()].filter(Boolean).length
        const local = forceComplete
            ? 1
            : this.phase === 'choose'
                ? 0.08
                : Math.min(0.94, 0.28 + (filled / slotCount) * 0.62)
        const progress = Math.round(((this.levelConfig.level - 1 + local) / 3) * 100)
        runtimeGameBridge.emit({
            type: 'CHECKPOINT',
            gameId: GAME_ID,
            progress,
            score: this.points,
            stage: this.levelConfig.level,
            hits: this.hits,
            errors: this.errors,
        })
    }
    private hudTitle() {
        if (this.phase === 'choose') return this.levelConfig.title
        if (this.levelConfig.level === 3) return 'Corrija o formato'
        return 'Monte o formato'
    }
    private hudHint() {
        if (this.phase === 'choose') return 'Escolha uma caixa.'
        if (this.levelConfig.level === 1) return 'Imagem usa pontos de cor.'
        if (this.levelConfig.level === 2) return 'Data usa dia, mês e ano.'
        return 'Texto usa ordem.'
    }
    private shortInstruction() {
        if (this.levelConfig.level === 1) return 'Guardar: vermelho, azul, amarelo.'
        if (this.levelConfig.level === 2) return 'Guardar: 18 de junho de 2026.'
        return 'Guardar: A-12.'
    }
    private currentAccent() {
        const id = this.selectedFormat ?? this.levelConfig.requiredFormat
        return FORMAT_OPTIONS.find(item => item.id === id)?.color ?? C.blue
    }
    private createRoundButton(x: number, y: number, r: number, label: string, color: number, onClick: () => void) {
        const button = this.add.container(x, y)
        const bg = this.add.graphics()
        bg.fillStyle(shade(color, 22), 1)
        bg.fillCircle(0, 4, r)
        bg.fillStyle(color, 1)
        bg.fillCircle(0, 0, r)
        bg.fillStyle(C.white, 0.24)
        bg.fillCircle(-6, -7, r * 0.35)
        const text = this.add.text(0, -1, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: `${Math.round(r * 1.15)}px`,
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        button.add([bg, text])
        this.enableButton(button, r * 2, r * 2, onClick)
        return button
    }
    private createWideButton(x: number, y: number, w: number, h: number, label: string, color: number, onClick: () => void, allowLocked = false) {
        const button = this.add.container(x, y)
        const bg = this.add.graphics()
        bg.fillStyle(shade(color, 24), 1)
        bg.fillRoundedRect(-w / 2, -h / 2 + 7, w, h, h / 2)
        bg.fillStyle(color, 1)
        bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        bg.fillStyle(C.white, 0.22)
        bg.fillRoundedRect(-w / 2 + 14, -h / 2 + 8, w - 28, 16, 8)
        const text = this.add.text(0, -1, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.white),
            align: 'center',
        }).setOrigin(0.5).setResolution(2)
        button.add([bg, text])
        this.enableButton(button, w, h, onClick, allowLocked)
        return button
    }
    private enableButton(container: Phaser.GameObjects.Container, w: number, h: number, onClick: () => void, allowLocked = false) {
        container.setSize(w, h)
        container.setInteractive(new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h), Phaser.Geom.Rectangle.Contains)
        if (container.input) container.input.cursor = 'pointer'
        container.on('pointerover', () => {
            if (!this.locked || allowLocked) this.tweens.add({ targets: container, scale: 1.035, duration: 100, ease: 'Sine.easeOut' })
        })
        container.on('pointerout', () => {
            this.tweens.add({ targets: container, scale: 1, duration: 100, ease: 'Sine.easeOut' })
        })
        container.on('pointerdown', () => {
            if (this.locked && !allowLocked) return
            this.tweens.add({ targets: container, scale: 0.96, duration: 60, yoyo: true })
            this.playClick()
            onClick()
        })
    }
    private fitImage(image: Phaser.GameObjects.Image, maxW: number, maxH: number) {
        const scale = Math.min(maxW / image.width, maxH / image.height)
        image.setScale(scale)
        return image
    }
    private drawFormatSymbol(g: Phaser.GameObjects.Graphics, id: FormatId, x: number, y: number, scale: number, color: number) {
        g.lineStyle(5 * scale, color, 1)
        g.fillStyle(color, 0.16)
        if (id === 'date') {
            g.fillRoundedRect(x - 42 * scale, y - 38 * scale, 84 * scale, 76 * scale, 10 * scale)
            g.strokeRoundedRect(x - 42 * scale, y - 38 * scale, 84 * scale, 76 * scale, 10 * scale)
            g.fillStyle(color, 1)
            g.fillRoundedRect(x - 42 * scale, y - 38 * scale, 84 * scale, 18 * scale, 9 * scale)
            g.fillStyle(color, 0.72)
            for (let i = 0; i < 3; i += 1) g.fillCircle(x - 22 * scale + i * 22 * scale, y + 8 * scale, 5 * scale)
            return
        }
        if (id === 'pixels') {
            for (let row = 0; row < 3; row += 1) {
                for (let col = 0; col < 3; col += 1) {
                    const colors = [C.red, C.blue, C.yellow, C.green, C.purple]
                    g.fillStyle(colors[(row * 3 + col) % colors.length], 0.92)
                    g.fillRoundedRect(x - 36 * scale + col * 28 * scale, y - 36 * scale + row * 28 * scale, 22 * scale, 22 * scale, 4 * scale)
                }
            }
            return
        }
        g.fillStyle(color, 0.18)
        g.fillRoundedRect(x - 46 * scale, y - 34 * scale, 92 * scale, 68 * scale, 12 * scale)
        g.strokeRoundedRect(x - 46 * scale, y - 34 * scale, 92 * scale, 68 * scale, 12 * scale)
        g.lineStyle(6 * scale, color, 0.8)
        g.lineBetween(x - 26 * scale, y - 10 * scale, x + 26 * scale, y - 10 * scale)
        g.lineBetween(x - 26 * scale, y + 12 * scale, x + 12 * scale, y + 12 * scale)
    }
    private drawPieceSymbol(g: Phaser.GameObjects.Graphics, piece: DataPiece, x: number, y: number, scale: number) {
        if (piece.visual === 'paint') {
            g.fillStyle(piece.color, 1)
            g.fillCircle(x, y, 35 * scale)
            g.fillStyle(C.white, 0.28)
            g.fillCircle(x - 12 * scale, y - 13 * scale, 11 * scale)
            return
        }
        if (piece.visual === 'calendar') {
            g.fillStyle(C.blue, 1)
            g.fillRoundedRect(x - 34 * scale, y - 30 * scale, 68 * scale, 60 * scale, 9 * scale)
            g.fillStyle(C.white, 1)
            g.fillRoundedRect(x - 26 * scale, y - 8 * scale, 52 * scale, 28 * scale, 6 * scale)
            return
        }
        if (piece.visual === 'place') {
            g.fillStyle(piece.color, 1)
            g.fillTriangle(x, y - 34 * scale, x - 36 * scale, y + 4 * scale, x + 36 * scale, y + 4 * scale)
            g.fillRoundedRect(x - 25 * scale, y, 50 * scale, 34 * scale, 7 * scale)
            return
        }
        if (piece.visual === 'star') {
            g.fillStyle(piece.color, 1)
            const points: Phaser.Geom.Point[] = []
            for (let i = 0; i < 10; i += 1) {
                const a = -Math.PI / 2 + i * Math.PI / 5
                const r = (i % 2 === 0 ? 37 : 16) * scale
                points.push(new Phaser.Geom.Point(x + Math.cos(a) * r, y + Math.sin(a) * r))
            }
            g.fillPoints(points, true)
            return
        }
        g.fillStyle(piece.color, 1)
        g.fillRoundedRect(x - 35 * scale, y - 35 * scale, 70 * scale, 70 * scale, 12 * scale)
    }
    private getAudioCtx(): AudioContext | null {
        if (this.isMuted) return null
        try {
            return (this.sound as Phaser.Sound.WebAudioSoundManager).context
        } catch {
            return null
        }
    }
    private playTone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
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
    private playClick() { this.playTone(480, 0.045, 'triangle', 0.055) }
    private playDrop() { this.playTone(620, 0.07, 'sine', 0.07) }
    private playCorrect() {
        this.playTone(620, 0.08, 'triangle', 0.1)
        this.time.delayedCall(90, () => this.playTone(820, 0.11, 'sine', 0.08))
    }
    private playError() { this.playTone(190, 0.16, 'square', 0.08) }
}
type FXTarget = Phaser.GameObjects.GameObject &
    Phaser.GameObjects.Components.Transform &
    Phaser.GameObjects.Components.AlphaSingle &
    Phaser.GameObjects.Components.Depth
function paintSlot(g: Phaser.GameObjects.Graphics, w: number, h: number, color: number, state: SlotPaintState) {
    const border = state === 'success' ? C.green : state === 'warning' ? C.red : state === 'hover' ? C.yellow : color
    const fill = state === 'empty' ? 0xeaf4ff : state === 'warning' ? 0xffeeee : state === 'success' ? 0xedffe9 : 0xffffff
    g.clear()
    g.fillStyle(C.shadow, 0.11)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 20)
    g.fillStyle(fill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
    g.fillStyle(border, state === 'empty' ? 0.12 : 0.2)
    g.fillRoundedRect(-w / 2 + 12, -h / 2 + 10, w - 24, 20, 10)
    g.lineStyle(state === 'hover' ? 6 : 4, border, state === 'empty' ? 0.55 : 0.95)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
}
function shade(color: number, amount: number) {
    return Phaser.Display.Color.ValueToColor(color).darken(amount).color
}
function hex(color: number) {
    return `#${color.toString(16).padStart(6, '0')}`
}
function labelSize(label: string) {
    if (label.length > 10) return '13px'
    if (label.length > 7) return '15px'
    return '17px'
}
