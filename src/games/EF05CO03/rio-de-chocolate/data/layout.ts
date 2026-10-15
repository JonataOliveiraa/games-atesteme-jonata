export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    veil: 90,
    header: 100,
    hud: 106,
    sign: 110,
    bubble: 130,
    banner: 140,
} as const

export const WD = {
    river: 0,
    bank: 1,
    foam: 2,
    ring: 3,
    sweet: 10,
    mel: 40,
    fx: 50,
} as const

export const HEADER = {
    h: 96,
    dividers: [282, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 186,
    pipGap: 32,
    pipR: 11,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const SIGN = {
    x: 640,
    y: 48,
    maxW: 820,
    chipH: 58,
    chipPad: 16,
    pillW: 92,
    gap: 12,
    icon: 40,
    lead: 23,
    text: 27,
    badgeR: 19,
    bigY: 330,
    bigScale: 1.7,
    cardPad: 34,
} as const

export const STEP = 260
export const REST_X = 260
export const LANES = [285, 450, 615] as const
export const MID_LANE = 1

export const colX = (k: number) => REST_X + STEP * k

export const SWEET = {
    w: 170,
    small: 0.64,
    top: 0.37,
    hit: 156,
    hover: 1.05,
    ring: 1.18,
} as const

export const MEL = {
    h: 170,
    toe: 64,
    jump: 110,
} as const

export const BANK = {
    nearX: -260,
    nearW: 640,
    nearShore: 330,
    farGap: 120,
    farW: 1280,
    farShore: 40,
    party: { x: 560, y: 330 },
} as const

export const RIVER = {
    fromX: 150,
    flow: 22,
    tile: 256,
} as const

export const CAMERA = {
    closeZoom: 1.6,
    closeAt: { x: 470, y: 470 },
} as const

export const BUBBLE = {
    w: 380,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 164,
    w: 760,
    h: 84,
} as const
