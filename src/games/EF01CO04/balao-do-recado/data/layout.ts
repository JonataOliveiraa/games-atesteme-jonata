import type { Point, SceneId } from '../types'

export const W = 1280
export const H = 720

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 222,
    pipsY: 44,
    pipGap: 40,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const CARD = {
    cx: 640,
    cy: 60,
    w: 560,
    h: 88,
    art: 72,
    gap: 20,
} as const

export const BAND = {
    top: 140,
    bottom: 545,
} as const

export const BALLOON = {
    x: 330,
    cell: 512,
    scale: 0.42,
    centerY: 256.5,
    hooks: [
        { x: 174, y: 398 },
        { x: 170, y: 397 },
        { x: 172, y: 398 },
        { x: 209, y: 406 },
    ],
    basketX: 330,
    basketY: 440,
    string: 46,
    message: 72,
    hitR: 58,
} as const

export const RING = {
    cell: 320,
    scale: 1.41,
    holeY: 168,
    rx: 100,
    ry: 138,
    outlineY: 160,
    lightMs: 420,
    dottedMs: 2000,
} as const

const NEAR = { x: 800, scale: 0.75, sink: 0, haze: null }
const HOUSE = { x: 1050, scale: 0.8, sink: 0, haze: null }
const FAR = { x: 1150, scale: 0.5, sink: 40, haze: 0xdce9f6 }
const HOUSE_TARGET = { x: 245, y: 367 }
const HOUSE_FACE = { x: 143, y: 380 }
const HOUSE_REACH = { x: 8, y: 41, w: 498, h: 471 }
const HOUSE_FOCUS = { x: 200, y: 330 }

type Place = { x: number; scale: number; sink: number; haze: number | null }
type Box = { x: number; y: number; w: number; h: number }

export const WINDOW = {
    bottom: H,
    enterFrom: 1600,
    enterMs: 900,
    place: {
        'friend-near': NEAR,
        'neighbor-away': HOUSE,
        'neighbor-away-phone': HOUSE,
        'grandma-far': FAR,
        'grandma-near': NEAR,
        'friend-far': FAR,
        'neighbor-asleep': HOUSE,
    } as Record<SceneId, Place>,
    away: { x: 143, y: 332, size: 110, tint: 0xa3aac4 },
    zzz: { x: 330, y: 150 },
    targets: {
        'friend-near': { x: 165, y: 224 },
        'neighbor-away': HOUSE_TARGET,
        'neighbor-away-phone': HOUSE_TARGET,
        'grandma-far': { x: 363, y: 251 },
        'grandma-near': { x: 190, y: 230 },
        'friend-far': { x: 320, y: 260 },
        'neighbor-asleep': HOUSE_TARGET,
    } as Record<SceneId, Point>,
    faces: {
        'friend-near': { x: 265, y: 270 },
        'neighbor-away': HOUSE_FACE,
        'neighbor-away-phone': HOUSE_FACE,
        'grandma-far': { x: 345, y: 245 },
        'grandma-near': { x: 256, y: 250 },
        'friend-far': { x: 320, y: 250 },
        'neighbor-asleep': { x: 330, y: 170 },
    } as Record<SceneId, Point>,
    reach: {
        'friend-near': { x: 37, y: 45, w: 442, h: 467 },
        'neighbor-away': HOUSE_REACH,
        'neighbor-away-phone': HOUSE_REACH,
        'grandma-far': { x: 166, y: 110, w: 250, h: 220 },
        'grandma-near': { x: 37, y: 45, w: 442, h: 467 },
        'friend-far': { x: 200, y: 190, w: 220, h: 170 },
        'neighbor-asleep': HOUSE_REACH,
    } as Record<SceneId, Box>,
    focus: {
        'friend-near': { x: 265, y: 250 },
        'neighbor-away': HOUSE_FOCUS,
        'neighbor-away-phone': HOUSE_FOCUS,
        'grandma-far': { x: 291, y: 220 },
        'grandma-near': { x: 256, y: 260 },
        'friend-far': { x: 310, y: 270 },
        'neighbor-asleep': HOUSE_FOCUS,
    } as Record<SceneId, Point>,
} as const

export const CHOICE = {
    x: 505,
    ys: [255, 470],
    sets: {
        2: { card: 190, art: 160, ys: [255, 470] },
        3: { card: 148, art: 124, ys: [228, 386, 544] },
    } as Record<number, { card: number; art: number; ys: number[] }>,
    splitMs: 560,
    flyShrink: 0.76,
    card: 190,
    art: 160,
    flyMs: 620,
} as const

export const MURAL = {
    cx: 640,
    cy: 390,
    w: 900,
    h: 540,
    xs: [400, 640, 880],
    noteY: 400,
    noteW: 200,
    noteH: 250,
    noteArt: 96,
    noteArtX: -12,
    stamp: 30,
    stampX: 70,
    stampY: -88,
    dropMs: 620,
} as const

export const DEPTH = {
    sky: 0,
    window: 10,
    ringBack: 20,
    balloon: 30,
    ringFront: 40,
    choice: 50,
    flying: 55,
    mural: 60,
    card: 90,
    hud: 100,
} as const

export const FORM_SLOT = {
    voice: { x: 249.5, y: 172, size: 66 },
    letter: { x: 160, y: 118, size: 92 },
    screen: { x: 152, y: 158, size: 104 },
} as const

export const ARRIVAL = {
    peekZoom: 1.6,
    focusZoom: {
        'friend-near': 1.6,
        'neighbor-away': 1.9,
        'neighbor-away-phone': 1.9,
        'grandma-far': 5.5,
        'grandma-near': 1.6,
        'friend-far': 5.5,
        'neighbor-asleep': 1.9,
    } as Record<SceneId, number>,
    zoomInMs: 500,
    moveMs: 700,
    holdMs: 1200,
    dottedMs: 1500,
    askDx: -46,
    askDy: -104,
    askR: 30,
} as const

export const DELIVERY = {
    mouth: { x: 290, y: 348 },
    tablet: { x: 277, y: 378.5, w: 54, h: 31 },
    wavesMs: 1300,
    signalMs: 1300,
    mailboxSize: 64,
    mailboxDy: 0,
    sunX: 960,
    sunY: 190,
    sun: 120,
    dayMs: 650,
    nightAlpha: 0.32,
    call: { w: 150, h: 110, dx: -150, dy: -170, selfDx: 150, selfDy: -140 },
    callHoldMs: 1600,
    thought: 190,
    thoughtArt: 64,
    thoughtSlot: { x: 140, y: 121.5 },
    thoughtCell: 256,
    thoughtAt: {
        'friend-near': { dx: -92, dy: -174 },
        'neighbor-away': { dx: -201, dy: -134 },
        'neighbor-away-phone': { dx: -201, dy: -134 },
        'grandma-far': { dx: -143, dy: -160 },
        'grandma-near': { dx: -92, dy: -174 },
        'friend-far': { dx: -143, dy: -160 },
        'neighbor-asleep': { dx: -201, dy: -134 },
    } as Record<SceneId, { dx: number; dy: number }>,
    thoughtHoldMs: 1000,
    thoughtFadeMs: 3400,
} as const

export const VOICE = {
    radius: 750,
    margin: 30,
    waves: 5,
    waveGap: 170,
    growMs: 1400,
    dash: 26,
} as const

const CELL = 512

export function cellToScreen(scene: SceneId, p: Point): Point {
    const { x, scale, sink } = WINDOW.place[scene]
    return { x: x + (p.x - CELL / 2) * scale, y: WINDOW.bottom + sink - (CELL - p.y) * scale }
}

export function targetOf(scene: SceneId): Point {
    return cellToScreen(scene, WINDOW.targets[scene])
}

export function faceOf(scene: SceneId): Point {
    return cellToScreen(scene, WINDOW.faces[scene])
}

export function focusOf(scene: SceneId): Point {
    return cellToScreen(scene, WINDOW.focus[scene])
}

export function reachBox(scene: SceneId): { x: number; y: number; w: number; h: number } {
    const box = WINDOW.reach[scene]
    const { scale } = WINDOW.place[scene]
    const corner = cellToScreen(scene, box)
    return { x: corner.x, y: corner.y, w: box.w * scale, h: box.h * scale }
}

export function voiceOrigin(balloonY: number): Point {
    return {
        x: BALLOON.x + (DELIVERY.mouth.x - BALLOON.cell / 2) * BALLOON.scale,
        y: balloonY + (DELIVERY.mouth.y - BALLOON.centerY) * BALLOON.scale,
    }
}

export const CAPTION = {
    x: 640,
    y: 126,
    h: 50,
    pad: 28,
    maxW: 620,
    size: 28,
} as const

export const BIRD = {
    size: 110,
    hitRadius: 42,
    flapMs: 180,
} as const
