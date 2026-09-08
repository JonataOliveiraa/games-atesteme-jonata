import Phaser from 'phaser'
import { DEPTH, PEDAL } from '../data/layout'
import { C } from '../data/theme'

export function runDemo(
    scene: Phaser.Scene,
    options: { onHold: () => void; onRelease: () => void },
) {
    const hand = scene.add.graphics().setDepth(DEPTH.trava + 10).setAlpha(0)
    hand.fillStyle(C.white, 0.34)
    hand.fillCircle(0, 0, 32)
    hand.lineStyle(7, C.white, 0.95)
    hand.strokeCircle(0, 0, 32)
    hand.fillStyle(C.white, 0.95)
    hand.fillCircle(0, 0, 10)
    hand.setPosition(PEDAL.x + PEDAL.w / 2, PEDAL.y + PEDAL.h + 90)

    const ripple = scene.add.graphics().setDepth(DEPTH.trava + 9).setAlpha(0)
    ripple.lineStyle(6, C.white, 0.95)
    ripple.strokeCircle(0, 0, 34)

    const tween = (target: object, props: Record<string, unknown>, duration: number, ease = 'Sine.easeInOut') =>
        new Promise<void>(resolve => {
            scene.tweens.add({ targets: target, ...props, duration, ease, onComplete: () => resolve() })
        })

    return (async () => {
        const cx = PEDAL.x + PEDAL.w / 2
        const cy = PEDAL.y + PEDAL.h / 2

        await tween(hand, { alpha: 1, y: cy }, 420)

        ripple.setPosition(cx, cy).setScale(0.6).setAlpha(0.9)
        scene.tweens.add({ targets: ripple, scale: 2.2, alpha: 0, duration: 520, ease: 'Cubic.easeOut' })
        await tween(hand, { scale: 0.76 }, 130)

        options.onHold()
        await tween(hand, { scale: 0.82 }, 1500, 'Sine.easeInOut')

        options.onRelease()
        await tween(hand, { scale: 1, y: cy + 70, alpha: 0 }, 340)

        scene.tweens.killTweensOf(hand)
        scene.tweens.killTweensOf(ripple)
        hand.destroy()
        ripple.destroy()
    })()
}
