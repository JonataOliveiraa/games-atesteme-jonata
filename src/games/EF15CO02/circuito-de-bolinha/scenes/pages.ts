import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { BELL, BUILD, CARD, CELL, DEPTH, H, MANUAL, W, slotX, trayPos } from '../data/layout'
import { columns, height, pieceById } from '../data/logic'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { LABEL } from '../data/words'
import type { PhaseDef, Piece, Rect, Vec } from '../types'
import { paintImage } from './art'
import type { Audio } from './audio'
import { bellImage, pieceImage, type From } from './board'

type Mark = 'none' | 'pulse' | 'current' | 'blame'

interface Card {
    id: string
    piece: Piece
    root: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    mini: Phaser.GameObjects.Image
    home: Vec
    slot: number
    busy: boolean
    mark: Mark
    pulse?: Phaser.Tweens.Tween
}

interface Slot {
    x: number
    image: Phaser.GameObjects.Image
    badge: Phaser.GameObjects.Arc
    number: Phaser.GameObjects.Text
    card?: Card
}

export interface Pages {
    setPhase(phase: PhaseDef): void
    enter(from: Vec): Promise<void>
    setPlayable(on: boolean): void
    tap(id: string): Promise<void>
    tapSlot(i: number): Promise<void>
    cardAt(id: string): Vec
    slotAt(i: number): Vec
    order(): Piece[]
    lift(i: number): Promise<void>
    take(i: number): From
    done(i: number): void
    blame(i: number): Promise<void>
    trayRect(): Rect
    manualRect(): Rect
    destroy(): void
}

export function createPages(scene: Phaser.Scene, audio: Audio, onBuild: () => void): Pages {
    let cards: Card[] = []
    let slots: Slot[] = []
    let playable = false
    let enabled = false
    let bandIn = false

    const band = paintImage(scene, W, MANUAL.h, g => {
        g.fillStyle(C.shadow, 0.18)
        g.fillRect(0, 0, W, 10)
        g.fillStyle(C.manualDark, 1)
        g.fillRect(0, 6, W, MANUAL.h - 6)
        g.fillStyle(C.manual, 1)
        g.fillRect(0, 6, W, MANUAL.h - 18)
        g.fillStyle(C.manualLight, 1)
        g.fillRect(0, 6, W, 8)
        for (let x = 40; x < W; x += 64) {
            g.fillStyle(C.manualDark, 1)
            g.fillCircle(x, 26, 7)
            g.fillStyle(C.manualLight, 0.8)
            g.fillCircle(x - 2, 24, 3)
        }
    })
        .setOrigin(0, 0)
        .setPosition(0, H)
        .setDepth(DEPTH.manual)

    const buttonImage = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.buildOff))
    buttonImage.setDisplaySize(BUILD.w, BUILD.h)
    const buttonText = scene.add
        .text(BUILD.textX, -6, LABEL.build, { fontFamily: FONT.black, fontSize: `${SIZE.build}px`, color: CSS.disabled })
        .setOrigin(0.5)
        .setResolution(2)
    const buttonRing = scene.add.graphics()
    buttonRing.lineStyle(7, C.ring, 1)
    buttonRing.strokeRoundedRect(-BUILD.w / 2 - 7, -BUILD.h / 2 - 7, BUILD.w + 14, BUILD.h + 14, 36)
    buttonRing.setAlpha(0)
    const button = scene.add
        .container(BUILD.x, BUILD.y, [buttonRing, buttonImage, buttonText])
        .setDepth(DEPTH.build)
        .setVisible(false)
    const buttonZone = scene.add
        .zone(BUILD.x, BUILD.y, BUILD.w + 20, BUILD.h + 20)
        .setDepth(DEPTH.build + 1)
        .setInteractive({ useHandCursor: true })
    let buttonPulse: Phaser.Tweens.Tween | undefined

    const paintButton = () => {
        buttonImage.setFrame(cellKey(enabled ? UI_CELL.buildOn : UI_CELL.buildOff))
        buttonImage.setDisplaySize(BUILD.w, BUILD.h)
        buttonText.setColor(enabled ? CSS.white : CSS.disabled)
        buttonPulse?.remove()
        buttonPulse = undefined
        buttonRing.setAlpha(0)
        if (enabled)
            buttonPulse = scene.tweens.add({
                targets: buttonRing,
                alpha: { from: 0.3, to: 1 },
                duration: 600,
                yoyo: true,
                repeat: -1,
            })
    }

    const refresh = () => {
        const next = playable && slots.length > 0 && slots.every(s => s.card) && cards.every(c => !c.busy)
        if (next === enabled) return
        enabled = next
        paintButton()
    }

    buttonZone.on('pointerdown', () => {
        if (!enabled) return
        enabled = false
        playable = false
        paintButton()
        paintRings()
        audio.pop()
        void FX.press(scene, button)
        onBuild()
    })

    const paintRing = (card: Card, mark: Mark) => {
        card.mark = mark
        card.pulse?.remove()
        card.pulse = undefined
        const g = card.ring
        g.clear()
        if (mark === 'none') return
        const color = mark === 'blame' ? C.oops : C.ring
        g.lineStyle(6, color, 1)
        g.strokeRoundedRect(-CARD.w / 2 - CARD.pulse, -CARD.h / 2 - CARD.pulse, CARD.w + CARD.pulse * 2, CARD.h + CARD.pulse * 2, 22)
        g.setAlpha(1)
        if (mark === 'pulse')
            card.pulse = scene.tweens.add({ targets: g, alpha: { from: 0.25, to: 1 }, duration: 600, yoyo: true, repeat: -1 })
    }

    const paintRings = () =>
        cards.forEach(card => {
            if (card.mark === 'current' || card.mark === 'blame') return
            paintRing(card, playable && card.slot < 0 && !card.busy ? 'pulse' : 'none')
        })

    const slotAt = (i: number): Vec => ({ x: slots[i]?.x ?? MANUAL.slotCx, y: MANUAL.slotY })

    const move = async (card: Card) => {
        if (card.busy) return
        let to: Vec
        if (card.slot < 0) {
            const i = slots.findIndex(s => !s.card)
            if (i < 0) return
            slots[i].card = card
            card.slot = i
            to = slotAt(i)
        } else {
            slots[card.slot].card = undefined
            card.slot = -1
            to = card.home
        }
        card.busy = true
        paintRings()
        refresh()
        audio.paper()
        scene.tweens.killTweensOf(card.root)
        card.root.setScale(1).setDepth(DEPTH.cardFlying)
        await FX.arcTo(scene, card.root, to, { height: 70, duration: TIMING.card })
        if (!card.root.active) return
        card.root.setDepth(DEPTH.card)
        card.busy = false
        paintRings()
        refresh()
    }

    const buildCard = (next: PhaseDef, piece: Piece, home: Vec): Card => {
        const page = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.page))
        page.setDisplaySize(CARD.w, CARD.h)
        const cols = columns(next)
        const rows = Math.max(2, height(next))
        const s = Math.min(CARD.inner.w / (cols * CELL), CARD.inner.h / (rows * CELL))
        const cell = CELL * s
        const left = (-cols * cell) / 2
        const base = CARD.inner.y + CARD.inner.h / 2
        const line = scene.add.rectangle(0, base + 2, cols * cell + 18, 5, C.woodDark).setOrigin(0.5, 0)
        const ghosts = next.pieces.map(p =>
            pieceImage(scene, p, cell)
                .setPosition(left + (p.c + 0.5) * cell, base - p.r * cell)
                .setTintFill(C.ghostMini)
                .setAlpha(0.95),
        )
        const bell = bellImage(scene, BELL.h * s).setPosition(left + (next.bell + 0.5) * cell, base)
        const at = { x: left + (piece.c + 0.5) * cell, y: base - piece.r * cell }
        const glow = scene.add.rectangle(at.x, at.y - cell / 2, cell + 12, cell + 12, C.butter, 0.75)
        const mini = pieceImage(scene, piece, cell).setPosition(at.x, at.y)
        const ring = scene.add.graphics()
        const root = scene.add
            .container(home.x, home.y, [ring, page, line, ...ghosts, bell, glow, mini])
            .setDepth(DEPTH.card)
            .setSize(CARD.w, CARD.h)
            .setInteractive({ useHandCursor: true })
        const card: Card = { id: piece.id, piece, root, ring, mini, home, slot: -1, busy: false, mark: 'none' }
        root.on('pointerdown', () => {
            if (!playable) return
            void move(card)
        })
        root.on('pointerover', () => {
            if (!playable || card.busy) return
            void FX.to(scene, root, { scale: CARD.hover }, { duration: 120 })
        })
        root.on('pointerout', () => {
            if (card.busy) return
            void FX.to(scene, root, { scale: 1 }, { duration: 120 })
        })
        return card
    }

    const clear = () => {
        cards.forEach(card => {
            card.pulse?.remove()
            scene.tweens.killTweensOf(card.root)
            card.root.destroy()
        })
        slots.forEach(slot => {
            slot.image.destroy()
            slot.badge.destroy()
            slot.number.destroy()
        })
        cards = []
        slots = []
    }

    const rowsUsed = () => Math.ceil(cards.length / 2)

    const pages: Pages = {
        setPhase(next) {
            clear()
            playable = false
            enabled = false
            paintButton()
            const count = next.pieces.length
            slots = Array.from({ length: count }, (_, i) => {
                const x = slotX(count, i)
                const image = scene.add.image(x, MANUAL.slotY, UI_SHEET.key, cellKey(UI_CELL.slot)).setDepth(DEPTH.manual + 1)
                image.setDisplaySize(CARD.w, CARD.h).setVisible(false)
                const bx = x - CARD.w / 2 + 8
                const by = MANUAL.slotY - CARD.h / 2 + 8
                const badge = scene.add
                    .circle(bx, by, MANUAL.badgeR, C.white)
                    .setStrokeStyle(4, C.manualDark)
                    .setDepth(DEPTH.card + 2)
                    .setVisible(false)
                const number = scene.add
                    .text(bx, by + 1, `${i + 1}`, { fontFamily: FONT.black, fontSize: `${SIZE.badge}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2)
                    .setDepth(DEPTH.card + 3)
                    .setVisible(false)
                return { x, image, badge, number }
            })
            cards = next.tray.map((id, i) => {
                const piece = pieceById(next, id)
                if (!piece) throw new Error(`página ${id} sem peça`)
                const card = buildCard(next, piece, trayPos(i))
                card.root.setVisible(false)
                return card
            })
        },
        async enter(from) {
            if (!bandIn) {
                bandIn = true
                button.setVisible(true).setY(H + BUILD.h)
                await FX.all(
                    FX.to(scene, band, { y: MANUAL.y }, { duration: 420, ease: 'Back.easeOut' }),
                    FX.to(scene, button, { y: BUILD.y }, { duration: 460, ease: 'Back.easeOut' }),
                )
            }
            await FX.all(
                ...slots.map((slot, i) =>
                    FX.wait(scene, i * 70).then(() => {
                        ;[slot.image, slot.badge, slot.number].forEach(o => o.setVisible(true))
                        return FX.popIn(scene, slot.image, { from: 0.6, duration: 260 })
                    }),
                ),
            )
            await FX.all(
                ...cards.map((card, i) =>
                    FX.wait(scene, i * TIMING.cardGap).then(async () => {
                        card.root.setPosition(from.x, from.y).setScale(0.3).setAlpha(0).setVisible(true).setDepth(DEPTH.cardFlying)
                        audio.paper()
                        await FX.all(
                            FX.arcTo(scene, card.root, card.home, { height: 120, duration: TIMING.cardIn }),
                            FX.to(scene, card.root, { scale: 1, alpha: 1 }, { duration: TIMING.cardIn }),
                        )
                        card.root.setDepth(DEPTH.card)
                    }),
                ),
            )
        },
        setPlayable(on) {
            playable = on
            paintRings()
            refresh()
        },
        tap(id) {
            const card = cards.find(c => c.id === id)
            return card ? move(card) : Promise.resolve()
        },
        tapSlot(i) {
            const card = slots[i]?.card
            return card ? move(card) : Promise.resolve()
        },
        cardAt(id) {
            const card = cards.find(c => c.id === id)
            return card ? { x: card.root.x, y: card.root.y } : { x: 0, y: 0 }
        },
        slotAt,
        order: () => slots.map(s => s.card?.piece).filter((p): p is Piece => !!p),
        async lift(i) {
            const card = slots[i]?.card
            if (!card) return
            paintRing(card, 'current')
            audio.paper()
            await FX.to(scene, card.root, { y: MANUAL.slotY - MANUAL.lift, scale: 1.06 }, { duration: TIMING.pageLift, ease: 'Back.easeOut' })
        },
        take(i) {
            const card = slots[i]?.card
            if (!card) return { x: slotAt(i).x, y: slotAt(i).y, w: CELL * 0.3 }
            const s = card.root.scale
            const from = { x: card.root.x + card.mini.x * s, y: card.root.y + card.mini.y * s, w: card.mini.displayWidth * s }
            card.mini.setAlpha(0.2)
            return from
        },
        done(i) {
            const card = slots[i]?.card
            if (!card) return
            paintRing(card, 'none')
            void FX.to(scene, card.root, { y: MANUAL.slotY, scale: 1, alpha: 0.8 }, { duration: TIMING.pageLift })
        },
        async blame(i) {
            const card = slots[i]?.card
            if (!card) return
            paintRing(card, 'blame')
            card.mini.setAlpha(1)
            await FX.shake(scene, card.root, { amount: 9, times: 4 })
        },
        trayRect() {
            const rows = Math.max(1, rowsUsed())
            const topY = trayPos(0).y - CARD.h / 2 - 12
            const bottomY = trayPos((rows - 1) * 2).y + CARD.h / 2 + 12
            const leftX = trayPos(0).x - CARD.w / 2 - 12
            const rightX = trayPos(1).x + CARD.w / 2 + 12
            return { x: (leftX + rightX) / 2, y: (topY + bottomY) / 2, w: rightX - leftX, h: bottomY - topY }
        },
        manualRect() {
            const n = Math.max(1, slots.length)
            const leftX = slotX(n, 0) - CARD.w / 2 - 14
            const rightX = BUILD.x + BUILD.w / 2 + 14
            return { x: (leftX + rightX) / 2, y: MANUAL.slotY, w: rightX - leftX, h: CARD.h + 30 }
        },
        destroy() {
            clear()
            buttonPulse?.remove()
            buttonZone.destroy()
            button.destroy()
            band.destroy()
        },
    }
    return pages
}
