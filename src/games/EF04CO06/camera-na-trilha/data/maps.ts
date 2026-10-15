import type { Circle, MapDef, MapId, Prop, PropKind, Rect, Spot, Vec } from '../types'
import { FRAME, HERO } from './layout'
import { SUBJECTS, moves } from './subjects'

export const GRID = 20
const EDGE = 34

export const PROP_SIZE: Record<PropKind, number> = {
    bigTree: 290,
    smallTree: 206,
    bush: 150,
    rock: 150,
    log: 176,
    reeds: 124,
    flowers: 88,
    lily: 96,
    caveRock: 150,
    gravel: 96,
}

const PROP_SOLID: Record<PropKind, number> = {
    bigTree: 40,
    smallTree: 30,
    bush: 40,
    rock: 50,
    log: 0,
    reeds: 0,
    flowers: 0,
    lily: 0,
    caveRock: 52,
    gravel: 0,
}

const p = (kind: PropKind, x: number, y: number, flip = false, size?: number): Prop => ({ kind, x, y, flip, size })
const wall = (x: number, y: number, r: number): Circle => ({ x, y, r })

const PRADO: MapDef = {
    id: 'prado',
    theme: 'meadow',
    w: 3200,
    h: 1440,
    start: { x: 330, y: 1190 },
    startFace: { x: 1, y: 0 },
    lake: { x: 1700, y: 830, rx: 380, ry: 190 },
    pool: { x: 2753, y: 430, r: 70 },
    cliff: { x: 2732, y: 336, r: 166 },
    river: [
        { x: 2690, y: 505 },
        { x: 2640, y: 630 },
        { x: 2590, y: 745 },
        { x: 2470, y: 840 },
        { x: 2240, y: 862 },
        { x: 2040, y: 846 },
    ],
    riverW: 92,
    pier: { x: 1880, top: 872, bottom: 1064, w: 104, skew: 32 },
    trail: [
        [
            { x: 330, y: 1190 },
            { x: 520, y: 1130 },
            { x: 690, y: 1020 },
            { x: 810, y: 870 },
            { x: 900, y: 800 },
            { x: 1040, y: 900 },
            { x: 1160, y: 1010 },
            { x: 1310, y: 1120 },
            { x: 1600, y: 1150 },
            { x: 1880, y: 1100 },
            { x: 2200, y: 1110 },
            { x: 2510, y: 1070 },
            { x: 2800, y: 1010 },
            { x: 2900, y: 880 },
            { x: 2860, y: 720 },
            { x: 2770, y: 620 },
        ],
        [
            { x: 810, y: 870 },
            { x: 640, y: 660 },
            { x: 470, y: 560 },
            { x: 330, y: 400 },
        ],
        [
            { x: 330, y: 1190 },
            { x: 300, y: 1080 },
        ],
    ],
    field: { x: 900, y: 590, rx: 250, ry: 160 },
    shade: [{ x: 700, y: 1240, rx: 200, ry: 74 }],
    props: [
        p('bigTree', 140, 250),
        p('bigTree', 410, 190),
        p('bigTree', 690, 270, true),
        p('bigTree', 250, 520),
        p('bigTree', 560, 470, true),
        p('bigTree', 800, 1190),
        p('bigTree', 1170, 230, true),
        p('bigTree', 2000, 190),
        p('bigTree', 2380, 230, true),
        p('bigTree', 3130, 760),
        p('bigTree', 110, 1390),
        p('bigTree', 1030, 1400, true),
        p('bigTree', 2300, 1410),
        p('bigTree', 3120, 1410, true),
        p('smallTree', 1500, 300),
        p('smallTree', 2250, 330, true),
        p('smallTree', 2400, 560),
        p('smallTree', 2860, 1260, true),
        p('smallTree', 1180, 1240),
        p('bush', 1040, 330),
        p('bush', 1720, 340),
        p('bush', 2120, 440),
        p('bush', 1260, 1340),
        p('bush', 2060, 1310),
        p('bush', 2700, 1390),
        p('bush', 3130, 990),
        p('bush', 120, 760),
        p('rock', 1190, 650),
        p('rock', 2720, 1130),
        p('rock', 1580, 1300),
        p('rock', 150, 1000),
        p('rock', 3140, 250),
        p('rock', 2990, 360),
        p('rock', 3120, 560, true),
        p('log', 1350, 480),
        p('log', 2370, 1190, true),
        p('reeds', 1600, 1036),
        p('reeds', 2040, 928, true),
        p('reeds', 1440, 704),
        p('flowers', 210, 880),
        p('flowers', 400, 860),
        p('flowers', 300, 960),
        p('flowers', 760, 520),
        p('flowers', 1040, 600),
        p('flowers', 800, 690),
        p('flowers', 1000, 470),
        p('flowers', 700, 610),
        p('flowers', 1060, 720),
        p('flowers', 1700, 1240),
        p('flowers', 2600, 1160),
        p('flowers', 3080, 900),
        p('flowers', 2250, 560),
        p('flowers', 1300, 260),
        p('flowers', 520, 1360),
        p('lily', 1390, 905),
        p('lily', 1452, 962),
        p('lily', 1620, 760),
        p('lily', 1760, 960),
        p('lily', 1990, 770),
    ],
    spots: [
        { subject: 'mushroom', at: { x: 660, y: 1240 }, view: { x: 430, y: 1290 }, face: { x: 1, y: 0 } },
        { subject: 'butterfly', at: { x: 300, y: 830 }, view: { x: 300, y: 1080 }, face: { x: 0, y: -1 } },
        { subject: 'sunflower', at: { x: 900, y: 560 }, view: { x: 900, y: 810 }, face: { x: 0, y: -1 } },
        {
            subject: 'frog',
            at: { x: 1376, y: 928 },
            view: { x: 1150, y: 980 },
            face: { x: 1, y: 0 },
            route: [
                { x: 1292, y: 928 },
                { x: 1390, y: 898 },
                { x: 1452, y: 955 },
                { x: 1390, y: 898 },
            ],
        },
        { subject: 'lake', at: { x: 1880, y: 720 }, view: { x: 1880, y: 900 }, face: { x: 0, y: -1 } },
        { subject: 'waterfall', at: { x: 2760, y: 300 }, view: { x: 2760, y: 600 }, face: { x: 0, y: -1 } },
        {
            subject: 'duck',
            at: { x: 2527, y: 795 },
            view: { x: 2510, y: 1040 },
            face: { x: 0, y: -1 },
            route: [
                { x: 2566, y: 764 },
                { x: 2488, y: 826 },
            ],
        },
    ],
}

const caveEdges = (): Circle[] => {
    const out: Circle[] = []
    for (let x = 0; x <= 3200; x += 200) out.push(wall(x, 30, 150), wall(x, 1430, 150))
    out.push(wall(0, 220, 220), wall(0, 1220, 220))
    ;[300, 700, 1100].forEach(y => out.push(wall(3200, y, 200)))
    return out
}

const GRUTA: MapDef = {
    id: 'gruta',
    theme: 'cave',
    w: 3200,
    h: 1440,
    start: { x: 230, y: 720 },
    startFace: { x: 1, y: 0 },
    ponds: [{ x: 2380, y: 1110, rx: 210, ry: 110 }],
    walls: [...caveEdges(), wall(650, 420, 110), wall(1950, 760, 120), wall(2950, 1150, 150), wall(1080, 1290, 100), wall(2720, 300, 120)],
    trail: [
        [
            { x: 230, y: 720 },
            { x: 560, y: 800 },
            { x: 900, y: 740 },
            { x: 1200, y: 800 },
            { x: 1500, y: 880 },
            { x: 1820, y: 900 },
            { x: 2100, y: 860 },
            { x: 2400, y: 830 },
            { x: 2650, y: 760 },
        ],
        [
            { x: 1500, y: 880 },
            { x: 1500, y: 600 },
        ],
        [
            { x: 2100, y: 860 },
            { x: 2150, y: 700 },
        ],
        [
            { x: 900, y: 740 },
            { x: 920, y: 640 },
        ],
    ],
    shade: [],
    dark: { alpha: 0.93 },
    lights: [
        { x: -60, y: 720, r: 560 },
        { x: 1480, y: 760, r: 120 },
        { x: 2290, y: 640, r: 120 },
    ],
    sparks: [
        { x: 640, y: 700, r: 70 },
        { x: 980, y: 860, r: 70 },
        { x: 1640, y: 560, r: 70 },
        { x: 2000, y: 880, r: 70 },
        { x: 2560, y: 860, r: 70 },
    ],
    props: [
        p('caveRock', 420, 330),
        p('caveRock', 1250, 380, true),
        p('caveRock', 1700, 1250),
        p('caveRock', 2600, 1300, true),
        p('caveRock', 2900, 520),
        p('gravel', 800, 600),
        p('gravel', 1380, 1180, true),
        p('gravel', 2250, 300),
        p('gravel', 2820, 950, true),
        p('gravel', 1980, 1240),
        p('gravel', 450, 1020),
    ],
    spots: [
        { subject: 'bluecrystal', at: { x: 760, y: 1080 }, view: { x: 530, y: 1130 }, face: { x: 1, y: 0 } },
        { subject: 'glowmoss', at: { x: 1250, y: 1080 }, view: { x: 1250, y: 910 }, face: { x: 0, y: 1 } },
        { subject: 'crystal', at: { x: 1150, y: 560 }, view: { x: 920, y: 610 }, face: { x: 1, y: 0 } },
        { subject: 'drops', at: { x: 1820, y: 1060 }, view: { x: 1820, y: 890 }, face: { x: 0, y: 1 } },
        { subject: 'stalagmite', at: { x: 1500, y: 260 }, view: { x: 1500, y: 560 }, face: { x: 0, y: -1 } },
        { subject: 'glowshroom', at: { x: 2150, y: 420 }, view: { x: 2150, y: 690 }, face: { x: 0, y: -1 } },
        {
            subject: 'cavefish',
            at: { x: 2380, y: 1110 },
            view: { x: 2380, y: 940 },
            face: { x: 0, y: 1 },
            route: [
                { x: 2270, y: 1110 },
                { x: 2490, y: 1110 },
                { x: 2380, y: 1070 },
                { x: 2380, y: 1150 },
            ],
        },
        {
            subject: 'fireflies',
            at: { x: 2700, y: 640 },
            view: { x: 2470, y: 690 },
            face: { x: 1, y: 0 },
            route: [
                { x: 2640, y: 640 },
                { x: 2760, y: 640 },
                { x: 2700, y: 590 },
                { x: 2700, y: 690 },
            ],
        },
    ],
}

const BOSQUE: MapDef = {
    id: 'bosque',
    theme: 'forest',
    w: 3200,
    h: 1440,
    start: { x: 250, y: 1150 },
    startFace: { x: 1, y: 0 },
    walls: [wall(2420, 1290, 110), wall(2990, 1150, 150), wall(2560, 1440, 110), wall(2860, 1440, 110)],
    floor: [{ x: 2700, y: 1230, rx: 300, ry: 230 }],
    trail: [
        [
            { x: 250, y: 1150 },
            { x: 480, y: 1060 },
            { x: 640, y: 1010 },
            { x: 900, y: 900 },
            { x: 1150, y: 820 },
            { x: 1400, y: 880 },
            { x: 1700, y: 800 },
            { x: 1950, y: 880 },
            { x: 2200, y: 1060 },
            { x: 2450, y: 980 },
            { x: 2650, y: 880 },
            { x: 2700, y: 990 },
        ],
        [
            { x: 1700, y: 800 },
            { x: 1700, y: 660 },
        ],
        [
            { x: 2450, y: 980 },
            { x: 2470, y: 700 },
        ],
        [
            { x: 1400, y: 880 },
            { x: 1500, y: 940 },
        ],
    ],
    shade: [{ x: 1700, y: 500, rx: 150, ry: 50 }],
    dark: { alpha: 0.9, areas: [{ x: 2700, y: 1230, rx: 290, ry: 240 }] },
    props: [
        p('smallTree', 150, 300, false, 156),
        p('smallTree', 420, 200, true, 150),
        p('smallTree', 700, 330, false, 160),
        p('smallTree', 1000, 250, true, 150),
        p('smallTree', 1350, 200, false, 156),
        p('smallTree', 2050, 250, true, 160),
        p('smallTree', 2400, 330, false, 150),
        p('smallTree', 2950, 300, true, 156),
        p('smallTree', 3100, 650, false, 150),
        p('smallTree', 180, 700, true, 156),
        p('smallTree', 1950, 1300, false, 150),
        p('smallTree', 1180, 1360, true, 156),
        p('bush', 800, 560),
        p('bush', 2600, 300, true),
        p('bush', 2150, 1250),
        p('bush', 500, 1350, true),
        p('bush', 1500, 1380),
        p('flowers', 300, 880),
        p('flowers', 1050, 1050),
        p('flowers', 1850, 620),
        p('flowers', 2400, 760),
        p('flowers', 2850, 760),
        p('flowers', 600, 1250),
        p('log', 1250, 1180, true),
        p('log', 2050, 700),
    ],
    spots: [
        { subject: 'nest', at: { x: 620, y: 900 }, view: { x: 390, y: 950 }, face: { x: 1, y: 0 } },
        { subject: 'boulder', at: { x: 900, y: 1250 }, view: { x: 670, y: 1300 }, face: { x: 1, y: 0 }, solid: 80 },
        { subject: 'ladybug', at: { x: 1180, y: 640 }, view: { x: 950, y: 690 }, face: { x: 1, y: 0 } },
        { subject: 'bigtree', at: { x: 1700, y: 380 }, view: { x: 1700, y: 650 }, face: { x: 0, y: -1 }, solid: 44 },
        {
            subject: 'bee',
            at: { x: 1500, y: 1100 },
            view: { x: 1500, y: 930 },
            face: { x: 0, y: 1 },
            route: [
                { x: 1466, y: 1095 },
                { x: 1534, y: 1095 },
                { x: 1500, y: 1075 },
                { x: 1500, y: 1118 },
            ],
        },
        { subject: 'ants', at: { x: 2250, y: 950 }, view: { x: 2020, y: 1000 }, face: { x: 1, y: 0 } },
        { subject: 'anthill', at: { x: 2700, y: 600 }, view: { x: 2470, y: 650 }, face: { x: 1, y: 0 }, solid: 56 },
        { subject: 'glowshroom', at: { x: 2700, y: 1220 }, view: { x: 2700, y: 1050 }, face: { x: 0, y: 1 }, size: 180 },
    ],
}

export const MAPS: Record<MapId, MapDef> = { prado: PRADO, gruta: GRUTA, bosque: BOSQUE }

export const sizeOf = (spot: Spot) => spot.size ?? SUBJECTS[spot.subject].size

export function spotOf(map: MapDef, id: string) {
    const spot = map.spots.find(s => s.subject === id)
    if (!spot) throw new Error(`[camera-na-trilha] sem lugar para ${id}`)
    return spot
}

export function frameAt(pos: Vec, face: Vec, zoom = false): Rect {
    const k = zoom ? FRAME.zoom : 1
    return {
        x: pos.x + face.x * FRAME.aheadX,
        y: pos.y - FRAME.lift + face.y * FRAME.aheadY,
        w: FRAME.w * k,
        h: FRAME.h * k,
    }
}

export function within(rect: Rect, point: Vec, inset: number = (FRAME.inset * rect.w) / FRAME.w) {
    return Math.abs(point.x - rect.x) <= rect.w / 2 - inset && Math.abs(point.y - rect.y) <= rect.h / 2 - inset
}

export function solids(map: MapDef): Circle[] {
    const list: Circle[] = map.props
        .filter(prop => PROP_SOLID[prop.kind] > 0)
        .map(prop => ({ x: prop.x, y: prop.y - 6, r: PROP_SOLID[prop.kind] }))
    map.props
        .filter(prop => prop.kind === 'log')
        .forEach(prop => list.push({ x: prop.x - 44, y: prop.y - 10, r: 30 }, { x: prop.x + 44, y: prop.y - 10, r: 30 }))
    if (map.cliff) list.push(map.cliff)
    if (map.walls) list.push(...map.walls)
    map.spots.forEach(spot => {
        if (spot.solid) list.push({ x: spot.at.x, y: spot.at.y + sizeOf(spot) * 0.36, r: spot.solid })
    })
    return list
}

const segDistance = (pt: Vec, a: Vec, b: Vec) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = dx * dx + dy * dy
    const t = len ? Math.max(0, Math.min(1, ((pt.x - a.x) * dx + (pt.y - a.y) * dy) / len)) : 0
    return Math.hypot(pt.x - (a.x + t * dx), pt.y - (a.y + t * dy))
}

export const riverDistance = (map: MapDef, pt: Vec) => {
    const river = map.river
    if (!river) return Infinity
    return river.slice(1).reduce((min, b, i) => Math.min(min, segDistance(pt, river[i], b)), Infinity)
}

export const inEllipse = (e: { x: number; y: number; rx: number; ry: number }, x: number, y: number, grow = 0) =>
    ((x - e.x) / (e.rx + grow)) ** 2 + ((y - e.y) / (e.ry + grow)) ** 2 < 1

export const inLake = (map: MapDef, x: number, y: number, grow = 0) => !!map.lake && inEllipse(map.lake, x, y, grow)

export const inPond = (map: MapDef, x: number, y: number, grow = 0) => (map.ponds ?? []).some(p => inEllipse(p, x, y, grow))

export const pierCenter = (map: MapDef, y: number) => {
    const pier = map.pier
    if (!pier) return 0
    return pier.x + pier.skew * (0.5 - (y - pier.top) / (pier.bottom - pier.top))
}

export const onPier = (map: MapDef, x: number, y: number, shrink = 0) => {
    const pier = map.pier
    if (!pier) return false
    return Math.abs(x - pierCenter(map, y)) <= pier.w / 2 - shrink && y >= pier.top && y <= pier.bottom
}

export interface Walk {
    cols: number
    rows: number
    open: Uint8Array
    free(x: number, y: number): boolean
    route(from: Vec, to: Vec): Vec[] | null
    reach(from: Vec): Int32Array
}

export function buildWalk(map: MapDef): Walk {
    const cols = Math.ceil(map.w / GRID)
    const rows = Math.ceil(map.h / GRID)
    const open = new Uint8Array(cols * rows)
    const m = HERO.radius
    const blocks = solids(map)
    for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
            const x = c * GRID + GRID / 2
            const y = r * GRID + GRID / 2
            let ok = x > EDGE && x < map.w - EDGE && y > EDGE + 10 && y < map.h - EDGE
            if (ok && inLake(map, x, y, m) && !onPier(map, x, y, m - 2)) ok = false
            if (ok && map.pool && Math.hypot(x - map.pool.x, y - map.pool.y) < map.pool.r + m) ok = false
            if (ok && riverDistance(map, { x, y }) < (map.riverW ?? 0) / 2 + m) ok = false
            if (ok && inPond(map, x, y, m)) ok = false
            if (ok && blocks.some(b => Math.hypot(x - b.x, y - b.y) < b.r + m)) ok = false
            open[r * cols + c] = ok ? 1 : 0
        }

    const cellAt = (x: number, y: number) => {
        const c = Math.floor(x / GRID)
        const r = Math.floor(y / GRID)
        if (c < 0 || r < 0 || c >= cols || r >= rows) return -1
        return r * cols + c
    }
    const free = (x: number, y: number) => {
        const i = cellAt(x, y)
        return i >= 0 && open[i] === 1
    }
    const center = (i: number): Vec => ({ x: (i % cols) * GRID + GRID / 2, y: Math.floor(i / cols) * GRID + GRID / 2 })
    const steps = [-1, 1, -cols, cols, -cols - 1, -cols + 1, cols - 1, cols + 1]
    const cost = [1, 1, 1, 1, 1.414, 1.414, 1.414, 1.414]

    const search = (start: number) => {
        const dist = new Float32Array(cols * rows).fill(Infinity)
        const prev = new Int32Array(cols * rows).fill(-1)
        const queue: number[] = []
        dist[start] = 0
        queue.push(start)
        while (queue.length) {
            let best = 0
            for (let k = 1; k < queue.length; k++) if (dist[queue[k]] < dist[queue[best]]) best = k
            const at = queue[best]
            queue[best] = queue[queue.length - 1]
            queue.pop()
            const ac = at % cols
            for (let k = 0; k < 8; k++) {
                const to = at + steps[k]
                if (to < 0 || to >= open.length || !open[to]) continue
                const tc = to % cols
                if (Math.abs(tc - ac) > 1) continue
                if (k >= 4 && (!open[at + (tc - ac)] || !open[to - (tc - ac)])) continue
                const d = dist[at] + cost[k]
                if (d < dist[to]) {
                    if (dist[to] === Infinity) queue.push(to)
                    dist[to] = d
                    prev[to] = at
                }
            }
        }
        return { dist, prev }
    }

    const clear = (a: Vec, b: Vec) => {
        const len = Math.hypot(b.x - a.x, b.y - a.y)
        const n = Math.ceil(len / 8)
        for (let k = 0; k <= n; k++) if (!free(a.x + ((b.x - a.x) * k) / n, a.y + ((b.y - a.y) * k) / n)) return false
        return true
    }

    return {
        cols,
        rows,
        open,
        free,
        route(from, to) {
            const a = cellAt(from.x, from.y)
            const b = cellAt(to.x, to.y)
            if (a < 0 || b < 0 || !open[b]) return null
            const { prev } = search(a)
            if (a === b) return [{ ...to }]
            if (prev[b] < 0) return null
            const cells: Vec[] = []
            for (let at = b; at !== a && at >= 0; at = prev[at]) cells.unshift(center(at))
            cells[cells.length - 1] = { ...to }
            const out: Vec[] = []
            let anchor = from
            let k = 0
            while (k < cells.length) {
                let far = k
                while (far + 1 < cells.length && clear(anchor, cells[far + 1])) far++
                out.push(cells[far])
                anchor = cells[far]
                k = far + 1
            }
            return out
        },
        reach(from) {
            const a = cellAt(from.x, from.y)
            const out = new Int32Array(cols * rows).fill(-1)
            if (a < 0) return out
            const { dist } = search(a)
            dist.forEach((d, i) => {
                if (d !== Infinity) out[i] = Math.round(d)
            })
            return out
        },
    }
}

const SAME = 400
const MOVING = 520

export function validateMaps(maps: MapDef[]): string[] {
    const problems: string[] = []
    maps.forEach(map => {
        const at = `mapa ${map.id}`
        const walk = buildWalk(map)
        if (!walk.free(map.start.x, map.start.y)) problems.push(`${at}: o Téo nasce num lugar fechado`)
        const reach = walk.reach(map.start)
        map.spots.forEach(spot => {
            const name = `${at}, ${spot.subject}`
            const cell = Math.floor(spot.view.y / GRID) * walk.cols + Math.floor(spot.view.x / GRID)
            if (!walk.free(spot.view.x, spot.view.y)) problems.push(`${name}: o lugar de onde se vê está fechado`)
            else if (reach[cell] < 0) problems.push(`${name}: não dá para chegar ao lugar de onde se vê`)
            const frame = frameAt(spot.view, spot.face)
            const points = [spot.at, ...(spot.route ?? [])]
            if (!points.every(pt => within(frame, pt))) problems.push(`${name}: o visor não cobre o assunto`)
        })
        map.spots.forEach((a, i) =>
            map.spots.slice(i + 1).forEach(b => {
                const min = moves(a.subject) || moves(b.subject) ? MOVING : SAME
                const d = Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y)
                if (d < min) problems.push(`${at}: ${a.subject} e ${b.subject} perto demais (${Math.round(d)})`)
            }),
        )
        map.spots.forEach(spot => {
            if (!SUBJECTS[spot.subject]) problems.push(`${at}: assunto desconhecido ${spot.subject}`)
        })
        const fixed = [...(map.lights ?? []), ...(map.sparks ?? [])]
        if (map.dark && !map.dark.areas)
            map.spots.forEach(spot => {
                if (SUBJECTS[spot.subject].glows) return
                if (fixed.some(l => Math.hypot(spot.at.x - l.x, spot.at.y - l.y) < l.r + 60))
                    problems.push(`${at}, ${spot.subject}: fica iluminado sem a LUZ`)
            })
    })
    return problems
}
