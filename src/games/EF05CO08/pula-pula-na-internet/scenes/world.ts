import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    GROUND_TOP,
    ITEM_CELL,
    ITEM_SHEET,
    PANEL_KEY,
    PLATFORM_ROW,
    PLATFORM_SHEET,
    SUMMIT_KEY,
    cellKey,
    groundKey,
    sliceKey,
    type PlatformRow,
} from '../data/files'
import { DEPTH, ITEM, PLATFORM, W } from '../data/layout'
import { NIGHT_TABS, groundFor } from '../data/scenery'
import { C } from '../data/theme'
import type { Course, LevelDef, Platform, Vec } from '../types'
import type { View } from './view'

export interface World {
    update(time: number): void
    platformX(p: Platform): number
    landed(p: Platform): void
    itemAt(i: number): Vec
    itemTaken(i: number): boolean
    takeItem(i: number, to: Vec): Promise<void>
    pingItem(i: number): void
    alarm(i: number, on: boolean): void
    destroy(): void
}

interface ItemView {
    box: Phaser.GameObjects.Container
    glow: Phaser.GameObjects.Arc
    base: Vec
    taken: boolean
    alarmed: boolean
}

const LOAD = { perPx: 0.55, cap: 1400, fade: 320 } as const

const rowOf = (p: Platform): PlatformRow => {
    if (p.kind === 'parada') return 'parada'
    if (p.kind === 'topo') return 'topo'
    return p.alt >= NIGHT_TABS ? 'noite' : 'aba'
}

export function createWorld(scene: Phaser.Scene, view: View, course: Course, level: LevelDef, continued = false): World {
    const statics: Phaser.GameObjects.GameObject[] = continued
        ? []
        : [
              scene.add.image(0, 0, PANEL_KEY).setOrigin(0).setDepth(DEPTH.panel),
              scene.add.image(W, 0, PANEL_KEY).setOrigin(1, 0).setFlipX(true).setDepth(DEPTH.panel),
          ]
    const startY = course.platforms[0].y
    const appear = (obj: Phaser.GameObjects.Container | Phaser.GameObjects.Image, y: number) => {
        if (!continued) return
        obj.setAlpha(0)
        const delay = Math.min(LOAD.cap, Math.max(0, startY - y) * LOAD.perPx)
        scene.tweens.add({ targets: obj, alpha: 1, duration: LOAD.fade, delay, ease: 'Sine.easeOut' })
    }

    const capW = PLATFORM.cap * (PLATFORM.h / PLATFORM.cellH)
    const lift = PLATFORM.surface * (PLATFORM.h / PLATFORM.cellH)

    const ground = course.platforms.find(p => p.kind === 'chao')
    if (ground && !continued) {
        const art = scene.add.image(ground.x, ground.y, groundKey(groundFor(level.altitude)))
        art.setOrigin(0.5, GROUND_TOP / art.height)
        view.add(art, 'platform')
    }

    const platformViews = new Map<number, Phaser.GameObjects.Container>()
    course.platforms.forEach(p => {
        if (p.kind === 'chao') return
        const row = PLATFORM_ROW[rowOf(p)]
        const midW = Math.max(2, p.w - capW * 2)
        const left = scene.add.image(-p.w / 2, -lift, PLATFORM_SHEET.key, sliceKey(row, 'l')).setOrigin(0).setDisplaySize(capW, PLATFORM.h)
        const mid = scene.add
            .image(-p.w / 2 + capW, -lift, PLATFORM_SHEET.key, sliceKey(row, 'm'))
            .setOrigin(0)
            .setDisplaySize(midW + 1, PLATFORM.h)
        const right = scene.add.image(p.w / 2 - capW, -lift, PLATFORM_SHEET.key, sliceKey(row, 'r')).setOrigin(0).setDisplaySize(capW, PLATFORM.h)
        const box = view.add(scene.add.container(p.x, p.y, [mid, left, right]), 'platform')
        platformViews.set(p.id, box)
        appear(box, p.y)
    })

    const summitArt = view.add(scene.add.image(course.summit.x, course.summit.y - lift + 4, SUMMIT_KEY).setOrigin(0.5, 1), 'summit')
    summitArt.setScale(300 / summitArt.width)
    appear(summitArt, course.summit.y)

    const itemViews: ItemView[] = []
    course.platforms.forEach(p => {
        if (p.item === undefined) return
        const def = level.items[p.item]
        const base = { x: p.x, y: p.y - ITEM.lift }
        const glow = scene.add.circle(0, 0, ITEM.size * 0.6, C.butter, 0.7)
        const art = scene.add.image(0, 0, ITEM_SHEET.key, cellKey(ITEM_CELL[def.kind]))
        art.setScale(ITEM.size / art.width)
        const box = view.add(scene.add.container(base.x, base.y, [glow, art]), 'item')
        scene.tweens.add({ targets: box, y: base.y - 10, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' })
        itemViews[p.item] = { box, glow, base, taken: false, alarmed: false }
        appear(box, p.y)
    })

    const xOf = (p: Platform, time: number) =>
        p.move ? p.x + Math.sin((time / p.move.period) * Math.PI * 2 + p.move.phase) * p.move.range : p.x

    let now = 0

    return {
        update(time) {
            now = time
            course.platforms.forEach(p => {
                if (!p.move) return
                platformViews.get(p.id)?.setX(xOf(p, time))
            })
        },
        platformX: p => xOf(p, now),
        landed(p) {
            const box = platformViews.get(p.id)
            if (!box) return
            scene.tweens.killTweensOf(box)
            box.setY(p.y).setAlpha(1)
            scene.tweens.add({ targets: box, y: p.y + 6, duration: 70, yoyo: true, ease: 'Sine.easeOut' })
        },
        itemAt(i) {
            const v = itemViews[i]
            return v ? { x: v.box.x, y: v.box.y } : { x: 0, y: 0 }
        },
        itemTaken: i => itemViews[i]?.taken ?? true,
        async takeItem(i, to) {
            const v = itemViews[i]
            if (!v || v.taken) return
            v.taken = true
            scene.tweens.killTweensOf(v.box)
            v.box.setRotation(0)
            v.glow.setVisible(false)
            await FX.to(scene, v.box, { x: to.x, y: to.y, scale: 0.35 }, { duration: 420, ease: 'Back.easeIn' })
            v.box.setVisible(false)
        },
        pingItem(i) {
            const v = itemViews[i]
            if (!v || v.taken) return
            const ring = view.add(scene.add.circle(v.box.x, v.box.y, ITEM.size * 0.7), 'fx')
            ring.setStrokeStyle(8, C.gold, 1)
            scene.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 700, repeat: 1, onComplete: () => ring.destroy() })
        },
        alarm(i, on) {
            const v = itemViews[i]
            if (!v || v.taken || v.alarmed === on) return
            v.alarmed = on
            v.glow.setFillStyle(on ? C.oops : C.butter, on ? 0.85 : 0.7)
            if (on) scene.tweens.add({ targets: v.box, rotation: 0.16, duration: 110, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            else {
                scene.tweens.killTweensOf(v.box)
                v.box.setRotation(0).setY(v.base.y).setAlpha(1)
                scene.tweens.add({ targets: v.box, y: v.base.y - 10, yoyo: true, repeat: -1, duration: 900, ease: 'Sine.easeInOut' })
            }
        },
        destroy() {
            statics.forEach(o => o.destroy())
            itemViews.forEach(v => scene.tweens.killTweensOf(v.box))
        },
    }
}
