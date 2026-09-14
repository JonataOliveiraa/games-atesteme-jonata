import Phaser from 'phaser'
import { boxOf, DEVICE_NAME, fitScale, frameOf, sheetOf } from '../data/devices'
import { C, CSS, FONT } from '../data/theme'
import type { DeviceId } from '../types'

export interface DeviceView {
    id: DeviceId
    root: Phaser.GameObjects.Container
    scale: number
    setActive(on: boolean): void
    setDull(on: boolean): void
    destroy(): void
}

const DULL_TINT = 0x93a3b5

export function createDeviceView(
    scene: Phaser.Scene,
    id: DeviceId,
    fit: { w: number; h: number },
): DeviceView {
    const root = scene.add.container(0, 0)
    const sheet = sheetOf(id)
    const box = boxOf(id)
    const scale = fitScale(box, fit.w, fit.h)
    let dull = false

    if (scene.textures.exists(sheet)) {
        const image = scene.add.image(0, 0, sheet, frameOf(id)).setScale(scale)
        const anchor = (active: boolean) => {
            const b = boxOf(id, active)
            image.setFrame(frameOf(id, active))
            image.setOrigin(((b.x + b.r) / 2) / 350, b.b / 350)
        }
        anchor(false)
        root.add(image)
        return {
            id,
            root,
            scale,
            setActive: anchor,
            setDull(on: boolean) {
                dull = on
                if (on) image.setTint(DULL_TINT).setAlpha(0.88)
                else image.clearTint().setAlpha(1)
            },
            destroy: () => root.destroy(true),
        }
    }

    const w = (box.r - box.x) * scale
    const h = (box.b - box.y) * scale
    const g = scene.add.graphics()
    let lit = false
    const paint = () => {
        g.clear()
        g.fillStyle(C.ink, 1)
        g.fillRoundedRect(-w / 2 - 4, -h - 4, w + 8, h + 8, 18)
        g.fillStyle(dull ? C.plasticDeep : lit ? C.screen : C.plastic, 1)
        g.fillRoundedRect(-w / 2, -h, w, h, 14)
    }
    paint()
    const label = scene.add
        .text(0, -h / 2, DEVICE_NAME[id], { fontFamily: FONT.black, fontSize: '16px', color: CSS.ink })
        .setOrigin(0.5)
        .setResolution(2)
    root.add([g, label])
    return {
        id,
        root,
        scale,
        setActive(on: boolean) {
            lit = on
            paint()
        },
        setDull(on: boolean) {
            dull = on
            paint()
        },
        destroy: () => root.destroy(true),
    }
}
