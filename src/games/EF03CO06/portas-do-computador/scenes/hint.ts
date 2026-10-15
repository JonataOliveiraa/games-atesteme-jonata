import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { DEPTH } from '../data/layout'
import { C } from '../data/theme'

type Point = { x: number; y: number }

/** Seta de pontinhos que anda da informação até o aparelho certo (só no guia). */
export interface Hint {
    show(from: Point, to: Point): void
    tap(at: Point): void
    hide(): void
    destroy(): void
}

const STEP = 26
const SWING = 50

export function createHint(scene: Phaser.Scene): Hint {
    const g = scene.add.graphics().setDepth(DEPTH.fx)
    const state = { t: 0 }
    let curve: Phaser.Curves.QuadraticBezier | undefined
    let flow: Phaser.Tweens.Tween | undefined
    let ring: Phaser.Time.TimerEvent | undefined

    const paint = () => {
        g.clear()
        if (!curve) return
        const len = curve.getLength()
        const count = Math.floor(len / STEP)
        for (let i = 0; i <= count; i++) {
            const u = ((i + state.t) * STEP) / len
            if (u > 0.9) continue
            const p = curve.getPointAt(u)
            const r = 5 + u * 4
            g.fillStyle(C.ink, 1)
            g.fillCircle(p.x, p.y, r + 2.5)
            g.fillStyle(C.glow, 1)
            g.fillCircle(p.x, p.y, r)
        }
        const tip = curve.getPointAt(1)
        const dir = curve.getTangentAt(0.98)
        const a = Math.atan2(dir.y, dir.x)
        const pt = (r: number, da: number) => ({ x: tip.x + Math.cos(a + da) * r, y: tip.y + Math.sin(a + da) * r })
        const head = [pt(0, 0), pt(-26, -0.5), pt(-26, 0.5)].map(p => ({ x: p.x, y: p.y }))
        g.fillStyle(C.glow, 1)
        g.fillTriangle(head[0].x, head[0].y, head[1].x, head[1].y, head[2].x, head[2].y)
        g.lineStyle(3, C.ink, 1)
        g.strokeTriangle(head[0].x, head[0].y, head[1].x, head[1].y, head[2].x, head[2].y)
    }

    const hide = () => {
        flow?.remove()
        flow = undefined
        ring?.remove()
        ring = undefined
        curve = undefined
        g.clear()
    }

    const tap = (at: Point) => void FX.ping(scene, at.x, at.y, C.glow, { radius: 92, duration: 620, depth: DEPTH.fx })

    return {
        show(from, to) {
            hide()
            const mid = new Phaser.Math.Vector2(from.x + (from.x < to.x ? -SWING : SWING), to.y)
            curve = new Phaser.Curves.QuadraticBezier(new Phaser.Math.Vector2(from.x, from.y), mid, new Phaser.Math.Vector2(to.x, to.y))
            state.t = 0
            flow = scene.tweens.add({ targets: state, t: 1, duration: FX.ms(scene, 520), repeat: -1, onUpdate: paint })
            ring = scene.time.addEvent({ delay: 950, loop: true, callback: () => tap(to) })
            paint()
        },
        tap,
        hide,
        destroy() {
            hide()
            g.destroy()
        },
    }
}
