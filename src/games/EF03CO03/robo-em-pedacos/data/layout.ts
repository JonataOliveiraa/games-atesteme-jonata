export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    ghost: 6,
    pallet: 8,
    module: 12,
    robot: 14,
    plug: 16,
    nina: 18,
    fx: 30,
    balloon: 50,
    veil: 60,
    bench: 62,
    benchPart: 64,
    benchPoint: 66,
    tool: 68,
    coach: 72,
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

export const LIFT = { x: 421, top: 492, left: 122, right: 721, floor: 540 } as const

export const ROBOT = { scale: 0.6 } as const

export const PALLETS = {
    slots: [
        { x: 772, y: 652 },
        { x: 914, y: 652 },
        { x: 1056, y: 652 },
        { x: 1198, y: 652 },
    ],
    w: 132,
    h: 26,
    moduleScale: 0.5,
    hit: { w: 140, h: 200 },
    tagDY: 34,
} as const

export const PLUG = { x: 790, y: 420, scale: 0.46, hit: 120 } as const

export const NINA_SPOT = { x: 100, footY: 710, scale: 0.6 } as const

export const BENCH = {
    x: 640,
    y: 400,
    w: 900,
    h: 540,
    moduleX: 640,
    moduleY: 604,
    moduleScale: 1.5,
    pointScale: 0.62,
    pointHit: 116,
    tagY: 160,
} as const

export const BALLOON = { h: 62, minW: 240 } as const

export const PANEL = { x: 640, y: 370, w: 980, h: 480 } as const
