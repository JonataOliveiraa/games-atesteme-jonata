import Phaser from 'phaser'
import { DEPTH, GROUND_Y, H, LANE_WX, W, xOf } from '../data/layout'
import { C } from '../data/theme'
import type { Lane } from '../types'

const TAP_Y = GROUND_Y - 40

export function runDemo(scene: Phaser.Scene, onTap: (lane: Lane) => void) {
    const veil = scene.add
        .rectangle(W / 2, H / 2, W, H, C.ink, 0)
        .setDepth(DEPTH.trava - 20)

    const hand = scene.add.graphics().setDepth(DEPTH.trava + 10).setPosition(W / 2, TAP_Y + 60)
    hand.fillStyle(C.white, 0.32)
    hand.fillCircle(0, 0, 30)
    hand.lineStyle(6, C.white, 0.95)
    hand.strokeCircle(0, 0, 30)
    hand.fillStyle(C.white, 0.95)
    hand.fillCircle(0, 0, 9)
    hand.setAlpha(0)

    const ripple = scene.add.graphics().setDepth(DEPTH.trava + 9)
    ripple.lineStyle(6, C.white, 0.95)
    ripple.strokeCircle(0, 0, 32)
    ripple.setAlpha(0)

    const tween = (target: object, props: Record<string, unknown>, duration: number, ease = 'Sine.easeInOut') =>
        new Promise<void>(resolve => {
            scene.tweens.add({ targets: target, ...props, duration, ease, onComplete: () => resolve() })
        })

    const tap = async (lane: Lane) => {
        const x = xOf(1, lane === 0 ? -LANE_WX : LANE_WX)
        await tween(hand, { x, y: TAP_Y }, 340)

        onTap(lane)
        ripple.setPosition(x, TAP_Y).setScale(0.5).setAlpha(0.9)
        scene.tweens.add({ targets: ripple, scale: 2.1, alpha: 0, duration: 460, ease: 'Cubic.easeOut' })
        await tween(hand, { scale: 0.74 }, 130)
        await tween(hand, { scale: 1 }, 130)
    }

    return (async () => {
        await Promise.all([
            tween(veil, { alpha: 0.24 }, 200),
            tween(hand, { alpha: 1 }, 200),
        ])
        await tap(0)
        await tap(1)
        await Promise.all([
            tween(veil, { alpha: 0 }, 200),
            tween(hand, { alpha: 0 }, 200),
        ])

        scene.tweens.killTweensOf(hand)
        scene.tweens.killTweensOf(ripple)
        scene.tweens.killTweensOf(veil)
        hand.destroy()
        ripple.destroy()
        veil.destroy()
    })()
}
