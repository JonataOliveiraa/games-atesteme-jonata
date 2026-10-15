import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { cellKey, STAMP, STAMP_SHEET, STRIP_SHEET } from '../data/files'
import { BOOTH, DEPTH, STRIP } from '../data/layout'
import { C, CSS, FONT, SIZE } from '../data/theme'
import { FIELD } from '../data/words'
import type { Field } from '../types'
import { fade, fit, pin, shadowOf } from './art'
import type { Audio } from './audio'
import { createPill, valueOf, type Board, type Pill } from './board'

export interface Label extends Board {
    /** troca o valor do campo com o carimbo: a borracha desce, a tinta fica, o texto novo entra */
    stamp(field: Field, value: string, from: { x: number; y: number }): Promise<void>
    /** liga o modo de escolher campo (N3): tocar num campo chama cb(field) */
    setPickable(on: boolean): void
    onPick(cb: (field: Field) => void): void
    /** some enquanto a criança arrasta o pátio (e os campos não pegam toque) */
    setShown(on: boolean): void
}

interface Cell {
    field: Field
    x: number
    pill: Pill
    text: Phaser.GameObjects.Text
    line: Phaser.GameObjects.Container
    zone: Phaser.GameObjects.Zone
    mark?: Phaser.GameObjects.Image
}

const SEP = STRIP.gap * 2

/** a etiqueta comprida do N2/N3: os campos lado a lado, na ordem do trem */
export function createStrip(scene: Phaser.Scene, audio?: Pick<Audio, 'stamp'>): Label {
    const paper = scene.add.image(0, 0, STRIP_SHEET.key, cellKey(0)).setDisplaySize(STRIP.w, STRIP.h)
    const dividers = scene.add.graphics()
    const box = scene.add.container(STRIP.x, STRIP.y, [shadowOf(scene, paper), paper, dividers]).setVisible(false)
    /** o some/volta do arrastar mexe só aqui; o alpha do `box` é do salto da etiqueta */
    const holder = pin(scene.add.container(0, 0, [box]).setDepth(DEPTH.board))
    let cells: Cell[] = []
    let shown = true
    let pickable = false
    let picked: (field: Field) => void = () => {}
    let room = 0

    const cell = (field: Field) => cells.find(c => c.field === field) ?? cells[0]

    const fitText = (text: Phaser.GameObjects.Text) => {
        text.setScale(1)
        if (text.width > room) text.setScale(room / text.width)
    }

    const clear = () => {
        cells.forEach(c => {
            c.zone.destroy()
            c.line.destroy()
        })
        cells = []
        dividers.clear()
    }

    const syncZones = () =>
        cells.forEach(c => {
            if (c.zone.input) c.zone.input.enabled = pickable && shown && box.visible
        })

    const build = (order: Field[], values: (field: Field) => string) => {
        clear()
        const inner = STRIP.w - STRIP.pad - STRIP.barcode
        const n = order.length
        const cellW = (inner - (n - 1) * SEP) / n
        room = cellW - STRIP.pillW - STRIP.gap
        order.forEach((field, i) => {
            const x = -STRIP.w / 2 + STRIP.pad + cellW / 2 + i * (cellW + SEP)
            const left = -cellW / 2
            const pill = createPill(scene, FIELD[field], STRIP.pillW, STRIP.pillH)
            pill.container.setPosition(left + STRIP.pillW / 2, 0)
            const text = scene.add
                .text(left + STRIP.pillW + STRIP.gap, 2, values(field), {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.strip}px`,
                    color: CSS.ink,
                })
                .setOrigin(0, 0.5)
                .setResolution(2)
            fitText(text)
            const line = pin(scene.add.container(x, 0, [pill.container, text]))
            box.add(line)
            const zone = scene.add
                .zone(STRIP.x + x, STRIP.y, cellW + SEP, STRIP.h)
                .setScrollFactor(0)
                .setDepth(DEPTH.board + 1)
                .setInteractive({ useHandCursor: true })
            zone.on('pointerdown', () => {
                if (pickable) picked(field)
            })
            cells.push({ field, x, pill, text, line, zone })
            if (i > 0) {
                const dx = x - cellW / 2 - SEP / 2
                dividers.fillStyle(C.paperLine, 1)
                for (let y = -STRIP.h / 2 + 18; y <= STRIP.h / 2 - 18; y += 12) dividers.fillCircle(dx, y, 3)
            }
        })
    }

    const valueCenter = (c: Cell) => ({
        x: STRIP.x + c.x + c.text.x + c.text.displayWidth / 2,
        y: STRIP.y + c.text.y,
    })

    return {
        async show(train, from) {
            build(train.order, field => valueOf(train, field))
            scene.tweens.killTweensOf(box)
            box.setVisible(true).setPosition(from.x, from.y).setScale(0.18).setAlpha(0)
            syncZones()
            await FX.to(scene, box, { x: STRIP.x, y: STRIP.y, scale: 1, alpha: 1 }, { duration: 460, ease: 'Back.easeOut' })
        },
        async hide() {
            if (!box.visible) return
            await FX.to(scene, box, { alpha: 0, scale: 0.92 }, { duration: 220 })
            box.setVisible(false).setScale(1).setAlpha(1)
            clear()
        },
        clear() {
            scene.tweens.killTweensOf(box)
            box.setVisible(false).setScale(1).setAlpha(1).setPosition(STRIP.x, STRIP.y)
            clear()
        },
        pill(field) {
            const c = cell(field)
            return { x: STRIP.x + c.x + c.pill.container.x, y: STRIP.y }
        },
        value(field) {
            return { x: valueCenter(cell(field)).x, y: STRIP.y + STRIP.h / 2 - 6 }
        },
        glow(field, on) {
            cell(field)?.pill.glow(on)
        },
        async shake(field) {
            const c = cell(field)
            if (c) await FX.shake(scene, c.line, { amount: 9, times: 3 })
        },
        async bump(field) {
            const c = cell(field)
            if (!c) return
            await FX.to(scene, c.pill.container, { scale: 1.18 }, { duration: 150, yoyo: true, ease: 'Sine.easeOut' })
        },
        rect() {
            return { x: STRIP.x, y: STRIP.y, w: STRIP.w + 24, h: STRIP.h + 24 }
        },
        async stamp(field, value, from) {
            const c = cell(field)
            if (!c) return
            const at = valueCenter(c)
            const tool = pin(fit(scene, STAMP_SHEET, STAMP.tool, BOOTH.tool))
                .setOrigin(0.5, 1)
                .setPosition(from.x, from.y)
                .setDepth(DEPTH.fx)
            const scale = tool.scale
            const above = at.y - 40
            await FX.to(scene, tool, { x: at.x, y: above, angle: -8 }, { duration: 420, ease: 'Sine.easeInOut' })
            await FX.to(scene, tool, { angle: 0 }, { duration: 110 })
            await FX.to(scene, tool, { y: at.y + 24, scaleY: scale * 0.86 }, { duration: 130, ease: 'Quad.easeIn' })
            audio?.stamp()
            c.mark?.destroy()
            const mark = pin(fit(scene, STAMP_SHEET, STAMP.mark, Math.min(BOOTH.mark, room))).setPosition(
                c.text.x + c.text.displayWidth / 2,
                2,
            )
            c.mark = mark
            c.line.addAt(mark, 1)
            void FX.popIn(scene, mark, { from: 0.4, duration: 260 })
            await FX.to(scene, c.text, { scale: 0 }, { duration: 120, ease: 'Sine.easeIn' })
            c.text.setText(value)
            fitText(c.text)
            mark.setX(c.text.x + c.text.displayWidth / 2)
            const size = c.text.scale
            c.text.setScale(0)
            const lift = FX.to(scene, tool, { y: above - 30, scaleY: scale, alpha: 0 }, { duration: 320, ease: 'Sine.easeOut' })
            await FX.to(scene, c.text, { scale: size }, { duration: 300, ease: 'Back.easeOut' })
            await lift
            tool.destroy()
        },
        setPickable(on) {
            pickable = on
            syncZones()
        },
        onPick(cb) {
            picked = cb
        },
        setShown(on) {
            shown = on
            fade(scene, holder, on ? 1 : 0)
            syncZones()
        },
        destroy() {
            clear()
            scene.tweens.killTweensOf([box, holder])
            holder.destroy()
        },
    }
}
