export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    beam: 8,
    school: 10,
    line: 20,
    boat: 30,
    sail: 32,
    bucket: 34,
    board: 40,
    caught: 46,
    tokens: 60,
    sign: 62,
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

export const WATER = {
    y: 354,
} as const

export const BOAT = {
    x: 530,
    y: 368,
    scale: 0.9,
    cell: 512,
    waterline: 457,
} as const

export const SAIL = {
    x: 338,
    y: 54,
    w: 190,
    h: 212,
    rowH: 62,
    drum: 32,
    mark: 36,
} as const

export const ROD_TIP = { x: 748, y: 187 } as const

export const BEAM = {
    x: ROD_TIP.x,
    top: WATER.y + 14,
    bottom: H,
    spread: 40,
} as const

export const SCHOOL = {
    y: 560,
    minX: -90,
    firstGap: 120,
    enterFrom: 620,
    enterMs: 1300,
    leaveBy: 900,
    leaveMs: 800,
    bob: 5,
    flapMs: 280,
} as const

export const FISH = {
    w: 160,
    h: 104,
    mouthX: 76,
    mark: 44,
    aura: 88,
} as const

export const HOOK = {
    restY: 330,
    size: 48,
    dropMs: 350,
    emptyMs: 600,
    reelY: 280,
    reelMs: 700,
} as const

export const BOARD = {
    x: 950,
    y: 185,
    w: 300,
    h: 224,
    drum: 64,
    drumGap: 8,
    ropeTop: 0,
    dropFrom: -260,
    beatMs: 450,
    hit: 20,
} as const

export const PIER = {
    x: 1038,
    y: 313,
    w: 250,
    h: 22,
} as const

export const BUCKET = {
    x: 1165,
    y: 322,
    w: 120,
    h: 112,
} as const

export const SIGN = {
    x: 640,
    y: 200,
} as const

export const TOKENS = {
    y: 380,
    gap: 200,
    w: 184,
    h: 104,
    drum: 34,
    mark: 40,
} as const
