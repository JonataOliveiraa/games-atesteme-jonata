import Phaser from 'phaser'
import { cellKey } from '../data/files'
import { DEPTH, MARKER, VIEW } from '../data/layout'
import { C } from '../data/theme'
import type { Rect, Vec } from '../types'
import type { View } from './view'

export interface Markers {
    update(target: Vec | null, icon: number | null): void
    visible(on: boolean): void
    destroy(): void
}

export function createMarkers(scene: Phaser.Scene, view: View, avoid: Rect): Markers {
    const s = MARKER.size
    const disc = scene.add.graphics()
    disc.fillStyle(C.shadow, 0.25)
    disc.fillCircle(2, 5, s)
    disc.fillStyle(C.white, 1)
    disc.fillCircle(0, 0, s)
    disc.lineStyle(5, C.accent, 1)
    disc.strokeCircle(0, 0, s)
    const tip = scene.add.graphics()
    tip.fillStyle(C.accent, 1)
    tip.fillTriangle(s + MARKER.tip + 6, 0, s - 4, -MARKER.tip, s - 4, MARKER.tip)
    const icon = scene.add.image(0, 0, 'icones', cellKey(0)).setDisplaySize(MARKER.icon, MARKER.icon)
    const box = scene.add.container(0, 0, [tip, disc, icon]).setDepth(DEPTH.marker).setVisible(false)
    let shown = true

    const left = VIEW.x + MARKER.inset
    const right = VIEW.x + VIEW.w - MARKER.inset
    const top = VIEW.y + VIEW.top + MARKER.inset
    const bottom = VIEW.y + VIEW.h - MARKER.inset
    const cx = VIEW.x + VIEW.w / 2
    const cy = VIEW.y + VIEW.top + (VIEW.h - VIEW.top) / 2
    const grow = (pad: number) => ({
        x0: avoid.x - avoid.w / 2 - pad,
        x1: avoid.x + avoid.w / 2 + pad,
        y0: avoid.y - avoid.h / 2 - pad,
        y1: avoid.y + avoid.h / 2 + pad,
    })
    const keepOut = grow(s + 10)
    const hidden = grow(20)
    const within = (p: Vec, r: typeof keepOut) => p.x > r.x0 && p.x < r.x1 && p.y > r.y0 && p.y < r.y1

    return {
        update(target, iconIndex) {
            if (!target || iconIndex === null || !shown) {
                box.setVisible(false)
                return
            }
            const p = view.toScreen(target)
            const covered = within(p, hidden)
            if (!covered && view.inView(target, 40)) {
                box.setVisible(false)
                return
            }
            let x: number
            let y: number
            if (covered) {
                x = keepOut.x1
                y = Phaser.Math.Clamp(p.y, top, bottom)
            } else {
                const dx = p.x - cx
                const dy = p.y - cy
                const k = Math.min(Math.abs((dx > 0 ? right - cx : left - cx) / (dx || 1e-6)), Math.abs((dy > 0 ? bottom - cy : top - cy) / (dy || 1e-6)))
                x = cx + dx * k
                y = cy + dy * k
                if (within({ x, y }, keepOut)) x = keepOut.x1
            }
            if (icon.frame.name !== cellKey(iconIndex)) icon.setFrame(cellKey(iconIndex)).setDisplaySize(MARKER.icon, MARKER.icon)
            box.setPosition(x, y).setVisible(true)
            tip.setRotation(Math.atan2(p.y - y, p.x - x))
        },
        visible(on) {
            shown = on
            if (!on) box.setVisible(false)
        },
        destroy() {
            box.destroy()
        },
    }
}
