export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    stars: 1,
    far: 2,
    mid: 3,
    near: 4,
    platform: 10,
    summit: 11,
    item: 14,
    phone: 18,
    fx: 26,
    panel: 40,
    pad: 44,
    alarm: 60,
    card: 90,
    header: 100,
    hud: 106,
    zoom: 120,
    caption: 140,
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
    askX: 716,
    askW: 820,
} as const

export const COLUMN = { left: 250, right: 1030, w: 780, x: 640 } as const

export const CAMERA = {
    anchor: 440,
    start: H - 40,
    respawn: H - 190,
    fall: 80,
    follow: 0.18,
    peek: 320,
} as const

export const PAD = {
    size: 150,
    y: 600,
    leftX: 125,
    rightX: 1155,
} as const

export const PLATFORM = {
    h: 46,
    cap: 48,
    cellW: 384,
    cellH: 72,
    surface: 8,
} as const

export const ITEM = {
    size: 118,
    lift: 86,
    reach: 74,
    warn: 150,
} as const

export const CARD = {
    x: 640,
    top: 112,
    w: 860,
    h: 588,
    barY: 152,
    bodyY: 200,
    bodyH: 136,
    rowY: 384,
    rowGap: 66,
    rowH: 58,
    rowW: 800,
    buttonY: 640,
    buttonW: 360,
    buttonH: 92,
    buttonGap: 400,
    photoW: 216,
    photoH: 140,
    badgeR: 22,
} as const

export const ZOOM = { x: 640, y: 372, w: 900, h: 585, frame: 16, closeR: 38 } as const

export const CAPTION = { x: 640, y: 170 } as const

export const MISS = { x: 640, y: 380 } as const
