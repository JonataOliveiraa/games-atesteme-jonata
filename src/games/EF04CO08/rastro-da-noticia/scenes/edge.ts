import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { LOGO_SHEET, cellKey } from '../data/files'
import { DEPTH, EDGE, W } from '../data/layout'
import { C } from '../data/theme'
import type { Rect } from '../types'
import { fitInto } from './art'

export interface EdgeHint {
    update(side: -1 | 0 | 1, logo: number | null): void
    rect(): Rect
    destroy(): void
}

export function createEdgeHint(scene: Phaser.Scene): EdgeHint {
    const g = scene.add.graphics()
    const logo = scene.add.image(0, 0, LOGO_SHEET.key, cellKey(0))
    const box = scene.add.container(0, EDGE.y, [g, logo]).setDepth(DEPTH.edge).setAlpha(0).setVisible(false)
    let current = 0
    let cell: number | null = null

    const paint = (side: number) => {
        const { w, h } = EDGE
        g.clear()
        g.fillStyle(C.shadow, 0.2)
        g.fillRoundedRect(-w / 2 + 3, -h / 2 + 5, w, h, h / 2)
        g.fillStyle(C.headerFace, 0.96)
        g.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        g.lineStyle(3, C.headerRim, 1)
        g.strokeRoundedRect(-w / 2, -h / 2, w, h, h / 2)
        const tip = (side * w) / 2 - side * 10
        const back = tip - side * 26
        g.fillStyle(C.accent, 1)
        g.fillTriangle(tip, 0, back, -18, back, 18)
        logo.setX(-side * 16)
    }

    return {
        update(side, next) {
            if (side === current && next === cell) return
            current = side
            cell = next
            scene.tweens.killTweensOf(box)
            if (side === 0 || next === null) {
                void FX.to(scene, box, { alpha: 0 }, { duration: 200 }).then(() => {
                    if (current === 0) box.setVisible(false)
                })
                return
            }
            paint(side)
            fitInto(logo.setFrame(cellKey(next)), EDGE.logo)
            box.setX(side < 0 ? EDGE.margin + EDGE.w / 2 : W - EDGE.margin - EDGE.w / 2).setVisible(true)
            void FX.to(scene, box, { alpha: 1 }, { duration: 240 })
        },
        rect: () => ({ x: box.x, y: box.y, w: EDGE.w + 16, h: EDGE.h + 16 }),
        destroy() {
            scene.tweens.killTweensOf(box)
            box.destroy()
        },
    }
}
