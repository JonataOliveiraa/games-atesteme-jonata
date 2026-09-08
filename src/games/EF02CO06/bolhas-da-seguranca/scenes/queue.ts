import Phaser from 'phaser'
import { Ease, FX } from '../../../../shared/effects/FX'
import { DEPTH, QUEUE, queueBounds, queueX } from '../data/layout'
import { C } from '../data/theme'

const darker = (color: number, amount = 26) =>
    Phaser.Display.Color.IntegerToColor(color).darken(amount).color

function paintDot(g: Phaser.GameObjects.Graphics, color: number | null) {
    const r = QUEUE.dot / 2
    g.clear()
    if (color === null) {
        g.lineStyle(4, C.screenEdge, 0.9)
        g.strokeCircle(0, 0, r)
        return
    }
    g.fillStyle(color, 0.5)
    g.fillCircle(0, 0, r)
    g.lineStyle(4, darker(color, 24), 1)
    g.strokeCircle(0, 0, r)
    g.fillStyle(C.white, 0.85)
    g.fillEllipse(-r * 0.34, -r * 0.38, r * 0.5, r * 0.32)
}

export function createQueue(scene: Phaser.Scene, total: number) {
    const root = scene.add.container(0, 0).setDepth(DEPTH.queue)
    const dots: Phaser.GameObjects.Graphics[] = []

    const box = queueBounds(total)
    const tray = scene.add.graphics()
    tray.fillStyle(C.white, 0.75)
    tray.fillRoundedRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, box.h / 2)
    tray.lineStyle(3, C.bubble, 0.7)
    tray.strokeRoundedRect(box.x - box.w / 2, box.y - box.h / 2, box.w, box.h, box.h / 2)
    root.add(tray)

    for (let i = 0; i < total; i++) {
        const g = scene.add.graphics().setPosition(queueX(i, total), QUEUE.cy)
        paintDot(g, null)
        root.add(g)
        dots.push(g)
    }

    let filled = 0

    return {
        get container() {
            return root
        },

        get total() {
            return total
        },

        async fill(color: number) {
            const dot = dots[filled]
            filled++
            if (!dot) return
            paintDot(dot, color)
            dot.setScale(0.3)
            void FX.sparks(scene, dot.x, dot.y, { color, count: 8, spread: 90, duration: 420, size: 7 })
            await FX.to(scene, dot, { scale: 1 }, { duration: 320, ease: Ease.back(2.6) })
        },

        trayPoint() {
            return { x: box.x, y: box.y }
        },

        async celebrate() {
            await FX.stagger(scene, dots, dot =>
                FX.to(scene, dot, { scale: 1.35 }, { duration: 160, yoyo: true }),
                60,
            )
        },

        destroy() {
            dots.forEach(dot => scene.tweens.killTweensOf(dot))
            root.destroy(true)
        },
    }
}

export type Queue = ReturnType<typeof createQueue>
