import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

type Point = { x: number; y: number }

/** uma linha de pontinhos da figura do pedido até o quadradinho do tecido */
export function drawLink(scene: Phaser.Scene, from: Point, to: Point) {
    const g = scene.add.graphics().setDepth(DEPTH.fx).setAlpha(0)
    const len = Phaser.Math.Distance.BetweenPoints(from, to)
    const n = Math.max(2, Math.floor(len / 18))
    for (let k = 0; k <= n; k++) {
        const x = Phaser.Math.Linear(from.x, to.x, k / n)
        const y = Phaser.Math.Linear(from.y, to.y, k / n)
        g.fillStyle(C.ink, 1)
        g.fillCircle(x, y, 7)
        g.fillStyle(C.glow, 1)
        g.fillCircle(x, y, 4.5)
    }
    void FX.to(scene, g, { alpha: 1 }, { duration: 220 })
    return g
}

/**
 * A volta do laço, no tutorial: uma seta de pontinhos sai de cima da última figura do
 * bloco e corre, em arco, até a primeira.
 */
export async function drawLoopBack(scene: Phaser.Scene, from: Point, to: Point, lift: number) {
    const g = scene.add.graphics().setDepth(DEPTH.fx)
    const p0 = { x: from.x, y: from.y - lift }
    const p2 = { x: to.x, y: to.y - lift }
    const c = { x: (p0.x + p2.x) / 2, y: Math.min(p0.y, p2.y) - lift * 1.1 }
    const at = (t: number) => ({
        x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * c.x + t ** 2 * p2.x,
        y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * c.y + t ** 2 * p2.y,
    })
    const dots = 16
    const run = { t: 0 }
    const draw = () => {
        g.clear()
        const shown = Math.floor(run.t * dots)
        for (let k = 0; k <= shown; k++) {
            const p = at(k / dots)
            g.fillStyle(C.ink, 1)
            g.fillCircle(p.x, p.y, 7)
            g.fillStyle(C.glow, 1)
            g.fillCircle(p.x, p.y, 4.5)
        }
        if (run.t < 1) return
        const tip = at(1)
        const back = at(0.93)
        const a = Math.atan2(tip.y - back.y, tip.x - back.x)
        const head = [0, 2.5, -2.5].map((d, k) => ({
            x: tip.x + Math.cos(a + d) * (k ? 20 : 8),
            y: tip.y + Math.sin(a + d) * (k ? 20 : 8),
        }))
        g.fillStyle(C.ink, 1)
        g.fillTriangle(head[0].x, head[0].y, head[1].x, head[1].y, head[2].x, head[2].y)
    }
    await new Promise<void>(resolve => {
        scene.tweens.add({
            targets: run,
            t: 1,
            duration: FX.ms(scene, 700),
            ease: 'Sine.easeInOut',
            onUpdate: draw,
            onComplete: () => resolve(),
            onStop: () => resolve(),
        })
    })
    draw()
    return g
}
