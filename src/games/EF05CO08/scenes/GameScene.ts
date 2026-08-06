import Phaser from 'phaser'
import { runtimeGameBridge } from '../../../shared/bridge/runtimeGameBridge'
import { EventBus } from '../../../shared/EventBus'
import { createTutorial, type TutorialStep } from '../../../shared/tutorial/createTutorial'
import { showLevelComplete } from '../../../shared/level/showLevelComplete'
import { LEVELS } from '../data/levels'
import { CRITERIA, TRUST_LABEL, TRUST_COLOR_KEY } from '../data/news'
import { C, A, hex } from '../data/theme'
import { W, H, CARD, SWIPE, SOLO, RADAR, CASEBOARD, MASCOTE } from '../data/layout'
import type {
    CasePhase,
    ComparePhase,
    CriterionId,
    InspectPhase,
    LevelConfig,
    NewsItem,
    PhaseConfig,
    TrustLevel,
} from '../types'

const GAME_ID = 'radar-de-confiabilidade'

const TRUST_FILL: Record<'green' | 'amber' | 'red', number> = {
    green: C.green,
    amber: C.amber,
    red: C.red,
}

type SignalState = 'neutral' | 'good' | 'bad'

interface PostGeom {
    headerCy: number
    imgCy: number
    imgH: number
    imgW: number
    pillCy: number
}

interface PostView {
    container: Phaser.GameObjects.Container
    reveal: () => void
    geom: PostGeom
}

interface TutorialSegment {
    key: string
    steps: TutorialStep[]
    before?: () => void
}

export class GameScene extends Phaser.Scene {
    private levelIdx = 0
    private phaseIdx = 0
    private points = 0
    private locked = true
    private ended = false

    private marks: Partial<Record<CriterionId, boolean>> = {}
    private criterionScore = 0
    private counterText?: Phaser.GameObjects.Text
    private seloPaints: Array<() => void> = []
    private tutorialQueue: TutorialSegment[] = []
    private inputBlocker?: Phaser.GameObjects.Rectangle
    private inputBlockedUntil = 0

    private track?: Phaser.GameObjects.Container
    private cards: PostView[] = []
    private items: NewsItem[] = []
    private index = 0
    private sliding = false
    private dragActive = false
    private dragMoved = false
    private dragStartX = 0
    private dragStartY = 0
    private dragBaseX = 0
    private paintDots: (i: number) => void = () => { }
    private setChooseLabel: (s: string) => void = () => { }
    private cardGeom?: PostGeom

    constructor() {
        super({ key: 'GameScene' })
    }

    init(data: { level?: number; phase?: number; points?: number }) {
        this.levelIdx = (data.level ?? 1) - 1
        this.phaseIdx = data.phase ?? 0
        this.points = data.points ?? 0
        this.locked = true
        this.ended = false
        this.marks = {}
        this.criterionScore = 0
        this.counterText = undefined
        this.seloPaints = []
        this.tutorialQueue = []
        this.track = undefined
        this.cards = []
        this.items = []
        this.index = 0
        this.sliding = false
        this.dragActive = false
        this.dragMoved = false
        this.cardGeom = undefined
        this.inputBlocker?.destroy()
        this.inputBlocker = undefined
        this.inputBlockedUntil = 0
    }

    private get level(): LevelConfig {
        return LEVELS[this.levelIdx]
    }

    private get phase(): PhaseConfig {
        return this.level.phases[this.phaseIdx]
    }

    create() {
        this.drawBackground()
        this.buildPhase()
        this.publishHud()

        runtimeGameBridge.emit({ type: 'GAME_READY', gameId: GAME_ID })

        EventBus.on('timer-end', this.onTimeUp, this)
        EventBus.on('show-tutorial', this.replayTutorial, this)
        this.events.once('shutdown', () => {
            EventBus.off('timer-end', this.onTimeUp, this)
            EventBus.off('show-tutorial', this.replayTutorial, this)
        })

        if (this.phaseIdx === 0) this.showLevelIntro(() => this.runTutorial())
        else this.runTutorial()
    }

    update() {
        if (!this.dragActive || !this.track) return
        const pointer = this.input.activePointer

        if (pointer.isDown) {
            const dx = pointer.x - this.dragStartX
            if (Math.abs(dx) > 12) this.dragMoved = true
            const min = SWIPE.cx - (this.cards.length - 1) * SWIPE.stride - 130
            const max = SWIPE.cx + 130
            this.track.x = Phaser.Math.Clamp(this.dragBaseX + dx, min, max)
            this.paintCarousel()
            return
        }

        this.dragActive = false

        if (!this.dragMoved) {
            this.handleCardTap(this.dragStartX, this.dragStartY)
            this.goTo(this.index)
            return
        }

        const d = this.track.x - this.trackTarget()
        if (d < -80) this.goTo(this.index + 1)
        else if (d > 80) this.goTo(this.index - 1)
        else this.goTo(this.index)
    }

    private drawBackground() {
        const bg = this.add.image(W / 2, H / 2, 'bg-feed').setDepth(-3)
        bg.setScale(Math.max(W / bg.width, H / bg.height))

        const veil = this.add.graphics().setDepth(-2)
        veil.fillStyle(C.sky, A.veil)
        veil.fillRect(0, 0, W, H)
    }

    private buildPhase() {
        const p = this.phase
        if (p.kind === 'comparar') this.buildCompare(p)
        if (p.kind === 'inspecionar') this.buildInspect(p)
        if (p.kind === 'caso') this.buildCase(p)
    }

    private startPhase() {
        this.locked = false
        if (this.level.timeLimit) EventBus.emit('timer-start', this.level.timeLimit)
    }

    private buildCompare(p: ComparePhase) {
        this.items = p.options
        const track = this.add.container(0, SWIPE.cy)
        this.track = track

        this.cards = p.options.map((item, i) => {
            const card = this.buildPost(item, SWIPE.w, SWIPE.h, false)
            card.container.x = i * SWIPE.stride
            track.add(card.container)
            return card
        })

        this.cardGeom = this.cards[0].geom

        const layer = this.add.rectangle(SWIPE.cx, SWIPE.cy, SWIPE.layerW, SWIPE.h, C.white, 0.001)
            .setDepth(5)
        layer.setInteractive({ useHandCursor: true })
        layer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            if (this.isInputBlocked() || this.locked || this.sliding || !this.track) return
            this.dragActive = true
            this.dragMoved = false
            this.dragStartX = pointer.x
            this.dragStartY = pointer.y
            this.dragBaseX = this.track.x
        })

        this.paintDots = this.buildDots(p.options.length)

        this.swapButton(() => this.goTo((this.index + 1) % this.cards.length))

        this.setChooseLabel = this.buildChooseBar(() => {
            this.locked = true
            this.dragActive = false
            this.cards.forEach(card => card.reveal())
            this.time.delayedCall(1500, () =>
                this.resolvePhase(p.options[this.index].id === p.correctId, p.explanation))
        })

        track.x = this.trackTarget()
        this.paintCarousel()
        this.paintDots(0)
        this.setChooseLabel(p.options[0].source)
    }

    private handleCardTap(x: number, y: number) {
        const geom = this.cards[this.index]?.geom
        if (!geom) return
        const cy = SWIPE.cy + geom.imgCy
        const inside = Math.abs(x - SWIPE.cx) <= geom.imgW / 2 && Math.abs(y - cy) <= geom.imgH / 2
        if (inside) this.openFullImage(this.items[this.index])
    }

    private trackTarget() {
        return SWIPE.cx - this.index * SWIPE.stride
    }

    private goTo(next: number) {
        if (!this.track) return
        this.index = Phaser.Math.Clamp(next, 0, this.cards.length - 1)
        this.sliding = true
        this.paintDots(this.index)
        if (this.items[this.index]) this.setChooseLabel(this.items[this.index].source)

        this.tweens.add({
            targets: this.track,
            x: this.trackTarget(),
            duration: 360,
            ease: 'Back.easeOut',
            onUpdate: () => this.paintCarousel(),
            onComplete: () => {
                this.sliding = false
                this.paintCarousel()
            },
        })
    }

    private paintCarousel() {
        if (!this.track) return
        this.cards.forEach(card => {
            const worldX = this.track!.x + card.container.x
            const d = Phaser.Math.Clamp(Math.abs(worldX - SWIPE.cx) / SWIPE.stride, 0, 1)
            card.container.setScale(1 - 0.14 * d)
            card.container.setAlpha(1 - 0.55 * d)
            card.container.setRotation(((worldX - SWIPE.cx) / SWIPE.stride) * 0.05)
        })
    }

    private buildDots(count: number) {
        const g = this.add.graphics()
        const gap = 32
        const startX = SWIPE.cx - ((count - 1) * gap) / 2

        const paint = (active: number) => {
            g.clear()
            for (let i = 0; i < count; i++) {
                const x = startX + i * gap
                if (i === active) {
                    g.fillStyle(C.blue, 1)
                    g.fillRoundedRect(x - 16, SWIPE.dotsY - 8, 32, 16, 8)
                } else {
                    g.fillStyle(C.grey, 0.6)
                    g.fillCircle(x, SWIPE.dotsY, 8)
                }
            }
        }

        for (let i = 0; i < count; i++) {
            const x = startX + i * gap
            const zone = this.add.rectangle(x, SWIPE.dotsY, 36, 44, C.white, 0.001)
            zone.setInteractive({ useHandCursor: true })
            zone.on('pointerup', () => {
                if (this.isInputBlocked() || this.locked || this.sliding) return
                this.goTo(i)
            })
        }

        paint(0)
        return paint
    }

    private swapButton(onClick: () => void) {
        const w = SWIPE.swapW
        const h = SWIPE.swapH
        const btn = this.add.container(SWIPE.swapX, SWIPE.rowY)
        const g = this.add.graphics()

        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(C.blue, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)

        g.lineStyle(5, C.white, 1)
        g.beginPath()
        g.arc(-w / 2 + 42, 0, 13, Phaser.Math.DegToRad(40), Phaser.Math.DegToRad(300))
        g.strokePath()
        g.fillStyle(C.white, 1)
        g.fillTriangle(-w / 2 + 52, -16, -w / 2 + 62, -4, -w / 2 + 48, -2)

        const t = this.add.text(16, 0, 'Ver a outra postagem', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 90 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerup', () => {
            if (this.isInputBlocked() || this.locked || this.sliding) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 80, yoyo: true })
            onClick()
        })

        return btn
    }

    private buildChooseBar(onClick: () => void) {
        const w = SWIPE.chooseW
        const h = SWIPE.chooseH
        const bar = this.add.container(SWIPE.chooseX, SWIPE.rowY)
        const g = this.add.graphics()

        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
        g.fillStyle(C.green, 1)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.fillStyle(C.white, A.gloss)
        g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)
        g.fillStyle(C.white, 1)
        g.fillCircle(-w / 2 + 42, 0, 18)
        g.lineStyle(5, C.green, 1)
        g.lineBetween(-w / 2 + 34, 0, -w / 2 + 40, 8)
        g.lineBetween(-w / 2 + 40, 8, -w / 2 + 52, -8)

        const t = this.add.text(20, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '20px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 110 },
        }).setOrigin(0.5).setResolution(2)

        bar.add([g, t])
        bar.setSize(w, h)
        bar.setInteractive({ useHandCursor: true })
        bar.on('pointerup', () => {
            if (this.isInputBlocked() || this.locked || this.sliding) return
            this.tweens.add({ targets: bar, scale: 0.96, duration: 80, yoyo: true })
            onClick()
        })

        return (source: string) => t.setText(`Confio nesta: ${source}`)
    }

    private buildInspect(p: InspectPhase) {
        const post = this.buildPost(p.item, SOLO.w, SOLO.h, true)
        post.container.setPosition(SOLO.cx, SOLO.cy)
        this.cardGeom = post.geom

        this.card(RADAR.x, RADAR.y, RADAR.w, RADAR.h, 26, C.panel)

        this.add.text(RADAR.cx, RADAR.headerY, 'RADAR DE CONFIANÇA', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        this.counterText = this.add.text(RADAR.cx, RADAR.counterY, '', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '21px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)
        this.updateCounter()

        CRITERIA.forEach((def, i) => this.buildCriterionRow(p.item, def.id, i))

        this.add.text(RADAR.cx, RADAR.seloLabelY, 'Que selo você dá para esta postagem?', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        const xs = [RADAR.cx - 148, RADAR.cx + 148]
        p.options.forEach((trust, i) => {
            const btn = this.button(xs[i], RADAR.seloY, 282, 64, TRUST_LABEL[trust], C.grey, () => {
                if (Object.keys(this.marks).length < CRITERIA.length) return
                this.locked = true
                this.resolvePhase(trust === p.answer, p.explanation)
            }, '24px')

            const paint = btn.getData('paint') as (c: number) => void
            this.seloPaints.push(() => {
                const ready = Object.keys(this.marks).length >= CRITERIA.length
                paint(ready ? TRUST_FILL[TRUST_COLOR_KEY[trust]] : C.grey)
            })
        })
    }

    private buildCase(p: CasePhase) {
        const post = this.buildPost(p.item, SOLO.w, SOLO.h, true)
        post.container.setPosition(SOLO.cx, SOLO.cy)
        this.cardGeom = post.geom

        this.card(RADAR.x, RADAR.y, RADAR.w, RADAR.h, 26, C.panel)

        this.add.text(RADAR.cx, CASEBOARD.headerY, 'SINAIS DA PUBLICAÇÃO', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '30px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        CRITERIA.forEach((def, i) => {
            const y = CASEBOARD.rowFirstY + i * CASEBOARD.rowGap
            const w = CASEBOARD.rowW
            const h = CASEBOARD.rowH
            const row = this.add.container(RADAR.cx, y)

            const g = this.add.graphics()
            g.fillStyle(C.panelSoft, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.lineStyle(2, C.border, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.fillStyle(C.white, 1)
            g.fillCircle(-w / 2 + 50, 0, 26)
            g.lineStyle(3, C.blue, 1)
            g.strokeCircle(-w / 2 + 50, 0, 26)

            const icon = this.add.graphics()
            this.drawIcon(icon, def.id, -w / 2 + 50, 0, 22, C.blue)

            const label = this.add.text(-w / 2 + 92, -17, def.name, {
                fontFamily: 'Arial Black, Arial',
                fontSize: '21px',
                color: hex(C.blueDark),
            }).setOrigin(0, 0.5).setResolution(2)

            const chip = this.add.text(-w / 2 + 92, 14, p.item.signals[def.id].chip, {
                fontFamily: 'Arial',
                fontStyle: 'bold',
                fontSize: '19px',
                color: hex(C.ink),
                wordWrap: { width: w - 120 },
            }).setOrigin(0, 0.5).setResolution(2)

            row.add([g, icon, label, chip])
        })

        this.add.text(RADAR.cx, CASEBOARD.seloLabelY, 'Escolha o selo desta publicação', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.inkSoft),
        }).setOrigin(0.5).setResolution(2)

        const xs = [RADAR.cx - 190, RADAR.cx, RADAR.cx + 190]
        p.options.forEach((trust, i) => {
            this.button(xs[i], CASEBOARD.seloY, 180, 64, TRUST_LABEL[trust], TRUST_FILL[TRUST_COLOR_KEY[trust]], () => {
                this.locked = true
                this.openJustify(p, trust)
            }, '20px')
        })
    }

    private buildPost(item: NewsItem, w: number, h: number, tapImage: boolean): PostView {
        const c = this.add.container(0, 0)
        const lx = -w / 2
        const ty = -h / 2

        const shell = this.add.graphics()
        shell.fillStyle(C.shadow, A.shadow)
        shell.fillRoundedRect(lx + 4, ty + 10, w, h, 26)
        shell.fillStyle(C.panel, 1)
        shell.fillRoundedRect(lx, ty, w, h, 26)
        shell.lineStyle(3, C.border, 1)
        shell.strokeRoundedRect(lx, ty, w, h, 26)
        c.add(shell)

        const avatar = this.add.graphics()
        const paintAvatar = (tone: number) => {
            avatar.clear()
            avatar.fillStyle(tone, 1)
            avatar.fillCircle(lx + 56, ty + 52, CARD.avatarR)
            avatar.fillStyle(C.white, A.gloss)
            avatar.fillEllipse(lx + 56, ty + 41, 36, 15)
        }
        paintAvatar(C.blue)

        const initial = this.add.text(lx + 56, ty + 52, item.source.charAt(0).toUpperCase(), {
            fontFamily: 'Arial Black, Arial',
            fontSize: '29px',
            color: '#ffffff',
        }).setOrigin(0.5).setResolution(2)

        const source = this.add.text(lx + 102, ty + 40, item.source, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '22px',
            color: hex(C.ink),
            wordWrap: { width: w - 140 },
        }).setOrigin(0, 0.5).setResolution(2)

        const autoriaIcon = this.add.graphics()
        this.drawIcon(autoriaIcon, 'autoria', lx + 114, ty + 80, 13, C.inkSoft)

        const autoria = this.add.text(lx + 134, ty + 80, item.signals.autoria.chip, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
            wordWrap: { width: w - 176 },
        }).setOrigin(0, 0.5).setResolution(2)

        const dataIcon = this.add.graphics()
        this.drawIcon(dataIcon, 'data', lx + 114, ty + 106, 13, C.inkSoft)

        const dataText = this.add.text(lx + 134, ty + 106, item.signals.data.chip, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.inkSoft),
            wordWrap: { width: w - 176 },
        }).setOrigin(0, 0.5).setResolution(2)

        const divider = this.add.graphics()
        divider.lineStyle(2, C.border, 1)
        divider.lineBetween(lx + 18, ty + CARD.headerH, lx + w - 18, ty + CARD.headerH)

        c.add([avatar, initial, source, autoriaIcon, autoria, dataIcon, dataText, divider])

        const pillW = (w - CARD.padX * 2 - CARD.pillGap) / 2
        const pillCy = ty + h - CARD.padBottom - CARD.pillH / 2
        const actionsY = pillCy - CARD.pillH / 2 - CARD.gapActionsPills

        const fontePill = this.signalPill(lx + CARD.padX + pillW / 2, pillCy, pillW, CARD.pillH, 'fonte', item.signals.fonte.chip)
        const provasPill = this.signalPill(lx + CARD.padX + pillW + CARD.pillGap + pillW / 2, pillCy, pillW, CARD.pillH, 'provas', item.signals.provas.chip)
        c.add([fontePill.container, provasPill.container])

        const captionTop = ty + CARD.headerH + CARD.gapHeaderCaption
        const caption = this.add.text(0, captionTop, item.title, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: w - 52 },
        }).setOrigin(0.5, 0).setResolution(2)

        if (caption.height > CARD.captionMaxH) caption.setFontSize(21)
        if (caption.height > CARD.captionMaxH) caption.setFontSize(19)

        const imgTop = captionTop + caption.height + CARD.gapCaptionImg
        const imgH = Math.max(CARD.imgMinH, actionsY - CARD.gapImgActions - imgTop)
        const imgW = w - CARD.padX * 2
        const imgCy = imgTop + imgH / 2

        const frame = this.add.graphics()
        frame.fillStyle(C.greySoft, 1)
        frame.fillRoundedRect(lx + CARD.padX, imgTop, imgW, imgH, 20)
        frame.lineStyle(3, C.border, 1)
        frame.strokeRoundedRect(lx + CARD.padX, imgTop, imgW, imgH, 20)

        const photo = this.add.image(0, imgCy, item.thumb)
        photo.setScale(Math.min((imgW - 16) / photo.width, (imgH - 16) / photo.height))

        const badge = this.zoomBadge(lx + CARD.padX + imgW - 30, imgTop + imgH - 30)
        c.add([caption, frame, photo, badge])

        if (tapImage) {
            const hit = this.add.rectangle(0, imgCy, imgW, imgH, C.white, 0.001)
            hit.setInteractive({ useHandCursor: true })
            hit.on('pointerup', () => {
                if (this.isInputBlocked() || this.locked) return
                this.openFullImage(item)
            })
            c.add(hit)
        }

        const actions = this.drawSocialIcons(lx + 44, actionsY)
        const hint = this.add.text(lx + w - 22, actionsY, 'toque na foto para ampliar', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '16px',
            color: hex(C.inkSoft),
        }).setOrigin(1, 0.5).setResolution(2)
        c.add([actions, hint])

        const reveal = () => {
            const tone = (id: CriterionId) => item.signals[id].good ? C.green : C.red
            const state = (id: CriterionId): SignalState => item.signals[id].good ? 'good' : 'bad'

            fontePill.setState(state('fonte'))
            provasPill.setState(state('provas'))
            paintAvatar(tone('fonte'))

            autoria.setColor(hex(tone('autoria')))
            autoriaIcon.clear()
            this.drawIcon(autoriaIcon, 'autoria', lx + 114, ty + 80, 13, tone('autoria'))

            dataText.setColor(hex(tone('data')))
            dataIcon.clear()
            this.drawIcon(dataIcon, 'data', lx + 114, ty + 106, 13, tone('data'))
        }

        return {
            container: c,
            reveal,
            geom: { headerCy: ty + 64, imgCy, imgH, imgW, pillCy },
        }
    }

    private drawSocialIcons(x: number, y: number) {
        const g = this.add.graphics()
        g.lineStyle(3, C.grey, 1)

        g.beginPath()
        g.arc(x - 6, y - 3, 7, Phaser.Math.DegToRad(150), Phaser.Math.DegToRad(340))
        g.strokePath()
        g.beginPath()
        g.arc(x + 6, y - 3, 7, Phaser.Math.DegToRad(200), Phaser.Math.DegToRad(30))
        g.strokePath()
        g.lineBetween(x - 12, y + 1, x, y + 12)
        g.lineBetween(x + 12, y + 1, x, y + 12)

        g.strokeRoundedRect(x + 40, y - 12, 30, 22, 8)
        g.lineBetween(x + 48, y + 10, x + 54, y + 17)
        g.lineBetween(x + 54, y + 17, x + 58, y + 10)

        g.strokeCircle(x + 100, y - 8, 5)
        g.strokeCircle(x + 100, y + 8, 5)
        g.strokeCircle(x + 118, y, 5)
        g.lineBetween(x + 104, y - 6, x + 114, y - 2)
        g.lineBetween(x + 104, y + 6, x + 114, y + 2)

        return g
    }

    private signalPill(x: number, y: number, w: number, h: number, id: CriterionId, text: string) {
        const container = this.add.container(x, y)
        const g = this.add.graphics()
        const icon = this.add.graphics()
        const t = this.add.text(-w / 2 + 56, 0, text, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '17px',
            color: hex(C.ink),
            wordWrap: { width: w - 72 },
        }).setOrigin(0, 0.5).setResolution(2)

        const setState = (state: SignalState) => {
            const tone = state === 'good' ? C.green : state === 'bad' ? C.red : C.inkSoft
            const fill = state === 'good' ? C.greenSoft : state === 'bad' ? C.redSoft : C.panelSoft
            const line = state === 'neutral' ? C.border : tone

            g.clear()
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 18)
            g.lineStyle(2, line, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18)

            icon.clear()
            this.drawIcon(icon, id, -w / 2 + 30, 0, 18, tone)
            t.setColor(hex(state === 'neutral' ? C.ink : tone))
        }

        setState('neutral')
        container.add([g, icon, t])
        return { container, setState }
    }

    private zoomBadge(x: number, y: number) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, 0.22)
        g.fillCircle(x, y + 4, 23)
        g.fillStyle(C.blue, 1)
        g.fillCircle(x, y, 23)
        g.fillStyle(C.white, A.gloss)
        g.fillEllipse(x, y - 9, 28, 12)
        g.lineStyle(4, C.white, 1)
        g.strokeCircle(x - 3, y - 3, 9)
        g.lineBetween(x + 4, y + 4, x + 11, y + 11)
        return g
    }

    private openFullImage(item: NewsItem) {
        const layer = this.add.container(0, 0).setDepth(600)

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.88).setInteractive()
        const img = this.add.image(W / 2, 316, item.thumb)
        img.setScale(Math.min(1000 / img.width, 420 / img.height))

        const frame = this.add.graphics()
        frame.fillStyle(C.panel, 1)
        frame.fillRoundedRect(
            W / 2 - img.displayWidth / 2 - 16,
            316 - img.displayHeight / 2 - 16,
            img.displayWidth + 32,
            img.displayHeight + 32,
            24,
        )

        const caption = this.add.text(W / 2, 316 + img.displayHeight / 2 + 62, item.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '27px',
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: 920 },
        }).setOrigin(0.5).setResolution(2)

        const close = () => this.closeModalSafely(overlay, layer);

        overlay.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            close()
        });

        const btn = this.button(W / 2, 664, 300, 64, 'Fechar', C.blue, () => { }, '25px', true);
        btn.removeAllListeners('pointerdown');
        btn.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            if (this.isInputBlocked()) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            close()
        });

        layer.add([overlay, frame, img, caption, btn])
        layer.setAlpha(0)
        this.tweens.add({ targets: layer, alpha: 1, duration: 180 })
    }

    private buildCriterionRow(item: NewsItem, id: CriterionId, index: number) {
        const def = CRITERIA[index]
        const y = RADAR.rowFirstY + index * RADAR.rowGap
        const w = RADAR.rowW
        const h = RADAR.rowH

        const row = this.add.container(RADAR.cx, y)
        const g = this.add.graphics()
        const icon = this.add.graphics()

        const name = this.add.text(-w / 2 + 94, -16, def.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '23px',
            color: hex(C.ink),
        }).setOrigin(0, 0.5).setResolution(2)

        const hint = this.add.text(-w / 2 + 94, 15, 'Toque para investigar', {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '19px',
            color: hex(C.inkSoft),
            wordWrap: { width: w - 230 },
        }).setOrigin(0, 0.5).setResolution(2)

        const badgeBg = this.add.graphics()
        const badge = this.add.text(w / 2 - 26, 0, '', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '18px',
            color: '#ffffff',
        }).setOrigin(1, 0.5).setResolution(2).setDepth(1)

        const paint = () => {
            const mark = this.marks[id]
            const done = mark !== undefined
            const tone = !done ? C.grey : mark ? C.green : C.red
            const fill = !done ? C.greySoft : mark ? C.greenSoft : C.redSoft

            g.clear()
            g.fillStyle(fill, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.lineStyle(3, done ? tone : C.border, 1)
            g.strokeRoundedRect(-w / 2, -h / 2, w, h, 20)
            g.fillStyle(C.white, 1)
            g.fillCircle(-w / 2 + 52, 0, 27)
            g.lineStyle(3, tone, 1)
            g.strokeCircle(-w / 2 + 52, 0, 27)

            icon.clear()
            this.drawIcon(icon, id, -w / 2 + 52, 0, 23, tone)

            if (done) {
                badge.setText(mark ? 'BOM' : 'RUIM')
                hint.setText(item.signals[id].chip)
                hint.setColor(hex(tone))
            } else {
                badge.setText('VER')
            }

            badgeBg.clear()
            badgeBg.fillStyle(done ? tone : C.blue, 1)
            badgeBg.fillRoundedRect(w / 2 - 26 - badge.width - 24, -20, badge.width + 38, 40, 20)
        }

        row.add([g, icon, name, hint, badgeBg, badge])
        paint()
        row.setSize(w, h)
        row.setInteractive({ useHandCursor: true })
        row.on('pointerdown', () => {
            if (this.isInputBlocked() || this.locked || this.marks[id] !== undefined) return
            this.tweens.add({ targets: row, scale: 0.98, duration: 70, yoyo: true })
            this.openCriterion(item, id, () => {
                paint()
                this.updateCounter()
                this.seloPaints.forEach(fn => fn())
            })
        })
    }

    private openCriterion(item: NewsItem, id: CriterionId, onDone: () => void) {
        const def = CRITERIA.find(c => c.id === id)!
        const sig = item.signals[id]

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(300).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(301)

        const detail = this.add.text(0, 0, sig.detail, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '26px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)

        const PH = detail.height + 430
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-380, top + 12, 760, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-380, top, 760, PH, 30)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-380, top, 760, PH, 30)

        const iconBg = this.add.graphics()
        iconBg.fillStyle(C.greySoft, 1)
        iconBg.fillCircle(0, top + 70, 44)
        iconBg.lineStyle(3, C.blue, 1)
        iconBg.strokeCircle(0, top + 70, 44)
        const icon = this.add.graphics()
        this.drawIcon(icon, id, 0, top + 70, 34, C.blue)

        const name = this.add.text(0, top + 152, def.name, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '34px',
            color: hex(C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        const question = this.add.text(0, top + 198, def.question, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '23px',
            color: hex(C.inkSoft),
            align: 'center',
            wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)

        const box = this.add.graphics()
        box.fillStyle(C.panelSoft, 1)
        box.fillRoundedRect(-340, top + 232, 680, detail.height + 56, 22)
        box.lineStyle(2, C.border, 1)
        box.strokeRoundedRect(-340, top + 232, 680, detail.height + 56, 22)
        detail.setY(top + 232 + (detail.height + 56) / 2)

        const answer = (good: boolean) => {
            this.marks[id] = good;
            if (good === sig.good) this.criterionScore += 5;
            this.closeModalSafely(overlay, modal, onDone);
        };

        const btnY = PH / 2 - 66
        const okBtn = this.button(-172, btnY, 330, 80, 'Parece bom', C.green, () => answer(true), '26px', true)
        const noBtn = this.button(172, btnY, 330, 80, 'Não parece bom', C.red, () => answer(false), '26px', true)

        modal.add([bg, iconBg, icon, name, question, box, detail, okBtn, noBtn])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private openJustify(p: CasePhase, trust: TrustLevel) {
        EventBus.emit('timer-stop')

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(300).setInteractive()
        const modal = this.add.container(W / 2, H / 2).setDepth(301)

        const PH = 350
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-360, top + 12, 720, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-360, top, 720, PH, 30)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-360, top, 720, PH, 30)

        const title = this.add.text(0, top + 56, 'Qual sinal pesou mais na sua escolha?', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '27px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 620 },
        }).setOrigin(0.5).setResolution(2)

        const buttons = CRITERIA.map((def, i) => {
            const x = i % 2 === 0 ? -164 : 164;
            const y = top + (i < 2 ? 144 : 232);
            return this.button(x, y, 310, 76, def.name, C.blue, () => {
                const correct = trust === p.answer && def.id === p.justify;
                if (trust === p.answer && def.id !== p.justify) this.criterionScore += 5;
                this.closeModalSafely(overlay, modal, () => {
                    this.resolvePhase(
                        trust === p.answer,
                        correct
                            ? p.explanation
                            : `${p.explanation} O sinal que mais pesou aqui foi: ${CRITERIA.find(c => c.id === p.justify)!.name}.`
                    );
                });
            }, '22px', true);
        });

        modal.add([bg, title, ...buttons])
        modal.setScale(0.92).setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 220, ease: 'Back.easeOut' })
    }

    private updateCounter() {
        if (!this.counterText) return
        const done = Object.keys(this.marks).length
        this.counterText.setText(`${done} de ${CRITERIA.length} sinais checados`)
        this.counterText.setColor(hex(done >= CRITERIA.length ? C.green : C.inkSoft))
    }

    private resolvePhase(correct: boolean, message: string) {
        this.locked = true
        EventBus.emit('timer-stop')

        const earned = (correct ? 10 : 0) + this.criterionScore
        this.points += earned

        runtimeGameBridge.emit({
            type: correct ? 'CORRECT_ANSWER' : 'WRONG_ANSWER',
            gameId: GAME_ID,
            pointsEarned: earned,
            stage: this.level.level,
        })

        this.showFeedback(correct, message, () => this.completePhase())
    }

    private onTimeUp = () => {
        if (this.ended || this.locked) return
        this.locked = true
        this.resolvePhase(false, `O tempo acabou. ${this.phase.explanation}`)
    }

    private showFeedback(correct: boolean, message: string, onDone: () => void) {
        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(400).setInteractive()
        const modal = this.add.container(W / 2, H / 2 + 20).setDepth(401)

        const body = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '26px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 640 },
        }).setOrigin(0.5).setResolution(2)

        const PH = body.height + 274
        const top = -PH / 2
        const tone = correct ? C.green : C.amber

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-380, top + 12, 760, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-380, top, 760, PH, 30)
        bg.lineStyle(4, tone, 1)
        bg.strokeRoundedRect(-380, top, 760, PH, 30)
        bg.fillStyle(tone, 1)
        bg.fillRoundedRect(-170, top - 14, 340, 26, 13)

        const title = this.add.text(0, top + 58, correct ? 'Radar certeiro!' : 'Vamos olhar de novo', {
            fontFamily: 'Arial Black, Arial',
            fontSize: '38px',
            color: hex(correct ? C.green : C.blueDark),
        }).setOrigin(0.5).setResolution(2)

        body.setY(top + 114 + body.height / 2)
        const mascote = this.add.image(W / 2 - 348, H / 2 + 20 + top - 18, correct ? 'mascote-reacao' : 'mascote-normal')
            .setDisplaySize(MASCOTE, MASCOTE).setDepth(402)

        const btn = this.button(0, PH / 2 - 62, 330, 78, 'Continuar', C.blue, () => {
            this.closeModalSafely(overlay, modal, () => {
                mascote.destroy();
                onDone();
            });
        }, '25px', true);

        modal.add([bg, title, body, btn])
        modal.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: modal, alpha: 1, scale: 1, duration: 240, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 240 })
    }

    private isInputBlocked() {
        return this.inputBlocker?.active || this.time.now < this.inputBlockedUntil
    }

    private blockInput(ms = 320) {
        this.inputBlockedUntil = Math.max(this.inputBlockedUntil, this.time.now + ms)

        if (!this.inputBlocker?.active) {
            this.inputBlocker = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, 0.001)
                .setDepth(9999)
                .setInteractive()
            this.inputBlocker.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
            this.inputBlocker.on('pointerup', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => event.stopPropagation())
        }

        this.time.delayedCall(ms, () => {
            if (this.time.now < this.inputBlockedUntil) return
            this.inputBlocker?.destroy()
            this.inputBlocker = undefined
        })
    }
    private closeModalSafely(
        overlay: Phaser.GameObjects.Rectangle,
        modal: Phaser.GameObjects.Container,
        onClosed?: () => void
    ): void {
        this.blockInput()
        overlay.disableInteractive();
        modal.each((child: Phaser.GameObjects.GameObject) => {
            if ('disableInteractive' in child) {
                (child as Phaser.GameObjects.Container).disableInteractive();
            }
        });

        this.tweens.add({
            targets: [overlay, modal],
            alpha: 0,
            duration: 150,
        });

        this.time.delayedCall(80, () => {
            overlay.destroy();
            modal.destroy();
            onClosed?.();
        });
    }

    private showLevelIntro(onStart: () => void) {
        this.locked = true

        const overlay = this.add.rectangle(W / 2, H / 2, W, H, C.shadow, A.overlay)
            .setDepth(500).setInteractive()
        const panel = this.add.container(W / 2, H / 2).setDepth(501)

        const objective = this.add.text(0, 0, this.level.objective, {
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fontSize: '26px',
            color: hex(C.ink),
            align: 'center',
            wordWrap: { width: 610 },
        }).setOrigin(0.5).setResolution(2)

        const PH = objective.height + 316
        const top = -PH / 2

        const bg = this.add.graphics()
        bg.fillStyle(C.shadow, 0.22)
        bg.fillRoundedRect(-360, top + 12, 720, PH, 30)
        bg.fillStyle(C.panel, 1)
        bg.fillRoundedRect(-360, top, 720, PH, 30)
        bg.lineStyle(4, C.blue, 1)
        bg.strokeRoundedRect(-360, top, 720, PH, 30)
        bg.fillStyle(C.blue, 1)
        bg.fillRoundedRect(-160, top - 14, 320, 26, 13)

        const badge = this.add.text(0, top + 56, `NÍVEL ${this.level.level}`, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '24px',
            color: hex(C.blue),
        }).setOrigin(0.5).setResolution(2)

        const title = this.add.text(0, top + 110, this.level.title, {
            fontFamily: 'Arial Black, Arial',
            fontSize: '40px',
            color: hex(C.blueDark),
            align: 'center',
            wordWrap: { width: 600 },
        }).setOrigin(0.5).setResolution(2)

        objective.setY(top + 168 + objective.height / 2)

        const mascote = this.add.image(W / 2 - 330, H / 2 + top - 18, 'mascote-normal')
            .setDisplaySize(MASCOTE, MASCOTE).setDepth(502)

        const btn = this.button(0, PH / 2 - 62, 330, 78, 'Começar', C.blue, () => {
            this.closeModalSafely(overlay, panel, () => {
                mascote.destroy();
                onStart();
            });
        }, '25px', true)

        panel.add([bg, badge, title, objective, btn])
        panel.setScale(0.92).setAlpha(0)
        mascote.setAlpha(0)
        this.tweens.add({ targets: panel, alpha: 1, scale: 1, duration: 260, ease: 'Back.easeOut' })
        this.tweens.add({ targets: mascote, alpha: 1, duration: 260 })
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

        showLevelComplete(this, {
            title: 'Radar completo!',
            subtitle: `${this.points} pontos`,
            message: 'Agora você sabe olhar o perfil, quem escreveu, a data e as provas antes de acreditar.',
            accent: C.green,
            overlayColor: C.shadow,
            titleColor: hex(C.blueDark),
            subtitleColor: hex(C.green),
            progress: { total: LEVELS.length, current: LEVELS.length },
        })
    }

    private runTutorial() {
        this.tutorialQueue = this.buildTutorialQueue()
        EventBus.emit('tutorial-ready')

        if (this.phaseIdx !== 0 || !this.tutorialQueue.length) {
            this.startPhase()
            return
        }

        this.playTutorialQueue(true, () => this.startPhase())
    }

    private replayTutorial = () => {
        if (this.ended || !this.tutorialQueue.length) return
        const wasLocked = this.locked
        this.locked = true
        this.dragActive = false
        this.playTutorialQueue(false, () => { this.locked = wasLocked })
    }

    private playTutorialQueue(once: boolean, onDone: () => void) {
        const next = (i: number) => {
            if (i >= this.tutorialQueue.length) {
                onDone()
                return
            }
            const seg = this.tutorialQueue[i]
            const run = () => createTutorial(this, {
                key: seg.key,
                once,
                accent: C.blue,
                safeTop: 110,
                steps: seg.steps,
                onFinish: () => next(i + 1),
            })

            if (seg.before) {
                seg.before()
                this.time.delayedCall(420, run)
            } else {
                run()
            }
        }

        next(0)
    }

    private buildTutorialQueue(): TutorialSegment[] {
        const g = this.cardGeom

        if (this.level.level === 1) {
            if (!g) return []
            const cardRect = { x: SWIPE.cx, y: SWIPE.cy, w: SWIPE.w + 24, h: SWIPE.h + 24 }

            return [
                {
                    key: 'radar-l1-a',
                    before: () => this.goTo(0),
                    steps: [
                        {
                            text: 'Esta é a primeira postagem. Ela aparece sozinha na tela, como no celular.',
                            shape: 'rect', ...cardRect, balloonY: 500,
                        },
                        {
                            text: 'No topo aparece o perfil que publicou, quem escreveu o texto e quando foi publicado.',
                            shape: 'rect', x: SWIPE.cx, y: SWIPE.cy + g.headerCy, w: SWIPE.w - 16, h: 136,
                        },
                        {
                            text: 'Esta é a foto da postagem. Toque nela para ver a imagem em tela cheia.',
                            shape: 'rect', x: SWIPE.cx, y: SWIPE.cy + g.imgCy, w: g.imgW + 18, h: g.imgH + 18,
                        },
                        {
                            text: 'Aqui embaixo ficam a fonte da postagem e se ela mostra provas do que diz.',
                            shape: 'rect', x: SWIPE.cx, y: SWIPE.cy + g.pillCy, w: SWIPE.w - 24, h: CARD.pillH + 18,
                        },
                    ],
                },
                {
                    key: 'radar-l1-b',
                    before: () => this.goTo(1),
                    steps: [
                        {
                            text: 'Pronto! Agora você está vendo a outra postagem sobre o mesmo assunto.',
                            shape: 'rect', ...cardRect, balloonY: 500,
                        },
                        {
                            text: 'Para trocar de postagem, arraste o dedo para o lado, use as setas ou toque neste botão.',
                            shape: 'rect', x: SWIPE.swapX, y: SWIPE.rowY, w: SWIPE.swapW + 26, h: SWIPE.swapH + 26,
                        },
                        {
                            text: 'As bolinhas mostram em qual das duas postagens você está agora.',
                            shape: 'rect', x: SWIPE.cx, y: SWIPE.dotsY, w: 200, h: 66,
                        },
                    ],
                },
                {
                    key: 'radar-l1-c',
                    before: () => this.goTo(0),
                    steps: [
                        {
                            text: 'Compare as duas com calma: perfil, autor, data, foto e provas.',
                            shape: 'rect', ...cardRect, balloonY: 500,
                        },
                        {
                            text: 'Este botão verde mostra o nome da postagem que está na tela. Toque nele para confiar nela.',
                            shape: 'rect', x: SWIPE.chooseX, y: SWIPE.rowY, w: SWIPE.chooseW + 26, h: SWIPE.chooseH + 26,
                        },
                    ],
                },
            ]
        }

        if (this.level.level === 2) {
            return [{
                key: 'radar-l2',
                steps: [
                    {
                        text: 'Agora é só uma postagem. Leia com calma e toque na foto para ampliar.',
                        shape: 'rect', x: SOLO.cx, y: SOLO.cy, w: SOLO.w + 22, h: SOLO.h + 22,
                    },
                    {
                        text: 'Toque em cada sinal do radar para investigar e marque se ele parece bom ou ruim.',
                        shape: 'rect', x: RADAR.cx, y: 372, w: RADAR.rowW + 44, h: 380,
                    },
                    {
                        text: 'Depois de checar os quatro sinais, os selos ficam coloridos e você escolhe um.',
                        shape: 'rect', x: RADAR.cx, y: RADAR.seloY, w: RADAR.rowW + 60, h: 108,
                    },
                ],
            }]
        }

        return [{
            key: 'radar-l3',
            steps: [
                {
                    text: 'Aqui os quatro sinais já vêm abertos, mas estão misturados: alguns bons, outros ruins.',
                    shape: 'rect', x: RADAR.cx, y: 370, w: CASEBOARD.rowW + 44, h: 380,
                },
                {
                    text: 'Existe um selo do meio: Cuidado. Use quando a postagem não é mentira, mas também não é notícia.',
                    shape: 'rect', x: RADAR.cx, y: CASEBOARD.seloY, w: CASEBOARD.rowW + 60, h: 108,
                },
                {
                    text: 'O tempo está correndo. Escolha o selo e depois diga qual sinal pesou mais.',
                    shape: 'none', balloonY: 380,
                },
            ],
        }]
    }

    private publishHud() {
        this.registry.set('hud', {
            instruction: this.phase.instruction,
            sub: this.phase.sub,
            level: this.level.level,
            phase: this.phaseIdx + 1,
            totalPhases: this.level.phases.length,
        })
    }

    private card(x: number, y: number, w: number, h: number, r = 24, fill = C.panel) {
        const g = this.add.graphics()
        g.fillStyle(C.shadow, A.shadow)
        g.fillRoundedRect(x + 4, y + 10, w, h, r)
        g.fillStyle(fill, 1)
        g.fillRoundedRect(x, y, w, h, r)
        g.lineStyle(3, C.border, 1)
        g.strokeRoundedRect(x, y, w, h, r)
        return g
    }

    private drawIcon(g: Phaser.GameObjects.Graphics, id: CriterionId, cx: number, cy: number, s: number, color: number) {
        g.fillStyle(color, 1)
        g.lineStyle(3, color, 1)

        if (id === 'fonte') {
            g.fillRoundedRect(cx - s * 0.6, cy - s * 0.25, s * 1.2, s * 0.95, 3)
            g.fillTriangle(cx - s * 0.78, cy - s * 0.25, cx + s * 0.78, cy - s * 0.25, cx, cy - s * 0.95)
            return
        }

        if (id === 'autoria') {
            g.fillCircle(cx, cy - s * 0.38, s * 0.34)
            g.fillRoundedRect(cx - s * 0.55, cy + s * 0.08, s * 1.1, s * 0.62, s * 0.31)
            return
        }

        if (id === 'data') {
            g.fillRoundedRect(cx - s * 0.62, cy - s * 0.5, s * 1.24, s * 1.12, 4)
            g.fillRect(cx - s * 0.36, cy - s * 0.86, s * 0.16, s * 0.4)
            g.fillRect(cx + s * 0.2, cy - s * 0.86, s * 0.16, s * 0.4)
            return
        }

        g.strokeCircle(cx - s * 0.14, cy - s * 0.16, s * 0.46)
        g.lineBetween(cx + s * 0.18, cy + s * 0.18, cx + s * 0.62, cy + s * 0.62)
    }

    private button(
        x: number,
        y: number,
        w: number,
        h: number,
        label: string,
        color: number,
        onClick: () => void,
        fontSize = '18px',
        ignoreLock = false,
    ) {
        const btn = this.add.container(x, y)
        const g = this.add.graphics()

        const paint = (c: number) => {
            g.clear()
            g.fillStyle(C.shadow, 0.2)
            g.fillRoundedRect(-w / 2, -h / 2 + 6, w, h, h / 2)
            g.fillStyle(c, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
            g.fillStyle(C.white, A.gloss)
            g.fillRoundedRect(-w / 2 + 8, -h / 2 + 7, w - 16, h * 0.32, h / 4)
        }

        paint(color)

        const t = this.add.text(0, 0, label, {
            fontFamily: 'Arial Black, Arial',
            fontSize,
            color: '#ffffff',
            align: 'center',
            wordWrap: { width: w - 24 },
        }).setOrigin(0.5).setResolution(2)

        btn.add([g, t])
        btn.setData('paint', paint)
        btn.setSize(w, h)
        btn.setInteractive({ useHandCursor: true })
        btn.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
            event.stopPropagation()
            if (this.isInputBlocked() || (!ignoreLock && this.locked)) return
            this.tweens.add({ targets: btn, scale: 0.95, duration: 70, yoyo: true })
            onClick()
        })

        return btn
    }
}
