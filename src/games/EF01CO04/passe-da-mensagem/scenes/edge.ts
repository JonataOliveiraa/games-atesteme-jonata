import Phaser from 'phaser'
import { C } from '../data/theme'
import { DEPTH, H, W } from '../data/layout'

const LIFE = 540

export function createEdge(scene: Phaser.Scene) {
    const g = scene.add.graphics().setDepth(DEPTH.edge)
    let left = 0
    let color = C.ok

    return {
        update(dtMs: number) {
            if (left <= 0) {
                if (g.commandBuffer.length) g.clear()
                return
            }
            left = Math.max(0, left - dtMs)
            const t = left / LIFE
            g.clear()
            for (let i = 0; i < 5; i++) {
                g.lineStyle(12 + i * 18, color, 0.28 * t * (1 - i / 5))
                g.strokeRoundedRect(6 + i * 7, 6 + i * 7, W - 12 - i * 14, H - 12 - i * 14, 44)
            }
        },

        flash(next: number) {
            left = LIFE
            color = next
        },

        destroy() {
            g.destroy()
        },
    }
}
