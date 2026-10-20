import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import {
    CLOUD_BASE,
    CLOUD_SHEET,
    ITEM_CELL,
    ITEM_SHEET,
    NET_KEY,
    PLATFORM_ROW,
    PLATFORM_SHEET,
    SKY_KEY,
    SUMMIT_KEY,
    cellKey,
    sliceKey,
} from '../data/files'
import { COLUMN, DEPTH, H, HEADER, ITEM, PLATFORM, W } from '../data/layout'
import { C } from '../data/theme'
import type { Cloud, Course, ItemDef, Platform, Vec } from '../types'
import type { View } from './view'

export interface World {
    update(time: number): void
    platformX(p: Platform): number
    landed(p: Platform): void
    itemAt(i: number): Vec
    itemTaken(i: number): boolean
    takeItem(i: number, to: Vec): Promise<void>
    pingItem(i: number): void
    cloudClosed(i: number): boolean
    bumpCloud(i: number): void
    openCloud(i: number): Promise<void>
    destroy(): void
}

interface ItemView {
    box: Phaser.GameObjects.Container
    glow: Phaser.GameObjects.Arc
    base: Vec
    taken: boolean
}

interface CloudView {
    left: Phaser.GameObjects.Image
    right: Phaser.GameObjects.Image
    open: boolean
}

const NET_SPEED = 0.35

export function createWorld(scene: Phaser.Scene, view: View, course: Course, items: ItemDef[]): World {
    const statics: Phaser.GameObjects.GameObject[] = []

    statics.push(scene.add.image(0, 0, SKY_KEY).setOrigin(0).setDisplaySize(W, H).setDepth(DEPTH.sky))
    const netTile = scene.add
        .tileSprite(COLUMN.left, HEADER.h, COLUMN.w, H - HEADER.h, NET_KEY)
        .setOrigin(0)
        .setAlpha(0.7)
        .setDepth(DEPTH.net)
    statics.push(netTile)

    const panels = scene.add.graphics().setDepth(DEPTH.panel)
    ;[0, COLUMN.right].forEach(x => {
        const w = x === 0 ? COLUMN.left : W - COLUMN.right
        panels.fillStyle(C.panel, 0.94)
        panels.fillRect(x, 0, w, H)
        panels.fillStyle(C.panelDark, 0.6)
        for (let k = 0; k < 9; k++) panels.fillCircle(x + 34 + ((k * 73) % (w - 60)), 150 + k * 52, 5 + (k % 3) * 3)
    })
    panels.fillStyle(C.columnLine, 0.75)
    panels.fillRect(COLUMN.left - 4, 0, 4, H)
    panels.fillRect(COLUMN.right, 0, 4, H)
    statics.push(panels)

    const capW = PLATFORM.cap * (PLATFORM.h / PLATFORM.cellH)
    const lift = PLATFORM.surface * (PLATFORM.h / PLATFORM.cellH)

    const platformViews = new Map<number, Phaser.GameObjects.Container>()
    course.platforms.forEach(p => {
        const row = PLATFORM_ROW[p.kind]
        const midW = Math.max(2, p.w - capW * 2)
        const left = scene.add.image(-p.w / 2, -lift, PLATFORM_SHEET.key, sliceKey(row, 'l')).setOrigin(0).setDisplaySize(capW, PLATFORM.h)
        const mid = scene.add
            .image(-p.w / 2 + capW, -lift, PLATFORM_SHEET.key, sliceKey(row, 'm'))
            .setOrigin(0)
            .setDisplaySize(midW + 1, PLATFORM.h)
        const right = scene.add
            .image(p.w / 2 - capW, -lift, PLATFORM_SHEET.key, sliceKey(row, 'r'))
            .setOrigin(0)
            .setDisplaySize(capW, PLATFORM.h)
        const box = view.add(scene.add.container(p.x, p.y, [mid, left, right]), 'platform')
        platformViews.set(p.id, box)
    })

    const summitArt = view.add(
        scene.add.image(course.summit.x, course.summit.y - lift + 4, SUMMIT_KEY).setOrigin(0.5, 1),
        'summit',
    )
    summitArt.setScale(300 / summitArt.frame.width)
    scene.tweens.add({ targets: summitArt, scaleX: summitArt.scaleX * 1.03, scaleY: summitArt.scaleY * 1.03, yoyo: true, repeat: -1, duration: 900 })

    const itemViews: ItemView[] = []
    course.platforms.forEach(p => {
        if (p.item === undefined) return
        const def = items[p.item]
        const base = { x: p.x, y: p.y - ITEM.lift }
        const glow = scene.add.circle(0, 0, ITEM.size * 0.62, C.butter, 0.45)
        const art = scene.add.image(0, 0, ITEM_SHEET.key, cellKey(ITEM_CELL[def.kind]))
        art.setScale(ITEM.size / art.frame.width)
        const box = view.add(scene.add.container(base.x, base.y, [glow, art]), 'item')
        scene.tweens.add({ targets: box, y: base.y - 10, yoyo: true, repeat: -1, duration: 820, ease: 'Sine.easeInOut' })
        scene.tweens.add({ targets: glow, scale: 1.18, alpha: 0.2, yoyo: true, repeat: -1, duration: 700 })
        itemViews[p.item] = { box, glow, base, taken: false }
    })

    const cloudViews: CloudView[] = []
    course.clouds.forEach((cloud: Cloud) => {
        const half = (side: 0 | 1) => {
            const img = scene.add.image(COLUMN.x, cloud.bottom + 6, CLOUD_SHEET.key, cellKey(side)).setOrigin(side ? 0 : 1, CLOUD_BASE)
            img.setScale((COLUMN.w / 2 + 50) / img.frame.width)
            return view.add(img, 'cloud')
        }
        cloudViews[cloud.item] = { left: half(0), right: half(1), open: false }
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
            netTile.tilePositionY = view.top() * NET_SPEED
        },
        platformX: p => xOf(p, now),
        landed(p) {
            const box = platformViews.get(p.id)
            if (!box) return
            scene.tweens.killTweensOf(box)
            box.setY(p.y)
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
            scene.tweens.killTweensOf(v.glow)
            v.glow.setVisible(false)
            await FX.to(scene, v.box, { x: to.x, y: to.y, scale: 0.35 }, { duration: 380, ease: 'Back.easeIn' })
            v.box.setVisible(false)
        },
        pingItem(i) {
            const v = itemViews[i]
            if (!v || v.taken) return
            const ring = view.add(scene.add.circle(v.box.x, v.box.y, ITEM.size * 0.7), 'fx')
            ring.setStrokeStyle(8, C.gold, 1)
            scene.tweens.add({ targets: ring, scale: 1.8, alpha: 0, duration: 700, repeat: 1, onComplete: () => ring.destroy() })
            void FX.to(scene, v.box, { scale: 1.25 }, { duration: 220, yoyo: true, repeat: 1 })
        },
        cloudClosed: i => !(cloudViews[i]?.open ?? true),
        bumpCloud(i) {
            const v = cloudViews[i]
            if (!v || v.open) return
            ;[v.left, v.right].forEach(img => {
                scene.tweens.killTweensOf(img)
                img.setY(course.clouds[i].bottom + 6)
                scene.tweens.add({ targets: img, y: img.y - 14, duration: 90, yoyo: true, ease: 'Sine.easeOut' })
            })
        },
        async openCloud(i) {
            const v = cloudViews[i]
            if (!v || v.open) return
            v.open = true
            const away = COLUMN.w / 2 + 120
            await FX.all(
                FX.to(scene, v.left, { x: COLUMN.x - away, alpha: 0 }, { duration: 620 }),
                FX.to(scene, v.right, { x: COLUMN.x + away, alpha: 0 }, { duration: 620 }),
            )
            v.left.setVisible(false)
            v.right.setVisible(false)
        },
        destroy() {
            statics.forEach(o => o.destroy())
            scene.tweens.killTweensOf(summitArt)
        },
    }
}
