import Phaser from 'phaser'
import { FX, Ease } from '../../../../shared/effects/FX'
import { BOX_ART, OBJ, OBJ_CELL, OBJECTS } from '../data/files'
import { BOX, CART, DEPTH, FLOOR } from '../data/layout'
import type { Rect, Vec } from '../types'

export interface Box {
    fill(count: number): void
    pop(): Promise<Vec>
    rect(): Rect
    destroy(): void
}

export function createBox(scene: Phaser.Scene): Box {
    const box = scene.add
        .sprite(BOX.x, FLOOR, OBJECTS, OBJ.box)
        .setOrigin(0.5, BOX_ART.foot / OBJ_CELL)
        .setScale(BOX.scale)
        .setDepth(DEPTH.box)
    const rim = FLOOR - (BOX_ART.foot - BOX_ART.top) * BOX.scale
    let queue: Phaser.GameObjects.Sprite[] = []

    const place = () => {
        queue.forEach((s, i) => {
            const x = BOX.x - ((queue.length - 1) * BOX.queueGap) / 2 + i * BOX.queueGap
            void FX.to(scene, s, { x, y: rim - 22 }, { duration: 220 })
        })
    }

    return {
        fill(count) {
            queue.forEach(s => s.destroy())
            queue = Array.from({ length: count }, (_, i) =>
                scene.add
                    .sprite(BOX.x - ((count - 1) * BOX.queueGap) / 2 + i * BOX.queueGap, rim - 22, OBJECTS, OBJ.cart)
                    .setScale(CART.queueScale)
                    .setDepth(DEPTH.box + 1),
            )
        },
        async pop() {
            const first = queue.shift()
            const at = first ? { x: first.x, y: first.y - 20 } : { x: BOX.x, y: rim }
            first?.destroy()
            void FX.to(scene, box, { scaleY: BOX.scale * 0.86, scaleX: BOX.scale * 1.08 }, { duration: 90, yoyo: true, ease: Ease.smooth })
            place()
            return at
        },
        rect() {
            return { x: BOX.x, y: (rim + FLOOR) / 2 - 10, w: 150, h: FLOOR - rim + 40 }
        },
        destroy() {
            queue.forEach(s => s.destroy())
            queue = []
            box.destroy()
        },
    }
}
