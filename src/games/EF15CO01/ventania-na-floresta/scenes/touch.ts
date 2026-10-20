import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH, TOUCH } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

export interface Touch {
    tap(at: Vec): Promise<void>
    stop(): void
    destroy(): void
}

export function createTouch(scene: Phaser.Scene): Touch {
    const art = scene.add.graphics()
    art.fillStyle(C.shadow, 0.22)
    art.fillCircle(2, 5, TOUCH.r + 3)
    art.fillStyle(C.ringRim, 1)
    art.fillCircle(0, 0, TOUCH.r + 3)
    art.fillStyle(C.ringYellow, 1)
    art.fillCircle(0, 0, TOUCH.r - 2)
    art.fillStyle(C.white, 0.85)
    art.fillCircle(-TOUCH.r * 0.32, -TOUCH.r * 0.32, TOUCH.r * 0.28)
    const dot = scene.add.container(0, 0, [art]).setDepth(DEPTH.touch).setVisible(false)
    const waves = new Set<Phaser.GameObjects.Graphics>()

    const ripple = (at: Vec, delay = 0, big = 1) => {
        const g = scene.add.graphics().setDepth(DEPTH.touch - 1).setPosition(at.x, at.y).setVisible(false)
        waves.add(g)
        const k = { t: 0 }
        scene.tweens.add({
            targets: k,
            t: 1,
            delay: FX.ms(scene, delay),
            duration: FX.ms(scene, 620),
            ease: 'Sine.easeOut',
            onStart: () => {
                if (g.active) g.setVisible(true)
            },
            onUpdate: () => {
                if (!g.active) return
                const r = TOUCH.r * (1 + (TOUCH.reach * big - 1) * k.t)
                const a = 1 - k.t
                g.clear()
                g.lineStyle(TOUCH.wave + 4, C.ringRim, 0.75 * a)
                g.strokeCircle(0, 0, r)
                g.lineStyle(TOUCH.wave, C.ringYellow, a)
                g.strokeCircle(0, 0, r)
            },
            onComplete: () => {
                waves.delete(g)
                g.destroy()
            },
        })
    }

    const stop = () => {
        scene.tweens.killTweensOf(dot)
        dot.setVisible(false).setScale(1).setAlpha(1)
        waves.forEach(w => w.destroy())
        waves.clear()
    }

    return {
        async tap(at) {
            stop()
            dot.setPosition(at.x, at.y).setVisible(true).setAlpha(0).setScale(1.4)
            void FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
            await FX.wait(scene, 420)
            scene.tweens.add({ targets: dot, scale: 0.68, duration: FX.ms(scene, 110), ease: 'Sine.easeIn', yoyo: true, hold: FX.ms(scene, 70) })
            ripple(at, 90)
            ripple(at, 260, 0.75)
            await FX.wait(scene, 360)
            void FX.to(scene, dot, { alpha: 0 }, { duration: 260 })
            await FX.wait(scene, 260)
            dot.setVisible(false)
        },
        stop,
        destroy() {
            stop()
            dot.destroy()
        },
    }
}
