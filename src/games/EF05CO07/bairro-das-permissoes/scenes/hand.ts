import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAND_KEY, HAND_TIP } from '../data/files'
import { DEPTH, HAND } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import type { View } from './view'

export interface Hand {
    press(at: Vec): Promise<void>
    hold(at: Vec, ms: number): Promise<void>
    lift(): Promise<void>
    stop(): void
    destroy(): void
}

export function createHand(scene: Phaser.Scene, view: View): Hand {
    const img = view.world(
        scene.add
            .image(0, 0, HAND_KEY)
            .setOrigin(HAND_TIP.x, HAND_TIP.y)
            .setDisplaySize(HAND.size, HAND.size)
            .setDepth(DEPTH.hand)
            .setVisible(false),
    )
    const base = img.scale
    let ring: Phaser.Time.TimerEvent | undefined

    const ripple = (at: Vec) => {
        const g = view.world(scene.add.circle(at.x, at.y, 22, C.white, 0.5).setDepth(DEPTH.hand - 1))
        g.setStrokeStyle(4, C.white, 0.9)
        scene.tweens.add({ targets: g, scale: 2.2, alpha: 0, duration: 520, onComplete: () => g.destroy() })
    }

    const stop = () => {
        ring?.remove()
        ring = undefined
        scene.tweens.killTweensOf(img)
        img.setVisible(false).setScale(base).setAlpha(1)
    }

    const hand: Hand = {
        async press(at) {
            stop()
            img.setPosition(at.x + HAND.tapLift, at.y + HAND.tapLift).setVisible(true).setAlpha(0).setScale(base * 1.1)
            await FX.to(scene, img, { alpha: 1, x: at.x, y: at.y, scale: base * 0.9 }, { duration: 300 })
            ripple(at)
            ring = scene.time.addEvent({ delay: 420, loop: true, callback: () => ripple({ x: img.x, y: img.y }) })
        },
        async hold(at, ms) {
            await hand.press(at)
            await FX.wait(scene, ms)
        },
        async lift() {
            ring?.remove()
            ring = undefined
            if (!img.visible) return
            await FX.to(scene, img, { alpha: 0, x: img.x + HAND.tapLift, y: img.y + HAND.tapLift, scale: base * 1.1 }, { duration: 260 })
            img.setVisible(false)
        },
        stop,
        destroy() {
            stop()
            img.destroy()
        },
    }
    return hand
}
