import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PHONE_FOOT, PHONE_SHEET, POSE, cellKey, type Pose } from '../data/files'
import { PHONE, PHYS } from '../data/physics'
import type { Vec } from '../types'
import type { View } from './view'

export interface Phone {
    place(x: number, y: number, vx: number, vy: number): void
    pose(p: Pose): void
    land(): void
    screen(): Vec
    glitch(): Promise<void>
    cheer(): Promise<void>
    destroy(): void
}

export function createPhone(scene: Phaser.Scene, view: View): Phone {
    const art = scene.add.image(0, 0, PHONE_SHEET.key, cellKey(POSE.up)).setOrigin(0.5, PHONE_FOOT)
    const base = PHONE.display / art.frame.height
    art.setScale(base)
    const body = view.add(scene.add.container(0, 0, [art]), 'phone')
    let squash = 0
    let current: Pose = 'up'
    let lockPose = false

    return {
        place(x, y, vx, vy) {
            body.setPosition(x, y)
            body.setRotation((vx / PHYS.run) * 0.14)
            squash = Math.max(0, squash - 0.06)
            const stretch = Phaser.Math.Clamp(-vy / 4000, -0.06, 0.1)
            art.setScale(base * (1 + squash - stretch * 0.6), base * (1 - squash + stretch))
        },
        pose(p) {
            if (lockPose || p === current) return
            current = p
            art.setFrame(cellKey(POSE[p]))
        },
        land() {
            squash = 0.22
        },
        screen: () => view.toScreen({ x: body.x, y: body.y - PHONE.h * 0.55 }),
        async glitch() {
            lockPose = true
            art.setFrame(cellKey(POSE.dizzy))
            current = 'dizzy'
            for (let k = 0; k < 4; k++) {
                body.setAlpha(k % 2 ? 1 : 0.25)
                await FX.wait(scene, 70)
            }
            body.setAlpha(1)
            await FX.wait(scene, 380)
            lockPose = false
        },
        async cheer() {
            await FX.to(scene, art, { angle: 360 }, { duration: 520 })
            art.setAngle(0)
        },
        destroy() {
            body.destroy()
        },
    }
}
