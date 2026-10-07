export const W = 1280
export const H = 720
export const FLOOR = 600

export const DEPTH = {
    bg: 0,
    trail: 4,
    platform: 6,
    piece: 8,
    robot: 10,
    plate: 12,
    box: 14,
    slingBack: 20,
    bandBack: 21,
    pouch: 22,
    cart: 23,
    slingFront: 24,
    bandFront: 25,
    dots: 26,
    lens: 40,
    fx: 30,
    balloon: 50,
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

export const SLING = { x: 262, scale: 0.9 } as const

export const LENS = { x: 150, y: 218, w: 250, h: 180, view: { w: 214, h: 140 } } as const

export const BOX = { x: 100, scale: 0.43, queueGap: 24 } as const

export const MAP = { left: 480, right: 1270, robotTop: 110, robotGap: 185 } as const

export const ROBOT = { scale: 0.7, catchPad: 14, jump: 90, bellyPop: 1.9 } as const

export const PLATE = { dy: 30, scale: 0.39 } as const

export const CART = { slingScale: 0.36, flyScale: 0.4, queueScale: 0.16 } as const

export const ZONE = { maxX: 600, minY: 100 } as const

export const FLIGHT = {
    gravity: 900,
    power: 8,
    maxPull: 150,
    minPull: 26,
    dt: 1 / 120,
    maxTime: 4,
    radius: 22,
    dotEvery: 7,
    timeScale: 1,
} as const

export const BALLOON = { h: 62, minW: 240 } as const

export const PANEL = { x: 640, y: 380, w: 900, h: 440 } as const
