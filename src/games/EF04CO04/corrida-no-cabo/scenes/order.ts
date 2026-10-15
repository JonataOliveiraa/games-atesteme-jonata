import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PIECE_SHEET, UI } from '../data/files'
import { DEPTH, ORDER } from '../data/layout'
import { BIT_COLOR, C, CSS, FONT, SIZE } from '../data/theme'
import { ORDER as SAY_ORDER } from '../data/words'
import type { Bit, Entry } from '../types'
import { fit, piece, refit } from './art'
import type { Rect } from './desk'

type Point = { x: number; y: number }

export interface Order {
    /** a figura pedida; nas palavras, a palavra com a letra da vez em destaque */
    set(entry: Entry, word?: string, index?: number): Promise<void>
    setSlot(i: number, bit: Bit | null, solid: boolean): void
    /** o número do código a seguir, esmaecido, antes de o carrinho passar */
    ghost(i: number, bit: Bit): void
    clearSlots(): void
    shakeSlot(i: number): Promise<void>
    /** contorna a caixinha que vai receber o próximo número */
    focus(i: number | null): void
    slotPos(i: number): Point
    figurePos(): Point
    rect(): Rect
    destroy(): void
}

const LETTER_STEP = 34

/** "Mande ⭐ = [ ][ ][ ][ ]": o que mandar e o código a seguir */
export function createOrder(scene: Phaser.Scene, bits: number, kind: 'figure' | 'letter'): Order {
    const slot = bits <= 5 ? ORDER.slot : ORDER.slotSmall
    const gap = bits <= 5 ? ORDER.slotGap : 6
    const digitSize = bits <= 5 ? SIZE.slot : SIZE.slotSmall
    const label = scene.add
        .text(0, 0, SAY_ORDER, { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const equals = scene.add
        .text(0, 0, '=', { fontFamily: FONT.black, fontSize: `${SIZE.order}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const figure = fit(scene, PIECE_SHEET, 4, ORDER.figure).setAlpha(0)
    const whatW = kind === 'letter' ? ORDER.word : ORDER.figure

    const pad = 20
    const slotsW = bits * slot + (bits - 1) * gap
    const w = pad + label.width + 14 + whatW + 14 + equals.width + 14 + slotsW + pad
    let x = -w / 2 + pad
    label.x = x
    x += label.width + 14 + whatW / 2
    const whatX = x
    figure.x = whatX
    x += whatW / 2 + 14 + equals.width / 2
    equals.x = x
    x += equals.width / 2 + 14
    const slotX = (i: number) => x + slot / 2 + i * (slot + gap)

    const bg = scene.add.graphics()
    bg.fillStyle(C.headerRim, 0.7)
    bg.fillRoundedRect(-w / 2, -ORDER.h / 2, w, ORDER.h, ORDER.h / 2)

    const slots = Array.from({ length: bits }, (_, i) => {
        const art = piece(scene, UI.slot, slot).setPosition(slotX(i), 0)
        const digit = scene.add
            .text(slotX(i), 1, '', { fontFamily: FONT.black, fontSize: `${digitSize}px`, color: CSS.white })
            .setOrigin(0.5)
            .setResolution(2)
        return { art, digit }
    })

    const ring = scene.add.graphics()
    const word = scene.add.container(whatX, 0)
    const root = scene.add
        .container(ORDER.x, ORDER.y, [bg, label, figure, word, equals, ...slots.flatMap(s => [s.art, s.digit]), ring])
        .setDepth(DEPTH.order)
    const figureBase = figure.scale

    /** a palavra: o que já foi em verde, a letra da vez sublinhada, o resto apagado */
    const paintWord = (text: string, index: number) => {
        word.removeAll(true)
        const x0 = -((text.length - 1) * LETTER_STEP) / 2
        let now: Phaser.GameObjects.Text | undefined
        ;[...text].forEach((ch, k) => {
            const current = k === index
            const t = scene.add
                .text(x0 + k * LETTER_STEP, 0, ch, {
                    fontFamily: FONT.black,
                    fontSize: `${current ? SIZE.letterNow : SIZE.letter}px`,
                    color: k < index ? CSS.done : current ? CSS.accent : CSS.inkSoft,
                })
                .setOrigin(0.5)
                .setResolution(2)
            word.add(t)
            if (current) {
                now = t
                word.add(scene.add.rectangle(t.x, 24, 26, 5, C.accent))
            }
        })
        return now
    }

    return {
        async set(entry, text, index = 0) {
            this.clearSlots()
            if (text) {
                figure.setAlpha(0)
                const now = paintWord(text, index)
                if (now) await FX.popIn(scene, now, { from: 0.5 })
                return
            }
            word.removeAll(true)
            refit(figure, entry.frame ?? 4, ORDER.figure)
            const base = figure.scale
            figure.setAlpha(1)
            await FX.popIn(scene, figure, { from: 0.5 })
            figure.setScale(base || figureBase)
        },
        setSlot(i, bit, solid) {
            const s = slots[i]
            if (!s) return
            s.digit.setText(bit ?? '')
            if (!bit) return
            s.digit.setColor(Phaser.Display.Color.IntegerToColor(BIT_COLOR[bit]).rgba)
            s.digit.setAlpha(solid ? 1 : 0.55)
            if (solid) {
                scene.tweens.killTweensOf(s.digit)
                s.digit.setScale(1)
                void FX.to(scene, s.digit, { scale: 1.3 }, { duration: 110, yoyo: true })
            }
        },
        ghost(i, bit) {
            const s = slots[i]
            if (!s) return
            s.digit.setText(bit).setColor(CSS.ghost).setAlpha(1)
            scene.tweens.killTweensOf(s.digit)
            s.digit.setScale(1)
            void FX.popIn(scene, s.digit, { from: 0.4, duration: 220 })
        },
        focus(i) {
            ring.clear()
            if (i === null || i >= bits) return
            const half = slot / 2 + 5
            ring.lineStyle(4, C.white, 1)
            ring.strokeRoundedRect(slotX(i) - half, -half, half * 2, half * 2, 12)
            ring.lineStyle(2, C.ink, 0.6)
            ring.strokeRoundedRect(slotX(i) - half - 3, -half - 3, half * 2 + 6, half * 2 + 6, 14)
        },
        clearSlots() {
            slots.forEach(s => s.digit.setText(''))
        },
        async shakeSlot(i) {
            const s = slots[i]
            if (!s) return
            await FX.all(FX.shake(scene, s.art, { amount: 6, times: 3 }), FX.shake(scene, s.digit, { amount: 6, times: 3 }))
        },
        slotPos: i => ({ x: ORDER.x + slotX(i), y: ORDER.y }),
        figurePos: () => ({ x: ORDER.x + whatX, y: ORDER.y }),
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: w + 16, h: ORDER.h + 12 }),
        destroy() {
            root.destroy()
        },
    }
}
