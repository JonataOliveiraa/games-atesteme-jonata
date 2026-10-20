import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAND_KEY, HAND_TIP } from '../data/files'
import { DEPTH, HAND } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

export interface Hand {
    hold(at: Vec, ms: number): Promise<void>
    stop(): void
    destroy(): void
}

export function createHand(scene: Phaser.Scene): Hand {
    const img = scene.add
        .image(0, 0, HAND_KEY)
        .setOrigin(HAND_TIP.x, HAND_TIP.y)
        .setDisplaySize(HAND.size, HAND.size)
        .setDepth(DEPTH.hand)
        .setVisible(false)
    const base = img.scale

    const ripple = (at: Vec) => {
        const ring = scene.add.circle(at.x, at.y, 26, C.white, 0.45).setDepth(DEPTH.hand - 1)
        ring.setStrokeStyle(5, C.white, 0.9)
        scene.tweens.add({ targets: ring, scale: 2.3, alpha: 0, duration: 560, onComplete: () => ring.destroy() })
    }

    const stop = () => {
        scene.tweens.killTweensOf(img)
        img.setVisible(false).setScale(base).setAlpha(1)
    }

    return {
        async hold(at, ms) {
            scene.tweens.killTweensOf(img)
            img.setPosition(at.x + 40, at.y + 50).setVisible(true).setAlpha(0).setScale(base * 1.1)
            await FX.to(scene, img, { x: at.x, y: at.y, alpha: 1, scale: base * 0.92 }, { duration: 300 })
            ripple(at)
            await FX.wait(scene, ms)
            await FX.to(scene, img, { x: at.x + 20, y: at.y + 26, scale: base }, { duration: 200 })
        },
        stop,
        destroy() {
            stop()
            img.destroy()
        },
    }
}
