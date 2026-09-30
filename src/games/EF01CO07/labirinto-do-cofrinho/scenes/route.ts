import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { spotKey } from '../data/levels'
import { cellCenter, DEPTH, GRID, ROUTE } from '../data/layout'
import { C } from '../data/theme'
import type { Point, Spot } from '../types'

export interface RouteView {
    showReach(cells: Spot[], here: Spot): void
    hideReach(): void
    showPath(from: Spot, path: Spot[], danger: (s: Spot) => boolean): void
    follow(x: number, y: number): void
    consume(reached: Spot): void
    clear(): void
    deny(s: Spot): void
    destroy(): void
}

const SIDES = [
    { dc: 0, dr: -1, edge: (l: number, t: number, r: number) => [l, t, r, t] },
    { dc: 0, dr: 1, edge: (l: number, _t: number, r: number, b: number) => [l, b, r, b] },
    { dc: -1, dr: 0, edge: (l: number, t: number, _r: number, b: number) => [l, t, l, b] },
    { dc: 1, dr: 0, edge: (_l: number, t: number, r: number, b: number) => [r, t, r, b] },
]

export function createRoute(scene: Phaser.Scene): RouteView {
    const reachFill = scene.add.graphics().setDepth(DEPTH.field + 1)
    const reachEdge = scene.add.graphics().setDepth(DEPTH.field + 2)
    const pathG = scene.add.graphics().setDepth(DEPTH.trail - 1)
    const marker = scene.add.container(0, 0).setDepth(DEPTH.trail).setVisible(false)
    const ring = scene.add.graphics()
    ring.fillStyle(C.yellow, 0.3)
    ring.fillEllipse(0, ROUTE.lineDY, ROUTE.ringW, ROUTE.ringH)
    ring.lineStyle(5, C.yellow, 1)
    ring.strokeEllipse(0, ROUTE.lineDY, ROUTE.ringW, ROUTE.ringH)
    const pin = scene.add.graphics()
    const a = ROUTE.pin
    pin.fillStyle(C.ink, 1)
    pin.fillTriangle(-a - 3, -a - 3, a + 3, -a - 3, 0, a * 0.6 + 4)
    pin.fillStyle(C.yellow, 1)
    pin.fillTriangle(-a, -a, a, -a, 0, a * 0.6)
    pin.y = -ROUTE.pinLift
    marker.add([ring, pin])
    scene.tweens.add({ targets: pin, y: -ROUTE.pinLift - 8, duration: 380, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    scene.tweens.add({ targets: ring, scaleX: 1.12, scaleY: 1.12, duration: 520, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' })
    const edgePulse = scene.tweens.add({
        targets: reachEdge,
        alpha: { from: 1, to: 0.75 },
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
    })

    let reachKey = ''
    let start: Point | null = null
    let path: Spot[] = []
    let isDanger: (s: Spot) => boolean = () => false
    const grow = { p: 1 }

    const ground = (s: Spot): Point => {
        const c = cellCenter(s)
        return { x: c.x, y: c.y + ROUTE.lineDY }
    }

    const paintPath = () => {
        pathG.clear()
        if (!start || !path.length) return
        const points = [start, ...path.map(ground)]
        const lengths = points.slice(1).map((p, i) => Phaser.Math.Distance.Between(points[i].x, points[i].y, p.x, p.y))
        let budget = lengths.reduce((sum, l) => sum + l, 0) * grow.p
        const segments: { a: Point; b: Point; risky: boolean }[] = []
        for (let i = 0; i < lengths.length && budget > 0; i++) {
            const k = Math.min(1, budget / Math.max(1, lengths[i]))
            const a0 = points[i]
            const b0 = points[i + 1]
            segments.push({ a: a0, b: { x: a0.x + (b0.x - a0.x) * k, y: a0.y + (b0.y - a0.y) * k }, risky: isDanger(path[i]) })
            budget -= lengths[i]
        }
        const stroke = (width: number, color: (risky: boolean) => number, alpha: number, dy = 0) => {
            segments.forEach(({ a: p0, b: p1, risky }) => {
                pathG.lineStyle(width, color(risky), alpha)
                pathG.lineBetween(p0.x, p0.y + dy, p1.x, p1.y + dy)
                pathG.fillStyle(color(risky), alpha)
                pathG.fillCircle(p1.x, p1.y + dy, width / 2)
            })
            if (segments.length) {
                pathG.fillStyle(color(segments[0].risky), alpha)
                pathG.fillCircle(segments[0].a.x, segments[0].a.y + dy, width / 2)
            }
        }
        stroke(ROUTE.line + 8, () => C.ink, 0.3, 3)
        stroke(ROUTE.line + 4, () => C.ink, 0.85)
        stroke(ROUTE.line, risky => (risky ? C.wave : C.white), 1)
    }

    const paintReach = (cells: Spot[], here: Spot) => {
        const all = [here, ...cells]
        const keys = new Set(all.map(spotKey))
        reachFill.clear()
        reachEdge.clear()
        const half = GRID.cell / 2
        cells.forEach(s => {
            const { x, y } = cellCenter(s)
            const inset = ROUTE.reachInset
            reachFill.fillStyle(C.white, ROUTE.reachAlpha)
            reachFill.fillRoundedRect(x - half + inset, y - half + inset, GRID.cell - inset * 2, GRID.cell - inset * 2, 14)
        })
        const lines: number[][] = []
        all.forEach(s => {
            const { x, y } = cellCenter(s)
            const [l, t, r, b] = [x - half + 3, y - half + 3, x + half - 3, y + half - 3]
            SIDES.forEach(side => {
                if (keys.has(spotKey({ c: s.c + side.dc, r: s.r + side.dr }))) return
                lines.push(side.edge(l, t, r, b))
            })
        })
        reachEdge.lineStyle(ROUTE.edge + 4, C.ink, 0.45)
        lines.forEach(([x0, y0, x1, y1]) => reachEdge.lineBetween(x0, y0, x1, y1))
        reachEdge.lineStyle(ROUTE.edge, C.yellow, 1)
        lines.forEach(([x0, y0, x1, y1]) => reachEdge.lineBetween(x0, y0, x1, y1))
    }

    return {
        showReach(cells, here) {
            const key = `${spotKey(here)}|${cells.map(spotKey).join('|')}`
            if (key === reachKey) return
            reachKey = key
            paintReach(cells, here)
            scene.tweens.killTweensOf(reachFill)
            reachFill.setAlpha(0)
            reachEdge.setVisible(true)
            scene.tweens.add({ targets: reachFill, alpha: 1, duration: 220 })
        },
        hideReach() {
            if (!reachKey) return
            reachKey = ''
            scene.tweens.killTweensOf(reachFill)
            scene.tweens.add({ targets: reachFill, alpha: 0, duration: 160 })
            reachEdge.setVisible(false)
        },
        showPath(from, next, danger) {
            start = ground(from)
            path = [...next]
            isDanger = danger
            scene.tweens.killTweensOf(grow)
            grow.p = 0
            scene.tweens.add({ targets: grow, p: 1, duration: ROUTE.growMs, ease: 'Sine.easeOut', onUpdate: paintPath })
            paintPath()
            const target = cellCenter(next[next.length - 1])
            marker.setPosition(target.x, target.y).setVisible(true)
            void FX.popIn(scene, marker, { from: 0.4, duration: 260 })
        },
        follow(x, y) {
            if (!path.length) return
            start = { x, y: y + ROUTE.lineDY }
            paintPath()
        },
        consume(reached) {
            if (!path.length) return
            if (spotKey(path[0]) === spotKey(reached)) {
                start = ground(path.shift() as Spot)
                paintPath()
            }
            if (!path.length) marker.setVisible(false)
        },
        clear() {
            start = null
            path = []
            scene.tweens.killTweensOf(grow)
            pathG.clear()
            marker.setVisible(false)
        },
        deny(s) {
            const { x, y } = cellCenter(s)
            const g = scene.add.graphics({ x, y }).setDepth(DEPTH.trail)
            const r = ROUTE.cross
            g.lineStyle(10, C.ink, 0.6)
            g.lineBetween(-r, -r, r, r)
            g.lineBetween(-r, r, r, -r)
            g.lineStyle(6, C.white, 1)
            g.lineBetween(-r, -r, r, r)
            g.lineBetween(-r, r, r, -r)
            void FX.shake(scene, g, { amount: 5, times: 2 })
            void FX.wait(scene, 350).then(() => FX.fadeOut(scene, g, { duration: 250 }))
            edgePulse.pause()
            scene.tweens.add({
                targets: reachEdge,
                alpha: { from: 1, to: 0.2 },
                duration: 120,
                yoyo: true,
                repeat: 2,
                onComplete: () => {
                    reachEdge.setAlpha(1)
                    edgePulse.resume()
                },
            })
        },
        destroy() {
            edgePulse.remove()
            scene.tweens.killTweensOf([reachFill, reachEdge, pin, ring, marker, grow])
            reachFill.destroy()
            reachEdge.destroy()
            pathG.destroy()
            marker.destroy()
        },
    }
}
