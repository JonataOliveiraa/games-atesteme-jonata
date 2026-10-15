import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { UI, UI_SHEET } from '../data/files'
import { BOARD, DEPTH } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FIELD } from '../data/words'
import type { Field, Train } from '../types'
import { fit, pin, shadowOf } from './art'

type Point = { x: number; y: number }
export type Rect = { x: number; y: number; w: number; h: number }

export interface Pill {
    readonly container: Phaser.GameObjects.Container
    glow(on: boolean): void
    setText(text: string): void
}

/** a pílula do nome do campo: todas iguais, na placa e na etiqueta */
export function createPill(scene: Phaser.Scene, text: string, w: number = BOARD.pillW, h: number = BOARD.pillH): Pill {
    const halo = scene.add.graphics()
    halo.fillStyle(C.pillGlow, 0.9)
    halo.fillRoundedRect(-w / 2 - 9, -h / 2 - 9, w + 18, h + 18, (h + 18) / 2)
    halo.setVisible(false)
    const g = scene.add.graphics()
    g.fillStyle(C.shadow, 0.18)
    g.fillRoundedRect(-w / 2 + 2, -h / 2 + 5, w, h, h / 2)
    g.fillStyle(C.pill, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    g.lineStyle(4, C.ink, 1)
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
    const label = scene.add
        .text(0, 1, text, { fontFamily: FONT.black, fontSize: `${SIZE.pill}px`, color: CSS.white })
        .setOrigin(0.5)
        .setResolution(2)
    const container = scene.add.container(0, 0, [halo, g, label])
    return {
        container,
        glow(on) {
            halo.setVisible(on)
            scene.tweens.killTweensOf(halo)
            halo.setAlpha(1)
            if (on) scene.tweens.add({ targets: halo, alpha: 0.45, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
        },
        setText(t) {
            label.setText(t)
        },
    }
}

export interface Board {
    /** a etiqueta salta de `from` (o caixote) para o quadro */
    show(train: Train, from: Point): Promise<void>
    hide(): Promise<void>
    clear(): void
    /** o centro da pílula do campo, na tela */
    pill(field: Field): Point
    /** a ponta direita do valor do campo, na tela */
    value(field: Field): Point
    glow(field: Field, on: boolean): void
    shake(field: Field): Promise<void>
    bump(field: Field): Promise<void>
    rect(): Rect
    destroy(): void
}

interface Row {
    field: Field
    y: number
    pill: Pill
    text: Phaser.GameObjects.Text
    line: Phaser.GameObjects.Container
}

export const valueOf = (train: Train, field: Field) =>
    field === 'name' ? train.name : field === 'to' ? train.to : field === 'from' ? train.from : `${train.weight ?? 0} kg`

export function createBoard(scene: Phaser.Scene): Board {
    const paper = fit(scene, UI_SHEET, UI.label, BOARD.w)
    const box = pin(scene.add.container(BOARD.x, BOARD.y, [shadowOf(scene, paper), paper]).setDepth(DEPTH.board).setVisible(false))
    let rows: Row[] = []
    const maxValue = BOARD.w / 2 - BOARD.valueX - 34

    const row = (field: Field) => rows.find(r => r.field === field) ?? rows[0]

    const clear = () => {
        rows.forEach(r => r.line.destroy())
        rows = []
    }

    return {
        async show(train, from) {
            clear()
            train.order.forEach((field, i) => {
                const y = BOARD.rowsTop + i * BOARD.rowGap
                const pill = createPill(scene, FIELD[field])
                pill.container.setPosition(BOARD.pillX, 0)
                const text = scene.add
                    .text(BOARD.valueX, 2, valueOf(train, field), { fontFamily: FONT.black, fontSize: `${SIZE.value}px`, color: CSS.ink })
                    .setOrigin(0, 0.5)
                    .setResolution(2)
                if (text.width > maxValue) text.setScale(maxValue / text.width)
                const line = scene.add.container(0, y, [pill.container, text])
                box.add(pin(line))
                rows.push({ field, y, pill, text, line })
            })
            scene.tweens.killTweensOf(box)
            box.setVisible(true).setPosition(from.x, from.y).setScale(0.18).setAlpha(0)
            await FX.to(scene, box, { x: BOARD.x, y: BOARD.y, scale: 1, alpha: 1 }, { duration: 460, ease: 'Back.easeOut' })
        },
        async hide() {
            if (!box.visible) return
            await FX.to(scene, box, { alpha: 0, scale: 0.92 }, { duration: 220 })
            box.setVisible(false).setScale(1).setAlpha(1)
            clear()
        },
        clear() {
            scene.tweens.killTweensOf(box)
            box.setVisible(false).setScale(1).setAlpha(1).setPosition(BOARD.x, BOARD.y)
            clear()
        },
        pill(field) {
            const r = row(field)
            return { x: BOARD.x + BOARD.pillX, y: BOARD.y + r.y }
        },
        value(field) {
            const r = row(field)
            return { x: BOARD.x + BOARD.valueX + r.text.displayWidth + 14, y: BOARD.y + r.y }
        },
        glow(field, on) {
            row(field)?.pill.glow(on)
        },
        async shake(field) {
            const r = row(field)
            if (r) await FX.shake(scene, r.line, { amount: 9, times: 3 })
        },
        async bump(field) {
            const r = row(field)
            if (!r) return
            await FX.to(scene, r.pill.container, { scale: 1.18 }, { duration: 150, yoyo: true, ease: 'Sine.easeOut' })
        },
        rect() {
            return { x: BOARD.x, y: BOARD.y, w: BOARD.w + 24, h: BOARD.h + 24 }
        },
        destroy() {
            clear()
            box.destroy()
        },
    }
}
