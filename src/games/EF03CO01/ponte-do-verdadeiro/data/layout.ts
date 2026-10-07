import { ART } from './files'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    deck: 5,
    chain: 6,
    lock: 8,
    castor: 10,
    lever: 12,
    glow: 18,
    critters: 20,
    fx: 30,
    sign: 40,
    balloon: 50,
    veil: 70,
    hand: 72,
    finale: 80,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
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

export const GROUND_Y = 612

export const DECK = { hingeX: 930, hingeY: 622, scale: 0.49, raised: 80, jam: 38 } as const

export const RING = {
    x: (ART.deck.ring.x - ART.deck.hinge.x) * DECK.scale,
    y: (ART.deck.ring.y - ART.deck.hinge.y) * DECK.scale,
} as const

export const PULLEY = { x: 997, y: 285, r: 31 } as const

export const LOCK = { x: DECK.hingeX + 6, y: DECK.hingeY - 34, scale: 0.36 } as const

export const SIGN = { x: 410, y: 222, scale: 0.92, textSize: 40, padX: 34 } as const

export const SIGN_FACE = {
    w: (ART.sign.face.right - ART.sign.face.x) * SIGN.scale,
    h: (ART.sign.face.bottom - ART.sign.face.y) * SIGN.scale,
} as const

export const CRITTER = {
    xs: [105, 290, 475],
    footY: 618,
    scale: 0.74,
    hit: { w: 160, h: 200, dy: -95 },
} as const

export const CROSS = { exitX: 1420, speed: 640, hop: 18, hopMs: 170, stagger: 160, hold: 1500 } as const

export const LEVER = {
    x: 1062,
    footY: 616,
    scale: 0.5,
    rim: 7,
    rimSteps: 16,
    hit: { x: 1062, y: 560, w: 170, h: 230 },
    labelY: 656,
} as const

export const CASTOR = { x: 1192, footY: 616, scale: 0.6 } as const

export const BALLOON = { h: 62, minW: 240, at: { x: 1150, y: 410 } } as const

export const BOARD = { x: 640, y: 392, w: 880, h: 500, row: 88, cardW: 760 } as const
