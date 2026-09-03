import Phaser from 'phaser'
import { Ease, FX, type FxTarget } from '../../../../shared/effects/FX'
import { C, ZONE_COLOR } from '../data/theme'
import { ALBUM, DEPTH, VEHICLE_FRAME, albumX } from '../data/layout'
import { pause } from './timing'
import type { Point, VehicleModel } from '../types'

const fx = (o: unknown) => o as unknown as FxTarget

export function createAlbum(scene: Phaser.Scene) {
    const slots = scene.add.graphics().setDepth(DEPTH.album)
    const cards = scene.add.container(0, 0).setDepth(DEPTH.album + 2)
    let total = 3

    function paint(filled: number) {
        slots.clear()
        const first = albumX(0, total)
        const last = albumX(total - 1, total)
        const trayX = first - ALBUM.w / 2 - 26
        const trayW = last - first + ALBUM.w + 52

        slots.fillStyle(C.ink, 0.28)
        slots.fillRoundedRect(trayX, ALBUM.top + 6, trayW, ALBUM.h + 24, 24)
        slots.fillStyle(C.ink, 1)
        slots.fillRoundedRect(trayX, ALBUM.top, trayW, ALBUM.h + 24, 24)
        slots.fillStyle(C.creamDeep, 1)
        slots.fillRoundedRect(trayX + 6, ALBUM.top + 6, trayW - 12, ALBUM.h + 12, 18)

        for (let i = 0; i < total; i++) {
            const x = albumX(i, total)
            const top = ALBUM.cy - ALBUM.h / 2
            if (i < filled) {
                slots.fillStyle(C.ink, 1)
                slots.fillRoundedRect(x - ALBUM.w / 2 - 3, top - 3, ALBUM.w + 6, ALBUM.h + 6, 17)
                slots.fillStyle(C.creamEdge, 1)
                slots.fillRoundedRect(x - ALBUM.w / 2, top, ALBUM.w, ALBUM.h, 14)
                slots.fillStyle(C.cream, 1)
                slots.fillRoundedRect(x - ALBUM.w / 2, top, ALBUM.w, ALBUM.h - 6, 14)
            } else {
                slots.fillStyle(C.creamEdge, 0.7)
                slots.fillRoundedRect(x - ALBUM.w / 2, top, ALBUM.w, ALBUM.h, 14)
                slots.lineStyle(5, C.ink, 0.4)
                slots.strokeRoundedRect(x - ALBUM.w / 2, top, ALBUM.w, ALBUM.h, 14)
            }
        }
    }

    return {
        reset(count: number) {
            total = count
            cards.removeAll(true)
            paint(0)
        },

        slotAt: (i: number): Point => ({ x: albumX(i, total), y: ALBUM.cy }),

        slotSize: () => ALBUM.w * 0.72,

        async place(i: number, vehicle: VehicleModel, key: string) {
            const x = albumX(i, total)
            const tone = ZONE_COLOR[key] ?? ZONE_COLOR.none
            paint(i + 1)

            const card = scene.add.container(x, ALBUM.cy)
            const band = scene.add.graphics()
            band.fillStyle(tone.main, 1)
            band.fillRoundedRect(-ALBUM.w / 2, ALBUM.h / 2 - 20, ALBUM.w, 14, 7)
            card.add(band)

            const size = ALBUM.w * 0.72
            if (scene.textures.exists('veiculos')) {
                const sprite = scene.add.sprite(0, -6, 'veiculos', vehicle.frame)
                sprite.setDisplaySize(size, size * (VEHICLE_FRAME.h / VEHICLE_FRAME.w))
                card.add(sprite)
            } else {
                const g = scene.add.graphics()
                g.fillStyle(tone.dark, 1)
                g.fillRoundedRect(-size * 0.3, -size * 0.2, size * 0.6, size * 0.34, 10)
                card.add(g)
            }
            cards.add(card)

            card.setScale(1.5).setAlpha(0)
            void FX.sparks(scene, x, ALBUM.cy, { color: tone.main, count: 14, spread: 90, depth: DEPTH.fx })
            await Promise.race([
                FX.to(scene, fx(card), { scale: 1, alpha: 1 },
                    { duration: 320, ease: Ease.back(2.6) }),
                pause(scene, 560),
            ])
            card.setScale(1).setAlpha(1)
        },

        async parade() {
            const list = cards.list as Phaser.GameObjects.Container[]
            for (const card of list) {
                void FX.to(scene, fx(card), { y: ALBUM.cy - 20 },
                    { duration: 190, yoyo: true, ease: 'Sine.easeOut' })
                await pause(scene, 130)
            }
            await pause(scene, 260)
        },

        destroy() {
            cards.removeAll(true)
            cards.destroy()
            slots.destroy()
        },
    }
}
