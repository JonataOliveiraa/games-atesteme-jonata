import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
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
    const shade = scene.add.circle(3, 5, HAND.r, C.shadow, 0.22)
    const face = scene.add.circle(0, 0, HAND.r, C.white, 0.92).setStrokeStyle(HAND.stroke, C.accent, 1)
    const core = scene.add.circle(0, 0, HAND.r * 0.42, C.accent, 1)
    const dot = view.world(scene.add.container(0, 0, [shade, face, core]).setDepth(DEPTH.hand).setVisible(false))
    let ring: Phaser.Time.TimerEvent | undefined

    const ripple = (at: Vec) => {
        const g = view.world(scene.add.circle(at.x, at.y, HAND.r, C.white, 0).setDepth(DEPTH.hand - 1))
        g.setStrokeStyle(HAND.wave, C.white, 0.95)
        scene.tweens.add({ targets: g, scale: HAND.spread, alpha: 0, duration: 720, ease: 'Sine.easeOut', onComplete: () => g.destroy() })
    }

    const tap = () => {
        scene.tweens.killTweensOf(dot)
        dot.setScale(1)
        scene.tweens.add({ targets: dot, scale: 0.82, duration: 110, yoyo: true })
        ripple({ x: dot.x, y: dot.y })
    }

    const stop = () => {
        ring?.remove()
        ring = undefined
        scene.tweens.killTweensOf(dot)
        dot.setVisible(false).setScale(1).setAlpha(1)
    }

    const hand: Hand = {
        async press(at) {
            stop()
            dot.setPosition(at.x, at.y).setVisible(true).setAlpha(0).setScale(1.4)
            await FX.to(scene, dot, { alpha: 1, scale: 1 }, { duration: 240, ease: 'Back.easeOut' })
            tap()
            ring = scene.time.addEvent({ delay: 520, loop: true, callback: tap })
        },
        async hold(at, ms) {
            await hand.press(at)
            await FX.wait(scene, ms)
        },
        async lift() {
            ring?.remove()
            ring = undefined
            if (!dot.visible) return
            scene.tweens.killTweensOf(dot)
            await FX.to(scene, dot, { alpha: 0, scale: 1.3 }, { duration: 220 })
            dot.setVisible(false).setScale(1)
        },
        stop,
        destroy() {
            stop()
            dot.destroy()
        },
    }
    return hand
}
