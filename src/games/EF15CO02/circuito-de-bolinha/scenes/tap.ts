import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'

export interface Tap {
    press(x: number, y: number): Promise<void>
    hide(): void
    destroy(): void
}

const R = 20

export function createTap(scene: Phaser.Scene): Tap {
    const dot = scene.add.circle(0, 0, R, C.butter).setStrokeStyle(5, C.headerLine).setDepth(DEPTH.tap).setVisible(false)
    const waves = new Set<Phaser.GameObjects.Graphics>()

    const ripple = (x: number, y: number, delay: number) => {
        const g = scene.add.graphics().setDepth(DEPTH.tap - 1)
        waves.add(g)
        const t = { v: 0 }
        scene.tweens.add({
            targets: t,
            v: 1,
            delay,
            duration: 520,
            ease: 'Sine.easeOut',
            onUpdate: () => {
                if (!waves.has(g)) return
                g.clear()
                const r = R + t.v * 46
                g.lineStyle(6, C.headerLine, 0.5 * (1 - t.v))
                g.strokeCircle(x, y, r + 2)
                g.lineStyle(4, C.butter, 1 - t.v)
                g.strokeCircle(x, y, r)
            },
            onComplete: () => {
                if (!waves.delete(g)) return
                g.destroy()
            },
        })
    }

    const tap: Tap = {
        async press(x, y) {
            dot.setPosition(x, y).setVisible(true).setAlpha(0).setScale(1)
            await FX.to(scene, dot, { alpha: 1 }, { duration: 180 })
            await FX.to(scene, dot, { scale: 0.72 }, { duration: TIMING.tapDown, ease: 'Quad.easeOut' })
            ripple(x, y, 0)
            ripple(x, y, 160)
            await FX.wait(scene, TIMING.tapHold)
            await FX.to(scene, dot, { scale: 1, alpha: 0 }, { duration: 200 })
            dot.setVisible(false)
        },
        hide() {
            dot.setVisible(false)
            waves.forEach(g => g.destroy())
            waves.clear()
        },
        destroy() {
            tap.hide()
            dot.destroy()
        },
    }
    return tap
}
