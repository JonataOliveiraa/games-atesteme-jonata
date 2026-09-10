import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { CONTROLS, DEPTH } from '../data/layout'
import { C } from '../data/theme'

/**
 * Duas setas grandes, uma em cada canto de baixo — o polegar de cada mão. Um
 * toque move o arquivo uma pista; segurar não faz diferença, porque a decisão
 * é qual pista, e não com que velocidade.
 */
export function createControls(
    scene: Phaser.Scene,
    options: { onLeft: () => void; onRight: () => void },
) {
    const make = (x: number, dir: -1 | 1, onTap: () => void) => {
        const root = scene.add.container(x, CONTROLS.y).setDepth(DEPTH.controls)
        const g = scene.add.graphics()
        const { w, h } = CONTROLS

        const paint = (on: boolean) => {
            g.clear()
            g.fillStyle(C.ink, 0.32)
            g.fillRoundedRect(-w / 2 + 5, -h / 2 + 9, w, h, 28)
            g.fillStyle(on ? C.selectDark : C.stoneDark, 1)
            g.fillRoundedRect(-w / 2, -h / 2, w, h, 28)
            g.fillStyle(on ? C.select : C.stone, 1)
            g.fillRoundedRect(-w / 2 + 7, -h / 2 + 7, w - 14, h - 20, 22)
            g.fillStyle(C.white, 0.38)
            g.fillRoundedRect(-w / 2 + 24, -h / 2 + 16, w - 48, 14, 7)

            g.fillStyle(C.white, on ? 1 : 0.6)
            g.fillTriangle(dir * 44, 0, dir * -4, -34, dir * -4, 34)
            g.fillRect(dir === -1 ? 0 : -40, -12, 40, 24)
        }
        paint(false)
        root.add(g)

        const zone = scene.add
            .zone(x, CONTROLS.y, CONTROLS.hitW, CONTROLS.hitH)
            .setOrigin(0.5)
            .setDepth(DEPTH.controls + 1)
            .setInteractive({ useHandCursor: true })
        zone.on('pointerdown', () => {
            if (!zone.input?.enabled) return
            void FX.press(scene, root)
            onTap()
        })

        return { root, zone, paint }
    }

    const left = make(CONTROLS.leftX, -1, options.onLeft)
    const right = make(CONTROLS.rightX, 1, options.onRight)

    return {
        setEnabled(value: boolean) {
            ;[left, right].forEach(button => {
                if (button.zone.input) button.zone.input.enabled = value
                button.paint(value)
            })
        },

        leftPos() {
            return { x: CONTROLS.leftX, y: CONTROLS.y }
        },

        rightPos() {
            return { x: CONTROLS.rightX, y: CONTROLS.y }
        },

        destroy() {
            ;[left, right].forEach(button => {
                scene.tweens.killTweensOf(button.root)
                button.zone.destroy()
                button.root.destroy(true)
            })
        },
    }
}

export type Controls = ReturnType<typeof createControls>
