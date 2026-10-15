import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PART, SHED, SHED_SHEET, TRACK_SHEET, UI, UI_SHEET } from '../data/files'
import { DEPTH, SHADOW, UI_ART } from '../data/layout'
import { doorDx, type MapDef } from '../data/maps'
import { CSS, FONT, SIZE } from '../data/theme'
import type { City } from '../types'
import { fit, refit, shadowOf } from './art'
import type { Rect } from './board'

type Point = { x: number; y: number }

interface Shed {
    body: Phaser.GameObjects.Image
    shadow: Phaser.GameObjects.Image
    plate: Phaser.GameObjects.Container
    name: Phaser.GameObjects.Text
    room: number
}

export interface Sheds {
    set(cities: City[]): Promise<void>
    indexOf(city: City): number
    door(i: number): Point
    plaque(i: number): Point
    rect(i: number): Rect
    area(): Rect
    cheer(i: number): Promise<void>
    shake(i: number): Promise<void>
    bump(i: number): Promise<void>
    destroy(): void
}

const PAD = 12

export function createSheds(scene: Phaser.Scene, map: MapDef): Sheds {
    const spots = map.sheds
    const size = map.shedSize
    const tag = map.plaque
    let cities: City[] = []
    let shown = false

    const sheds: Shed[] = spots.map(spot => {
        const body = fit(scene, SHED_SHEET, SHED.open, size).setPosition(spot.x, spot.y).setDepth(DEPTH.shed).setVisible(false)
        const shadow = shadowOf(scene, body).setDepth(DEPTH.shadow).setVisible(false)
        const board = fit(scene, UI_SHEET, UI.plaque, tag.w)
        if (board.displayHeight > tag.h * 1.4) board.setScale(board.scale * ((tag.h * 1.4) / board.displayHeight))
        board.setY((0.5 - UI_ART.plaquePanelY) * board.displayHeight)
        const name = scene.add
            .text(0, -2, '', { fontFamily: FONT.black, fontSize: `${SIZE.plaque}px`, color: CSS.ink })
            .setOrigin(0.5)
            .setResolution(2)
        const plate = scene.add
            .container(spot.x, spot.y + tag.dy, [shadowOf(scene, board), board, name])
            .setDepth(DEPTH.plaque)
            .setVisible(false)
        return { body, shadow, plate, name, room: board.displayWidth * 0.78 }
    })

    const write = (shed: Shed, city: City) => {
        shed.name.setText(city).setScale(1)
        if (shed.name.width > shed.room) shed.name.setScale(shed.room / shed.name.width)
    }

    const door = (shed: Shed, open: boolean) => refit(shed.body, open ? SHED.open : SHED.closed, size)

    const rect = (i: number): Rect => {
        const spot = spots[i]
        const top = spot.y + tag.dy - tag.h / 2 - PAD
        const bottom = spot.y + size / 2 + PAD
        return { x: spot.x, y: (top + bottom) / 2, w: size + PAD * 2, h: bottom - top }
    }

    return {
        async set(next) {
            cities = next.slice(0, sheds.length)
            if (!shown) {
                shown = true
                await FX.all(
                    ...sheds.map((shed, i) => {
                        write(shed, cities[i])
                        door(shed, true)
                        shed.body.setVisible(true)
                        shed.shadow.setVisible(true)
                        shed.plate.setVisible(true)
                        return FX.all(
                            FX.popIn(scene, shed.body, { delay: i * 120 }),
                            FX.to(scene, shed.shadow.setAlpha(0), { alpha: SHADOW.alpha }, { duration: 380, delay: i * 120 }),
                            FX.popIn(scene, shed.plate, { delay: 160 + i * 120 }),
                        )
                    }),
                )
                return
            }
            sheds.forEach(shed => door(shed, false))
            await FX.wait(scene, 180)
            await FX.all(...sheds.map(shed => FX.to(scene, shed.plate, { scaleX: 0 }, { duration: 160, ease: 'Sine.easeIn' })))
            sheds.forEach((shed, i) => write(shed, cities[i]))
            await FX.all(...sheds.map(shed => FX.to(scene, shed.plate, { scaleX: 1 }, { duration: 200, ease: 'Back.easeOut' })))
            await FX.wait(scene, 120)
            sheds.forEach(shed => door(shed, true))
        },
        indexOf(city) {
            return cities.indexOf(city)
        },
        door(i) {
            return { x: spots[i].x + doorDx(map), y: spots[i].y }
        },
        plaque(i) {
            return { x: spots[i].x - tag.w / 2 + 6, y: spots[i].y + tag.dy }
        },
        rect,
        area() {
            const all = sheds.map((_, i) => rect(i))
            const left = Math.min(...all.map(r => r.x - r.w / 2))
            const right = Math.max(...all.map(r => r.x + r.w / 2))
            const top = Math.min(...all.map(r => r.y - r.h / 2))
            const bottom = Math.max(...all.map(r => r.y + r.h / 2))
            return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
        },
        async cheer(i) {
            const shed = sheds[i]
            const star = fit(scene, TRACK_SHEET, PART.star, 64)
                .setPosition(shed.body.x, shed.body.y - size / 2)
                .setDepth(DEPTH.fx)
            void FX.popIn(scene, star, { from: 0.2, duration: 320 }).then(() =>
                FX.to(scene, star, { y: star.y - 60, alpha: 0 }, { duration: 600, delay: 300 }).then(() => star.destroy()),
            )
            await FX.to(scene, [shed.body, shed.plate], { angle: 4 }, { duration: 110, yoyo: true, repeat: 2, ease: 'Sine.easeInOut' })
            shed.body.setAngle(0)
            shed.plate.setAngle(0)
        },
        async shake(i) {
            const shed = sheds[i]
            await FX.all(FX.shake(scene, shed.body, { amount: 10, times: 4 }), FX.shake(scene, shed.plate, { amount: 10, times: 4 }))
        },
        async bump(i) {
            const plate = sheds[i].plate
            const y = spots[i].y + tag.dy
            scene.tweens.killTweensOf(plate)
            plate.setY(y)
            await FX.to(scene, plate, { y: y - 26 }, { duration: 170, yoyo: true, repeat: 1, ease: 'Sine.easeOut' })
            plate.setY(y)
        },
        destroy() {
            sheds.forEach(shed => {
                scene.tweens.killTweensOf([shed.body, shed.shadow, shed.plate])
                shed.body.destroy()
                shed.shadow.destroy()
                shed.plate.destroy()
            })
        },
    }
}
