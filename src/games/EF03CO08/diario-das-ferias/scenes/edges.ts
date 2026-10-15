import Phaser from 'phaser'
import { DEPTH, EDGE, W } from '../data/layout'
import { C } from '../data/theme'

/**
 * Setinha parada na borda da tela para cada coisa do momento que ficou fora
 * da vista. É igual para todas: diz "tem algo para lá", nunca o que é.
 */
export interface Edges {
    update(points: { x: number; y: number }[]): void
    clear(): void
    destroy(): void
}

export function createEdges(scene: Phaser.Scene): Edges {
    const g = scene.add.graphics().setDepth(DEPTH.lens + 2)
    const arrow = (x: number, y: number, dir: number) => {
        const s = EDGE.size
        g.fillStyle(C.shadow, 0.25)
        g.fillCircle(x + 2, y + 4, s)
        g.fillStyle(C.white, 0.95)
        g.fillCircle(x, y, s)
        g.lineStyle(4, C.ink, 1)
        g.strokeCircle(x, y, s)
        g.fillStyle(C.accent, 1)
        g.fillTriangle(x + dir * s * 0.55, y, x - dir * s * 0.3, y - s * 0.5, x - dir * s * 0.3, y + s * 0.5)
    }
    return {
        update(points) {
            g.clear()
            points.forEach(p => {
                if (p.x >= 0 && p.x <= W) return
                const dir = p.x < 0 ? -1 : 1
                arrow(dir < 0 ? EDGE.inset : W - EDGE.inset, Phaser.Math.Clamp(p.y, EDGE.minY, EDGE.maxY), dir)
            })
        },
        clear() {
            g.clear()
        },
        destroy() {
            g.destroy()
        },
    }
}
