import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { HAND_KEY, HAND_TIP } from '../data/files'
import { DEPTH, HAND } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import type { View } from './view'

/**
 * A mãozinha que mostra o gesto: puxa o cabo e toca no aparelho. Ela mora no
 * mapa, então acompanha o zoom da câmera. A ponta do dedo é o ponto exato.
 */
export interface Hand {
    /** Aparece no ponto, aperta e leva até o destino; `onMove` recebe cada ponto do caminho. */
    drag(from: Vec, to: Vec, ms: number, onMove?: (at: Vec) => void): Promise<void>
    /** Toca no ponto sem parar, até `stop()`. */
    tapLoop(at: Vec): void
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
    let loop: Phaser.Tweens.Tween | undefined
    let ring: Phaser.Time.TimerEvent | undefined
    let loopAt: Vec | null = null

    const ripple = (at: Vec) => {
        const g = view.world(scene.add.circle(at.x, at.y, 22, C.white, 0.5).setDepth(DEPTH.hand - 1))
        g.setStrokeStyle(4, C.white, 0.9)
        scene.tweens.add({ targets: g, scale: 2.2, alpha: 0, duration: 520, onComplete: () => g.destroy() })
    }

    const stop = () => {
        loop?.stop()
        loop = undefined
        ring?.remove()
        ring = undefined
        loopAt = null
        scene.tweens.killTweensOf(img)
        img.setVisible(false).setScale(base).setAlpha(1)
    }

    return {
        async drag(from, to, ms, onMove) {
            stop()
            img.setPosition(from.x, from.y).setVisible(true).setAlpha(0).setScale(base * 1.15)
            await FX.to(scene, img, { alpha: 1, scale: base }, { duration: 260 })
            ripple(from)
            const k = { t: 0 }
            await new Promise<void>(resolve => {
                scene.tweens.add({
                    targets: k,
                    t: 1,
                    duration: FX.ms(scene, ms),
                    ease: 'Sine.easeInOut',
                    onUpdate: () => {
                        const at = { x: Phaser.Math.Linear(from.x, to.x, k.t), y: Phaser.Math.Linear(from.y, to.y, k.t) }
                        img.setPosition(at.x, at.y)
                        onMove?.(at)
                    },
                    onComplete: () => resolve(),
                })
            })
        },
        tapLoop(at) {
            if (loopAt && loopAt.x === at.x && loopAt.y === at.y) return
            stop()
            loopAt = { ...at }
            img.setPosition(at.x + HAND.tapLift, at.y + HAND.tapLift).setVisible(true).setAlpha(1)
            loop = scene.tweens.add({
                targets: img,
                x: at.x,
                y: at.y,
                scale: base * 0.9,
                duration: 360,
                yoyo: true,
                hold: 120,
                repeatDelay: 380,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
            ring = scene.time.addEvent({ delay: 1240, startAt: 880, loop: true, callback: () => ripple(at) })
        },
        stop,
        destroy() {
            stop()
            img.destroy()
        },
    }
}
