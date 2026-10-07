import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { ART, BUS_FRAME, BUS_SHEET, frameKey } from '../data/files'
import { BUS, DEPTH } from '../data/layout'
import { C } from '../data/theme'
import type { RiderId } from '../types'
import { riderImage, type Rect } from './art'

export interface Bus {
    drive(on: boolean): void
    honk(): Promise<void>
    cheer(): void
    seat(id: RiderId): Promise<void>
    unseat(): Promise<void>
    openDoor(): Promise<void>
    closeDoor(): Promise<void>
    doorFoot(): { x: number; y: number }
    doorCenter(): { x: number; y: number }
    windowRect(index: number): Rect
    readonly seated: number
    destroy(): void
}

export function createBus(scene: Phaser.Scene): Bus {
    const s = BUS.scale
    const top = BUS.ground - (ART.wheels[0].y + ART.wheelSize / 2) * s
    const body = scene.add.container(BUS.left, top).setDepth(DEPTH.bus)
    body.add(scene.add.image(0, 0, BUS_SHEET, frameKey('bus')).setOrigin(0).setScale(s))

    const d = ART.door
    const doorway = scene.add.graphics({ x: (d.x + d.w / 2) * s, y: (d.y + d.h / 2) * s })
    doorway.fillStyle(C.door, 1)
    doorway.fillRoundedRect((-d.w / 2) * s, (-d.h / 2) * s, d.w * s, d.h * s, 8)
    doorway.setAlpha(0).setScale(0.2, 1)
    body.add(doorway)

    const [, , wheelW] = BUS_FRAME.wheel
    const wheels = ART.wheels.map(w =>
        scene.add
            .image(BUS.left + w.x * s, top + w.y * s, BUS_SHEET, frameKey('wheel'))
            .setScale((ART.wheelSize * s) / wheelW)
            .setDepth(DEPTH.wheels),
    )

    const minis: Phaser.GameObjects.Image[] = []
    let spin: Phaser.Tweens.Tween[] = []
    let bob: Phaser.Tweens.Tween | undefined

    const windowCenter = (index: number) => {
        const w = ART.windows[index % ART.windows.length]
        return { x: w.x * s, y: w.y * s }
    }

    const wave = (mini: Phaser.GameObjects.Image) => {
        scene.tweens.killTweensOf(mini)
        mini.setAngle(-12)
        scene.tweens.add({
            targets: mini,
            angle: 12,
            duration: 260,
            yoyo: true,
            repeat: 3,
            onComplete: () => mini.setAngle(0),
        })
    }

    return {
        drive(on) {
            spin.forEach(t => t.remove())
            spin = []
            bob?.remove()
            bob = undefined
            body.setY(top)
            if (!on) return
            spin = wheels.map(wheel =>
                scene.tweens.add({ targets: wheel, angle: wheel.angle + 360, duration: 520, repeat: -1 }),
            )
            bob = scene.tweens.add({ targets: body, y: top - 3, duration: 180, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
            minis.forEach(wave)
        },
        cheer() {
            minis.forEach(wave)
        },
        async honk() {
            await FX.impact(scene, body, 0.04)
        },
        async seat(id) {
            const at = windowCenter(minis.length)
            const mini = riderImage(scene, id, BUS.miniSize).setPosition(at.x, at.y)
            body.add(mini)
            minis.push(mini)
            await FX.popIn(scene, mini, { from: 0.2 })
            wave(mini)
        },
        async unseat() {
            const mini = minis.pop()
            if (!mini) return
            await FX.to(scene, mini, { scale: 0, alpha: 0 }, { duration: 240 })
            mini.destroy()
        },
        async openDoor() {
            await FX.to(scene, doorway, { alpha: 1, scaleX: 1 }, { duration: 200, ease: 'Quad.easeOut' })
        },
        async closeDoor() {
            await FX.to(scene, doorway, { alpha: 0, scaleX: 0.2 }, { duration: 200, ease: 'Quad.easeIn' })
        },
        doorFoot() {
            return { x: BUS.left + (d.x + d.w / 2) * s, y: top + (d.y + d.h) * s + 14 }
        },
        doorCenter() {
            return { x: BUS.left + (d.x + d.w / 2) * s, y: top + (d.y + d.h / 2) * s }
        },
        windowRect(index) {
            const at = windowCenter(index)
            const size = ART.windowSize * s + 24
            return { x: BUS.left + at.x, y: top + at.y, w: size, h: size }
        },
        get seated() {
            return minis.length
        },
        destroy() {
            spin.forEach(t => t.remove())
            bob?.remove()
            wheels.forEach(wheel => wheel.destroy())
            body.destroy()
        },
    }
}
