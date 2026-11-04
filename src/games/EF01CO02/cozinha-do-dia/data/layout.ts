import type { DishId, ObjectId, Vec } from '../types'
import { C } from './theme'

export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    stain: 6,
    dish: 10,
    bench: 12,
    recipe: 14,
    flyer: 18,
    fx: 22,
    zones: 40,
    header: 100,
    hud: 106,
    banner: 140,
    dot: 160,
} as const

export const HEADER = { h: 72, lift: 96, liftTime: 240 } as const

export const HUD = {
    y: 36,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 192,
    pipGap: 34,
    pipR: 11,
    helpX: 1226,
    helpY: 36,
    helpR: 28,
    helpHit: 96,
    livesX: 1100,
    livesY: 36,
    livesSize: 30,
} as const

export const COUNTER = { y: 385, top: 400, edge: 665 } as const

export const CLOSE = { scale: 1.9, x: 0, y: -115 } as const

export const CLIENT = {
    x: 190,
    y: 408,
    h: 340,
    hop: 18,
    enterX: -200,
    headY: 208,
    serveX: 330,
    serveY: 486,
} as const

export const THOUGHT = {
    x: 380,
    y: 185,
    goalDX: 10,
    goalDY: -20,
    goal: {
        cereal: { size: 165, focus: 0.68 },
        hotdog: { size: 165, focus: 0.78 },
        smoothie: { size: 180, focus: 0.52 },
        sandwich: { size: 165, focus: 0.72 },
        sundae: { size: 150, focus: 0.5 },
        pave: { size: 165, focus: 0.58 },
    } satisfies Record<DishId, { size: number; focus: number }>,
} as const

export const RECIPE = {
    x: 800,
    y: 142,
    cardW: 118,
    cardH: 100,
    gap: 40,
    icon: 66,
    lit: 1.12,
    dim: 0.3,
    wide: { from: 5, scale: 0.8, x: 810 },
    offerX: 806,
    offerY: [144, 294],
    offerPad: 14,
} as const

export const DISH = {
    x: 640,
    y: 490,
    size: 290,
    mouth: { cereal: 180, hotdog: 222, smoothie: 62, sandwich: 216, sundae: 146, pave: 250 } satisfies Record<DishId, number>,
    stack: {
        board: 232,
        tray: 258,
        'cup-1': 92,
        'cup-1s': 92,
        'cup-2': 36,
        dish: 268,
        'pave-1c': 218,
        'pave-2': 188,
        'pave-2c': 150,
    } as Record<string, number>,
    hover: {
        cereal: { x: 112, y: -84 },
        hotdog: { x: 112, y: -84 },
        smoothie: { x: 142, y: -30 },
        sandwich: { x: 112, y: -84 },
        sundae: { x: 132, y: -40 },
        pave: { x: 112, y: -84 },
    } satisfies Record<DishId, Vec>,
    hoverTilt: -112,
    nozzleDX: -66,
    nozzleDY: 26,
    fill: {
        'bowl-cereal': { mode: 'rise', from: 0.66, to: 0.36 },
        'bowl-full': { mode: 'fade', from: 0, to: 1 },
        hotdog: { mode: 'wipe', from: 0.16, to: 0.84 },
        'jar-full': { mode: 'rise', from: 0.72, to: 0.46 },
        'sand-3': { mode: 'wipe', from: 0.2, to: 0.8 },
        'cup-1s': { mode: 'drip', from: 0.2, to: 0.46 },
        'cup-2s': { mode: 'drip', from: 0.05, to: 0.27 },
        'pave-1c': { mode: 'wipe', from: 0.14, to: 0.87 },
        'pave-2c': { mode: 'wipe', from: 0.14, to: 0.87 },
    } satisfies Record<string, { mode: 'fade' | 'wipe' | 'rise' | 'drip'; from: number; to: number }>,
} as const

export const POUR = {
    startX: 58,
    startY: { cereal: -92, hotdog: -92, smoothie: -74, sandwich: -92, sundae: -80, pave: -92 } satisfies Record<DishId, number>,
    half: { cereal: 78, hotdog: 88, smoothie: 62, sandwich: 84, sundae: 54, pave: 88 } satisfies Record<DishId, number>,
    reachLeft: 300,
    reachRight: 320,
    nose: 62,
    tiltOn: -112,
    tiltOff: -38,
    tiltWobble: 7,
    flowFrom: -78,
    swayShare: 1.05,
    rampTime: 0.9,
    gravity: 1500,
    dropSpeed: 70,
    spread: 26,
    floorNear: 46,
    floorFar: 92,
    maxStains: 16,
    wince: 360,
    dripEvery: 170,
    soundEvery: 320,
    demoFree: 1.3,
    demoMin: 2.2,
    demoUntil: 0.4,
    fingerDY: 0,
    spotDY: 80,
    spotW: 460,
    spotH: 400,
    material: {
        cereal: { color: C.cereal, size: 22, every: 70, drops: 40, solid: true },
        milk: { color: C.milk, size: 17, every: 42, drops: 66, solid: false },
        ketchup: { color: C.ketchup, size: 15, every: 46, drops: 58, solid: false },
        syrup: { color: C.syrup, size: 15, every: 46, drops: 44, solid: false },
        cream: { color: C.cream2, size: 17, every: 46, drops: 44, solid: false },
    } as Record<ObjectId, { color: number; size: number; every: number; drops: number; solid: boolean }>,
} as const

export const FOCUS = {
    reach: 1.7,
    fade: 320,
    followShare: 0.08,
    pour: { y: 340, r: 270, strength: 0.5 },
    meal: { dx: 50, y: 300, r: 230, strength: 0.72 },
} as const

export const BENCH = {
    y: 584,
    slots: [360, 640, 920],
    padW: 190,
    padH: 156,
    object: 128,
    hitW: 210,
    hitH: 176,
    button: 74,
    buttonY: 444,
    buttonHit: 124,
} as const

export const BANNER = {
    x: 640,
    y: 680,
    w: 620,
    h: 72,
} as const

export const PARADE = { xs: [300, 640, 980], y: 408 } as const
