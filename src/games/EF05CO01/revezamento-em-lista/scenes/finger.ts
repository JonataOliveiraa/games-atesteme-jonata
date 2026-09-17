import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

export interface Finger {
    tap(x: number, y: number): Promise<void>
    hide(): Promise<void>
    reset(): void
    destroy(): void
}

/**
 * O dedo do tutorial: ele VAI até o alvo e bate ali. Nunca arrasta.
 *
 * Todo movimento mata o anterior antes de começar. Sem isso, um `hide` ainda
 * correndo apagava o dedo no meio do toque seguinte — e o toque acontecia
 * invisível, dando a impressão de que a tela mexia sozinha.
 */
export function createFinger(scene: Phaser.Scene): Finger {
    const root = scene.add.container(-200, -200).setDepth(DEPTH.hud + 30).setAlpha(0)

    const hand = scene.add.graphics()
    hand.fillStyle(C.ink, 0.28)
    hand.fillEllipse(6, 10, 54, 54)
    hand.fillStyle(C.white, 1)
    hand.fillCircle(0, 0, 25)
    hand.fillStyle(C.ink, 1)
    hand.fillCircle(0, 0, 18)
    hand.fillStyle(C.white, 1)
    hand.fillRoundedRect(-6, -46, 12, 30, 6)
    root.add(hand)

    const reset = () => {
        FX.kill(scene, root)
        root.setAlpha(0).setScale(1).setPosition(-200, -200)
    }

    return {
        tap: async (x, y) => {
            reset()
            root.setPosition(x + 90, y - 110)
            await FX.to(scene, root, { alpha: 1 }, { duration: 160 })
            await FX.to(scene, root, { x, y: y + 40 }, { duration: 520, ease: 'Sine.easeInOut' })
            await FX.to(scene, root, { scale: 0.82 }, { duration: 120, yoyo: true })
            await FX.ping(scene, x, y, C.rope, { radius: 70, depth: DEPTH.hud + 29 })
        },

        hide: async () => {
            FX.kill(scene, root)
            await FX.to(scene, root, { alpha: 0 }, { duration: 180 })
            root.setPosition(-200, -200)
        },

        reset,
        destroy: () => root.destroy(true),
    }
}
