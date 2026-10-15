import Phaser from 'phaser'
import { FX } from '../../../../shared/effects/FX'
import { PART, TRACK_SHEET, cellKey } from '../data/files'
import { DEPTH, H, RAIL } from '../data/layout'
import { START_X, doorDx, follow, type MapDef, type Point } from '../data/maps'
import { C } from '../data/theme'

export type Pose = { x: number; y: number; angle: number }

export interface Route {
    length: number
    at(s: number): Pose
    /** a distância em que a frente do trem para no sinal */
    stop: number
    /** a distância em que a frente do trem para na porta do galpão */
    door: number
    /** o galpão aonde a rota leva */
    shed: number
}

export interface Rails {
    /** a rota que as alavancas formam */
    route(states: number[]): Route
    /** acende o caminho das alavancas (do sinal até o galpão) */
    light(states: number[], animate?: boolean): void
    dim(): void
    destroy(): void
}

const STEP = 6
const GLOW_PAD = 40

function polyline(points: Point[]) {
    const acc = [0]
    for (let i = 1; i < points.length; i++) acc.push(acc[i - 1] + Phaser.Math.Distance.BetweenPoints(points[i - 1], points[i]))
    const length = acc[acc.length - 1]
    const at = (s: number): Pose => {
        const d = Phaser.Math.Clamp(s, 0, length)
        let i = 1
        while (i < points.length - 1 && acc[i] < d) i++
        const a = points[i - 1]
        const b = points[i]
        const span = acc[i] - acc[i - 1]
        const k = span ? (d - acc[i - 1]) / span : 0
        return { x: Phaser.Math.Linear(a.x, b.x, k), y: Phaser.Math.Linear(a.y, b.y, k), angle: Math.atan2(b.y - a.y, b.x - a.x) }
    }
    return { length, at }
}

type Line = ReturnType<typeof polyline>

/** a parte de um caminho entre duas distâncias, em pontos densos (para desenhar) */
function slice(line: Line, from: number, to: number): Point[] {
    const pts: Point[] = []
    for (let s = from; s < to; s += STEP) pts.push(line.at(s))
    pts.push(line.at(to))
    return pts
}

function offset(points: Point[], d: number): Point[] {
    return points.map((p, i) => {
        const a = points[Math.max(0, i - 1)]
        const b = points[Math.min(points.length - 1, i + 1)]
        const ang = Math.atan2(b.y - a.y, b.x - a.x)
        return { x: p.x - Math.sin(ang) * d, y: p.y + Math.cos(ang) * d }
    })
}

function stroke(g: Phaser.GameObjects.Graphics, points: Point[]) {
    g.beginPath()
    g.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach(p => g.lineTo(p.x, p.y))
    g.strokePath()
}

/** quanto do trilho que entra no galpão fica aceso: até um pouco depois da porta */
function shedEnd(map: MapDef, points: Point[], line: Line, shed: number) {
    const last = points[points.length - 1]
    return line.length - (last.x - (map.sheds[shed].x + doorDx(map)))
}

/** Trilhos assados numa textura só (dormentes da folha + dois trilhos); cada trilho aceso é outra textura, do tamanho dele. */
export function createRails(scene: Phaser.Scene, map: MapDef): Rails {
    const lines = map.tracks.map(t => polyline(t.points))
    const stop = map.stopX - START_X

    const rt = scene.add.renderTexture(0, 0, map.width, H).setOrigin(0).setDepth(DEPTH.rails)
    const sleeper = scene.textures.getFrame(TRACK_SHEET.key, cellKey(PART.sleeper))
    const sx = RAIL.sleeperW / sleeper.width
    const sy = RAIL.sleeperLen / sleeper.height
    // o desenho do trilho que entra num galpão acaba debaixo do telhado (a rota do trem continua até passar dele)
    const pieces: Point[][] = lines.map((line, i) => {
        const next = map.tracks[i].next
        const points = map.tracks[i].points
        const end = 'shed' in next ? line.length - (points[points.length - 1].x - map.sheds[next.shed].x) : line.length
        return slice(line, i === 0 ? -60 - START_X : 0, end)
    })

    // o leito de brita: uma faixa mais escura que o chão, para o trilho se ler como caminho
    const bed = scene.make.graphics({ x: 0, y: 0 }, false)
    ;[
        { r: RAIL.bed / 2 + RAIL.edge, color: C.ballastEdge },
        { r: RAIL.bed / 2, color: C.ballast },
    ].forEach(pass => {
        bed.fillStyle(pass.color, 1)
        pieces.forEach(points => points.forEach(p => bed.fillCircle(p.x, p.y, pass.r)))
    })
    rt.draw(bed)
    bed.destroy()

    pieces.forEach(points => {
        let walked = 0
        let next = 0
        for (let i = 1; i < points.length; i++) {
            const a = points[i - 1]
            const b = points[i]
            const len = Phaser.Math.Distance.BetweenPoints(a, b)
            const rotation = Math.atan2(b.y - a.y, b.x - a.x)
            while (next <= walked + len) {
                const k = len ? (next - walked) / len : 0
                rt.stamp(TRACK_SHEET.key, cellKey(PART.sleeper), Phaser.Math.Linear(a.x, b.x, k), Phaser.Math.Linear(a.y, b.y, k), {
                    rotation,
                    scaleX: sx,
                    scaleY: sy,
                })
                next += RAIL.sleeperGap
            }
            walked += len
        }
    })

    const g = scene.make.graphics({ x: 0, y: 0 }, false)
    ;[
        { width: RAIL.width + 4, color: C.steel },
        { width: RAIL.width - 2, color: C.steelLight },
    ].forEach(pass => {
        g.lineStyle(pass.width, pass.color, 1)
        pieces.forEach(points => [-RAIL.gauge / 2, RAIL.gauge / 2].forEach(d => stroke(g, offset(points, d))))
    })
    rt.draw(g)
    g.destroy()

    const glows = map.tracks.map((track, i) => {
        const line = lines[i]
        const from = i === 0 ? stop - 20 : 0
        const to = 'shed' in track.next ? shedEnd(map, track.points, line, track.next.shed) + 60 : line.length
        const pts = slice(line, from, to)
        const left = Math.min(...pts.map(p => p.x)) - GLOW_PAD
        const top = Math.min(...pts.map(p => p.y)) - GLOW_PAD
        const right = Math.max(...pts.map(p => p.x)) + GLOW_PAD
        const bottom = Math.max(...pts.map(p => p.y)) + GLOW_PAD
        const glow = scene.add
            .renderTexture(left, top, Math.ceil(right - left), Math.ceil(bottom - top))
            .setOrigin(0)
            .setDepth(DEPTH.route)
            .setAlpha(0)
        const lg = scene.make.graphics({ x: 0, y: 0 }, false)
        lg.lineStyle(RAIL.gauge + 30, C.routeGlow, 0.55)
        stroke(lg, pts)
        glow.draw(lg, -left, -top)
        lg.destroy()
        return glow
    })

    const routes = new Map<string, Route>()
    const build = (states: number[]): Route => {
        const path = follow(map, states)
        const points: Point[] = []
        path.tracks.forEach((t, k) => points.push(...(k === 0 ? map.tracks[t].points : map.tracks[t].points.slice(1))))
        const line = polyline(points)
        return { length: line.length, at: line.at, stop, door: shedEnd(map, points, line, path.shed), shed: path.shed }
    }

    let lit: number[] = []

    return {
        route(states) {
            const key = states.join()
            let r = routes.get(key)
            if (!r) {
                r = build(states)
                routes.set(key, r)
            }
            return r
        },
        light(states, animate = true) {
            lit = follow(map, states).tracks
            glows.forEach((glow, i) => {
                scene.tweens.killTweensOf(glow)
                const alpha = lit.includes(i) ? 1 : 0
                if (animate) void FX.to(scene, glow, { alpha }, { duration: 220 })
                else glow.setAlpha(alpha)
            })
        },
        dim() {
            if (!lit.length) return
            glows.forEach(glow => {
                scene.tweens.killTweensOf(glow)
                void FX.to(scene, glow, { alpha: 0 }, { duration: 260 })
            })
            lit = []
        },
        destroy() {
            glows.forEach(glow => glow.destroy())
            rt.destroy()
        },
    }
}
