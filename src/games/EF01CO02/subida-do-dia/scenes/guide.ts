import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { createTutorial, type TutorialStep } from '../../../../shared/tutorial/createTutorial'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'
import { TIMING } from '../data/timing'
import type { Rect } from '../types'

export const spot = (r: Rect, pad = 0): Pick<TutorialStep, 'shape' | 'x' | 'y' | 'w' | 'h'> => ({
    shape: 'rect',
    x: r.x,
    y: r.y,
    w: r.w + pad * 2,
    h: r.h + pad * 2,
})

export function teach(scene: Phaser.Scene, key: string, steps: TutorialStep[]): Promise<void> {
    return new Promise(resolve => {
        createTutorial(scene, {
            key,
            steps,
            once: false,
            textSize: 32,
            accent: C.gold,
            safeTop: 90,
            onFinish: () => resolve(),
        })
    })
}

export interface Tap {
    press(x: number, y: number): Promise<void>
    hide(): void
    destroy(): void
}

const R = 22

export function createTap(scene: Phaser.Scene): Tap {
    const dot = scene.add
        .circle(0, 0, R, C.gold)
        .setStrokeStyle(5, C.ink)
        .setScrollFactor(0)
        .setDepth(DEPTH.tap)
        .setVisible(false)
    const waves = new Set<Phaser.GameObjects.Graphics>()

    const ripple = (x: number, y: number, delay: number) => {
        const g = scene.add.graphics().setScrollFactor(0).setDepth(DEPTH.tap - 1)
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
                const r = R + t.v * 48
                g.lineStyle(6, C.ink, 0.5 * (1 - t.v))
                g.strokeCircle(x, y, r + 2)
                g.lineStyle(4, C.gold, 1 - t.v)
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
            FX.kill(scene, dot)
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
