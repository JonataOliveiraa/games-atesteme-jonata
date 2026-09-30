import type { Rect } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    machine: 10,
    hatch: 12,
    rooms: 20,
    rim: 22,
    roomFx: 24,
    present: 30,
    flying: 40,
    photos: 50,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 230,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const LINE = {
    left: 43,
    right: 658,
    top: 146,
    pegs: [162, 294, 434, 579],
    photoW: 70,
    photoH: 78,
    pic: 50,
} as const

const ROPE: [number, number][] = [
    [43, 142],
    [162, 194],
    [294, 210],
    [434, 210],
    [579, 190],
    [658, 140],
]

export const ropeY = (x: number): number => {
    const i = Math.max(1, ROPE.findIndex(([px]) => px >= x))
    const [x0, y0] = ROPE[i - 1]
    const [x1, y1] = ROPE[Math.min(i, ROPE.length - 1)]
    return x1 === x0 ? y0 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

export const MACHINE = {
    x: 210,
    foot: 702,
    scale: 0.44,
} as const

export const TABLE = {
    x: 521,
    top: 527,
    w: 290,
    h: 26,
} as const

export const GIFT = {
    x: TABLE.x,
    y: TABLE.top - 53,
    size: 160,
} as const

export const DEVICE = {
    x: TABLE.x,
    y: TABLE.top - 88,
    size: 180,
    roomScale: 0.42,
    roomDX: 64,
    roomY: 328,
} as const

export const PRESENT_HIT: Rect = { x: TABLE.x, y: TABLE.top - 84, w: 240, h: 230 }

export const ROOMS: [Rect, Rect] = [
    { x: 848.5, y: 427, w: 213, h: 282 },
    { x: 1116, y: 427, w: 214, h: 282 },
]

export const ROOM_HIT_PAD = 22

export const BOTH_ROOMS: Rect = { x: 982, y: 427, w: 482, h: 282 }

export const HOUSE = {
    left: 690,
    right: 1260,
    top: 110,
    eaves: 260,
    bottom: 700,
    floor: 680,
} as const

export const PERSON = {
    foot: 552,
    scale: 0.52,
} as const

