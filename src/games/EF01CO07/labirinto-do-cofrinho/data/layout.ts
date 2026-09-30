import type { Point, Slot, Spot } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    field: 4,
    hedge: 10,
    magnet: 12,
    trail: 16,
    person: 20,
    vault: 22,
    bia: 30,
    balloon: 40,
    flying: 50,
    veil: 60,
    card: 62,
    sign: 64,
    hud: 100,
} as const

export const GRID = {
    x: 24,
    y: 100,
    cell: 88,
    cols: 11,
    rows: 7,
} as const

export const cellCenter = (s: Spot): Point => ({
    x: GRID.x + s.c * GRID.cell + GRID.cell / 2,
    y: GRID.y + s.r * GRID.cell + GRID.cell / 2,
})

export const cellAt = (x: number, y: number): Spot | null => {
    const c = Math.floor((x - GRID.x) / GRID.cell)
    const r = Math.floor((y - GRID.y) / GRID.cell)
    if (c < 0 || r < 0 || c >= GRID.cols || r >= GRID.rows) return null
    return { c, r }
}

export const spanRect = (spots: Spot[], grow = 0) => {
    const xs = spots.map(s => cellCenter(s).x)
    const ys = spots.map(s => cellCenter(s).y)
    const half = GRID.cell / 2 + grow
    const left = Math.min(...xs) - half
    const right = Math.max(...xs) + half
    const top = Math.min(...ys) - half
    const bottom = Math.max(...ys) + half
    return { x: (left + right) / 2, y: (top + bottom) / 2, w: right - left, h: bottom - top }
}

export const HUD = {
    pipsX: 120,
    pipsY: 44,
    pipGap: 40,
    pipR: 13,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const CLEARING = {
    x: 992,
    y: 100,
    w: 264,
    h: 616,
} as const

export const VAULT = {
    x: 1110,
    y: 386,
    w: 132,
    h: 128,
} as const

export const SLOTS: Record<Slot, Point> = {
    top: { x: 1110, y: 208 },
    bottom: { x: 1110, y: 566 },
}

export const PERSON = {
    h: 176,
    hitW: 200,
    hitH: 240,
    small: 0.5,
    enterX: 1360,
} as const

export const BIA = {
    h: 104,
    feet: 34,
    grab: GRID.cell * 1.3,
    stop: { x: 1000, y: 408 },
    trailGap: 18,
    trailMs: 800,
    stride: 24,
    bob: 6,
    tilt: 5,
    halo: { w: 70, h: 26 },
    shoulder: { x: 30, y: -54 },
} as const

export const BALLOON = {
    tipX: -60,
    tipY: -52,
    tail: 24,
    wrap: 330,
    font: 28,
    padX: 20,
    padY: 14,
    minW: 72,
    left: 12,
} as const

export const ROUTE = {
    reachAlpha: 0.42,
    reachInset: 6,
    line: 12,
    lineDY: 24,
    edge: 7,
    growMs: 260,
    ringW: 58,
    ringH: 22,
    pin: 13,
    pinLift: 14,
    cross: 16,
} as const

export const TRAP = {
    scale: 0.58,
    foot: 38,
    hit: 96,
} as const

export const GIFT = {
    card: 0.2,
    size: 40,
    side: 46,
    lift: 6,
} as const

export const CALLOUT = {
    side: 84,
    lift: 40,
    arrow: 22,
    ringW: 130,
    ringH: 40,
} as const

export const CHOOSE = {
    shot: { x: 900, y: 380, zoom: 1.2 },
    zoomMs: 800,
    prompt: 'Escolha a pessoa confiável',
    promptFont: 38,
    promptTop: 84,
} as const

export const THOUGHT = {
    dx: -206,
    dy: -34,
    smallBelow: 0.8,
    smallDX: -150,
    smallDY: -90,
} as const

export const CARD = {
    x: 640,
    y: 360,
    w: 420,
    h: 260,
    mini: 0.085,
} as const

export const MAGNET = {
    caught: 2.2,
    artH: 60,
    artDY: 14,
    gapY: -9,
    slot: 9,
    icon: 16,
    cardDX: 118,
    cardTop: 70,
} as const

export const INTRO = {
    walkY: 118,
    sideX: 1230,
    carerDX: 96,
    carerScale: 0.75,
    hugDX: 40,
    zoom: 2,
    lookUp: 30,
    zoomMs: 750,
    card: { dx: 120, dy: -60, screen: 0.72 },
    arcLift: 170,
    walkMs: 2400,
} as const

export const SIGN = {
    x: 640,
    y: 150,
} as const

export const FINALE = {
    cardY: 350,
    vaultY: 600,
    vaultScale: 0.9,
} as const
