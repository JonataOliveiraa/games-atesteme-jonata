import type { Format, PhaseDef, PieceDef, Rect, Vec } from '../types'
import { PIECE, ROBOT_ART, SLING_ART, SLING_CELL } from './files'
import { FLIGHT, FLOOR, ROBOT, SLING, W } from './layout'

export type Hit =
    | { kind: 'robot'; format: Format; at: Vec }
    | { kind: 'piece'; index: number; at: Vec }
    | { kind: 'floor'; at: Vec }
    | { kind: 'out'; at: Vec }

export interface World {
    robots: { format: Format; rect: Rect }[]
    pieces: Rect[]
}

export interface Flight {
    points: Vec[]
    hit: Hit
}

export const anchor = (): Vec => ({
    x: SLING.x + (SLING_ART.rest.x - SLING_CELL / 2) * SLING.scale,
    y: FLOOR - (SLING_ART.foot - SLING_ART.rest.y) * SLING.scale,
})

export const robotRect = (feet: Vec): Rect => {
    const s = ROBOT.scale
    const w = (ROBOT_ART.right - ROBOT_ART.left) * s
    const h = (ROBOT_ART.foot - ROBOT_ART.top) * s
    return { x: feet.x, y: feet.y - h / 2, w, h }
}

export const pieceRect = (p: PieceDef): Rect => {
    const { w, h } = PIECE[p.type]
    return { x: p.x, y: p.y - h / 2, w, h }
}

export const top = (p: PieceDef) => p.y - PIECE[p.type].h

export const overlapX = (a: Rect, b: Rect) =>
    Math.min(a.x + a.w / 2, b.x + b.w / 2) - Math.max(a.x - a.w / 2, b.x - b.w / 2)

export const rests = (upper: PieceDef, lower: PieceDef) =>
    Math.abs(upper.y - top(lower)) <= 2 && overlapX(pieceRect(upper), pieceRect(lower)) > 4

export function buildWorld(phase: Pick<PhaseDef, 'pieces' | 'robots'>): World {
    const pad = ROBOT.catchPad
    return {
        robots: (Object.entries(phase.robots) as [Format, Vec][]).map(([format, feet]) => {
            const r = robotRect(feet)
            return { format, rect: { x: r.x, y: r.y, w: r.w + pad * 2, h: r.h + pad * 2 } }
        }),
        pieces: phase.pieces.map(pieceRect),
    }
}

const inside = (p: Vec, r: Rect, grow: number) =>
    Math.abs(p.x - r.x) <= r.w / 2 + grow && Math.abs(p.y - r.y) <= r.h / 2 + grow

export const clampPull = (d: Vec): Vec => {
    const len = Math.hypot(d.x, d.y)
    if (len <= FLIGHT.maxPull) return d
    return { x: (d.x / len) * FLIGHT.maxPull, y: (d.y / len) * FLIGHT.maxPull }
}

export function fly(pull: Vec, world: World): Flight {
    const a = anchor()
    const pos = { x: a.x + pull.x, y: a.y + pull.y }
    const vel = { x: -pull.x * FLIGHT.power, y: -pull.y * FLIGHT.power }
    const points: Vec[] = [{ ...pos }]
    const r = FLIGHT.radius
    for (let t = 0; t < FLIGHT.maxTime; t += FLIGHT.dt) {
        vel.y += FLIGHT.gravity * FLIGHT.dt
        pos.x += vel.x * FLIGHT.dt
        pos.y += vel.y * FLIGHT.dt
        const at = { ...pos }
        points.push(at)
        const robot = world.robots.find(o => inside(at, o.rect, r))
        if (robot) return { points, hit: { kind: 'robot', format: robot.format, at } }
        const piece = world.pieces.findIndex(o => inside(at, o, r))
        if (piece >= 0) return { points, hit: { kind: 'piece', index: piece, at } }
        if (vel.y > 0 && at.y >= FLOOR - r) return { points, hit: { kind: 'floor', at: { x: at.x, y: FLOOR - r } } }
        if (at.x > W + 60 || at.x < -60) return { points, hit: { kind: 'out', at } }
    }
    return { points, hit: { kind: 'out', at: { ...pos } } }
}

export function samplePulls(world: World): { pull: Vec; hit: Hit }[] {
    const out: { pull: Vec; hit: Hit }[] = []
    for (let len = FLIGHT.minPull; len <= FLIGHT.maxPull; len += 4) {
        for (let deg = -20; deg <= 85; deg += 1.5) {
            const rad = (deg * Math.PI) / 180
            const pull = { x: -Math.cos(rad) * len, y: Math.sin(rad) * len }
            out.push({ pull, hit: fly(pull, world).hit })
        }
    }
    return out
}

export function demoPull(world: World, format: Format): Vec | undefined {
    const hits = samplePulls(world).filter(s => s.hit.kind === 'robot' && s.hit.format === format)
    if (!hits.length) return undefined
    const steep = hits.filter(s => Math.atan2(s.pull.y, -s.pull.x) > 0.5)
    const pool = steep.length ? steep : hits
    return pool[Math.floor(pool.length / 2)].pull
}
