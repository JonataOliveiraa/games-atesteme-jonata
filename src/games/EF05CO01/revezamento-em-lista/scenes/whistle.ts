import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, WHISTLE } from '../data/layout'
import { A, C, CSS, FONT } from '../data/theme'

export interface Whistle {
    setEnabled(on: boolean): void
    press(): Promise<void>
    call(): void
    center(): { x: number; y: number }
    box(): { x: number; y: number; w: number; h: number }
    destroy(): void
}

export function createWhistle(scene: Phaser.Scene, onPress: () => void): Whistle {
    const cx = WHISTLE.x + WHISTLE.w / 2
    const cy = WHISTLE.y + WHISTLE.h / 2

    const root = scene.add.container(cx, cy).setDepth(DEPTH.chip)
    const body = scene.add.graphics()
    root.add(body)

    const label = scene.add
        .text(0, WHISTLE.h / 2 - 30, 'NADAR!', {
            fontFamily: FONT.black,
            fontSize: '26px',
            color: CSS.white,
        })
        .setOrigin(0.5)
        .setResolution(2)
    label.setStroke(CSS.ink, 6)
    root.add(label)

    let enabled = false

    const paint = () => {
        const w = WHISTLE.w
        const h = WHISTLE.h
        body.clear()
        body.fillStyle(C.ink, A.shadow)
        body.fillRoundedRect(-w / 2 + 4, -h / 2 + 8, w, h, 20)
        body.fillStyle(C.ink, 1)
        body.fillRoundedRect(-w / 2, -h / 2, w, h, 20)
        body.fillStyle(enabled ? C.green : C.slate, 1)
        body.fillRoundedRect(-w / 2 + 5, -h / 2 + 5, w - 10, h - 10, 16)
        body.fillStyle(C.white, enabled ? 0.24 : 0.12)
        body.fillRoundedRect(-w / 2 + 14, -h / 2 + 14, w - 28, 18, 9)

        body.fillStyle(C.white, enabled ? 1 : 0.6)
        body.fillRoundedRect(-44, -34, 72, 42, 16)
        body.fillCircle(30, -20, 16)
        body.fillStyle(C.ink, enabled ? 0.8 : 0.4)
        body.fillCircle(-16, -12, 9)
        body.fillRoundedRect(-52, -40, 18, 12, 6)

        if (!enabled) {
            body.fillStyle(C.ink, 0.55)
            body.fillRoundedRect(-14, 14, 28, 22, 5)
            body.lineStyle(5, C.ink, 0.55)
            body.strokeCircle(0, 12, 10)
        }

        label.setAlpha(enabled ? 1 : 0.55)
    }
    paint()

    const zone = scene.add
        .zone(cx, cy, WHISTLE.w, WHISTLE.h)
        .setOrigin(0.5)
        .setDepth(DEPTH.chip + 2)
        .setInteractive({ useHandCursor: true })
    zone.on('pointerdown', () => onPress())

    return {
        setEnabled: on => {
            enabled = on
            paint()
        },
        press: () => FX.press(scene, root),
        call: () => {
            void FX.to(scene, root, { scale: 1.06 }, { duration: 320, yoyo: true, repeat: 2 })
        },
        center: () => ({ x: cx, y: cy }),
        box: () => ({ x: WHISTLE.x, y: WHISTLE.y, w: WHISTLE.w, h: WHISTLE.h }),
        destroy: () => {
            zone.destroy()
            root.destroy(true)
        },
    }
}
