import type { Blob, Deco, MapDef, Tone, Vec } from '../types'
import { DEEP, FLOOR_GAP, SHALLOW, SUB, SURFACE } from './layout'

export const SUB_RADIUS = 44
export const GRID = 40
export const MAX_ROCK = 2048
export const DECO_ROOM = 110

const SHELF_R = 34
const SF = SHALLOW.h - FLOOR_GAP
const DF = DEEP.h - FLOOR_GAP
let floor = SF

export function random(seed: number) {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = a
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

type Rand = () => number

const shelf = (x: number, y: number, w: number): Blob[] => {
    const out: Blob[] = []
    const n = Math.max(2, Math.round((w - SHELF_R * 2) / (SHELF_R * 0.8)))
    for (let k = 0; k <= n; k++) out.push({ x: x - w / 2 + SHELF_R + ((w - SHELF_R * 2) * k) / n, y: y + SHELF_R - 8, r: SHELF_R })
    return out
}

const chain = (rnd: Rand, x: number, from: number, to: number, w: number, taper = 0): Blob[] => {
    const out: Blob[] = []
    const dir = Math.sign(to - from) || 1
    const len = Math.abs(to - from)
    for (let d = 0; d <= len; d += w * 0.42) {
        const k = len ? d / len : 0
        const r = (w / 2) * (1 - taper * k) * (0.82 + rnd() * 0.3)
        out.push({ x: x + (rnd() - 0.5) * w * 0.34, y: from + dir * d, r })
    }
    return out
}

const mound = (rnd: Rand, x: number, w: number, h: number): Blob[] => {
    const out: Blob[] = []
    for (let xi = x - w / 2; xi <= x + w / 2; xi += 64) {
        const p = 1 - ((xi - x) / (w / 2)) ** 2
        const r = 58 + rnd() * 34
        const top = floor + 30 - p * h + r * 0.55
        out.push({ x: xi + (rnd() - 0.5) * 20, y: top, r })
        for (let y = top + r * 0.9; y < floor + 60; y += r * 0.9) out.push({ x: xi + (rnd() - 0.5) * 30, y, r: r * (0.9 + rnd() * 0.2) })
    }
    return out
}

const column = (rnd: Rand, x: number, top: number, w: number): Blob[] => [
    ...mound(rnd, x, w * 2.4, 90),
    ...chain(rnd, x, floor + 40, top + w * 0.5, w),
    ...shelf(x, top, w + 70),
]

const wall = (rnd: Rand, x: number, top: number, w: number): Blob[] => [
    ...mound(rnd, x, w * 2.6, 110),
    ...chain(rnd, x, floor + 40, top + w * 0.5, w),
]

const island = (rnd: Rand, x: number, y: number, w: number, depth: number): Blob[] => {
    const out = shelf(x, y, w)
    const rows = Math.max(2, Math.round(depth / 70))
    for (let k = 1; k <= rows; k++) {
        const width = w * Math.pow(1 - k / (rows + 1), 0.8)
        const r = Math.min(66, Math.max(22, width / 3))
        const n = Math.max(1, Math.round((width - r * 2) / (r * 1.1)))
        for (let i = 0; i <= n; i++) {
            const bx = n === 0 ? x : x - width / 2 + r + ((width - r * 2) * i) / n
            out.push({ x: bx + (rnd() - 0.5) * 16, y: y + 24 + (k / rows) * depth, r: r * (0.9 + rnd() * 0.2) })
        }
    }
    return out
}

const band = (rnd: Rand, x0: number, x1: number, y: number, thick: number, drips: number[]): Blob[] => {
    const out = shelf((x0 + x1) / 2, y, x1 - x0)
    for (let x = x0 + 50; x <= x1 - 50; x += 64) out.push({ x: x + (rnd() - 0.5) * 20, y: y + thick * 0.42, r: 44 + rnd() * 12 })
    for (let x = x0 + 50; x <= x1 - 50; x += 70) out.push({ x: x + (rnd() - 0.5) * 20, y: y + thick - 56 + (rnd() - 0.5) * 24, r: 52 + rnd() * 14 })
    drips.forEach(dx => out.push(...chain(rnd, dx, y + thick - 30, y + thick + 120 + rnd() * 120, 70, 0.7)))
    return out
}

const spike = (rnd: Rand, x: number, h: number): Blob[] => chain(rnd, x, floor + 30, floor - h, 90, 0.65)

const layer = (rnd: Rand, y: number, gaps: [number, number][], drip = true, thick = 190): Blob[][] => {
    const spans: [number, number][] = []
    let x = -40
    ;[...gaps]
        .sort((a, b) => a[0] - b[0])
        .forEach(([g0, g1]) => {
            if (g0 > x) spans.push([x, g0])
            x = g1
        })
    if (x < SHALLOW.w + 40) spans.push([x, SHALLOW.w + 40])
    const out: Blob[][] = []
    spans.forEach(([a, b]) => {
        const n = Math.ceil((b - a) / 1500)
        for (let i = 0; i < n; i++) {
            const x0 = a + ((b - a) * i) / n
            const x1 = a + ((b - a) * (i + 1)) / n
            out.push(band(rnd, x0, x1, y, thick, drip && x1 - x0 > 500 ? [x0 + (x1 - x0) * 0.32, x0 + (x1 - x0) * 0.72] : []))
        }
    })
    return out
}

const post = (rnd: Rand, x: number, from: number, to: number, w = 150): Blob[] => chain(rnd, x, from, to, w)

interface Draft {
    id: string
    size: { w: number; h: number }
    seed: number
    tone: Tone
    rocks: (rnd: Rand) => Blob[][]
    slots: Vec[]
    pickups: Vec[]
}

const LAVENDER: Tone = { light: 0x9b8fe0, dark: 0x6f62c4, weed: 0x5fd48a, coral: 0xff5fae, gem: 0x3fe0e0 }
const VIOLET: Tone = { light: 0x7f74d8, dark: 0x5546ad, weed: 0x3fe0e0, coral: 0xc9a6ff, gem: 0x3fe0e0 }
const CORAL: Tone = { light: 0xe69ad0, dark: 0xb766a8, weed: 0x5fd48a, coral: 0xfff06a, gem: 0xff5fae }
const TEAL: Tone = { light: 0x7fc9d6, dark: 0x4f93ad, weed: 0x5fd48a, coral: 0xff5fae, gem: 0xfff06a }
const PLUM: Tone = { light: 0xb593db, dark: 0x8062b0, weed: 0x3fe0e0, coral: 0xfff06a, gem: 0x3fe0e0 }

const DRAFTS: Draft[] = [
    {
        id: 'jardim',
        size: SHALLOW,
        seed: 11,
        tone: LAVENDER,
        rocks: rnd => [
            island(rnd, 1000, 1150, 330, 260),
            column(rnd, 1500, 1450, 170),
            mound(rnd, 1200, 420, 170),
            island(rnd, 2100, 1050, 360, 300),
            mound(rnd, 2200, 320, 140),
            column(rnd, 2900, 1300, 180),
            island(rnd, 3500, 820, 380, 340),
            mound(rnd, 3700, 560, 220),
            column(rnd, 4100, 1500, 170),
            island(rnd, 4600, 1050, 340, 280),
            mound(rnd, 4450, 300, 150),
        ],
        slots: [
            { x: 1000, y: 1150 },
            { x: 1500, y: 1450 },
            { x: 2100, y: 1050 },
            { x: 2900, y: 1300 },
            { x: 3500, y: 820 },
            { x: 4100, y: 1500 },
            { x: 4600, y: 1050 },
            { x: 700, y: SF },
            { x: 2500, y: SF },
            { x: 3250, y: SF },
            { x: 4850, y: SF },
            { x: 1880, y: SF },
        ],
        pickups: [
            { x: 820, y: 720 },
            { x: 1800, y: 620 },
            { x: 2550, y: 760 },
            { x: 3050, y: 1720 },
            { x: 3900, y: 1150 },
            { x: 4400, y: 620 },
            { x: 1250, y: 1640 },
            { x: 4900, y: 1600 },
        ],
    },
    {
        id: 'cavernas',
        size: SHALLOW,
        seed: 23,
        tone: VIOLET,
        rocks: rnd => [
            band(rnd, 640, 1360, 1150, 190, [820, 1180]),
            band(rnd, 1660, 2660, 1150, 190, [1850, 2450]),
            band(rnd, 2960, 3960, 1150, 190, [3150, 3750]),
            band(rnd, 4260, 5160, 1150, 190, [4450, 4950]),
            island(rnd, 1700, 650, 300, 220),
            island(rnd, 2800, 700, 320, 240),
            island(rnd, 4100, 650, 320, 240),
            column(rnd, 3800, 1720, 160),
            spike(rnd, 1450, 230),
            spike(rnd, 2700, 260),
            spike(rnd, 4950, 240),
        ],
        slots: [
            { x: 1000, y: 1150 },
            { x: 2150, y: 1150 },
            { x: 3450, y: 1150 },
            { x: 4700, y: 1150 },
            { x: 900, y: SF },
            { x: 2150, y: SF },
            { x: 3200, y: SF },
            { x: 4500, y: SF },
            { x: 2800, y: 700 },
            { x: 4100, y: 650 },
            { x: 3800, y: 1720 },
            { x: 1700, y: 650 },
        ],
        pickups: [
            { x: 1200, y: 760 },
            { x: 2300, y: 480 },
            { x: 3450, y: 720 },
            { x: 4750, y: 520 },
            { x: 1500, y: 1650 },
            { x: 2650, y: 1600 },
            { x: 4300, y: 1680 },
            { x: 600, y: 1650 },
        ],
    },
    {
        id: 'desfiladeiro',
        size: SHALLOW,
        seed: 37,
        tone: CORAL,
        rocks: rnd => [
            [...wall(rnd, 1300, 820, 210), ...shelf(1300, 820, 280), ...shelf(1480, 1500, 200)],
            island(rnd, 2300, 600, 520, 900),
            [...wall(rnd, 3200, 900, 220), ...shelf(3200, 900, 290), ...shelf(3010, 1450, 200), ...shelf(3390, 1700, 200)],
            island(rnd, 4150, 700, 480, 860),
            mound(rnd, 2300, 500, 160),
            mound(rnd, 4200, 420, 140),
        ],
        slots: [
            { x: 1300, y: 820 },
            { x: 1480, y: 1500 },
            { x: 2300, y: 600 },
            { x: 3200, y: 900 },
            { x: 3010, y: 1450 },
            { x: 3390, y: 1700 },
            { x: 4150, y: 700 },
            { x: 700, y: SF },
            { x: 1800, y: SF },
            { x: 2750, y: SF },
            { x: 3750, y: SF },
            { x: 4750, y: SF },
        ],
        pickups: [
            { x: 900, y: 1200 },
            { x: 1300, y: 500 },
            { x: 1750, y: 1300 },
            { x: 2300, y: 1850 },
            { x: 2750, y: 600 },
            { x: 3650, y: 1300 },
            { x: 4150, y: 1850 },
            { x: 4800, y: 900 },
        ],
    },
    {
        id: 'abismo',
        size: DEEP,
        seed: 41,
        tone: TEAL,
        rocks: rnd => [
            island(rnd, 1100, 1000, 340, 300),
            island(rnd, 2300, 800, 360, 300),
            island(rnd, 3600, 1100, 380, 320),
            island(rnd, 4600, 850, 340, 280),
            island(rnd, 1700, 1800, 360, 320),
            island(rnd, 3000, 1950, 380, 340),
            island(rnd, 4300, 1700, 340, 300),
            column(rnd, 900, 2500, 180),
            column(rnd, 2200, 2650, 180),
            column(rnd, 3500, 2550, 190),
            column(rnd, 4700, 2450, 180),
            mound(rnd, 1500, 500, 200),
            mound(rnd, 2900, 520, 220),
            mound(rnd, 4100, 480, 200),
        ],
        slots: [
            { x: 1100, y: 1000 },
            { x: 2300, y: 800 },
            { x: 3600, y: 1100 },
            { x: 4600, y: 850 },
            { x: 1700, y: 1800 },
            { x: 3000, y: 1950 },
            { x: 4300, y: 1700 },
            { x: 900, y: 2500 },
            { x: 2200, y: 2650 },
            { x: 3500, y: 2550 },
            { x: 4700, y: 2450 },
            { x: 2550, y: DF },
        ],
        pickups: [
            { x: 700, y: 700 },
            { x: 1700, y: 600 },
            { x: 3000, y: 600 },
            { x: 4100, y: 500 },
            { x: 2400, y: 1400 },
            { x: 3900, y: 1450 },
            { x: 1250, y: 2300 },
            { x: 2650, y: 2800 },
        ],
    },
    {
        id: 'degraus',
        size: DEEP,
        seed: 53,
        tone: PLUM,
        rocks: rnd => [
            ...layer(rnd, 1150, [
                [1400, 1700],
                [3500, 3800],
            ]),
            ...layer(rnd, 2200, [
                [2400, 2700],
                [4400, 4700],
            ]),
            island(rnd, 2600, 650, 320, 240),
            column(rnd, 4100, 2750, 170),
            spike(rnd, 1500, 200),
            spike(rnd, 3000, 220),
        ],
        slots: [
            { x: 1000, y: 1150 },
            { x: 2450, y: 1150 },
            { x: 4400, y: 1150 },
            { x: 700, y: 2200 },
            { x: 1900, y: 2200 },
            { x: 3500, y: 2200 },
            { x: 900, y: DF },
            { x: 2200, y: DF },
            { x: 3600, y: DF },
            { x: 4800, y: DF },
            { x: 2600, y: 650 },
            { x: 4100, y: 2750 },
        ],
        pickups: [
            { x: 1200, y: 700 },
            { x: 3500, y: 600 },
            { x: 4700, y: 700 },
            { x: 2000, y: 1700 },
            { x: 4200, y: 1750 },
            { x: 800, y: 1750 },
            { x: 1500, y: 2700 },
            { x: 3200, y: 2750 },
        ],
    },
    {
        id: 'fendas',
        size: DEEP,
        seed: 67,
        tone: LAVENDER,
        rocks: rnd => [
            [...wall(rnd, 1400, 1400, 220), ...shelf(1400, 1400, 290), ...shelf(1590, 2100, 200)],
            [...wall(rnd, 2600, 1500, 220), ...shelf(2600, 1500, 290), ...shelf(2410, 2400, 200), ...shelf(2790, 1900, 200)],
            [...wall(rnd, 3800, 1350, 220), ...shelf(3800, 1350, 290), ...shelf(3610, 2600, 200), ...shelf(3990, 2000, 200)],
            island(rnd, 2000, 800, 300, 220),
            island(rnd, 4600, 900, 320, 240),
        ],
        slots: [
            { x: 1400, y: 1400 },
            { x: 2600, y: 1500 },
            { x: 3800, y: 1350 },
            { x: 1590, y: 2100 },
            { x: 2410, y: 2400 },
            { x: 2790, y: 1900 },
            { x: 3610, y: 2600 },
            { x: 3990, y: 2000 },
            { x: 800, y: DF },
            { x: 2000, y: DF },
            { x: 3200, y: DF },
            { x: 4500, y: DF },
        ],
        pickups: [
            { x: 900, y: 800 },
            { x: 2000, y: 1350 },
            { x: 3200, y: 700 },
            { x: 4500, y: 1450 },
            { x: 800, y: 2500 },
            { x: 2000, y: 2600 },
            { x: 3200, y: 2400 },
            { x: 4500, y: 2600 },
        ],
    },
    {
        id: 'serpente',
        size: DEEP,
        seed: 79,
        tone: CORAL,
        rocks: rnd => [
            ...layer(rnd, 1000, [
                [1900, 2200],
                [4000, 4300],
            ]),
            ...layer(rnd, 1900, [
                [800, 1100],
                [3100, 3400],
            ]),
            ...layer(
                rnd,
                2650,
                [
                    [2000, 2300],
                    [4300, 4600],
                ],
                false,
            ),
            post(rnd, 3000, 1190, 1900),
            post(rnd, 1600, 2090, 2650),
            post(rnd, 3500, DF + 40, 2840),
        ],
        slots: [
            { x: 900, y: 1000 },
            { x: 3000, y: 1000 },
            { x: 4700, y: 1000 },
            { x: 400, y: 1900 },
            { x: 1600, y: 1900 },
            { x: 2600, y: 1900 },
            { x: 3900, y: 1900 },
            { x: 600, y: 2650 },
            { x: 2900, y: 2650 },
            { x: 3800, y: 2650 },
            { x: 1200, y: DF },
            { x: 4400, y: DF },
        ],
        pickups: [
            { x: 1500, y: 600 },
            { x: 3600, y: 600 },
            { x: 1000, y: 1500 },
            { x: 3800, y: 1500 },
            { x: 2400, y: 2300 },
            { x: 4600, y: 2300 },
            { x: 1200, y: 2980 },
            { x: 4000, y: 2980 },
        ],
    },
    {
        id: 'colunas',
        size: DEEP,
        seed: 83,
        tone: TEAL,
        rocks: rnd => [
            ...layer(rnd, 1100, [
                [1200, 1500],
                [3300, 3600],
                [4700, 5000],
            ]),
            ...layer(
                rnd,
                2300,
                [
                    [600, 900],
                    [2300, 2600],
                    [4400, 4700],
                ],
                false,
            ),
            post(rnd, 2400, 1290, 2300),
            post(rnd, 4200, 1290, 2300),
            post(rnd, 1300, DF + 40, 2490),
            post(rnd, 3400, DF + 40, 2490),
        ],
        slots: [
            { x: 600, y: 1100 },
            { x: 2250, y: 1100 },
            { x: 4300, y: 1100 },
            { x: 1700, y: 2300 },
            { x: 3000, y: 2300 },
            { x: 3900, y: 2300 },
            { x: 4900, y: 2300 },
            { x: 800, y: DF },
            { x: 2000, y: DF },
            { x: 2900, y: DF },
            { x: 4000, y: DF },
            { x: 4800, y: DF },
        ],
        pickups: [
            { x: 1000, y: 700 },
            { x: 3000, y: 650 },
            { x: 4600, y: 650 },
            { x: 700, y: 1700 },
            { x: 3000, y: 1750 },
            { x: 4700, y: 1750 },
            { x: 2000, y: 2800 },
            { x: 4300, y: 2800 },
        ],
    },
    {
        id: 'grutas',
        size: DEEP,
        seed: 97,
        tone: PLUM,
        rocks: rnd => [
            ...layer(rnd, 900, [[2500, 2800]]),
            ...layer(rnd, 1750, [
                [900, 1200],
                [4100, 4400],
            ]),
            ...layer(rnd, 2550, [[2500, 2800]], false),
            post(rnd, 1700, 1090, 1750),
            spike(rnd, 1500, 180),
        ],
        slots: [
            { x: 900, y: 900 },
            { x: 1800, y: 900 },
            { x: 4000, y: 900 },
            { x: 500, y: 1750 },
            { x: 2400, y: 1750 },
            { x: 3300, y: 1750 },
            { x: 4800, y: 1750 },
            { x: 1200, y: 2550 },
            { x: 3600, y: 2550 },
            { x: 4600, y: 2550 },
            { x: 800, y: DF },
            { x: 3400, y: DF },
        ],
        pickups: [
            { x: 1500, y: 500 },
            { x: 3500, y: 500 },
            { x: 800, y: 1350 },
            { x: 3000, y: 1350 },
            { x: 4700, y: 1350 },
            { x: 2000, y: 2150 },
            { x: 4000, y: 2150 },
            { x: 3000, y: 2950 },
        ],
    },
]

const inside = (blobs: Blob[], x: number, y: number, pad = 0) => blobs.some(b => Math.hypot(x - b.x, y - b.y) < b.r + pad)

function decorate(rnd: Rand, rock: Blob[], all: Blob[], slots: Vec[], pickups: Vec[]): Deco[] {
    const out: Deco[] = []
    const kinds: Deco['kind'][] = ['weed', 'weed', 'coral', 'gem', 'star', 'weed', 'shell']
    rock.forEach(b => {
        const x = b.x + (rnd() - 0.5) * b.r * 0.6
        const top = b.y - Math.sqrt(Math.max(0, b.r * b.r - (x - b.x) ** 2))
        if (inside(all, x, top - 6)) return
        if (slots.some(s => Math.abs(s.x - x) < 130 && top > s.y - 190 && top < s.y + 40)) return
        if (pickups.some(p => Math.hypot(p.x - x, p.y - top) < 90)) return
        if (rnd() > 0.42) return
        out.push({ x, y: top + 6, kind: kinds[Math.floor(rnd() * kinds.length)], size: 0.8 + rnd() * 0.5, flip: rnd() < 0.5 })
    })
    return out
}

function build(d: Draft): MapDef {
    floor = d.size.h - FLOOR_GAP
    const rnd = random(d.seed)
    const groups = d.rocks(rnd)
    const solids = groups.flat()
    const rocks = groups.map(blobs => ({ blobs, decor: decorate(rnd, blobs, solids, d.slots, d.pickups) }))
    return { id: d.id, w: d.size.w, h: d.size.h, floor, tone: d.tone, rocks, solids, slots: d.slots, pickups: d.pickups }
}

export const MAPS: Record<string, MapDef> = Object.fromEntries(DRAFTS.map(d => [d.id, build(d)]))

export function pushOut(map: MapDef, x: number, y: number, r: number): Vec {
    let px = x
    let py = y
    for (let pass = 0; pass < 3; pass++) {
        let moved = false
        for (const b of map.solids) {
            const dx = px - b.x
            const dy = py - b.y
            const min = b.r + r
            if (Math.abs(dx) >= min || Math.abs(dy) >= min) continue
            const d = Math.hypot(dx, dy)
            if (d >= min) continue
            if (d < 0.001) {
                py = b.y - min
            } else {
                px = b.x + (dx / d) * min
                py = b.y + (dy / d) * min
            }
            moved = true
        }
        if (!moved) break
    }
    return { x: px, y: py }
}

export function rockBounds(blobs: Blob[], height: number) {
    const x0 = Math.floor(Math.min(...blobs.map(b => b.x - b.r)) - 10)
    const x1 = Math.ceil(Math.max(...blobs.map(b => b.x + b.r)) + 10)
    const y0 = Math.floor(Math.min(...blobs.map(b => b.y - b.r)) - DECO_ROOM)
    const y1 = Math.ceil(Math.min(height, Math.max(...blobs.map(b => b.y + b.r)) + 10))
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}

const open = (map: MapDef, x: number, y: number) =>
    x >= 60 && x <= map.w - 60 && y >= SURFACE + 40 && y <= map.floor - 40 && !inside(map.solids, x, y, SUB_RADIUS)

export function distances(map: MapDef, from: Vec): { at(p: Vec, reach: number): number } {
    const cols = Math.ceil(map.w / GRID)
    const rows = Math.ceil(map.h / GRID)
    const free = new Uint8Array(cols * rows)
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) free[r * cols + c] = open(map, c * GRID + GRID / 2, r * GRID + GRID / 2) ? 1 : 0
    const dist = new Float64Array(cols * rows).fill(Infinity)
    const start = Math.floor(from.y / GRID) * cols + Math.floor(from.x / GRID)
    dist[start] = 0
    const heap: [number, number][] = [[0, start]]
    const push = (item: [number, number]) => {
        heap.push(item)
        let i = heap.length - 1
        while (i > 0) {
            const p = (i - 1) >> 1
            if (heap[p][0] <= heap[i][0]) break
            ;[heap[p], heap[i]] = [heap[i], heap[p]]
            i = p
        }
    }
    const pop = () => {
        const top = heap[0]
        const last = heap.pop()!
        if (heap.length) {
            heap[0] = last
            let i = 0
            for (;;) {
                const l = i * 2 + 1
                const r = l + 1
                let m = i
                if (l < heap.length && heap[l][0] < heap[m][0]) m = l
                if (r < heap.length && heap[r][0] < heap[m][0]) m = r
                if (m === i) break
                ;[heap[m], heap[i]] = [heap[i], heap[m]]
                i = m
            }
        }
        return top
    }
    const steps: [number, number, number][] = [
        [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
        [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ]
    while (heap.length) {
        const [d, i] = pop()
        if (d > dist[i]) continue
        const c = i % cols
        const r = (i / cols) | 0
        for (const [dc, dr, cost] of steps) {
            const nc = c + dc
            const nr = r + dr
            if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue
            const j = nr * cols + nc
            if (!free[j]) continue
            if (dc && dr && (!free[r * cols + nc] || !free[nr * cols + c])) continue
            const nd = d + cost * GRID
            if (nd < dist[j]) {
                dist[j] = nd
                push([nd, j])
            }
        }
    }
    return {
        at(p, reach) {
            let best = Infinity
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const i = r * cols + c
                if (dist[i] === Infinity) continue
                if (Math.hypot(c * GRID + GRID / 2 - p.x, r * GRID + GRID / 2 - p.y) <= reach) best = Math.min(best, dist[i])
            }
            return best
        },
    }
}

export function validateMaps(maps: MapDef[]): string[] {
    const problems: string[] = []
    maps.forEach(map => {
        const at = `mapa ${map.id}`
        map.rocks.forEach((rock, i) => {
            const b = rockBounds(rock.blobs, map.h)
            if (b.w > MAX_ROCK || b.h > MAX_ROCK) problems.push(`${at}: pedra ${i} grande demais (${b.w}×${b.h})`)
        })
        if (!open(map, SUB.start.x, SUB.start.y)) problems.push(`${at}: o submarino nasce dentro da pedra`)
        const field = distances(map, SUB.start)
        map.slots.forEach((s, i) => {
            if (inside(map.solids, s.x, s.y - 60) || inside(map.solids, s.x, s.y - 120)) problems.push(`${at}: o lugar ${i} está enterrado`)
            if (s.y < map.floor - 10 && !inside(map.solids, s.x, s.y + 14)) problems.push(`${at}: o lugar ${i} flutua`)
            if (field.at({ x: s.x, y: s.y - 60 }, SUB.touch - 8) === Infinity) problems.push(`${at}: não dá para encostar no lugar ${i}`)
        })
        map.pickups.forEach((p, i) => {
            if (inside(map.solids, p.x, p.y, 30)) problems.push(`${at}: bolha ${i} dentro da pedra`)
            else if (field.at(p, 60) === Infinity) problems.push(`${at}: bolha ${i} inalcançável`)
        })
    })
    return problems
}

if (import.meta.env?.DEV) {
    const problems = validateMaps(Object.values(MAPS))
    if (problems.length) console.error('[mergulho-da-pesquisa]', problems)
}
