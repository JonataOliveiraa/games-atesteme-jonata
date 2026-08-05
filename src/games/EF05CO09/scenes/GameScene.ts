import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { FIELDS, LICENSE_LABEL, KIND_LABEL, SEAL_LABEL } from '../data/media'
import { C, A, SEAL_COLOR, SEAL_SOFT, hex } from '../data/theme'
import { W, H, PANEL, EASEL, TAG, SHEET, MURAL, MASCOTE } from '../data/layout'
import type {
    CreditOption,
    FichaPhase,
    FieldId,
    LevelConfig,
    MediaItem,
    MediaKind,
    MuralPhase,
    PhaseConfig,
    SealId,
} from '../types'

const GAME_ID = 'curadoria-com-creditos'

const SEAL_RANK: Record<SealId, number> = { verde: 0, amarelo: 1, vermelho: 2 }
const SEAL_POINTS: Record<SealId, number> = { verde: 15, amarelo: 8, vermelho: 0 }

interface SlotView {
    x: number
    y: number
    refresh: () => void
}

interface FrameView {
    container: Phaser.GameObjects.Container
    refresh: () => void
    x: number
    y: number
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private credits: Record<string, Partial<Record<FieldId, CreditOption>>> = {}
    private seals: Record<string, SealId> = {}

    private slotViews = new Map<FieldId, SlotView>()
    private frameViews = new Map<string, FrameView>()
    private stampPaint?: (c: number) => void
    private publishPaint?: (c: number) => void
    private statusText?: Phaser.GameObjects.Text
    private sealMount?: Phaser.GameObjects.Container
    private easelBody?: Phaser.GameObjects.Container
    private benchLayer?: Phaser.GameObjects.Container
    private sheetLayer?: Phaser.GameObjects.Container

    private tutorialKey = ''
    private tutorialSteps: TutorialStep[] = []

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false
        this.credits = {}
        this.seals = {}
        this.slotViews = new Map()
        this.frameViews = new Map()
        this.stampPaint = undefined
        this.publishPaint = undefined
        this.statusText = undefined
        this.sealMount = undefined
        this.easelBody = undefined
        this.benchLayer = undefined
        this.sheetLayer = undefined
        this.tutorialSteps = []
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        if (this.levelIdx === 0 && this.phaseIdx === 0) this.resetTally()

        this.drawBackground()

        const p = this.phase
        if (p.kind === 'ficha') this.buildFicha(p)
        else this.buildMural(p)

        this.publishHud()
        this.time.delayedCall(0, () => this.publishHud())
        EventBus.once('ui-ready', () => this.publishHud())
        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID, stage: this.level.level })

        EventBus.on('spool-end', this.onTimeUp, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('spool-end', this.onTimeUp, this)
            EventBus.off('show-tutorial', this.replayTutorial, this)
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-portfolio').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) EventBus.emit('spool-start', this.level.timeLimit)
    }

    private buildFicha(p: FichaPhase) {
        this.benchLayer = this.buildBench(p.item, p.fields, seal => {
            this.seals[p.item.id] = seal
            this.bumpTally(seal)
            this.showVerdict(p.item, p.fields, seal, retry => {
                if (retry) {
                    this.dropTally(seal)
                    this.retryItem(p.item)
                    return
                }
                this.resolveFicha(p.item, seal)
            })
        })
    }

    private retryItem(item: MediaItem) {
        this.credits[item.id] = {}
        delete this.seals[item.id]
        this.benchLayer?.destroy()
        this.slotViews.clear()

        const p = this.phase
        if (p.kind === 'ficha') this.buildFicha(p)
        this.locked = false
    }

    private resolveFicha(item: MediaItem, seal: SealId) {
        const earned = SEAL_POINTS[seal]
        this.points += earned

        runtimeGameBridge.emit({
            type: seal === 'verde' ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.completePhase()
    }

    private buildBench(item: MediaItem, fields: FieldId[], onStamped: (seal: SealId) => void) {
        const layer = this.add.container(0, 0)

        layer.add(this.boardGraphics(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 28, C.panelSoft))
        layer.add(this.buildEasel(item))
        layer.add(this.buildString())
        layer.add(this.buildTag(item, fields))

        const stamp = this.button(TAG.cx, TAG.stampY, TAG.stampW, TAG.stampH, 'CARIMBAR', C.grey, () => {
            if (!this.allFilled(item, fields)) return
            this.locked = true
            const seal = this.computeSeal(item, fields)
            this.playStamp(seal, () => onStamped(seal))
        }, '24px')

        this.stampPaint = stamp.getData('paint') as (c: number) => void
        layer.add(stamp)
        this.refreshStamp(item, fields)

        return layer
    }

    private buildEasel(item: MediaItem) {
        const easel = this.add.container(EASEL.cx, EASEL.cy).setAngle(EASEL.tilt)
        this.easelBody = easel

        const hw = EASEL.w / 2
        const hh = EASEL.h / 2

        const legs = this.add.graphics()
        legs.fillStyle(C.easelDark, 1)
        legs.fillRoundedRect(-hw + 30, hh - 16, 22, 44, 8)
        legs.fillRoundedRect(hw - 52, hh - 16, 22, 44, 8)
        legs.fillStyle(C.easel, 1)
        legs.fillRoundedRect(-hw + 12, hh - 26, EASEL.w - 24, 26, 10)

        const wood = this.add.graphics()
        wood.fillStyle(C.shadow, A.shadow)
        wood.fillRoundedRect(-hw + 5, -hh + 12, EASEL.w, EASEL.h - 30, 22)
        wood.fillStyle(C.easel, 1)
        wood.fillRoundedRect(-hw, -hh, EASEL.w, EASEL.h - 30, 22)
        wood.fillStyle(C.easelDark, 0.5)
        wood.fillRoundedRect(-hw + 8, -hh + 8, EASEL.w - 16, EASEL.h - 46, 18)
        wood.fillStyle(C.panel, 1)
        wood.fillRoundedRect(-hw + 16, -hh + 16, EASEL.w - 32, EASEL.h - 62, 14)

        const kindPill = this.add.graphics()
        const kindText = this.add.text(0, EASEL.kindDy, KIND_LABEL[item.kind], {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)

        const pw = kindText.width + 76
        kindPill.fillStyle(C.blueDark, 1)
        kindPill.fillRoundedRect(-pw / 2, EASEL.kindDy - 18, pw, 36, 18)
        kindPill.fillStyle(C.white, 0.18)
        kindPill.fillRoundedRect(-pw / 2 + 6, EASEL.kindDy - 13, pw - 12, 12, 6)
        kindText.setX(14)

        const kindIcon = this.add.graphics()
        this.drawKindIcon(kindIcon, item.kind, -pw / 2 + 28, EASEL.kindDy, 15, C.white)

        const frame = this.add.graphics()
        frame.fillStyle(C.greySoft, 1)
        frame.fillRoundedRect(-EASEL.thumbBox / 2, EASEL.thumbDy - EASEL.thumbBox / 2, EASEL.thumbBox, EASEL.thumbBox, 16)
        frame.lineStyle(3, C.border, 1)
        frame.strokeRoundedRect(-EASEL.thumbBox / 2, EASEL.thumbDy - EASEL.thumbBox / 2, EASEL.thumbBox, EASEL.thumbBox, 16)

        const thumb = this.fitImage(item.thumb, 0, EASEL.thumbDy, EASEL.thumbBox - 18, EASEL.thumbBox - 18)

        const half = EASEL.thumbBox / 2
        const zoomBadge = this.add.graphics()
        zoomBadge.fillStyle(C.shadow, 0.25)
        zoomBadge.fillCircle(half - 22, EASEL.thumbDy + half - 18, 21)
        zoomBadge.fillStyle(C.blueDark, 1)
        zoomBadge.fillCircle(half - 24, EASEL.thumbDy + half - 22, 21)
        zoomBadge.fillStyle(C.white, 0.22)
        zoomBadge.fillEllipse(half - 24, EASEL.thumbDy + half - 30, 26, 11)
        this.drawZoomIcon(zoomBadge, half - 24, EASEL.thumbDy + half - 22, 13, C.white)

        const zoom = this.add.zone(0, EASEL.thumbDy, EASEL.thumbBox, EASEL.thumbBox)
            .setInteractive({ useHandCursor: true })
        zoom.on('pointerdown', () => {
            if (this.sheetLayer) return
            this.tweens.add({ targets: thumb, scale: thumb.scale * 0.95, duration: 80, yoyo: true })
            this.openLightbox(item)
        })

        const title = this.add.text(0, EASEL.titleDy, item.title, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 336 },
        }).setOrigin(0.5).setResolution(2)

        const origin = this.add.text(0, EASEL.originDy - 10, item.origin, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: 330 },
        }).setOrigin(0.5).setResolution(2)

        this.sealMount = this.add.container(EASEL.sealDx, EASEL.sealDy)

        easel.add([legs, wood, frame, thumb, zoomBadge, zoom, title, origin, kindPill, kindIcon, kindText, this.sealMount])
        return easel
    }

    private buildString() {
        const g = this.add.graphics()
        const from = new Phaser.Math.Vector2(EASEL.cx + EASEL.w / 2 - 24, EASEL.cy - 130)
        const to = new Phaser.Math.Vector2(TAG.holeX, TAG.holeY)
        const curve = new Phaser.Curves.QuadraticBezier(
            from,
            new Phaser.Math.Vector2((from.x + to.x) / 2, Math.max(from.y, to.y) + 46),
            to,
        )

        g.lineStyle(5, C.string, 0.9)
        curve.draw(g, 48)
        g.fillStyle(C.string, 1)
        g.fillCircle(from.x, from.y, 6)
        return g
    }

    private buildTag(item: MediaItem, fields: FieldId[]) {
        const layer = this.add.container(0, 0)
        const paper = this.add.graphics()

        paper.fillStyle(C.shadow, A.shadow)
        paper.fillRoundedRect(TAG.x + 5, TAG.y + 12, TAG.w, TAG.h, 22)
        paper.fillStyle(C.paper, 1)
        paper.fillRoundedRect(TAG.x, TAG.y, TAG.w, TAG.h, 22)
        paper.lineStyle(3, C.paperEdge, 1)
        paper.strokeRoundedRect(TAG.x, TAG.y, TAG.w, TAG.h, 22)

        paper.fillStyle(C.panelSoft, 1)
        for (let y = TAG.y + 40; y < TAG.y + TAG.h - 20; y += 26) {
            paper.fillCircle(TAG.x, y, 7)
        }

        paper.lineStyle(2, C.paperLine, 0.45)
        for (let y = TAG.y + 292; y < TAG.y + TAG.h - 100; y += 26) {
            paper.lineBetween(TAG.x + 40, y, TAG.x + TAG.w - 40, y)
        }

        paper.fillStyle(C.panelSoft, 1)
        paper.fillCircle(TAG.holeX, TAG.holeY, 13)
        paper.lineStyle(3, C.paperEdge, 1)
        paper.strokeCircle(TAG.holeX, TAG.holeY, 13)

        const header = this.add.text(TAG.cx + 24, TAG.headerY, 'ETIQUETA DE CRÉDITO', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '23px',
            color: hex(C.easelDark),
        }).setOrigin(0.5).setResolution(2)

        const license = this.add.text(TAG.cx + 22, TAG.licenseY, LICENSE_LABEL[item.license], {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        const lw = license.width + 78
        const licenseBg = this.add.graphics()
        licenseBg.fillStyle(C.panel, 1)
        licenseBg.fillRoundedRect(TAG.cx + 22 - lw / 2, TAG.licenseY - 21, lw, 42, 21)
        licenseBg.lineStyle(3, C.blue, 1)
        licenseBg.strokeRoundedRect(TAG.cx + 22 - lw / 2, TAG.licenseY - 21, lw, 42, 21)

        const lock = this.add.graphics()
        this.drawLockIcon(lock, TAG.cx + 12 - lw / 2 + 30, TAG.licenseY, 15, C.blue)

        layer.add([paper, header, licenseBg, lock, license])

        const firstY = TAG.slotBlockCy - ((fields.length - 1) * TAG.slotGap) / 2
        fields.forEach((field, i) => {
            layer.add(this.buildSlot(item, field, TAG.cx, firstY + i * TAG.slotGap, fields))
        })

        return layer
    }

    private buildSlot(item: MediaItem, field: FieldId, cx: number, cy: number, fields: FieldId[]) {
        const def = FIELDS.find(f => f.id === field)!
        const w = TAG.slotW
        const h = TAG.slotH
        const slot = this.add.container(cx, cy)

        const g = this.add.graphics()
        const dots = this.add.graphics()

        const prefix = this.add.text(-w / 2 + 22, 0, def.prefix, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '21px',
            color: hex(C.easelDark),
        }).setOrigin(0, 0.5).setResolution(2)

        const value = this.add.text(-w / 2 + TAG.prefixDx + 18, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.ink),
            wordWrap: { width: w - TAG.prefixDx - 60 },
        }).setOrigin(0, 0.5).setResolution(2)

        const pulse = this.tweens.add({
            targets: dots,
            alpha: 0.35,
            duration: 620,
            yoyo: true,
            repeat: -1,
        })

        const refresh = () => {
            const chosen = this.credits[item.id]?.[field]
            g.clear()
            dots.clear()

            g.fillStyle(chosen ? C.white : C.paperEdge, chosen ? 1 : 0.4)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 16)
            g.lineStyle(3, chosen ? C.green : C.paperEdge, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 16)

            if (chosen) {
                pulse.pause()
                dots.setAlpha(1)
                value.setText(chosen.chip)
                value.setColor(hex(C.ink))
                dots.fillStyle(C.green, 1)
                dots.fillCircle(w / 2 - 30, 0, 13)
                dots.lineStyle(4, C.white, 1)
                dots.beginPath()
                dots.moveTo(w / 2 - 36, 0)
                dots.lineTo(w / 2 - 31, 6)
                dots.lineTo(w / 2 - 23, -6)
                dots.strokePath()
            } else {
                pulse.resume()
                value.setText('toque para preencher')
                value.setColor(hex(C.inkSoft))
                dots.fillStyle(C.easelDark, 0.8)
                const x0 = -w / 2 + TAG.prefixDx + 14
                for (let x = x0; x < w / 2 - 26; x += 16) dots.fillCircle(x, 22, 3)
            }

            this.refreshStamp(item, fields)
        }

        slot.add([g, dots, prefix, value])
        slot.setSize(w, h)
        slot.setInteractive({ useHandCursor: true })
        slot.on('pointerdown', () => {
            if (this.locked || this.sheetLayer) return
            this.tweens.add({ targets: slot, scale: 0.98, duration: 70, yoyo: true })
            this.openSheet(item, field)
        })

        this.slotViews.set(field, { x: cx, y: cy, refresh })
        refresh()
        return slot
    }

    private openSheet(item: MediaItem, field: FieldId) {
        const def = FIELDS.find(f => f.id === field)!
        const layer = this.add.container(0, 0).setDepth(600)
        this.sheetLayer = layer

        const backdrop = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay).setInteractive()
        backdrop.on('pointerdown', () => this.closeSheet(layer))

        const sheet = this.add.container(0, 420)

        const sh = H - SHEET.y + 40
        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.24)
        bg.fillRoundedRect(SHEET.x, SHEET.y - 8, SHEET.w, sh, { tl: 34, tr: 34, bl: 0, br: 0 })
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(SHEET.x, SHEET.y, SHEET.w, sh, { tl: 34, tr: 34, bl: 0, br: 0 })
        bg.fillStyle(C.grey, 0.5)
        bg.fillRoundedRect(W / 2 - 46, SHEET.handleY - 4, 92, 8, 4)

        const question = this.add.text(W / 2, SHEET.questionY, def.question, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '27px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 860 },
        }).setOrigin(0.5).setResolution(2)

        const closeBtn = this.add.container(SHEET.x + SHEET.w - 52, SHEET.handleY + 26)
        const cg = this.add.graphics()
        cg.fillStyle(C.greySoft, 1)
        cg.fillCircle(0, 0, 22)
        cg.lineStyle(4, C.inkSoft, 1)
        cg.lineBetween(-8, -8, 8, 8)
        cg.lineBetween(8, -8, -8, 8)
        closeBtn.add(cg)
        closeBtn.setSize(52, 52)
        closeBtn.setInteractive({ useHandCursor: true })
        closeBtn.on('pointerdown', () => this.closeSheet(layer))

        sheet.add([bg, question, closeBtn])

        item.options[field].forEach((option, i) => {
            const y = SHEET.optionFirstY + i * SHEET.optionGap
            const row = this.optionRow(W / 2, y, option.label, () => {
                this.credits[item.id] = { ...(this.credits[item.id] ?? {}), [field]: option }
                this.closeSheet(layer)
                this.flyChip(option.chip, W / 2, y + 420, field)
            })
            sheet.add(row)
        })

        layer.add([backdrop, sheet])
        backdrop.setAlpha(0)
        this.tweens.add({ targets: backdrop, alpha: 1, duration: 180 })
        this.tweens.add({ targets: sheet, y: 0, duration: 300, ease: 'Cubic.easeOut' })
    }

    private closeSheet(layer: Phaser.GameObjects.Container) {
        this.sheetLayer = undefined
        this.tweens.add({
            targets: layer,
            alpha: 0,
            y: 60,
            duration: 180,
            onComplete: () => layer.destroy(),
        })
    }

    private optionRow(x: number, y: number, label: string, onClick: () => void) {
        const row = this.add.container(x, y)
        const g = this.add.graphics()
        const w = SHEET.optionW
        const h = SHEET.optionH

        g.fillStyle(C.panelSoft, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
        g.fillStyle(C.blue, 1)
        g.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, 10, h - 28, 5)

        const t = this.add.text(-w / 2 + 46, 0, label, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            wordWrap: { width: w - 80 },
        }).setOrigin(0, 0.5).setResolution(2)

        row.add([g, t])
        row.setSize(w, h)
        row.setInteractive({ useHandCursor: true })
        row.on('pointerdown', () => {
            this.tweens.add({ targets: row, scale: 0.97, duration: 70, yoyo: true })
            onClick()
        })
        return row
    }

    private flyChip(label: string, fromX: number, fromY: number, field: FieldId) {
        const slot = this.slotViews.get(field)
        if (!slot) return

        const chip = this.add.container(fromX, fromY).setDepth(650)
        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)
        const g = this.add.graphics()
        const cw = t.width + 44
        g.fillStyle(C.green, 1)
        g.fillRoundedRect(-cw / 2, -22, cw, 44, 22)
        g.fillStyle(C.white, 0.22)
        g.fillRoundedRect(-cw / 2 + 8, -17, cw - 16, 14, 7)
        chip.add([g, t])

        this.tweens.add({
            targets: chip,
            x: slot.x - 40,
            y: slot.y,
            scale: 0.72,
            angle: -6,
            duration: 430,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                chip.destroy()
                slot.refresh()
                this.tweens.add({ targets: [], duration: 1 })
            },
        })
    }

    private allFilled(item: MediaItem, fields: FieldId[]) {
        const filled = this.credits[item.id] ?? {}
        return fields.every(f => filled[f] !== undefined)
    }

    private refreshStamp(item: MediaItem, fields: FieldId[]) {
        if (!this.stampPaint) return
        this.stampPaint(this.allFilled(item, fields) ? C.green : C.grey)
    }

    private computeSeal(item: MediaItem, fields: FieldId[]): SealId {
        const filled = this.credits[item.id] ?? {}
        let worst: SealId = 'verde'
        fields.forEach(f => {
            const option = filled[f]
            if (option && SEAL_RANK[option.seal] > SEAL_RANK[worst]) worst = option.seal
        })
        return worst
    }

    private playStamp(seal: SealId, onDone: () => void) {
        const mount = this.sealMount
        if (!mount) {
            onDone()
            return
        }

        const wax = this.add.container(0, 0).setScale(3.4).setAlpha(0).setAngle(-42)
        const g = this.add.graphics()
        const r = EASEL.sealR

        g.fillStyle(C.shadow, 0.24)
        g.fillCircle(3, 6, r)
        g.fillStyle(SEAL_COLOR[seal], 1)
        g.fillCircle(0, 0, r)
        g.lineStyle(5, C.white, 0.9)
        g.strokeCircle(0, 0, r - 9)
        g.fillStyle(C.white, 0.2)
        g.fillEllipse(0, -r * 0.42, r * 1.1, r * 0.44)
        for (let i = 0; i < 14; i++) {
            const a = (Math.PI * 2 * i) / 14
            g.fillStyle(SEAL_COLOR[seal], 1)
            g.fillCircle(Math.cos(a) * r, Math.sin(a) * r, 7)
        }

        const label = this.add.text(0, 0, SEAL_LABEL[seal], {
            fontFamily: 'Arial Black, Arial',
            fontSize: '15px',
            color: hex(C.white),
            align: 'center',
            wordWrap: { width: r * 1.6 },
        }).setOrigin(0.5).setResolution(2)

        wax.add([g, label])
        mount.add(wax)

        this.tweens.add({
            targets: wax,
            scale: 1,
            alpha: 1,
            angle: -8,
            duration: 340,
            ease: 'Back.easeIn',
            onComplete: () => {
                this.cameras.main.shake(160, 0.006)
                EventBus.emit('seal-pulse')
                if (this.easelBody) {
                    this.tweens.add({
                        targets: this.easelBody,
                        angle: EASEL.tilt + 2.4,
                        duration: 90,
                        yoyo: true,
                        repeat: 1,
                    })
                }
                this.time.delayedCall(420, onDone)
            },
        })
    }

    private showVerdict(item: MediaItem, fields: FieldId[], seal: SealId, onDone: (retry: boolean) => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2 + 18).setDepth(701)

        const filled = this.credits[item.id] ?? {}
        const rows: Phaser.GameObjects.GameObject[] = []
        let cursor = 116

        fields.forEach(f => {
            const option = filled[f]
            if (!option) return
            const def = FIELDS.find(d => d.id === f)!
            const tone = SEAL_COLOR[option.seal]

            const head = this.add.text(-286, 0, `${def.prefix} ${option.chip}`, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '20px',
                color: hex(tone),
                wordWrap: { width: 560 },
            }).setOrigin(0, 0).setResolution(2)

            const why = this.add.text(-286, 0, option.why, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '18px',
                color: hex(C.ink),
                wordWrap: { width: 560 },
            }).setOrigin(0, 0).setResolution(2)

            const dot = this.add.graphics()
            dot.fillStyle(tone, 1)
            dot.fillCircle(-308, 10, 9)

            head.setY(cursor)
            why.setY(cursor + head.height + 4)
            dot.setY(cursor)

            cursor += head.height + why.height + 26
            rows.push(dot, head, why)
        })

        const note = this.add.text(-286, cursor + 4, item.greenNote, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            wordWrap: { width: 560 },
        }).setOrigin(0, 0).setResolution(2)
        cursor += note.height + 32

        const PH = cursor + 104
        const top = -PH / 2
        const shift = top

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-350, top + 12, 700, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-350, top, 700, PH, 28)
        bg.lineStyle(5, SEAL_COLOR[seal], 1)
        bg.strokeRoundedRect(-350, top, 700, PH, 28)
        bg.fillStyle(SEAL_COLOR[seal], 1)
        bg.fillRoundedRect(-170, top - 15, 340, 28, 14)

        const title = this.add.text(0, top + 58, SEAL_LABEL[seal], {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(SEAL_COLOR[seal]),
        }).setOrigin(0.5).setResolution(2);

        [...rows, note].forEach(o => {
            const obj = o as Phaser.GameObjects.Text
            obj.setY(obj.y + shift)
        })

        const finish = (retry: boolean) => {
            overlay.destroy()
            modal.destroy()
            onDone(retry)
        }

        const buttons: Phaser.GameObjects.Container[] = []
        if (seal === 'verde') {
            buttons.push(this.button(0, PH / 2 - 54, 300, 66, 'Continuar', C.green, () => finish(false), '22px', true))
        } else {
            buttons.push(this.button(-160, PH / 2 - 54, 300, 66, 'Refazer etiqueta', C.blue, () => finish(true), '20px', true))
            buttons.push(this.button(160, PH / 2 - 54, 300, 66, 'Continuar assim', C.grey, () => finish(false), '20px', true))
        }

        modal.add([bg, title, ...rows, note, ...buttons])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private buildMural(p: MuralPhase) {
        this.boardGraphics(PANEL.x, PANEL.y, PANEL.w, PANEL.h, 28, C.cork)

        const ribbon = this.add.graphics()
        ribbon.fillStyle(C.corkDark, 1)
        ribbon.fillRoundedRect(PANEL.x + 24, MURAL.ribbonY - 22, PANEL.w - 48, 46, 22)
        ribbon.fillStyle(C.white, 0.14)
        ribbon.fillRoundedRect(PANEL.x + 32, MURAL.ribbonY - 16, PANEL.w - 64, 14, 7)

        this.add.text(W / 2, MURAL.ribbonY, 'GALERIA DA TURMA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: hex(C.paper),
        }).setOrigin(0.5).setResolution(2)

        p.items.forEach((item, i) => {
            const x = MURAL.firstX + i * MURAL.gapX
            this.frameViews.set(item.id, this.buildFrame(item, x, p.fields, i))
        })

        this.statusText = this.add.text(W / 2, MURAL.statusY, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.paper),
            align: 'center',
            wordWrap: { width: 900 },
        }).setOrigin(0.5).setResolution(2)

        const publish = this.button(W / 2, MURAL.publishY, MURAL.publishW, MURAL.publishH, 'PUBLICAR GALERIA', C.grey, () => {
            if (!this.canPublish(p)) return
            this.locked = true
            this.playSweep(() => this.showReport(p))
        }, '24px')

        this.publishPaint = publish.getData('paint') as (c: number) => void
        this.refreshMural(p)
    }

    private buildFrame(item: MediaItem, x: number, fields: FieldId[], index: number): FrameView {
        const container = this.add.container(x, MURAL.slotCy)
        const w = MURAL.slotW
        const h = MURAL.slotH

        const nail = this.add.graphics()
        nail.fillStyle(C.corkDark, 1)
        nail.fillCircle(0, -h / 2 - 18, 7)
        nail.fillStyle(C.white, 0.4)
        nail.fillCircle(-2, -h / 2 - 20, 3)

        const g = this.add.graphics()
        const thumb = this.fitImage(item.thumb, 0, -22, w - 56, h - 128)
        const state = this.add.text(0, h / 2 - 34, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '16px',
            color: hex(C.white),
        }).setOrigin(0.5).setResolution(2)

        const refresh = () => {
            const seal = this.seals[item.id]
            const tone = seal ? SEAL_COLOR[seal] : C.grey

            g.clear()
            g.fillStyle(C.shadow, 0.26)
            g.fillRoundedRect(-w / 2 + 4, -h / 2 + 10, w, h, 14)
            g.fillStyle(C.easel, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
            g.fillStyle(C.easelDark, 0.55)
            g.fillRoundedRect(-w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 10)
            g.fillStyle(C.panel, 1)
            g.fillRoundedRect(-w / 2 + 18, -h / 2 + 18, w - 36, h - 72, 8)
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-w / 2 + 18, h / 2 - 50, w - 36, 34, 10)

            state.setText(seal ? SEAL_LABEL[seal] : 'SEM ETIQUETA')
        }

        container.add([nail, g, thumb, state])
        refresh()

        container.setSize(w, h + 40)
        container.setInteractive({ useHandCursor: true })
        container.on('pointerdown', () => {
            if (this.locked) return
            this.tweens.add({ targets: container, scale: 0.97, duration: 80, yoyo: true })
            this.openBench(item, fields)
        })

        container.setAngle(-8).setAlpha(0)
        this.tweens.add({
            targets: container,
            angle: 0,
            alpha: 1,
            duration: 520,
            delay: 120 * index,
            ease: 'Elastic.easeOut',
        })

        return { container, refresh, x, y: MURAL.slotCy }
    }

    private openBench(item: MediaItem, fields: FieldId[]) {
        this.locked = false
        this.slotViews.clear()
        this.credits[item.id] = {}

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.65).setDepth(180).setInteractive()
        const bench = this.buildBench(item, fields, seal => {
            const previous = this.seals[item.id]
            if (previous) this.dropTally(previous)
            this.seals[item.id] = seal
            this.bumpTally(seal)

            this.showVerdict(item, fields, seal, retry => {
                if (retry) {
                    this.dropTally(seal)
                    delete this.seals[item.id]
                    this.credits[item.id] = {}
                    bench.destroy()
                    overlay.destroy()
                    this.openBench(item, fields)
                    return
                }
                bench.destroy()
                overlay.destroy()
                this.slotViews.clear()
                this.stampPaint = undefined
                this.frameViews.get(item.id)?.refresh()
                const p = this.phase
                if (p.kind === 'mural') this.refreshMural(p)
                this.locked = false
            })
        })

        bench.setDepth(200)
        bench.setAlpha(0)
        this.tweens.add({ targets: bench, alpha: 1, duration: 220 })

        const back = this.button(150, 96, 168, 54, 'Voltar', C.blueDark, () => {
            bench.destroy()
            overlay.destroy()
            this.slotViews.clear()
            this.stampPaint = undefined
            this.locked = false
        }, '19px')
        back.setDepth(201)
        bench.add(back)
    }

    private canPublish(p: MuralPhase) {
        const all = p.items.every(i => this.seals[i.id] !== undefined)
        const clean = p.items.every(i => this.seals[i.id] !== 'vermelho')
        return all && clean
    }

    private refreshMural(p: MuralPhase) {
        const missing = p.items.filter(i => this.seals[i.id] === undefined).length
        const red = p.items.filter(i => this.seals[i.id] === 'vermelho').length

        if (this.statusText) {
            if (missing > 0) this.statusText.setText(`Faltam ${missing} quadro(s) para etiquetar.`)
            else if (red > 0) this.statusText.setText(`${red} quadro(s) com selo vermelho. Toque neles e refaça a etiqueta.`)
            else this.statusText.setText('Tudo em ordem. A galeria pode ser publicada!')
        }

        this.publishPaint?.(this.canPublish(p) ? C.green : C.grey)
    }

    private playSweep(onDone: () => void) {
        EventBus.emit('spool-stop')

        const beam = this.add.graphics().setDepth(240)
        beam.fillStyle(C.white, 0.55)
        beam.fillRect(0, PANEL.y, 120, PANEL.h)
        beam.x = PANEL.x - 140

        this.tweens.add({
            targets: beam,
            x: PANEL.x + PANEL.w + 40,
            duration: 760,
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                beam.destroy()
                onDone()
            },
        })

        this.frameViews.forEach((view, id) => {
            const index = [...this.frameViews.keys()].indexOf(id)
            this.tweens.add({
                targets: view.container,
                y: MURAL.slotCy - 16,
                duration: 220,
                delay: 140 * index,
                yoyo: true,
                ease: 'Quad.easeOut',
            })
        })
    }

    private showReport(p: MuralPhase) {
        const counts = { verde: 0, amarelo: 0, vermelho: 0, vazio: 0 }
        p.items.forEach(i => {
            const seal = this.seals[i.id]
            if (!seal) counts.vazio++
            else counts[seal]++
        })

        const earned = p.items.reduce((sum, i) => {
            const seal = this.seals[i.id]
            return sum + (seal ? SEAL_POINTS[seal] : 0)
        }, 0)
        this.points += earned

        const clean = counts.vermelho === 0 && counts.vazio === 0
        runtimeGameBridge.emit({
            type: clean ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(700).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(701)

        const lines = [
            `${counts.verde} mídia(s) com créditos completos`,
            `${counts.amarelo} mídia(s) que ainda pedem revisão`,
            counts.vermelho > 0 ? `${counts.vermelho} mídia(s) que não podiam ser publicadas` : '',
        ].filter(Boolean).join('\n')

        const body = this.add.text(0, 0, lines, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.ink),
            align: 'center',
            lineSpacing: 12,
        }).setOrigin(0.5).setResolution(2)

        const closing = this.add.text(0, 0, clean
            ? 'Sua galeria respeita quem criou cada mídia.'
            : 'Ainda dá para melhorar: cada obra tem alguém por trás dela.', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: 560 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + closing.height + 250
        const top = -PH / 2
        const tone = clean ? C.green : C.amber

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-330, top + 12, 660, PH, 28)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-330, top, 660, PH, 28)
        bg.lineStyle(5, tone, 1)
        bg.strokeRoundedRect(-330, top, 660, PH, 28)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-170, top - 15, 340, 28, 14)

        const title = this.add.text(0, top + 58, 'Galeria publicada', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 112 + body.height / 2)
        closing.setY(top + 128 + body.height + closing.height / 2)

        const btn = this.button(0, PH / 2 - 54, 300, 66, 'Ver resultado', C.blue, () => {
            overlay.destroy()
            modal.destroy()
            this.completePhase()
        }, '22px', true)

        modal.add([bg, title, body, closing, btn])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        const p = this.phase
        if (p.kind !== 'mural') return
        this.locked = true
        this.showReport(p)
    }

    private resetTally() {
        this.registry.set('tally', { verde: 0, amarelo: 0, vermelho: 0, total: 0 })
    }

    private bumpTally(seal: SealId) {
        const t = this.registry.get('tally') ?? { verde: 0, amarelo: 0, vermelho: 0, total: 0 }
        this.registry.set('tally', { ...t, [seal]: t[seal] + 1, total: t.total + 1 })
    }

    private dropTally(seal: SealId) {
        const t = this.registry.get('tally') ?? { verde: 0, amarelo: 0, vermelho: 0, total: 0 }
        this.registry.set('tally', {
            ...t,
            [seal]: Math.max(0, t[seal] - 1),
            total: Math.max(0, t.total - 1),
        })
    }

    private completePhase() {
        const isLastPhase = this.phaseIdx + 1 >= this.level.phases.length
        const isLastLevel = this.levelIdx + 1 >= LEVELS.length

        if (!isLastPhase) {
            this.scene.restart({ level: this.level.level, phase: this.phaseIdx + 1, points: this.points })
            return
        }

        if (!isLastLevel) {
            showLevelComplete(this, {
                subtitle: `Nível ${this.level.level} concluído`,
                message: LEVELS[this.levelIdx + 1].objective,
                accent: C.blue,
                overlayColor: C.shadow,
                titleColor: hex(C.blueDark),
                subtitleColor: hex(C.blue),
                progress: { total: LEVELS.length, current: this.level.level },
                autoAdvance: {
                    delay: 2300,
                    onComplete: () => this.scene.restart({
                        level: this.level.level + 1,
                        phase: 0,
                        points: this.points,
                    }),
                },
            })
            return
        }

        this.ended = true
        runtimeGameBridge.emit({ type: 'GAME_COMPLETED', gameId: GAME_ID, stage: this.level.level })
        runtimeGameBridge.emit({ type: 'FINISH_GAME', gameId: GAME_ID, stage: this.level.level })

        showLevelComplete(this, {
            title: 'Curadoria concluída!',
            subtitle: `${this.points} pontos`,
            message: 'Toda mídia tem autor, fonte e limites de uso. Agora você sabe registrar os três.',
            accent: C.green,
            overlayColor: C.shadow,
            titleColor: hex(C.blueDark),
            subtitleColor: hex(C.green),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(800).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(801)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 296
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-320, top + 12, 640, PH, 28)
        bg.fillStyle(C.paper, 1)
        bg.fillRoundedRect(-320, top, 640, PH, 28)
        bg.lineStyle(5, C.easel, 1)
        bg.strokeRoundedRect(-320, top, 640, PH, 28)
        bg.fillStyle(C.easel, 1)
        bg.fillRoundedRect(-150, top - 15, 300, 28, 14)

        const badge = this.add.text(0, top + 54, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: hex(C.easelDark),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 102, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '36px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 550 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 156 + objective.height / 2)

        const btn = this.button(0, PH / 2 - 56, 300, 68, 'Começar', C.green, () => {
            overlay.destroy()
            panel.destroy()
            onStart()
        }, '22px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
    }

    private runTutorial() {
        this.tutorialSteps = this.buildTutorialSteps()
        this.tutorialKey = `curadoria-l${this.level.level}`
        EventBus.emit('tutorial-ready')

        if (this.phaseIdx !== 0 || !this.tutorialSteps.length) {
            this.startPhase()
            return
        }

        createTutorial(this, {
            key: this.tutorialKey,
            accent: C.easel,
            safeTop: 130,
            steps: this.tutorialSteps,
            onFinish: () => this.startPhase(),
        })
    }

    private replayTutorial = () => {
        if (this.ended || !this.tutorialSteps.length) return
        const wasLocked = this.locked
        this.locked = true
        createTutorial(this, {
            key: this.tutorialKey,
            once: false,
            accent: C.easel,
            safeTop: 130,
            steps: this.tutorialSteps,
            onFinish: () => { this.locked = wasLocked },
        })
    }

    private buildTutorialSteps(): TutorialStep[] {
        if (this.level.level === 1) {
            return [
                {
                    text: 'A mídia fica no cavalete e a etiqueta de crédito fica pendurada ao lado.',
                    shape: 'rect', x: EASEL.cx, y: EASEL.cy, w: EASEL.w + 30, h: EASEL.h + 20,
                },
                {
                    text: 'Toque em cada lacuna pontilhada. Uma folha sobe por baixo com as opções.',
                    shape: 'rect', x: TAG.cx, y: TAG.slotBlockCy, w: TAG.slotW + 40, h: 200,
                },
                {
                    text: 'Com a etiqueta completa, o botão CARIMBAR acende e o selo desce na mídia.',
                    shape: 'rect', x: TAG.cx, y: TAG.stampY, w: TAG.stampW + 60, h: 110,
                },
            ]
        }

        if (this.level.level === 2) {
            return [
                {
                    text: 'Agora a etiqueta tem uma lacuna a mais: o uso da mídia.',
                    shape: 'rect', x: TAG.cx, y: TAG.slotBlockCy, w: TAG.slotW + 40, h: 280,
                },
                {
                    text: 'Leia a licença no alto da etiqueta antes de decidir. Ela diz o que é permitido.',
                    shape: 'rect', x: TAG.cx, y: TAG.licenseY, w: 520, h: 90,
                },
                {
                    text: 'Selo amarelo ou vermelho não é o fim: você pode refazer a etiqueta.',
                    shape: 'none', balloonY: 420,
                },
            ]
        }

        return [
            {
                text: 'Aqui estão quatro quadros do mural. Toque em um para abrir o cavalete dele.',
                shape: 'rect', x: W / 2, y: MURAL.slotCy, w: 1080, h: MURAL.slotH + 60,
            },
            {
                text: 'O botão PUBLICAR só acende quando todos estiverem etiquetados e sem selo vermelho.',
                shape: 'rect', x: W / 2, y: MURAL.publishY, w: MURAL.publishW + 60, h: 110,
            },
            {
                text: 'O barbante no alto marca o tempo. Quando ele acabar, a galeria é publicada como estiver.',
                shape: 'none', balloonY: 400,
            },
        ]
    }

    private publishHud() {
        this.registry.remove('hud')
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.phase.sub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private boardGraphics(x: number, y: number, w: number, h: number, r = 24, fill = C.panel) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 4, y + 10, w, h, r)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x, y, w, h, r)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(x, y, w, h, r)
        return g
    }

    private fitImage(key: string, x: number, y: number, boxW: number, boxH: number) {
        const img = this.add.image(x, y, key)
        img.setScale(Math.min(boxW / img.width, boxH / img.height))
        return img
    }

    private openLightbox(item: MediaItem) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.82)
            .setDepth(900).setInteractive()
        const box = this.add.container(W / 2, H / 2).setDepth(901)

        const bw = 760
        const bh = 600

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.3)
        bg.fillRoundedRect(-bw / 2 + 6, -bh / 2 + 14, bw, bh, 26)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-bw / 2, -bh / 2, bw, bh, 26)
        bg.lineStyle(5, C.easel, 1)
        bg.strokeRoundedRect(-bw / 2, -bh / 2, bw, bh, 26)
        bg.fillStyle(C.greySoft, 1)
        bg.fillRoundedRect(-bw / 2 + 22, -bh / 2 + 22, bw - 44, bh - 168, 18)

        const big = this.fitImage(item.thumb, 0, -bh / 2 + 22 + (bh - 168) / 2, bw - 68, bh - 192)

        const title = this.add.text(0, bh / 2 - 118, item.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: bw - 80 },
        }).setOrigin(0.5).setResolution(2)

        const origin = this.add.text(0, bh / 2 - 82, item.origin, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '18px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: bw - 80 },
        }).setOrigin(0.5).setResolution(2)

        const close = () => {
            this.tweens.add({
                targets: [box, overlay],
                alpha: 0,
                duration: 160,
                onComplete: () => { box.destroy(); overlay.destroy() },
            })
        }

        const btn = this.button(0, bh / 2 - 40, 240, 56, 'Fechar', C.blueDark, close, '20px', true)
        overlay.on('pointerdown', close)

        box.add([bg, big, title, origin, btn])
        box.setScale(0.9).setAlpha(0)
        overlay.setAlpha(0)
        this.tweens.add({ targets: overlay, alpha: 1, duration: 160 })
        this.tweens.add({ targets: box, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
    }

    private drawZoomIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number, color: number) {
        g.lineStyle(3, color, 1)
        g.strokeCircle(cx - s * 0.12, cy - s * 0.12, s * 0.46)
        g.lineBetween(cx + s * 0.2, cy + s * 0.2, cx + s * 0.6, cy + s * 0.6)
        g.lineBetween(cx - s * 0.38, cy - s * 0.12, cx + s * 0.14, cy - s * 0.12)
        g.lineBetween(cx - s * 0.12, cy - s * 0.38, cx - s * 0.12, cy + s * 0.14)
    }

    private drawKindIcon(g: Phaser.GameObjects.Graphics, kind: MediaKind, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (kind === 'imagem') {
            g.strokeRoundedRect(cx - s * 0.7, cy - s * 0.6, s * 1.4, s * 1.2, 3)
            g.fillTriangle(cx - s * 0.5, cy + s * 0.5, cx - s * 0.05, cy - s * 0.25, cx + s * 0.4, cy + s * 0.5)
            g.fillCircle(cx + s * 0.35, cy - s * 0.28, s * 0.16)
            return
        }

        if (kind === 'audio') {
            g.fillCircle(cx - s * 0.4, cy + s * 0.45, s * 0.28)
            g.fillCircle(cx + s * 0.45, cy + s * 0.2, s * 0.28)
            g.fillRect(cx - s * 0.2, cy - s * 0.7, s * 0.16, s * 1.2)
            g.fillRect(cx + s * 0.57, cy - s * 0.9, s * 0.16, s * 1.1)
            g.fillRect(cx - s * 0.2, cy - s * 0.9, s * 0.93, s * 0.22)
            return
        }

        if (kind === 'video') {
            g.strokeRoundedRect(cx - s * 0.75, cy - s * 0.55, s * 1.5, s * 1.1, 4)
            g.fillTriangle(cx - s * 0.18, cy - s * 0.3, cx - s * 0.18, cy + s * 0.3, cx + s * 0.32, cy)
            return
        }

        g.strokeRoundedRect(cx - s * 0.75, cy - s * 0.65, s * 1.5, s * 1.05, 6)
        g.fillTriangle(cx - s * 0.3, cy + s * 0.35, cx - s * 0.05, cy + s * 0.35, cx - s * 0.35, cy + s * 0.85)
    }

    private drawLockIcon(g: Phaser.GameObjects.Graphics, cx: number, cy: number, s: number, color: number) {
        g.lineStyle(3, color, 1)
        g.beginPath()
        g.arc(cx, cy - s * 0.2, s * 0.42, Math.PI, 0)
        g.strokePath()
        g.fillStyle(color, 1)
        g.fillRoundedRect(cx - s * 0.62, cy - s * 0.18, s * 1.24, s * 0.95, 4)
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
            g.fillStyle(C.shadow, 0.24)
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
        btn.setData('paint', paint)
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', () => {
            if (!ignoreLock && this.locked) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}