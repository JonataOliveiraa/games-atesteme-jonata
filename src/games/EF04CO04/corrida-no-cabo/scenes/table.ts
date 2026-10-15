import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_SHEET, UI } from '../data/files'
import { DEPTH, HEADER, TABLE, W } from '../data/layout'
import { C, CSS, FONT, SIZE, inkOn } from '../data/theme'
import { TABLE_TITLE } from '../data/words'
import type { Entry } from '../types'
import { fit, slice } from './art'
import type { Rect } from './desk'

type Point = { x: number; y: number }

export interface Table {
    /** troca os cartões (nas palavras, o combinado de cada fase traz só as letras dela) */
    setEntries(entries: Entry[]): void
    rect(): Rect
    cardRect(id: string): Rect
    figurePos(id: string): Point
    digitPos(id: string, i: number): Point
    bump(id: string): Promise<void>
    shake(id: string): Promise<void>
    markDigit(id: string, i: number, on: boolean): void
    destroy(): void
}

/** a segunda faixa do cabeçalho: o rótulo "Combinado" à esquerda e os cartões espalhados por igual */
export function createTable(scene: Phaser.Scene, entries: Entry[]): Table {
    const root = scene.add.container(0, 0).setDepth(DEPTH.panel)
    const y = TABLE.y

    const labelText = scene.add
        .text(0, 0, TABLE_TITLE, { fontFamily: FONT.black, fontSize: `${SIZE.title}px`, color: inkOn(C.accent) })
        .setOrigin(0.5)
        .setResolution(2)
    const labelW = TABLE.labelW
    const tab = scene.add.graphics()
    tab.fillStyle(C.accent, 1)
    tab.fillRoundedRect(-labelW / 2, -20, labelW, 40, 20)
    tab.lineStyle(3, C.ink, 1)
    tab.strokeRoundedRect(-labelW / 2, -20, labelW, 40, 20)
    root.add(scene.add.container(TABLE.labelX, y, [tab, labelText]))

    type Card = { box: Phaser.GameObjects.Container; figure: Phaser.GameObjects.Image | Phaser.GameObjects.Text; digits: Phaser.GameObjects.Text[] }
    const cards = new Map<string, Card>()
    const deck = scene.add.container(0, 0)
    root.add(deck)

    const build = (list: Entry[]) => {
        deck.removeAll(true)
        cards.clear()
        const n = list.length
        const cardW = n >= 4 ? TABLE.cardW : TABLE.cardWide
        const left = TABLE.labelX + labelW / 2 + TABLE.gap
        const right = W - HEADER.margin
        const total = n * cardW + (n - 1) * TABLE.gap
        const start = left + (right - left - total) / 2
        list.forEach((entry, i) => {
            const cx = start + i * (cardW + TABLE.gap) + cardW / 2
            const plate = slice(scene, 0, 0, UI.card, cardW, TABLE.cardH, 46, 0.4)
            const fx = -cardW / 2 + 42
            const figure = entry.glyph
                ? scene.add
                      .text(fx, 1, entry.glyph, { fontFamily: FONT.black, fontSize: `${SIZE.glyph}px`, color: CSS.accent })
                      .setOrigin(0.5)
                      .setResolution(2)
                : fit(scene, PIECE_SHEET, entry.frame ?? 4, TABLE.figure).setPosition(fx, 0)
            const area = cardW - 96
            const step = Math.min(30, area / entry.code.length)
            const size = Math.min(SIZE.code, Math.round(step * 1.15))
            const x0 = 30 - ((entry.code.length - 1) * step) / 2
            const digits = [...entry.code].map((d, k) =>
                scene.add
                    .text(x0 + k * step, 1, d, { fontFamily: FONT.black, fontSize: `${size}px`, color: CSS.ink })
                    .setOrigin(0.5)
                    .setResolution(2),
            )
            const box = scene.add.container(cx, y, [plate, figure, ...digits])
            deck.add(box)
            cards.set(entry.id, { box, figure, digits })
        })
    }
    build(entries)

    const card = (id: string) => {
        const c = cards.get(id)
        if (!c) throw new Error(`[corrida-no-cabo] cartão desconhecido: ${id}`)
        return c
    }

    return {
        setEntries: build,
        rect: () => ({ x: W / 2, y, w: W - 12, h: TABLE.cardH + 18 }),
        cardRect(id) {
            const c = card(id)
            const plate = c.box.list[0] as Phaser.GameObjects.NineSlice
            return { x: c.box.x, y: c.box.y, w: plate.displayWidth + 10, h: TABLE.cardH + 10 }
        },
        figurePos(id) {
            const c = card(id)
            return { x: c.box.x + c.figure.x, y: c.box.y + c.figure.y }
        },
        digitPos(id, i) {
            const c = card(id)
            return { x: c.box.x + c.digits[i].x, y: c.box.y + c.digits[i].y }
        },
        async bump(id) {
            const c = card(id)
            scene.tweens.killTweensOf(c.box)
            c.box.setScale(1)
            await FX.to(scene, c.box, { scale: 1.1 }, { duration: 140, yoyo: true })
        },
        async shake(id) {
            await FX.shake(scene, card(id).box, { amount: 7, times: 2 })
        },
        markDigit(id, i, on) {
            const d = card(id).digits[i]
            if (!d) return
            d.setColor(on ? CSS.accent : CSS.ink)
            scene.tweens.killTweensOf(d)
            d.setScale(1)
            if (on) void FX.to(scene, d, { scale: 1.35 }, { duration: 160, yoyo: true, repeat: 1 })
        },
        destroy() {
            root.destroy()
        },
    }
}
