import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { fitInside, SCENE_BOX, SHEET } from '../data/art'
import { DEPTH, FILM } from '../data/layout'
import { C } from '../data/theme'

const PAD = 10
const INNER = { w: FILM.w - PAD * 2, h: FILM.h - PAD * 2 }

function paintSlot(g: Phaser.GameObjects.Graphics, filled: boolean) {
    const { w, h } = FILM
    g.clear()
    g.fillStyle(C.ink, 0.28)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 16)
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 14)
    g.fillStyle(filled ? C.inkSoft : C.purpleDeep, 1)
    g.fillRoundedRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 11)
    g.fillStyle(C.screenDeep, 1)
    g.fillRoundedRect(-INNER.w / 2, -INNER.h / 2, INNER.w, INNER.h, 7)
    for (let i = 0; i < 4; i++) {
        const x = -w / 2 + 12 + i * ((w - 24) / 3)
        g.fillStyle(C.cream, filled ? 0.85 : 0.32)
        g.fillRoundedRect(x - 5, -h / 2 + 6, 10, 7, 3)
        g.fillRoundedRect(x - 5, h / 2 - 13, 10, 7, 3)
    }
}

export function createFilm(scene: Phaser.Scene, onPick: (index: number) => void) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.film)
    const zones: Phaser.GameObjects.Zone[] = []
    let enabled = false

    const shots: (Phaser.GameObjects.GameObject | null)[] = [null, null, null]

    const slots = FILM.ys.map((y, index) => {
        const holder = scene.add.container(FILM.cx, y)
        const face = scene.add.graphics()
        const ring = scene.add.graphics().setAlpha(0)
        ring.lineStyle(6, C.yellow, 1)
        ring.strokeRoundedRect(-FILM.w / 2 - 6, -FILM.h / 2 - 6, FILM.w + 12, FILM.h + 12, 18)
        paintSlot(face, false)
        holder.add([face, ring])
        root.add(holder)

        const zone = scene.add
            .zone(FILM.cx, y, FILM.w + 12, FILM.h + 12)
            .setOrigin(0.5)
            .setDepth(DEPTH.film + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (enabled && shots[index]) onPick(index)
        })
        zones.push(zone)

        return { holder, face, ring }
    })

    const makeShot = (frame: number) => {
        if (!scene.textures.exists(SHEET.scenes)) {
            const g = scene.add.graphics()
            const tone = [C.blue, C.purple, C.ok, C.coral, C.yellowDeep, C.inkSoft][frame % 6]
            g.fillStyle(tone, 1)
            g.fillRoundedRect(-INNER.w / 2 + 3, -INNER.h / 2 + 3, INNER.w - 6, INNER.h - 6, 6)
            return g
        }
        const image = scene.add.image(0, 0, SHEET.scenes, frame)
        const box = SCENE_BOX[frame]
        const scale = fitInside(box, INNER.w - 6, INNER.h - 6)
        image.setOrigin((box.x + box.w / 2) / image.frame.width, (box.y + box.h / 2) / image.frame.height)
        image.setScale(scale)
        return image
    }

    return {
        async fill(index: number, frame: number, from: { x: number; y: number; w: number }) {
            const slot = slots[index]
            const shot = makeShot(frame)
            shots[index]?.destroy()
            shots[index] = shot
            slot.holder.addAt(shot, 1)
            paintSlot(slot.face, true)

            const target = shot.scale
            const wide = scene.textures.exists(SHEET.scenes) ? SCENE_BOX[frame].w : INNER.w - 6
            const local = { x: from.x - FILM.cx, y: from.y - FILM.ys[index] }
            shot.setPosition(local.x, local.y).setScale(from.w / wide)
            await FX.all(
                FX.arcTo(scene, shot, { x: 0, y: 0 }, { height: 70, duration: 480 }),
                FX.to(scene, shot, { scale: target }, { duration: 480 }),
            )
            await FX.to(scene, slot.holder, { scale: 1.1 }, { duration: 120, yoyo: true })
            slot.holder.setScale(1)
        },

        show(index: number, frame: number) {
            const slot = slots[index]
            const shot = makeShot(frame)
            shots[index]?.destroy()
            shots[index] = shot
            slot.holder.addAt(shot, 1)
            paintSlot(slot.face, true)
        },

        highlight(index: number | null) {
            slots.forEach((slot, i) => {
                scene.tweens.killTweensOf(slot.ring)
                slot.ring.setAlpha(i === index ? 1 : 0)
            })
        },

        reset() {
            shots.forEach((shot, index) => {
                shot?.destroy()
                shots[index] = null
                paintSlot(slots[index].face, false)
                slots[index].ring.setAlpha(0)
            })
        },

        setEnabled(value: boolean) {
            enabled = value
            zones.forEach(zone => {
                if (zone.input) zone.input.enabled = value
            })
        },

        async fade(visible: boolean) {
            if (!visible) {
                enabled = false
                zones.forEach(zone => {
                    if (zone.input) zone.input.enabled = false
                })
            }
            await FX.to(scene, root, { alpha: visible ? 1 : 0, x: visible ? 0 : 90 }, { duration: 320 })
        },

        lift(on: boolean) {
            root.setDepth(on ? DEPTH.curtain - 2 : DEPTH.film)
            zones.forEach(zone => zone.setDepth(on ? DEPTH.curtain - 1 : DEPTH.film + 1))
        },

        bounds() {
            const first = FILM.ys[0]
            const last = FILM.ys[FILM.ys.length - 1]
            return { x: FILM.cx, y: (first + last) / 2, w: FILM.w + 30, h: last - first + FILM.h + 30 }
        },

        destroy() {
            slots.forEach(slot => scene.tweens.killTweensOf([slot.holder, slot.ring]))
            zones.forEach(zone => zone.destroy())
            root.destroy(true)
        },
    }
}

export type Film = ReturnType<typeof createFilm>
