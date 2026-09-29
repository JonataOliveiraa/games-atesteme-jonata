import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import type { GuideRect } from '../../../../shared/guide/createVisualGuide'
import { CARD_CELL, CARDS } from '../data/files'
import { BENCH, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { CardDef } from '../types'

export interface CardView {
    readonly id: string
    readonly container: Phaser.GameObjects.Container
}

export interface Bench {
    deal(cards: CardDef[]): Promise<void>
    onPick(handler: (cardId: string) => void): void
    setEnabled(on: boolean): void
    view(cardId: string): CardView | undefined
    rect(cardId: string): GuideRect
    readonly area: GuideRect
    readonly scale: number
    take(cardId: string): CardView | undefined
    hop(cardId: string): Promise<void>
    dismiss(cardId: string): Promise<void>
    putBack(cardId: string, card: CardView): Promise<void>
    clear(): void
    destroy(): void
}

const CELL = 256
const CARD_ART_W = 240

function iconArt(scene: Phaser.Scene, card: CardDef): Phaser.GameObjects.GameObject {
    if (scene.textures.exists(card.icon.sheet)) {
        return scene.add.image(0, BENCH.iconY, card.icon.sheet, card.icon.cell).setScale(BENCH.icon / CELL)
    }
    const g = scene.add.graphics()
    const s = BENCH.icon * 0.8
    g.fillStyle(C.gold, 1)
    g.fillRoundedRect(-s / 2, BENCH.iconY - s / 2, s, s, 16)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-s / 2, BENCH.iconY - s / 2, s, s, 16)
    return g
}

export function createCardArt(scene: Phaser.Scene, card: CardDef): Phaser.GameObjects.Container {
    const body = scene.add.image(0, 0, CARDS, CARD_CELL.card).setScale(BENCH.w / CARD_ART_W)
    const label = scene.add
        .text(0, BENCH.labelY, card.label, {
            fontFamily: FONT.black,
            fontSize: `${SIZE.label}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setScale(Math.min(1, (BENCH.w - 20) / Math.max(1, label.width)))
    return scene.add.container(0, 0, [body, iconArt(scene, card), label])
}

export function createBench(scene: Phaser.Scene): Bench {
    const cards = new Map<string, { view: CardView; zone: Phaser.GameObjects.Zone; slot: number; taken: boolean }>()
    let pick: ((id: string) => void) | undefined
    let enabled = false
    let row = BENCH.rows[3]

    const slotOf = (id: string) => cards.get(id)?.slot ?? 0
    const rect = (id: string): GuideRect => ({
        x: BENCH.x,
        y: row.ys[slotOf(id)],
        w: BENCH.w * row.scale,
        h: BENCH.h * row.scale,
    })

    const refresh = () => {
        cards.forEach(({ zone, view, taken }) => {
            if (zone.input) zone.input.enabled = enabled && !taken && view.container.active
        })
    }

    const clear = () => {
        cards.forEach(({ view, zone }) => {
            zone.destroy()
            if (view.container.active) view.container.destroy()
        })
        cards.clear()
    }

    return {
        async deal(list) {
            clear()
            row = BENCH.rows[list.length] ?? BENCH.rows[3]
            await FX.all(
                ...list.map((def, slot) => {
                    const y = row.ys[slot]
                    const container = createCardArt(scene, def)
                        .setPosition(BENCH.x, y)
                        .setScale(row.scale)
                        .setDepth(DEPTH.bench)
                    const zone = scene.add
                        .zone(BENCH.x, y, BENCH.w * row.scale, BENCH.h * row.scale)
                        .setDepth(DEPTH.bench + 5)
                        .setInteractive({ useHandCursor: true })
                    zone.on('pointerdown', () => {
                        if (!enabled) return
                        void FX.press(scene, container)
                        pick?.(def.id)
                    })
                    cards.set(def.id, { view: { id: def.id, container }, zone, slot, taken: false })
                    return FX.popIn(scene, container, { delay: slot * 110 })
                }),
            )
            refresh()
        },
        onPick(handler) {
            pick = handler
        },
        setEnabled(on) {
            enabled = on
            refresh()
        },
        view: id => cards.get(id)?.view,
        rect,
        get area() {
            const top = row.ys[0]
            const bottom = row.ys[row.ys.length - 1]
            return {
                x: BENCH.x,
                y: (top + bottom) / 2,
                w: BENCH.w * row.scale + 20,
                h: bottom - top + BENCH.h * row.scale + 20,
            }
        },
        get scale() {
            return row.scale
        },
        take(id) {
            const entry = cards.get(id)
            if (!entry) return undefined
            entry.taken = true
            if (entry.zone.input) entry.zone.input.enabled = false
            entry.view.container.setDepth(DEPTH.flying)
            return entry.view
        },
        async hop(id) {
            const entry = cards.get(id)
            if (!entry) return
            const c = entry.view.container
            const y = row.ys[entry.slot]
            await FX.to(scene, c, { y: y - 26, angle: -4 }, { duration: BENCH.hopMs, ease: 'Quad.easeOut' })
            await FX.to(scene, c, { y, angle: 0 }, { duration: BENCH.hopMs * 1.6, ease: 'Bounce.easeOut' })
        },
        async dismiss(id) {
            const entry = cards.get(id)
            if (!entry) return
            entry.taken = true
            refresh()
            await FX.to(scene, entry.view.container, { alpha: 0, x: BENCH.x - 60 }, { duration: 420, ease: 'Sine.easeIn' })
        },
        async putBack(id, card) {
            const entry = cards.get(id)
            if (!entry) return
            await FX.to(
                scene,
                card.container,
                { x: BENCH.x, y: row.ys[entry.slot], scale: row.scale, angle: 0 },
                { duration: 380, ease: 'Back.easeOut' },
            )
            card.container.setDepth(DEPTH.bench)
            entry.taken = false
            refresh()
        },
        clear,
        destroy() {
            pick = undefined
            clear()
        },
    }
}
