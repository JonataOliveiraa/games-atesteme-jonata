import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { BAG_KEY, cellKey } from '../data/files'
import { BAG, DEPTH } from '../data/layout'
import { PLACES } from '../data/places'
import { C } from '../data/theme'
import type { PartId, Rect, Vec } from '../types'

export interface Bag {
    readonly items: readonly (PartId | null)[]
    has(id: PartId): boolean
    full(): boolean
    slotAt(index: number): Vec
    add(id: PartId, from: Vec): Promise<void>
    take(id: PartId, to: Vec): Promise<void>
    drop(index: number, toward: Vec): Promise<void>
    shake(): void
    rect(): Rect
    visible(on: boolean): void
    destroy(): void
}

interface Slot {
    box: Phaser.GameObjects.Container
    full: Phaser.GameObjects.Graphics
    icon: Phaser.GameObjects.Image
}

export function createBag(scene: Phaser.Scene): Bag {
    const items: (PartId | null)[] = Array.from({ length: BAG.slots }, () => null)
    const left = BAG.x - BAG.w / 2
    const height = BAG.bottom - BAG.top

    const panel = scene.add.graphics()
    panel.fillStyle(C.shadow, 0.18)
    panel.fillRoundedRect(left + 3, BAG.top + 7, BAG.w, height, 30)
    panel.fillStyle(C.headerFace, 1)
    panel.fillRoundedRect(left, BAG.top, BAG.w, height, 30)
    panel.fillStyle(C.headerRim, 1)
    panel.fillRoundedRect(left + 22, BAG.bottom - 7, BAG.w - 44, 7, 3.5)

    const art = scene.add.image(BAG.x, BAG.artY, BAG_KEY).setDisplaySize(BAG.art, BAG.art)
    const artBase = art.scale

    const slotAt = (i: number): Vec => ({ x: BAG.x, y: BAG.slotY + i * BAG.slotGap })

    const slots: Slot[] = items.map((_, i) => {
        const at = slotAt(i)
        const empty = scene.add.graphics()
        empty.fillStyle(C.headerSoft, 1)
        empty.fillCircle(0, 0, BAG.slotR)
        empty.lineStyle(4, C.headerRim, 1)
        empty.strokeCircle(0, 0, BAG.slotR)
        const full = scene.add.graphics()
        full.fillStyle(C.shadow, 0.18)
        full.fillCircle(0, 4, BAG.slotR)
        full.fillStyle(C.white, 1)
        full.fillCircle(0, 0, BAG.slotR)
        full.lineStyle(4, C.headerLine, 1)
        full.strokeCircle(0, 0, BAG.slotR)
        full.setVisible(false)
        const icon = scene.add.image(0, 0, 'icones', cellKey(0)).setDisplaySize(BAG.icon, BAG.icon).setVisible(false)
        const box = scene.add.container(at.x, at.y, [empty, full, icon])
        return { box, full, icon }
    })

    const rig = scene.add.container(0, 0, [panel, art, ...slots.map(s => s.box)]).setDepth(DEPTH.bag)

    const paintSlot = (i: number, pop: boolean) => {
        const id = items[i]
        const s = slots[i]
        s.full.setVisible(Boolean(id))
        s.icon.setVisible(Boolean(id))
        if (id) s.icon.setFrame(cellKey(PLACES[id].icon)).setDisplaySize(BAG.icon, BAG.icon)
        scene.tweens.killTweensOf(s.box)
        s.box.setScale(1)
        if (pop) void FX.to(scene, s.box, { scale: 1.18 }, { duration: 120, yoyo: true })
    }

    const hop = () => {
        scene.tweens.killTweensOf(art)
        art.setScale(artBase)
        void FX.to(scene, art, { scaleX: artBase * 1.12, scaleY: artBase * 0.9 }, { duration: 110, yoyo: true })
    }

    const arc = (obj: Phaser.GameObjects.Image, from: Vec, to: Vec, lift: number, grow: number) => {
        const k = { t: 0 }
        const base = obj.scale
        return new Promise<void>(resolve => {
            scene.tweens.add({
                targets: k,
                t: 1,
                duration: FX.ms(scene, BAG.fly),
                ease: 'Sine.easeInOut',
                onUpdate: () => {
                    const u = k.t
                    obj.setPosition(Phaser.Math.Linear(from.x, to.x, u), Phaser.Math.Linear(from.y, to.y, u) - Math.sin(u * Math.PI) * lift)
                    obj.setScale(base * Phaser.Math.Linear(1, grow, u))
                },
                onComplete: () => resolve(),
            })
        })
    }

    const flyer = (id: PartId, at: Vec) =>
        scene.add
            .image(at.x, at.y, 'icones', cellKey(PLACES[id].icon))
            .setDisplaySize(BAG.icon * 1.25, BAG.icon * 1.25)
            .setDepth(DEPTH.bag + 4)

    return {
        items,
        has: id => items.includes(id),
        full: () => !items.includes(null),
        slotAt,
        async add(id, from) {
            const i = items.indexOf(null)
            if (i < 0 || items.includes(id)) return
            items[i] = id
            const fly = flyer(id, from)
            await arc(fly, from, slotAt(i), 140, 0.8)
            fly.destroy()
            paintSlot(i, true)
            hop()
        },
        async take(id, to) {
            const i = items.indexOf(id)
            if (i < 0) return
            items[i] = null
            paintSlot(i, false)
            hop()
            const fly = flyer(id, slotAt(i))
            await arc(fly, slotAt(i), to, 120, 1.3)
            fly.destroy()
        },
        async drop(i, toward) {
            const id = items[i]
            if (!id) return
            items[i] = null
            paintSlot(i, false)
            hop()
            const from = slotAt(i)
            const dx = toward.x - from.x
            const dy = toward.y - from.y
            const len = Math.hypot(dx, dy) || 1
            const fly = flyer(id, from)
            const to = { x: from.x + (dx / len) * 320, y: from.y + (dy / len) * 320 }
            void FX.to(scene, fly, { alpha: 0 }, { duration: BAG.fly * 0.5, delay: BAG.fly * 0.5 })
            await arc(fly, from, to, 80, 0.7)
            fly.destroy()
        },
        shake() {
            if (scene.tweens.isTweening(rig)) return
            void FX.shake(scene, rig, { amount: 8, times: 3 })
        },
        rect() {
            const top = BAG.artY - BAG.art / 2
            return { x: BAG.x, y: (top + BAG.bottom) / 2, w: BAG.w, h: BAG.bottom - top }
        },
        visible(on) {
            rig.setVisible(on)
        },
        destroy() {
            scene.tweens.killTweensOf([rig, art, ...slots.map(s => s.box)])
            rig.destroy()
        },
    }
}
