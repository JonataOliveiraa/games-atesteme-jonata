import Phaser from 'phaser'
import { ARROW, DEPTH, H, minimapBox, W } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'

export interface Arrows {
    update(camera: Phaser.Cameras.Scene2D.Camera, targets: Vec[]): void
    clear(): void
    destroy(): void
}

export function createArrows(scene: Phaser.Scene): Arrows {
    const g = scene.add.graphics().setDepth(DEPTH.arrows).setScrollFactor(0)
    return {
        update(camera, targets) {
            g.clear()
            const cx = W / 2
            const cy = H / 2
            targets.forEach(t => {
                const sx = t.x - camera.scrollX
                const sy = t.y - camera.scrollY
                const inside = sx > 30 && sx < W - 30 && sy > ARROW.top - 40 && sy < ARROW.bottom + 40
                if (inside) return
                const a = Math.atan2(sy - cy, sx - cx)
                const kx = (W / 2 - ARROW.inset) / Math.abs(Math.cos(a) || 1e-6)
                const ky = (sy < cy ? cy - ARROW.top : ARROW.bottom - cy) / Math.abs(Math.sin(a) || 1e-6)
                const k = Math.min(kx, ky)
                const x = cx + Math.cos(a) * k
                let y = cy + Math.sin(a) * k
                const map = minimapBox()
                if (x > map.x - map.w / 2 - 40 && y < map.y + map.h / 2 + 44) y = map.y + map.h / 2 + 44
                const s = ARROW.size
                const tip = { x: x + Math.cos(a) * s, y: y + Math.sin(a) * s }
                const l = { x: x + Math.cos(a + 2.4) * s, y: y + Math.sin(a + 2.4) * s }
                const r = { x: x + Math.cos(a - 2.4) * s, y: y + Math.sin(a - 2.4) * s }
                g.fillStyle(C.ink, 1)
                g.fillCircle(x, y, s + 6)
                g.fillStyle(C.glow, 1)
                g.fillCircle(x, y, s + 2)
                g.fillStyle(C.ink, 1)
                g.fillTriangle(tip.x, tip.y, l.x, l.y, r.x, r.y)
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
