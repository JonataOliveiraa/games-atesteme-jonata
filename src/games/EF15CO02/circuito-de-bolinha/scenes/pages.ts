import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { IF_KEY, PIPOCA_CELL, PIPOCA_SHEET, UI_CELL, UI_SHEET, cellKey } from '../data/files'
import { BELL, BUILD, CARD, CELL, DEPTH, H, IF, MANUAL, MINI, W, slotXs, trayPos } from '../data/layout'
import { columns, height, positions, tapeOf, type Position } from '../data/logic'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { TIMING } from '../data/timing'
import { IF_WORDS, LABEL } from '../data/words'
import type { Page, PhaseDef, Piece, Rect, Tape, Vec } from '../types'
import { paintImage } from './art'
import type { Audio } from './audio'
import { askImage, askMark, bellFlipped, bellImage, pieceImage, type From } from './board'

type Mark = 'none' | 'pulse' | 'current' | 'blame'

interface Card {
    id: string
    page: Page
    root: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
    mini: Phaser.GameObjects.Image
    stamp?: Phaser.GameObjects.Text
    home: Vec
    holder?: Holder
    busy: boolean
    mark: Mark
    pulse?: Phaser.Tweens.Tween
}

interface Holder extends Position {
    x: number
    y: number
    scale: number
    card?: Card
}

interface Slot {
    image?: Phaser.GameObjects.Image
    badge: Phaser.GameObjects.Arc
    number: Phaser.GameObjects.Text
}

interface IfCard {
    root: Phaser.GameObjects.Container
    ring: Phaser.GameObjects.Graphics
}

export interface Pages {
    setPhase(phase: PhaseDef): void
    enter(from: Vec): Promise<void>
    leave(to: Vec): Promise<void>
    setPlayable(on: boolean): void
    tap(id: string): Promise<void>
    tapAt(at: Position): Promise<void>
    cardAt(id: string): Vec
    cardRect(id: string): Rect
    holderAt(at: Position): Vec
    order(): Tape
    lift(at: Position): Promise<void>
    take(at: Position): From
    restore(at: Position): void
    count(at: Position, n: number): void
    done(at: Position): void
    blame(at: Position): Promise<void>
    trayRect(): Rect
    manualRect(): Rect
    destroy(): void
}

const stampText = (n: number) => `×${n}`

export function createPages(scene: Phaser.Scene, audio: Audio, onBuild: () => void): Pages {
    let phase: PhaseDef | undefined
    let cards: Card[] = []
    let holders: Holder[] = []
    let slots: Slot[] = []
    let ifCard: IfCard | undefined
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
        const next = playable && holders.length > 0 && holders.every(h => h.card) && cards.every(c => !c.busy)
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

    const paintIf = (mark: Mark) => {
        if (!ifCard) return
        const g = ifCard.ring
        g.clear()
        if (mark === 'none') return
        g.lineStyle(6, mark === 'blame' ? C.oops : C.ring, 1)
        g.strokeRoundedRect(-IF.w / 2 - CARD.pulse, -IF.h / 2 - CARD.pulse, IF.w + CARD.pulse * 2, IF.h + CARD.pulse * 2, 24)
    }

    const paintRings = () =>
        cards.forEach(card => {
            if (card.mark === 'current' || card.mark === 'blame') return
            paintRing(card, playable && !card.holder && !card.busy ? 'pulse' : 'none')
        })

    const same = (a: Position, b: Position) => a.slot === b.slot && a.pocket === b.pocket

    const holderOf = (at: Position) => holders.find(h => same(h, at))

    const baseScale = (card: Card) => card.holder?.scale ?? 1

    const move = async (card: Card) => {
        if (card.busy) return
        let to: Vec
        let scale = 1
        if (!card.holder) {
            const free = holders.find(h => !h.card)
            if (!free) return
            free.card = card
            card.holder = free
            to = free
            scale = free.scale
        } else {
            card.holder.card = undefined
            card.holder = undefined
            to = card.home
        }
        card.busy = true
        paintRings()
        refresh()
        audio.paper()
        scene.tweens.killTweensOf(card.root)
        card.root.setDepth(DEPTH.cardFlying)
        await FX.all(
            FX.arcTo(scene, card.root, to, { height: 70, duration: TIMING.card }),
            FX.to(scene, card.root, { scale }, { duration: TIMING.card }),
        )
        if (!card.root.active) return
        card.root.setDepth(DEPTH.card)
        card.busy = false
        paintRings()
        refresh()
    }

    const highlight = (page: Page): Piece =>
        page.kind === 'piece' ? page.piece : { id: page.id, kind: 'block', c: page.c, r: 0 }

    const buildCard = (next: PhaseDef, page: Page, home: Vec): Card => {
        const art = scene.add.image(0, 0, UI_SHEET.key, cellKey(UI_CELL.page))
        art.setDisplaySize(CARD.w, CARD.h)
        const cols = columns(next)
        const rows = Math.max(2, height(next))
        const s = Math.min(CARD.inner.w / (cols * CELL), CARD.inner.h / (rows * CELL))
        const cell = CELL * s
        const left = (-cols * cell) / 2
        const base = CARD.inner.y + CARD.inner.h / 2
        const line = scene.add.rectangle(0, base + 2, cols * cell + 18, 5, C.woodDark).setOrigin(0.5, 0)
        const ghosts: Phaser.GameObjects.GameObject[] = next.model.flatMap(p => {
            const x = left + (p.c + 0.5) * cell
            const y = base - p.r * cell
            return [
                pieceImage(scene, p, cell + MINI.rim * 2)
                    .setPosition(x, y + MINI.rim)
                    .setTintFill(C.headerLine)
                    .setAlpha(MINI.rimAlpha),
                pieceImage(scene, p, cell).setPosition(x, y).setTintFill(C.ghostMini),
            ]
        })
        if (next.choice) {
            const x = left + (next.choice.c + 0.5) * cell
            const y = base - next.choice.r * cell
            ghosts.push(askImage(scene, cell).setPosition(x, y), askMark(scene, cell * 0.62).setPosition(x, y - cell / 2))
        }
        const bells = next.bells.map(c =>
            bellImage(scene, BELL.h * s)
                .setPosition(left + (c + 0.5) * cell, base)
                .setFlipX(bellFlipped(next, c)),
        )
        const piece = highlight(page)
        const at = { x: left + (piece.c + 0.5) * cell, y: base - piece.r * cell }
        const big = cell * MINI.pop
        const glow = scene.add.rectangle(at.x, at.y - big / 2, big + 12, big + 12, C.butter, 0.9).setStrokeStyle(3, C.ring)
        const outline = pieceImage(scene, piece, big + MINI.rim * 2)
            .setPosition(at.x, at.y + MINI.rim)
            .setTintFill(C.headerLine)
        const mini = pieceImage(scene, piece, big).setPosition(at.x, at.y)
        const ring = scene.add.graphics()
        const parts: Phaser.GameObjects.GameObject[] = [ring, art, line, ...ghosts, ...bells, glow, outline, mini]
        let stamp: Phaser.GameObjects.Text | undefined
        if (page.kind === 'repeat') {
            const disc = scene.add.circle(CARD.stamp.x, CARD.stamp.y, CARD.stamp.r, C.accent).setStrokeStyle(4, C.white)
            stamp = scene.add
                .text(CARD.stamp.x, CARD.stamp.y + 1, stampText(page.n), {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.stamp}px`,
                    color: CSS.white,
                })
                .setOrigin(0.5)
                .setResolution(2)
            parts.push(disc, stamp)
        }
        const root = scene.add
            .container(home.x, home.y, parts)
            .setDepth(DEPTH.card)
            .setSize(CARD.w, CARD.h)
            .setInteractive({ useHandCursor: true })
        const card: Card = { id: page.id, page, root, ring, mini, stamp, home, busy: false, mark: 'none' }
        root.on('pointerdown', () => {
            if (!playable) return
            void move(card)
        })
        root.on('pointerover', () => {
            if (!playable || card.busy) return
            void FX.to(scene, root, { scale: baseScale(card) * CARD.hover }, { duration: 120 })
        })
        root.on('pointerout', () => {
            if (card.busy) return
            void FX.to(scene, root, { scale: baseScale(card) }, { duration: 120 })
        })
        return card
    }

    const photo = (next: PhaseDef) => {
        const { w, h } = IF.photo
        const frame = scene.add.graphics()
        frame.fillStyle(C.shadow, 0.25)
        frame.fillRoundedRect(-w / 2 + 4, -h / 2 + 6, w, h, 12)
        frame.fillStyle(C.white, 1)
        frame.fillRoundedRect(-w / 2, -h / 2, w, h, 12)
        frame.fillStyle(C.wall, 1)
        frame.fillRoundedRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16, 8)
        frame.fillStyle(C.wood, 1)
        frame.fillRect(-w / 2 + 8, h / 2 - 22, w - 16, 14)
        frame.lineStyle(4, C.headerLine, 1)
        frame.strokeRoundedRect(-w / 2, -h / 2, w, h, 12)
        const parts: Phaser.GameObjects.GameObject[] = [frame]
        const floor = h / 2 - 20
        const sides = ['left', 'right'] as const
        sides.forEach(side => {
            const out = side === 'left' ? -1 : 1
            const x = out * w * 0.26
            parts.push(bellImage(scene, h * 0.6).setPosition(x, floor).setFlipX(side === 'left'))
            if (side !== next.cond) return
            const cat = scene.add.image(x + out * 16, floor + 2, PIPOCA_SHEET.key, cellKey(PIPOCA_CELL.sleep))
            cat.setOrigin(0.5, 1).setScale((w * 0.36) / cat.width)
            parts.push(cat)
        })
        return scene.add.container(0, IF.photo.y, parts).setAngle(IF.photo.angle)
    }

    const buildIf = (next: PhaseDef, x: number): IfCard => {
        const art = scene.add.image(0, 0, IF_KEY).setDisplaySize(IF.w, IF.h)
        const ring = scene.add.graphics()
        const word = scene.add
            .text(IF.word.x, IF.word.y, IF_WORDS.if, { fontFamily: FONT.black, fontSize: `${SIZE.seWord}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const label = (text: string, k: number, color: string) =>
            scene.add
                .text((k - 0.5) * IF.w, IF.labelY, text, {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.pocket}px`,
                    color: CSS.white,
                    stroke: color,
                    strokeThickness: 6,
                })
                .setOrigin(0.5)
                .setResolution(2)
        const root = scene.add
            .container(x, MANUAL.slotY, [
                ring,
                art,
                word,
                photo(next),
                label(IF_WORDS.yes, IF.pockets.yes, CSS.yes),
                label(IF_WORDS.no, IF.pockets.no, CSS.no),
            ])
            .setDepth(DEPTH.card - 2)
            .setVisible(false)
        return { root, ring }
    }

    const clear = () => {
        cards.forEach(card => {
            card.pulse?.remove()
            scene.tweens.killTweensOf(card.root)
            card.root.destroy()
        })
        slots.forEach(slot => {
            slot.image?.destroy()
            slot.badge.destroy()
            slot.number.destroy()
        })
        if (ifCard) {
            scene.tweens.killTweensOf(ifCard.root)
            ifCard.root.destroy()
        }
        ifCard = undefined
        cards = []
        holders = []
        slots = []
    }

    const rowsUsed = () => Math.ceil(cards.length / 2)

    const slotVisuals = () => [...slots.flatMap(s => [s.image, s.badge, s.number]), ifCard?.root].filter(o => !!o)

    const pages: Pages = {
        setPhase(next) {
            clear()
            phase = next
            playable = false
            enabled = false
            paintButton()
            const widths = Array.from({ length: next.slots }, (_, i) => (i === next.ifSlot ? IF.w : CARD.w))
            const xs = slotXs(widths)
            slots = xs.map((x, i) => {
                const isIf = i === next.ifSlot
                const image = isIf
                    ? undefined
                    : scene.add.image(x, MANUAL.slotY, UI_SHEET.key, cellKey(UI_CELL.slot)).setDepth(DEPTH.manual + 1).setVisible(false)
                image?.setDisplaySize(CARD.w, CARD.h)
                const bx = x - widths[i] / 2 + 8
                const by = MANUAL.slotY - (isIf ? IF.h : CARD.h) / 2 + 8
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
                if (isIf) ifCard = buildIf(next, x)
                return { image, badge, number }
            })
            holders = positions(next).map(at => {
                const x = xs[at.slot]
                if (!at.pocket) return { ...at, x, y: MANUAL.slotY, scale: 1 }
                return {
                    ...at,
                    x: x + (IF.pockets[at.pocket] - 0.5) * IF.w,
                    y: MANUAL.slotY + (IF.pocketY - 0.5) * IF.h,
                    scale: IF.scale,
                }
            })
            cards = next.tray.map((page, i) => {
                const card = buildCard(next, page, trayPos(i))
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
                        ;[slot.image, slot.badge, slot.number].forEach(o => o?.setVisible(true))
                        const pop = slot.image ?? (i === phase?.ifSlot ? ifCard?.root.setVisible(true) : undefined)
                        return pop ? FX.popIn(scene, pop, { from: 0.6, duration: 260 }) : Promise.resolve()
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
        async leave(to) {
            playable = false
            paintRings()
            refresh()
            await FX.all(
                ...cards.map((card, i) =>
                    FX.wait(scene, i * 80).then(async () => {
                        scene.tweens.killTweensOf(card.root)
                        card.root.setDepth(DEPTH.cardFlying)
                        audio.paper()
                        await FX.all(
                            FX.arcTo(scene, card.root, to, { height: 110, duration: TIMING.cardIn }),
                            FX.to(scene, card.root, { scale: 0.3, alpha: 0 }, { duration: TIMING.cardIn }),
                        )
                    }),
                ),
                ...slotVisuals().map(o => FX.to(scene, o, { alpha: 0 }, { duration: 260 })),
            )
            clear()
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
        tapAt(at) {
            const card = holderOf(at)?.card
            return card ? move(card) : Promise.resolve()
        },
        cardAt(id) {
            const card = cards.find(c => c.id === id)
            return card ? { x: card.root.x, y: card.root.y } : { x: 0, y: 0 }
        },
        cardRect(id) {
            const card = cards.find(c => c.id === id)
            const s = card ? card.root.scale : 1
            return { x: card?.root.x ?? 0, y: card?.root.y ?? 0, w: CARD.w * s, h: CARD.h * s }
        },
        holderAt(at) {
            const h = holderOf(at)
            return h ? { x: h.x, y: h.y } : { x: MANUAL.slotCx, y: MANUAL.slotY }
        },
        order: () => (phase ? tapeOf(phase, holders.map(h => h.card?.page)) : { slots: [] }),
        async lift(at) {
            const holder = holderOf(at)
            if (!holder && phase?.ifSlot === at.slot) {
                paintIf('current')
                audio.paper()
                if (ifCard) await FX.impact(scene, ifCard.root, 0.06)
                return
            }
            const card = holder?.card
            if (!card || !holder) return
            paintRing(card, 'current')
            audio.paper()
            await FX.to(
                scene,
                card.root,
                { y: holder.y - MANUAL.lift * holder.scale, scale: holder.scale * 1.06 },
                { duration: TIMING.pageLift, ease: 'Back.easeOut' },
            )
        },
        take(at) {
            const holder = holderOf(at)
            const card = holder?.card
            if (!card || !holder) return { x: holder?.x ?? MANUAL.slotCx, y: MANUAL.slotY, w: CELL * 0.3 }
            const s = card.root.scale
            const from = { x: card.root.x + card.mini.x * s, y: card.root.y + card.mini.y * s, w: card.mini.displayWidth * s }
            card.mini.setAlpha(0.2)
            return from
        },
        restore(at) {
            holderOf(at)?.card?.mini.setAlpha(1)
        },
        count(at, n) {
            const stamp = holderOf(at)?.card?.stamp
            if (!stamp) return
            audio.tick(n)
            scene.tweens.killTweensOf(stamp)
            stamp.setScale(1, 1)
            void FX.to(scene, stamp, { scaleX: 0 }, { duration: TIMING.count / 2, ease: 'Quad.easeIn' }).then(() => {
                if (!stamp.active) return
                stamp.setText(`${n}`)
                return FX.to(scene, stamp, { scaleX: 1 }, { duration: TIMING.count / 2, ease: 'Quad.easeOut' })
            })
        },
        done(at) {
            const holder = holderOf(at)
            if (!holder && phase?.ifSlot === at.slot) {
                paintIf('none')
                return
            }
            const card = holder?.card
            if (!card || !holder) return
            paintRing(card, 'none')
            if (card.stamp && card.page.kind === 'repeat') card.stamp.setText(stampText(card.page.n))
            void FX.to(scene, card.root, { y: holder.y, scale: holder.scale, alpha: 0.8 }, { duration: TIMING.pageLift })
        },
        async blame(at) {
            if (at.pocket) paintIf('blame')
            const card = holderOf(at)?.card
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
            const xs = holders.map(h => h.x)
            const leftX = Math.min(MANUAL.slotCx, ...xs) - CARD.w / 2 - 14
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
