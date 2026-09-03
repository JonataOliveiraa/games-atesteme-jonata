import Phaser from 'phaser'
import { C } from '../data/theme'
import { DEPTH } from '../data/layout'
import type { Point, Target } from '../types'

const GAP = 42
const DOT = 9

export function createGuides(scene: Phaser.Scene) {
    const trail = scene.add.graphics().setDepth(DEPTH.line)
    const rings = scene.add.graphics().setDepth(DEPTH.spot)
    let painted = false

    function drawTrail(from: Point, to: Point, offset: number) {
        const dx = to.x - from.x
        const dy = to.y - from.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        const a = { x: from.x + ux * 66, y: from.y + uy * 66 }
        const span = len - 66 - 78
        if (span <= GAP) return

        for (let d = offset % GAP; d < span; d += GAP) {
            const t = d / span
            const fade = Math.min(1, t * 3.2) * Math.min(1, (1 - t) * 3.2)
            if (fade <= 0.04) continue
            const x = a.x + ux * d
            const y = a.y + uy * d
            const r = DOT * (0.68 + t * 0.5)
            trail.fillStyle(C.ink, 0.55 * fade)
            trail.fillCircle(x, y + 2, r + 3)
            trail.fillStyle(C.cream, fade)
            trail.fillCircle(x, y, r)
            trail.fillStyle(C.white, 0.9 * fade)
            trail.fillCircle(x - r * 0.28, y - r * 0.3, r * 0.4)
        }

        const tip = { x: a.x + ux * span, y: a.y + uy * span }
        const angle = Math.atan2(uy, ux)
        const size = 30
        const lx = tip.x - Math.cos(angle - 0.56) * size
        const ly = tip.y - Math.sin(angle - 0.56) * size
        const rx = tip.x - Math.cos(angle + 0.56) * size
        const ry = tip.y - Math.sin(angle + 0.56) * size
        trail.fillStyle(C.ok, 1)
        trail.fillTriangle(tip.x, tip.y, lx, ly, rx, ry)
        trail.lineStyle(6, C.ink, 1)
        trail.strokeTriangle(tip.x, tip.y, lx, ly, rx, ry)
    }

    function drawRing(at: Point, pulse: number) {
        const w = 206 * pulse
        const h = 62 * pulse
        rings.fillStyle(C.okDark, 0.3)
        rings.fillEllipse(at.x, at.y, w, h)
        rings.lineStyle(16, C.ink, 0.7)
        rings.strokeEllipse(at.x, at.y, w, h)
        rings.lineStyle(10, C.okDark, 1)
        rings.strokeEllipse(at.x, at.y, w, h)
        rings.lineStyle(5, C.ok, 1)
        rings.strokeEllipse(at.x, at.y, w, h)
    }

    return {
        refresh(from: Point, targets: Target[], time: number) {
            trail.clear()
            rings.clear()
            painted = true
            const offset = (time * 0.075) % GAP
            const pulse = 1 + Math.sin(time * 0.005) * 0.07
            targets.forEach(target => {
                drawRing(target.mark, pulse)
                drawTrail(from, target.hook, offset)
            })
        },

        clear() {
            if (!painted) return
            painted = false
            trail.clear()
            rings.clear()
        },

        destroy() {
            trail.destroy()
            rings.destroy()
        },
    }
}
