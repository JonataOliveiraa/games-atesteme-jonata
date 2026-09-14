import Phaser from 'phaser'
import { DEPTH, STATION, TABLE } from '../data/layout'
import { C } from '../data/theme'
import type { Side } from '../types'

type Point = { x: number; y: number }

function paintCable(g: Phaser.GameObjects.Graphics, curve: Phaser.Curves.CubicBezier, color: number, lit: boolean) {
    const points = curve.getPoints(40)
    g.clear()
    g.lineStyle(17, C.ink, 1)
    g.strokePoints(points, false)
    g.lineStyle(10, color, 1)
    g.strokePoints(points, false)
    g.lineStyle(3, C.white, lit ? 0.8 : 0.3)
    g.strokePoints(
        points.map(p => new Phaser.Math.Vector2(p.x, p.y - 2)),
        false,
    )
}

const FLOW = { count: 3, from: 0.16, to: 0.9, idle: 0.28, busy: 1.1 }

function paintFlow(g: Phaser.GameObjects.Graphics, curve: Phaser.Curves.CubicBezier, phase: number, lit: boolean) {
    g.clear()
    for (let i = 0; i < FLOW.count; i++) {
        const k = (i / FLOW.count + phase) % 1
        const t = FLOW.from + k * (FLOW.to - FLOW.from)
        const at = curve.getPoint(t)
        const tangent = curve.getTangent(t)
        const angle = Math.atan2(tangent.y, tangent.x)
        const fade = Math.sin(k * Math.PI)
        const alpha = (lit ? 0.95 : 0.62) * fade
        const p = (dx: number, dy: number) =>
            new Phaser.Math.Vector2(
                at.x + dx * Math.cos(angle) - dy * Math.sin(angle),
                at.y + dx * Math.sin(angle) + dy * Math.cos(angle),
            )
        g.lineStyle(lit ? 7 : 6, C.white, alpha)
        g.strokePoints([p(-8, -11), p(6, 0), p(-8, 11)], false)
    }
}

export function createCables(scene: Phaser.Scene, ports: { inPort: Point; outPort: Point }) {
    const jackIn = { x: STATION.input.x + 34, y: TABLE.top - 30 }
    const jackOut = { x: STATION.output.x - 34, y: TABLE.top - 30 }

    const curveIn = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(jackIn.x, jackIn.y),
        new Phaser.Math.Vector2(jackIn.x + 110, jackIn.y + 16),
        new Phaser.Math.Vector2(ports.inPort.x - 90, ports.inPort.y + 10),
        new Phaser.Math.Vector2(ports.inPort.x + 4, ports.inPort.y),
    )
    const curveOut = new Phaser.Curves.CubicBezier(
        new Phaser.Math.Vector2(ports.outPort.x - 4, ports.outPort.y),
        new Phaser.Math.Vector2(ports.outPort.x + 90, ports.outPort.y + 10),
        new Phaser.Math.Vector2(jackOut.x - 110, jackOut.y + 16),
        new Phaser.Math.Vector2(jackOut.x, jackOut.y),
    )

    const gIn = scene.add.graphics().setDepth(DEPTH.cable)
    const gOut = scene.add.graphics().setDepth(DEPTH.cable)

    const plugs = scene.add.graphics().setDepth(DEPTH.cable + 1)
    for (const [jack, dir, color] of [
        [jackIn, -1, C.input],
        [jackOut, 1, C.output],
    ] as const) {
        plugs.fillStyle(C.ink, 1)
        plugs.fillRect(jack.x + dir * 22 - 4, jack.y - 9, 10, 5)
        plugs.fillRect(jack.x + dir * 22 - 4, jack.y + 4, 10, 5)
        plugs.fillRoundedRect(jack.x - 16, jack.y - 15, 32, 30, 8)
        plugs.fillStyle(color, 1)
        plugs.fillRoundedRect(jack.x - 13, jack.y - 12, 26, 24, 6)
        plugs.fillStyle(C.white, 0.45)
        plugs.fillRoundedRect(jack.x - 9, jack.y - 9, 18, 5, 2)
    }

    const flowIn = scene.add.graphics().setDepth(DEPTH.cable + 2)
    const flowOut = scene.add.graphics().setDepth(DEPTH.cable + 2)
    const lit: Record<Side, boolean> = { input: false, output: false }
    const faulted: Record<Side, boolean> = { input: false, output: false }
    const phase: Record<Side, number> = { input: 0, output: 0 }

    const tick = (_time: number, delta: number) => {
        const dt = Math.min(delta, 50) / 1000
        ;(['input', 'output'] as Side[]).forEach(side => {
            if (faulted[side]) return
            phase[side] = (phase[side] + dt * (lit[side] ? FLOW.busy : FLOW.idle)) % 1
        })
        if (faulted.input) flowIn.clear()
        else paintFlow(flowIn, curveIn, phase.input, lit.input)
        if (faulted.output) flowOut.clear()
        else paintFlow(flowOut, curveOut, phase.output, lit.output)
    }
    scene.events.on('update', tick)

    const paint = (side: Side, on: boolean) =>
        side === 'input'
            ? paintCable(gIn, curveIn, faulted.input ? C.warn : C.input, on && !faulted.input)
            : paintCable(gOut, curveOut, faulted.output ? C.warn : C.output, on && !faulted.output)

    paint('input', false)
    paint('output', false)

    return {
        curve(side: Side) {
            return side === 'input' ? curveIn : curveOut
        },

        light(side: Side, on: boolean) {
            lit[side] = on
            paint(side, on)
        },

        fault(side: Side, on: boolean) {
            faulted[side] = on
            if (on) lit[side] = false
            paint(side, lit[side])
        },

        destroy() {
            scene.events.off('update', tick)
            flowIn.destroy()
            flowOut.destroy()
            gIn.destroy()
            gOut.destroy()
            plugs.destroy()
        },
    }
}

export type Cables = ReturnType<typeof createCables>
