import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    APP_CELL,
    APP_SHEET,
    CAVE_CELL,
    CAVE_SHEET,
    CRITTER_CELL,
    CRITTER_SHEET,
    FALL_SHEET,
    NATURE_CELL,
    NATURE_SHEET,
    SCENERY_CELL,
    SCENERY_SHEET,
    WOOD_CELL,
    WOOD_SHEET,
    cellKey,
    type Sheet,
} from '../data/files'
import { DEPTH, ORDER } from '../data/layout'
import { SUBJECTS } from '../data/subjects'
import { C, CSS, FONT, MODE_TONE, SIZE, inkOn } from '../data/theme'
import { MODE_LABEL } from '../data/words'
import type { Order, Rect, SubjectId } from '../types'
import { fit } from './art'
import type { Card } from './capture'

export interface OrderCard {
    show(order: Order): Promise<void>
    leave(): Promise<void>
    slot(): { x: number; y: number; w: number }
    keep(card: Card): void
    shakeMode(): Promise<void>
    rect(): Rect
    visible(on: boolean): void
    setCompact(k: number): void
    destroy(): void
}

const ICON: Record<SubjectId, { sheet: Sheet; cell: number }> = {
    mushroom: { sheet: NATURE_SHEET, cell: NATURE_CELL.mushroom },
    butterfly: { sheet: NATURE_SHEET, cell: NATURE_CELL.butterflyA },
    sunflower: { sheet: NATURE_SHEET, cell: NATURE_CELL.sunflower },
    frog: { sheet: NATURE_SHEET, cell: NATURE_CELL.frog },
    lake: { sheet: NATURE_SHEET, cell: NATURE_CELL.lily },
    waterfall: { sheet: FALL_SHEET, cell: 0 },
    duck: { sheet: NATURE_SHEET, cell: NATURE_CELL.duck },
    bluecrystal: { sheet: CAVE_SHEET, cell: CAVE_CELL.bluecrystal },
    crystal: { sheet: CAVE_SHEET, cell: CAVE_CELL.crystal },
    drops: { sheet: CRITTER_SHEET, cell: CRITTER_CELL.drop },
    glowmoss: { sheet: CRITTER_SHEET, cell: CRITTER_CELL.mossLit },
    glowshroom: { sheet: CAVE_SHEET, cell: CAVE_CELL.shroomLit },
    cavefish: { sheet: CRITTER_SHEET, cell: CRITTER_CELL.fish },
    fireflies: { sheet: CRITTER_SHEET, cell: CRITTER_CELL.fireflyLit },
    stalagmite: { sheet: CAVE_SHEET, cell: CAVE_CELL.stalagmite },
    nest: { sheet: WOOD_SHEET, cell: WOOD_CELL.nest },
    boulder: { sheet: SCENERY_SHEET, cell: SCENERY_CELL.rock },
    ladybug: { sheet: WOOD_SHEET, cell: WOOD_CELL.ladybug },
    bigtree: { sheet: WOOD_SHEET, cell: WOOD_CELL.bigtree },
    ants: { sheet: WOOD_SHEET, cell: WOOD_CELL.ant },
    anthill: { sheet: WOOD_SHEET, cell: WOOD_CELL.anthill },
    bee: { sheet: WOOD_SHEET, cell: WOOD_CELL.beeOpen },
}

const SHIFT = 16
const GAP = { icon: 16, text: 14, slot: 28 }

function dashed(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number) {
    g.fillStyle(C.headerSoft, 1)
    g.fillRoundedRect(x, y, w, h, 12)
    g.lineStyle(3, C.headerLine, 0.45)
    const dash = 11
    const gap = 8
    const edge = (ax: number, ay: number, bx: number, by: number) => {
        const len = Math.hypot(bx - ax, by - ay)
        for (let d = 0; d < len; d += dash + gap) {
            const e = Math.min(len, d + dash)
            g.lineBetween(ax + ((bx - ax) * d) / len, ay + ((by - ay) * d) / len, ax + ((bx - ax) * e) / len, ay + ((by - ay) * e) / len)
        }
    }
    edge(x + 10, y, x + w - 10, y)
    edge(x + w, y + 10, x + w, y + h - 10)
    edge(x + w - 10, y + h, x + 10, y + h)
    edge(x, y + h - 10, x, y + 10)
}

export function createOrderCard(scene: Phaser.Scene): OrderCard {
    const slotArt = scene.add.graphics()
    dashed(slotArt, -ORDER.slotW / 2, -ORDER.slotH / 2, ORDER.slotW, ORDER.slotH)

    const pillBg = scene.add.graphics()
    const pillIcon = scene.add.image(-ORDER.pillW / 2 + 32, 0, APP_SHEET.key, cellKey(APP_CELL.camera))
    const pillText = scene.add
        .text(24, 1, '', { fontFamily: FONT.black, fontSize: `${SIZE.pill}px`, color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    const pill = scene.add.container(ORDER.pillDX, 0, [pillBg, pillIcon, pillText])

    let icon: Phaser.GameObjects.Image | undefined
    const name = scene.add
        .text(ORDER.textDX, ORDER.nameDY, '', { fontFamily: FONT.black, fontSize: `${SIZE.name}px`, color: CSS.ink })
        .setOrigin(0, 0.5)
        .setResolution(2)
    const hint = scene.add
        .text(ORDER.textDX, ORDER.hintDY, '', { fontFamily: FONT.body, fontSize: `${SIZE.hint}px`, color: CSS.inkSoft })
        .setOrigin(0, 0.5)
        .setResolution(2)

    const backing = scene.add.graphics().setAlpha(0)
    const content = scene.add.container(ORDER.x, ORDER.y, [backing, pill, name, hint]).setAlpha(0)
    const slot = scene.add.container(ORDER.x + ORDER.slotDX, ORDER.y, [slotArt])
    const rig = scene.add.container(0, 0, [slot, content]).setDepth(DEPTH.order)
    let compact = 0
    let kept: Card[] = []
    let shown = true
    let active = false
    let pillX = ORDER.pillDX
    let slotX = ORDER.slotDX

    const paintPill = (order: Order) => {
        const tone = MODE_TONE[order.mode]
        pillBg.clear()
        pillBg.fillStyle(tone, 1)
        pillBg.fillRoundedRect(-ORDER.pillW / 2, -ORDER.pillH / 2, ORDER.pillW, ORDER.pillH, ORDER.pillH / 2)
        pillIcon.setFrame(cellKey(order.mode === 'photo' ? APP_CELL.camera : APP_CELL.camcorder))
        pillIcon.setScale(46 / Math.max(pillIcon.frame.width, pillIcon.frame.height))
        pillText.setText(MODE_LABEL[order.mode]).setColor(inkOn(tone)).setScale(1)
        if (pillText.width > ORDER.pillW - 76) pillText.setScale((ORDER.pillW - 76) / pillText.width)
    }

    const clearKept = () => {
        kept.forEach(c => c.destroy())
        kept = []
    }

    return {
        async show(order) {
            const def = SUBJECTS[order.subject]
            paintPill(order)
            icon?.destroy()
            const art = ICON[order.subject]
            icon = fit(scene, art.sheet, art.cell, ORDER.iconSize).setPosition(ORDER.iconDX, 0)
            content.addAt(icon, 1)
            name.setText(def.name).setScale(1)
            if (name.width > ORDER.textW) name.setScale(ORDER.textW / name.width)
            hint.setText(order.hint).setScale(1)
            if (hint.width > ORDER.textW) hint.setScale(ORDER.textW / hint.width)
            const textW = Math.max(name.displayWidth, hint.displayWidth)
            const total = ORDER.pillW + GAP.icon + ORDER.iconSize + GAP.text + textW + GAP.slot + ORDER.slotW
            const left = -total / 2
            pillX = left + ORDER.pillW / 2
            pill.setPosition(pillX, 0)
            icon.setX(left + ORDER.pillW + GAP.icon + ORDER.iconSize / 2)
            name.setX(left + ORDER.pillW + GAP.icon + ORDER.iconSize + GAP.text)
            hint.setX(name.x)
            slotX = total / 2 - ORDER.slotW / 2
            slot.setX(ORDER.x + slotX)
            const right = name.x + textW + 22
            const from = left - 14
            backing.clear()
            backing.fillStyle(C.shadow, 0.22)
            backing.fillRoundedRect(from + 3, -ORDER.h / 2 + 7, right - from, ORDER.h - 4, 28)
            backing.fillStyle(C.headerFace, 0.96)
            backing.fillRoundedRect(from, -ORDER.h / 2 + 2, right - from, ORDER.h - 4, 28)
            backing.lineStyle(3, C.headerRim, 1)
            backing.strokeRoundedRect(from, -ORDER.h / 2 + 2, right - from, ORDER.h - 4, 28)
            active = true
            scene.tweens.killTweensOf(content)
            content.setPosition(ORDER.x, ORDER.y + SHIFT).setAlpha(0)
            await FX.to(scene, content, { y: ORDER.y, alpha: shown ? 1 : 0 }, { duration: 380, ease: 'Back.easeOut' })
        },
        async leave() {
            scene.tweens.killTweensOf(content)
            const away = FX.to(scene, content, { y: ORDER.y - SHIFT, alpha: 0 }, { duration: 280, ease: 'Sine.easeIn' })
            const cards = kept.map(c => FX.to(scene, c.box, { alpha: 0, scale: c.box.scale * 0.8 }, { duration: 280 }))
            await FX.all(away, ...cards)
            active = false
            clearKept()
        },
        slot: () => ({ x: ORDER.x + slotX, y: ORDER.y, w: ORDER.slotW - 6 }),
        keep(card) {
            kept.push(card)
        },
        setCompact(k) {
            compact = k
            backing.setAlpha(k)
            slot.setAlpha(shown ? 1 - k : 0)
        },
        async shakeMode() {
            scene.tweens.killTweensOf(pill)
            pill.setPosition(pillX, 0)
            await FX.to(scene, pill, { x: pillX + 10 }, { duration: 55, yoyo: true, repeat: 5 })
            pill.setPosition(pillX, 0)
        },
        rect: () => ({ x: ORDER.x, y: ORDER.y, w: ORDER.w + 12, h: ORDER.h + 8 }),
        visible(on) {
            shown = on
            content.setAlpha(on && active ? 1 : 0)
            slot.setAlpha(on ? 1 - compact : 0)
            kept.forEach(c => c.box.setAlpha(on ? 1 : 0))
        },
        destroy() {
            clearKept()
            scene.tweens.killTweensOf([content, pill])
            rig.destroy()
        },
    }
}
