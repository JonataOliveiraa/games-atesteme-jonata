import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI, UI_SHEET } from '../data/files'
import { DEPTH, ORDER, U } from '../data/layout'
import { C } from '../data/theme'
import type { Entry } from '../types'
import { glyph, pixel, ptext } from './art'
import type { Rect } from './guide'
import { bakePix, cellPix } from './pixelart'

/** "DEVOLVA OS PIXELS" (ou AS LETRAS) e uma casinha por fujão: vazia com "?", ganha a cor (ou a letra) de quem volta */
export interface Order {
    set(count: number, text: string): void
    fill(got: Entry, wrong?: boolean): Promise<void>
    rect(): Rect
    destroy(): void
}

export function createOrder(scene: Phaser.Scene): Order {
    const root = scene.add.container(ORDER.x, ORDER.y).setDepth(DEPTH.order)
    let slots: Array<{ x: number; filled: boolean; parts: Phaser.GameObjects.Image[] }> = []
    let width = 0

    const set = (count: number, text: string) => {
        root.removeAll(true)
        slots = []
        const label = ptext(scene, 0, 2, text, ORDER.text, 'white')
        const slotsW = count * ORDER.slot + (count - 1) * ORDER.gap
        const gap = 24
        width = label.width + gap + slotsW
        label.setX(-width / 2 + label.width / 2)
        root.add(label)
        for (let i = 0; i < count; i++) {
            const x = -width / 2 + label.width + gap + ORDER.slot / 2 + i * (ORDER.slot + ORDER.gap)
            const hole = pixel(scene, UI_SHEET, UI.hole, ORDER.slot / 16).setX(x)
            const mark = glyph(scene, '?', 'mark', 21).setX(x)
            root.add([hole, mark])
            slots.push({ x, filled: false, parts: [hole, mark] })
        }
    }

    return {
        set,
        async fill(got, wrong = false) {
            const slot = slots.find(s => !s.filled)
            if (!slot) return
            slot.filled = true
            const chip = scene.add.image(0, 0, bakePix(scene, `chip-${got.color.toString(16)}`, cellPix(ORDER.slot / U, got.color))).setScale(U)
            const box = scene.add.container(slot.x, 0, [chip])
            if (got.glyph) box.add(ptext(scene, 0, 2, got.glyph, 4, 'dark'))
            if (wrong) {
                const g = scene.add.graphics()
                g.lineStyle(U, C.oops, 1)
                g.strokeRect(-ORDER.slot / 2 - U / 2, -ORDER.slot / 2 - U / 2, ORDER.slot + U, ORDER.slot + U)
                box.add(g)
            }
            root.add(box)
            slot.parts.forEach(p => p.setVisible(false))
            await FX.popIn(scene, box, { from: 0.5, duration: 260 })
            if (wrong) await FX.to(scene, box, { x: slot.x + U }, { duration: 50, yoyo: true, repeat: 3 })
        },
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: width + 32, h: ORDER.slot + 24 }),
        destroy() {
            root.destroy()
        },
    }
}
