import Phaser from 'phaser'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

/**
 * O cadeado da trava. Ele mora sobre a ficha intrusa e some no instante em que
 * ela volta para a bolsa — o único caminho de saída, e ele nunca fecha.
 */
export function createLock(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.lock).setAlpha(0)
    g.lineStyle(11, C.ink, 1)
    g.beginPath()
    g.arc(0, -18, 18, Math.PI, 0)
    g.strokePath()
    g.fillStyle(C.ink, 1)
    g.fillRoundedRect(-29, -20, 58, 48, 11)
    g.fillStyle(C.warn, 1)
    g.fillRoundedRect(-24, -15, 48, 38, 9)
    g.fillStyle(C.ink, 1)
    g.fillCircle(0, 2, 7)

    return {
        show(x: number, y: number) {
            g.setPosition(x, y).setAlpha(1).setScale(0.5)
            scene.tweens.killTweensOf(g)
            scene.tweens.add({ targets: g, scale: 1, duration: 260, ease: 'Back.easeOut' })
        },

        hide() {
            scene.tweens.killTweensOf(g)
            scene.tweens.add({ targets: g, alpha: 0, duration: 180 })
        },

        destroy() {
            scene.tweens.killTweensOf(g)
            g.destroy()
        },
    }
}

export type Lock = ReturnType<typeof createLock>
