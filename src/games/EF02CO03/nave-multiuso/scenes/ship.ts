import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { SHIP, SHIP_CELL, SHIP_FRAME } from '../data/files'
import { DEPTH, NOSE, REACH, SHIP_VIEW, TAIL } from '../data/layout'
import { C, TOOL_COLOR } from '../data/theme'
import type { Tool, Vec } from '../types'

type G = Phaser.GameObjects.Graphics
type Target = { x: number; y: number } | null
type Beam = { tool: Tool; target: () => Vec; start: number; g: G }

const SWAP_MS = 280
const LOCK = { size: 78, corner: 28 } as const

export interface Ship {
    readonly tool: Tool
    readonly x: number
    readonly y: number
    readonly noseY: number
    drive(dir: Vec, dt: number): void
    place(x: number, y: number): void
    glide(x: number, y: number, ms: number): Promise<void>
    setTool(tool: Tool): void
    blast(tool: Tool, target: () => Vec, ms: number): Promise<void>
    shake(): Promise<void>
    heat(): Promise<void>
    swap(): void
    setBoost(level: number): void
    update(time: number, target?: Target): void
    destroy(): void
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function cone(g: G, x: number, bottom: number, top: number, near: number, far: number) {
    g.fillPoints(
        [
            { x: x - near, y: bottom },
            { x: x + near, y: bottom },
            { x: x + far, y: top },
            { x: x - far, y: top },
        ],
        true,
    )
}

function diamond(g: G, x: number, y: number, r: number) {
    g.fillTriangle(x - r, y, x, y - r * 1.6, x + r, y)
    g.fillTriangle(x - r, y, x, y + r * 1.6, x + r, y)
}

export function createShip(scene: Phaser.Scene): Ship {
    let tool: Tool = 'blower'
    const pos = { x: SHIP_VIEW.x as number, y: SHIP_VIEW.y as number }
    let lean = 0
    const beams: Beam[] = []
    let swapAt = -SWAP_MS
    let clock = 0
    const jolt = { x: 0 }
    let boost = 0

    const reach = scene.add.graphics().setDepth(DEPTH.reach)
    const flame = scene.add.graphics().setDepth(DEPTH.ship - 1)
    const fx = scene.add.graphics().setDepth(DEPTH.fx)
    const sprite = scene.add.sprite(pos.x, pos.y, SHIP, SHIP_FRAME[tool]).setScale(SHIP_VIEW.scale).setDepth(DEPTH.ship)

    const nose = () => pos.y - NOSE

    const drawRange = (time: number, locked: boolean) => {
        const x = pos.x
        const bottom = nose()
        const top = bottom - REACH.len
        const len = REACH.len
        const color = TOOL_COLOR[tool]
        const flash = Math.max(0, 1 - (time - swapAt) / SWAP_MS)
        const base = (locked ? 0.24 : 0.14) + flash * 0.3
        reach.clear()
        if (beams.length || boost > 0) return

        reach.fillStyle(color, base * 0.6)
        cone(reach, x, bottom, top, REACH.near, REACH.far)
        reach.fillStyle(color, base * 0.8)
        cone(reach, x, bottom, top, REACH.near * 0.7, REACH.far * 0.7)
        reach.fillStyle(flash > 0 ? C.white : color, base)
        cone(reach, x, bottom, top, REACH.near * 0.4, REACH.far * 0.4)

        const dash = 26
        const shift = (time * 0.07) % dash
        reach.lineStyle(4, color, 0.9)
        ;[-1, 1].forEach(side => {
            for (let s = -shift; s < len; s += dash) {
                const a = Math.max(0, s) / len
                const b = Math.min(len, s + dash * 0.55) / len
                if (b <= a) continue
                reach.lineBetween(x + side * lerp(REACH.near, REACH.far, a), bottom - a * len, x + side * lerp(REACH.near, REACH.far, b), bottom - b * len)
            }
        })
        reach.lineStyle(6, color, 1)
        reach.lineBetween(x - REACH.far, top, x + REACH.far, top)
        reach.lineBetween(x - REACH.far, top, x - REACH.far + 6, top + 16)
        reach.lineBetween(x + REACH.far, top, x + REACH.far - 6, top + 16)

        if (tool === 'blower') {
            for (let k = 0; k < 5; k++) {
                const t0 = ((time * 0.0011 + k / 5) % 1)
                const pts: Phaser.Types.Math.Vector2Like[] = []
                for (let i = 0; i <= 5; i++) {
                    const t = Math.min(1, t0 * 0.8 + i * 0.05)
                    pts.push({ x: x + Math.sin(t * 9 + k * 1.7 + time * 0.006) * lerp(10, REACH.far * 0.6, t), y: bottom - t * len })
                }
                reach.lineStyle(8, C.cyanDark, 0.55 - t0 * 0.35)
                reach.strokePoints(pts, false)
                reach.lineStyle(4, C.white, 0.95 - t0 * 0.6)
                reach.strokePoints(pts, false)
            }
        } else if (tool === 'water') {
            reach.fillStyle(C.royal, 0.85)
            for (let k = 0; k < 10; k++) {
                const t = ((time * 0.0013 + k / 10) % 1)
                const side = k % 2 === 0 ? -1 : 1
                reach.fillCircle(x + side * lerp(8, REACH.far * 0.45, t), bottom - t * len, 6 - t * 2)
            }
            reach.lineStyle(2, C.white, 0.7)
            for (let k = 0; k < 4; k++) {
                const t = ((time * 0.0007 + k / 4) % 1)
                reach.strokeCircle(x + Math.sin(k * 2.4) * 20, bottom - t * len, 4 + t * 3)
            }
        } else {
            for (let k = 0; k < 4; k++) {
                const t = 1 - ((time * 0.0009 + k / 4) % 1)
                const w = lerp(REACH.near, REACH.far, t) * 1.6
                reach.lineStyle(5, C.pink, 0.35 + (1 - t) * 0.55)
                reach.strokeEllipse(x, bottom - t * len, w, w * 0.32)
            }
            reach.fillStyle(C.white, 0.9)
            for (let k = 0; k < 4; k++) {
                const t = 1 - ((time * 0.0012 + k / 4) % 1)
                const a = time * 0.006 + k * 1.6
                diamond(reach, x + Math.cos(a) * lerp(6, REACH.far * 0.5, t), bottom - t * len, 3)
            }
        }
    }

    const drawLock = (time: number, target: Target) => {
        if (!target || beams.length) return
        const color = TOOL_COLOR[tool]
        const s = LOCK.size + Math.sin(time * 0.012) * 5
        const c = LOCK.corner
        const corners = (w: number) => {
            fx.lineStyle(w, w > 7 ? C.ink : color, 1)
            ;[
                [-1, -1],
                [1, -1],
                [1, 1],
                [-1, 1],
            ].forEach(([sx, sy]) => {
                const cx = target.x + sx * s
                const cy = target.y + sy * s
                fx.lineBetween(cx, cy, cx - sx * c, cy)
                fx.lineBetween(cx, cy, cx, cy - sy * c)
            })
        }
        corners(11)
        corners(6)
    }

    const drawBeam = (beam: Beam, time: number) => {
        const g = beam.g
        g.clear()
        const ny = nose()
        const to = beam.target()
        const dx = to.x - pos.x
        const dy = to.y - ny
        const len = Math.max(20, Math.hypot(dx, dy))
        g.setPosition(pos.x, ny).setRotation(Math.atan2(dx, -dy))
        const x = 0
        const bottom = 0
        const age = Math.max(0, time - beam.start)
        const grow = Math.min(1, age / 140)
        const color = TOOL_COLOR[beam.tool]

        g.fillStyle(color, 0.55)
        g.fillCircle(x, bottom, 16 + Math.sin(age * 0.05) * 4)

        if (beam.tool === 'blower') {
            g.fillStyle(C.cyan, 0.3)
            cone(g, x, bottom, bottom - len * grow, REACH.near, REACH.far * 1.4)
            g.fillStyle(C.white, 0.25)
            cone(g, x, bottom, bottom - len * grow, REACH.near * 0.6, REACH.far * 0.8)
            for (let k = 0; k < 10; k++) {
                const dir = k % 2 === 0 ? 1 : -1
                const pts: Phaser.Types.Math.Vector2Like[] = []
                for (let i = 0; i <= 8; i++) {
                    const t = (i / 8) * grow
                    pts.push({ x: x + dir * Math.sin(t * 7 + age * 0.02 + k) * (8 + t * 60), y: bottom - t * len })
                }
                g.lineStyle(10, C.cyanDark, 0.6)
                g.strokePoints(pts, false)
                g.lineStyle(5, C.white, 1 - (k % 3) * 0.15)
                g.strokePoints(pts, false)
            }
            ;[46, 70].forEach((r, k) => {
                const a = age * (k === 0 ? 0.012 : -0.009)
                ;[
                    [11, C.cyanDark, 0.7],
                    [6, C.white, 1],
                ].forEach(([w, c, al]) => {
                    g.lineStyle(w, c, al)
                    g.beginPath()
                    g.arc(x, -len, r, a, a + 2.2, false)
                    g.strokePath()
                })
            })
        } else if (beam.tool === 'water') {
            const end = bottom - len * grow
            const pts: Phaser.Types.Math.Vector2Like[] = []
            for (let i = 0; i <= 12; i++) {
                const t = i / 12
                pts.push({ x: x + Math.sin(t * 10 - age * 0.03) * 5 * t, y: lerp(bottom, end, t) })
            }
            g.lineStyle(32, C.ink, 1)
            g.strokePoints(pts, false)
            g.lineStyle(24, C.royal, 1)
            g.strokePoints(pts, false)
            g.lineStyle(7, C.white, 0.85)
            g.strokePoints(
                pts.map(p => ({ x: (p.x ?? 0) - 5, y: p.y })),
                false,
            )
            if (grow >= 1) {
                const ring = (age % 320) / 320
                g.lineStyle(5, C.white, 1 - ring)
                g.strokeEllipse(x, end, 40 + ring * 90, (40 + ring * 90) * 0.5)
                g.fillStyle(C.royal, 1)
                for (let k = 0; k < 12; k++) {
                    const a = (k / 12) * Math.PI * 2 + k
                    const r = ((age * 0.25 + k * 23) % 70) + 14
                    g.fillCircle(x + Math.cos(a) * r, end + Math.sin(a) * r * 0.6, 6 - r / 20)
                }
            }
        } else {
            const top = bottom - len * grow
            g.fillStyle(C.pink, 0.26)
            cone(g, x, bottom, top, 26, 92)
            g.lineStyle(5, C.pink, 0.95)
            g.lineBetween(x - 26, bottom, x - 92, top)
            g.lineBetween(x + 26, bottom, x + 92, top)
            for (let k = 0; k < 5; k++) {
                const t = 1 - ((age * 0.0022 + k / 5) % 1)
                const w = lerp(52, 184, t) * grow
                g.lineStyle(6, C.pink, 0.3 + (1 - t) * 0.65)
                g.strokeEllipse(x, bottom - t * len * grow, w, w * 0.3)
            }
            g.fillStyle(C.white, 1)
            for (let k = 0; k < 8; k++) {
                const t = 1 - ((age * 0.0016 + k / 8) % 1)
                const a = age * 0.01 + k * 0.8
                diamond(g, x + Math.cos(a) * lerp(10, 80, t), bottom - t * len * grow, 4)
            }
        }
    }

    const drawFlame = (time: number, y: number) => {
        const x = pos.x
        const base = y + TAIL - 6
        const len = (30 + Math.sin(time * 0.03) * 7) * (1 + boost * 2.4) + (boost > 0 ? Math.random() * 14 * boost : 0)
        const wide = 1 + boost * 0.8
        const engine = SHIP_CELL.engineDX * SHIP_VIEW.scale
        flame.clear()
        ;[-engine, engine].forEach(dx => {
            if (boost > 0) {
                flame.fillStyle(C.cyan, 0.35 * boost)
                flame.fillTriangle(x + dx - 20 * wide, base, x + dx + 20 * wide, base, x + dx, base + len * 1.25)
            }
            flame.fillStyle(C.flame, 1)
            flame.fillTriangle(x + dx - 12 * wide, base, x + dx + 12 * wide, base, x + dx, base + len)
            flame.fillStyle(C.yellow, 1)
            flame.fillTriangle(x + dx - 6 * wide, base, x + dx + 6 * wide, base, x + dx, base + len * 0.6)
            if (boost > 0.3) {
                flame.fillStyle(C.white, boost)
                flame.fillTriangle(x + dx - 3 * wide, base, x + dx + 3 * wide, base, x + dx, base + len * 0.35)
            }
        })
    }

    return {
        get tool() {
            return tool
        },
        get x() {
            return pos.x
        },
        get y() {
            return pos.y
        },
        get noseY() {
            return nose()
        },
        drive(dir, dt) {
            pos.x = Phaser.Math.Clamp(pos.x + dir.x * SHIP_VIEW.speed * dt, SHIP_VIEW.minX, SHIP_VIEW.maxX)
            pos.y = Phaser.Math.Clamp(pos.y + dir.y * SHIP_VIEW.speed * dt, SHIP_VIEW.minY, SHIP_VIEW.maxY)
            lean = Phaser.Math.Linear(lean, dir.x * 12, 0.2)
        },
        place(x, y) {
            scene.tweens.killTweensOf(pos)
            pos.x = x
            pos.y = y
        },
        glide(x, y, ms) {
            scene.tweens.killTweensOf(pos)
            return new Promise(resolve => scene.tweens.add({ targets: pos, x, y, duration: ms, ease: 'Sine.easeInOut', onComplete: () => resolve() }))
        },
        setTool(next) {
            tool = next
            sprite.setFrame(SHIP_FRAME[next])
        },
        async blast(kind, target, ms) {
            const beam: Beam = { tool: kind, target, start: clock, g: scene.add.graphics().setDepth(DEPTH.fx) }
            beams.push(beam)
            await FX.wait(scene, ms)
            beams.splice(beams.indexOf(beam), 1)
            beam.g.destroy()
        },
        async shake() {
            await new Promise<void>(resolve => scene.tweens.add({ targets: jolt, x: 10, duration: 55, yoyo: true, repeat: 4, onComplete: () => resolve() }))
            jolt.x = 0
        },
        async heat() {
            for (let k = 0; k < 3; k++) {
                sprite.setTint(0xff6a5a)
                await FX.wait(scene, 120)
                sprite.clearTint()
                await FX.wait(scene, 90)
            }
        },
        swap() {
            swapAt = clock
            scene.tweens.killTweensOf(sprite)
            sprite.setScale(SHIP_VIEW.scale)
            void FX.to(scene, sprite, { scale: SHIP_VIEW.scale * 1.1 }, { duration: 90, yoyo: true })
            void FX.ping(scene, pos.x, nose(), TOOL_COLOR[tool], { radius: 56, duration: 320, depth: DEPTH.fx })
        },
        setBoost(level) {
            boost = Phaser.Math.Clamp(level, 0, 1)
        },
        update(time, target = null) {
            clock = time
            const y = pos.y + Math.sin(time * 0.004) * SHIP_VIEW.bob
            lean = Phaser.Math.Linear(lean, 0, 0.05)
            const shiver = boost > 0 ? (Math.random() - 0.5) * 5 * boost : 0
            sprite.setPosition(pos.x + jolt.x + shiver, y).setAngle(lean)
            fx.clear()
            drawRange(time, !!target)
            drawLock(time, target)
            beams.forEach(beam => drawBeam(beam, time))
            drawFlame(time, y)
        },
        destroy() {
            scene.tweens.killTweensOf(pos)
            reach.destroy()
            flame.destroy()
            fx.destroy()
            beams.forEach(beam => beam.g.destroy())
            beams.length = 0
            sprite.destroy()
        },
    }
}
