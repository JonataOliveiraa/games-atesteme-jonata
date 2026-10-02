export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    track: 4,
    blade: 8,
    trainBack: 12,
    cargo: 14,
    trainFront: 16,
    item: 30,
    plate: 32,
    balloon: 50,
    finale: 60,
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

export const FUNNEL = {
    x: 640,
    top: 30,
    mouth: 145,
    w: 190,
} as const

export const SWITCH = {
    x: 640,
    y: 320,
    turn: 34,
    bladeH: 90,
    arrowDX: 150,
    arrowDY: 72,
} as const

export const ITEM = {
    waitX: 640,
    waitY: 226,
    size: 165,
    cargoScale: 0.42,
    dropMs: 1000,
    slideMs: 520,
} as const

export const PLATE = {
    x: 640,
    y: 388,
    h: 46,
    pad: 26,
} as const

export const RAIL = {
    y: 660,
} as const

export const WAGON = {
    xs: { left: 383, right: 896 },
    w: 280,
    h: 138,
    top: 522,
    frontTop: 553,
    mouthY: 475,
    rest: 536,
    wheelR: 15,
} as const

export const ENGINE = {
    x: 1161,
    h: 175,
} as const

export const TRAIN = {
    enterFrom: -1300,
    leaveTo: 1500,
    enterMs: 1400,
    leaveMs: 1700,
} as const

export const BALLOON = {
    dy: -150,
    h: 64,
    minW: 280,
} as const

export const FINALE = {
    left: 470,
    right: 810,
    y: 300,
    board: { x: 640, y: 380, w: 960, h: 420 },
} as const
