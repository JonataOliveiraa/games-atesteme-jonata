import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAND_KEY, HAND_TIP } from '../data/files'
import { DEPTH, HAND } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

/**
 * A mãozinha da demonstração. Ela mora na tela (não no mundo), porque o que
 * ela aperta são os botões. A ponta do dedo é o ponto exato.
 */
export interface Hand {
    /** Vai até o ponto e aperta; `hold` deixa o dedo em cima até `lift()`. */
    press(at: Vec, hold?: boolean): Promise<void>
    lift(): Promise<void>
    hide(): void
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
    let at: Vec | null = null

    const ripple = (p: Vec) => {
        const g = scene.add.circle(p.x, p.y, 22, C.white, 0.5).setDepth(DEPTH.hand - 1)
        g.setStrokeStyle(4, C.white, 0.9)
        scene.tweens.add({ targets: g, scale: 2.2, alpha: 0, duration: 520, onComplete: () => g.destroy() })
    }

    const hand: Hand = {
        async press(p, hold = false) {
            scene.tweens.killTweensOf(img)
            if (!img.visible || !at) {
                img.setPosition(p.x + HAND.tapLift * 2, p.y + HAND.tapLift * 2).setVisible(true).setAlpha(0).setScale(base)
                await FX.to(scene, img, { alpha: 1, x: p.x + HAND.tapLift, y: p.y + HAND.tapLift }, { duration: 260 })
            } else await FX.to(scene, img, { x: p.x + HAND.tapLift, y: p.y + HAND.tapLift }, { duration: 420, ease: 'Sine.easeInOut' })
            at = p
            await FX.to(scene, img, { x: p.x, y: p.y, scale: base * 0.9 }, { duration: 200 })
            ripple(p)
            if (!hold) await hand.lift()
        },
        async lift() {
            if (!at) return
            await FX.to(scene, img, { x: at.x + HAND.tapLift, y: at.y + HAND.tapLift, scale: base }, { duration: 180 })
        },
        hide() {
            scene.tweens.killTweensOf(img)
            img.setVisible(false)
            at = null
        },
        destroy() {
            hand.hide()
            img.destroy()
        },
    }
    return hand
}
