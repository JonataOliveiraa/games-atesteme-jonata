import Phaser from 'phaser'
import { DEPTH, MARKER, VIEW } from '../data/layout'
import { C } from '../data/theme'
import type { Vec } from '../types'
import type { View } from './view'

export interface Markers {
    update(target: Vec | null): void
    visible(on: boolean): void
    destroy(): void
}

export function createMarkers(scene: Phaser.Scene, view: View): Markers {
    const g = scene.add.graphics()
    const s = MARKER.size
    g.fillStyle(C.shadow, 0.25)
    g.fillCircle(2, 4, s)
    g.fillStyle(C.white, 1)
    g.fillCircle(0, 0, s)
    g.fillStyle(C.accent, 1)
    g.fillTriangle(s * 0.72, 0, s * 0.02, -s * 0.5, s * 0.02, s * 0.5)
    g.fillRoundedRect(-s * 0.62, -s * 0.16, s * 0.7, s * 0.32, s * 0.12)
    const box = scene.add.container(0, 0, [g]).setDepth(DEPTH.marker).setVisible(false)
    const pulse = scene.tweens.add({ targets: box, scale: 1.15, duration: 520, yoyo: true, repeat: -1 })
    let shown = true

    const left = VIEW.x + MARKER.inset
    const right = VIEW.x + VIEW.w - MARKER.inset
    const top = VIEW.y + MARKER.inset
    const bottom = VIEW.y + VIEW.h - MARKER.inset
    const cx = VIEW.x + VIEW.w / 2
    const cy = VIEW.y + VIEW.h / 2

    return {
        update(target) {
            if (!target || !shown || view.inView(target, 40)) {
                box.setVisible(false)
                return
            }
            const p = view.toScreen(target)
            const dx = p.x - cx
            const dy = p.y - cy
            const k = Math.min(Math.abs((dx > 0 ? right - cx : left - cx) / (dx || 1e-6)), Math.abs((dy > 0 ? bottom - cy : top - cy) / (dy || 1e-6)))
            box.setPosition(cx + dx * k, cy + dy * k).setRotation(Math.atan2(dy, dx)).setVisible(true)
        },
        visible(on) {
            shown = on
            if (!on) box.setVisible(false)
        },
        destroy() {
            pulse.remove()
            box.destroy()
        },
    }
}
