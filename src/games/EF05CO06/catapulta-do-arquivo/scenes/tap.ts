import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

/** o dedo da demonstração: uma bolinha que afunda e solta ondinhas, em coordenadas de tela */
export interface Tap {
    press(x: number, y: number): Promise<void>
    moveTo(x: number, y: number, ms: number): Promise<void>
    place(x: number, y: number): void
    lift(): Promise<void>
    destroy(): void
}

const R = 22

export function createTap(scene: Phaser.Scene): Tap {
    const shade = scene.add.circle(3, 5, R, C.shadow, 0.22)
    const face = scene.add.circle(0, 0, R, C.white, 0.92).setStrokeStyle(5, C.accent, 1)
    const core = scene.add.circle(0, 0, R * 0.42, C.accent, 1)
    const dot = scene.add.container(0, 0, [shade, face, core]).setDepth(DEPTH.tap).setScrollFactor(0).setVisible(false)

    const ripple = () => {
        const ring = scene.add.circle(dot.x, dot.y, R, C.white, 0).setDepth(DEPTH.tap - 1).setScrollFactor(0)
        ring.setStrokeStyle(4, C.white, 0.95)
        scene.tweens.add({ targets: ring, scale: 2.6, alpha: 0, duration: 720, ease: 'Sine.easeOut', onComplete: () => ring.destroy() })
    }

    return {
        async press(x, y) {
            scene.tweens.killTweensOf(dot)
            dot.setPosition(x, y).setVisible(true).setAlpha(0).setScale(1.4)
            await FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
            await FX.to(scene, dot, { scale: 0.82 }, { duration: 110 })
            ripple()
        },
        moveTo(x, y, ms) {
            return FX.to(scene, dot, { x, y }, { duration: ms, ease: 'Sine.easeInOut' })
        },
        place(x, y) {
            dot.setPosition(x, y)
        },
        async lift() {
            if (!dot.visible) return
            ripple()
            await FX.to(scene, dot, { alpha: 0, scale: 1.3 }, { duration: 220 })
            dot.setVisible(false).setScale(1)
        },
        destroy() {
            scene.tweens.killTweensOf(dot)
            dot.destroy()
        },
    }
}
