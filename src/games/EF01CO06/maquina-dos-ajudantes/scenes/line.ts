import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEVICE_ART, DEVICE_CELL, DEVICE_CELL_SIZE, DEVICES, PEOPLE, PERSON_CELL, personFrame } from '../data/files'
import { DEPTH, LINE, ropeY } from '../data/layout'
import { C } from '../data/theme'
import type { DeviceId, Person, Point } from '../types'

export interface Line {
    hang(index: number, person: Person, device: DeviceId, from: Point): Promise<void>
    finale(onSwing: (device: DeviceId) => void): Promise<void>
    destroy(): void
}

interface Photo {
    box: Phaser.GameObjects.Container
    device: DeviceId
}

const PIC_TOP = 12
const DEVICE_PX = 34

export function createLine(scene: Phaser.Scene): Line {
    const photos: (Photo | undefined)[] = []

    const build = (x: number, y: number, person: Person, device: DeviceId) => {
        const frame = scene.add.graphics()
        const left = -LINE.photoW / 2
        frame.fillStyle(C.shadow, 0.14)
        frame.fillRoundedRect(left + 3, 4 + 5, LINE.photoW, LINE.photoH, 6)
        frame.fillStyle(C.white, 1)
        frame.fillRoundedRect(left, 4, LINE.photoW, LINE.photoH, 6)
        frame.lineStyle(4, C.ink, 1)
        frame.strokeRoundedRect(left, 4, LINE.photoW, LINE.photoH, 6)
        frame.fillStyle(C.paper, 1)
        frame.fillRect(-LINE.pic / 2, PIC_TOP, LINE.pic, LINE.pic)
        frame.lineStyle(2, C.ink, 0.5)
        frame.strokeRect(-LINE.pic / 2, PIC_TOP, LINE.pic, LINE.pic)

        const picBottom = PIC_TOP + LINE.pic
        const who = scene.add
            .image(0, picBottom, PEOPLE, personFrame(person, 'helped'))
            .setOrigin(0.5, PERSON_CELL.foot / PERSON_CELL.h)
            .setScale((LINE.pic - 4) / 540)

        const gadget = scene.add
            .image(LINE.pic / 2 - DEVICE_PX / 2 - 1, picBottom - DEVICE_PX / 2 - 1, DEVICES, DEVICE_CELL[DEVICE_ART[device]])
            .setScale(DEVICE_PX / DEVICE_CELL_SIZE)

        const pin = scene.add.graphics()
        pin.fillStyle(C.wood, 1)
        pin.fillRoundedRect(-7, -10, 14, 26, 4)
        pin.lineStyle(3, C.ink, 1)
        pin.strokeRoundedRect(-7, -10, 14, 26, 4)
        pin.lineStyle(2, C.woodDark, 1)
        pin.lineBetween(0, -6, 0, 12)

        return scene.add.container(x, y, [frame, who, gadget, pin]).setDepth(DEPTH.photos)
    }

    const swing = async (box: Phaser.GameObjects.Container) => {
        await FX.to(scene, box, { angle: 10 }, { duration: 160, yoyo: true })
        await FX.to(scene, box, { angle: -10 }, { duration: 160, yoyo: true })
        box.setAngle(0)
    }

    return {
        async hang(index, person, device, from) {
            photos[index]?.box.destroy()
            const x = LINE.pegs[index]
            const box = build(from.x, from.y, person, device).setScale(1.5).setAlpha(0)
            photos[index] = { box, device }
            await FX.to(scene, box, { alpha: 1 }, { duration: 150 })
            await Promise.all([
                FX.arcTo(scene, box, { x, y: ropeY(x) }, { height: 110, duration: 800 }),
                FX.to(scene, box, { scale: 1 }, { duration: 800 }),
            ])
            box.setAngle(10)
            await FX.to(scene, box, { angle: 0 }, { duration: 700, ease: Ease.spring() })
        },
        async finale(onSwing) {
            let last: Promise<void> = Promise.resolve()
            for (const photo of photos) {
                if (!photo?.box.active) continue
                onSwing(photo.device)
                last = swing(photo.box)
                await FX.wait(scene, 380)
            }
            await last
        },
        destroy() {
            photos.forEach(photo => photo?.box.destroy())
            photos.length = 0
        },
    }
}
