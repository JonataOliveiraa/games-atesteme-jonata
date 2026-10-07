import Phaser from 'phaser'
import { ART, BUS_FRAME, BUS_SHEET, frameKey } from '../data/files'
import { DEPTH, RIDER, STOP } from '../data/layout'
import { RIDERS } from '../data/riders'
import { SITUATIONS } from '../data/situations'
import { C, CSS, FONT, SIZE } from '../data/theme'
import type { RiderId, StopDef } from '../types'
import { riderImage, type Rect } from './art'

export interface RiderView {
    id: RiderId
    container: Phaser.GameObjects.Container
}

export interface StopView {
    readonly group: Phaser.GameObjects.Container
    readonly riders: RiderView[]
    riderAt(x: number, y: number): number
    riderRect(index: number): Rect
    take(index: number): RiderView
    wave(): void
    signRect(): Rect
    destroy(): void
}

const [, , STOP_W, STOP_H] = BUS_FRAME.stop
const SIGN_Y = STOP.foot - (STOP_H - (ART.sign.y + ART.sign.h / 2)) * STOP.scale
const SIGN_W = ART.sign.w * STOP.scale
const SIGN_H = ART.sign.h * STOP.scale
const TERMINAL_SCALE = 1.3

function createRider(scene: Phaser.Scene, id: RiderId, x: number, nameSize: number) {
    const art = riderImage(scene, id, RIDER.size).setOrigin(0.5, 1)
    const label = scene.add
        .text(0, RIDER.plateY - RIDER.foot, RIDERS[id].name, {
            fontFamily: FONT.black,
            fontSize: `${nameSize}px`,
            color: CSS.ink,
        })
        .setOrigin(0.5)
        .setResolution(2)
    const w = label.width + 22
    const plate = scene.add.graphics()
    plate.fillStyle(C.cream, 1)
    plate.fillRoundedRect(-w / 2, label.y - RIDER.plateH / 2, w, RIDER.plateH, RIDER.plateH / 2)
    plate.lineStyle(3, C.ink, 1)
    plate.strokeRoundedRect(-w / 2, label.y - RIDER.plateH / 2, w, RIDER.plateH, RIDER.plateH / 2)
    const container = scene.add.container(x, RIDER.foot, [art, plate, label])
    return { id, container }
}

export function createStop(scene: Phaser.Scene, def: StopDef | null, x: number): StopView {
    const group = scene.add.container(x, 0).setDepth(DEPTH.stop)
    const riders: RiderView[] = []
    const count = (def?.riders.length === 3 ? 3 : 2) as 2 | 3
    const hitW = RIDER.hitW[count]

    if (def) {
        group.add(scene.add.image(0, STOP.foot, BUS_SHEET, frameKey('stop')).setOrigin(0.5, 1).setScale(STOP.scale))
        group.add(
            scene.add
                .text(0, SIGN_Y, SITUATIONS[def.situation].text, {
                    fontFamily: FONT.black,
                    fontSize: `${SIZE.sign}px`,
                    color: CSS.ink,
                    align: 'center',
                    wordWrap: { width: SIGN_W - 18 },
                    lineSpacing: -4,
                })
                .setOrigin(0.5)
                .setResolution(2),
        )
        const slots = RIDER.slots[count]
        def.riders.forEach((id, i) => {
            const rider = createRider(scene, id, slots[i], RIDER.nameSize[count])
            riders.push(rider)
            group.add(rider.container)
        })
    } else {
        group.add(
            scene.add.image(0, STOP.foot, BUS_SHEET, frameKey('terminal')).setOrigin(0.5, 1).setScale(TERMINAL_SCALE),
        )
    }

    const riderRect = (index: number): Rect => {
        const c = riders[index].container
        return {
            x: group.x + c.x,
            y: (RIDER.hitTop + RIDER.hitBottom) / 2,
            w: hitW,
            h: RIDER.hitBottom - RIDER.hitTop,
        }
    }

    return {
        group,
        riders,
        riderAt(px, py) {
            if (py < RIDER.hitTop || py > RIDER.hitBottom) return -1
            return riders.findIndex(r => r.container.active && Math.abs(px - (group.x + r.container.x)) <= hitW / 2)
        },
        riderRect,
        take(index) {
            const rider = riders[index]
            const c = rider.container
            const worldX = group.x + c.x
            group.remove(c)
            c.addToDisplayList()
            c.setPosition(worldX, c.y).setDepth(DEPTH.walker)
            riders.splice(index, 1)
            return rider
        },
        wave() {
            riders.forEach((r, i) => {
                const art = r.container.list[0] as Phaser.GameObjects.Image
                scene.tweens.add({
                    targets: art,
                    angle: { from: -8, to: 8 },
                    duration: 240,
                    delay: i * 80,
                    yoyo: true,
                    repeat: 4,
                    onComplete: () => art.setAngle(0),
                })
            })
        },
        signRect() {
            return { x: group.x, y: SIGN_Y, w: SIGN_W + 20, h: SIGN_H + 20 }
        },
        destroy() {
            group.destroy()
        },
    }
}

export const STOP_SIZE = { w: STOP_W * STOP.scale, h: STOP_H * STOP.scale }
