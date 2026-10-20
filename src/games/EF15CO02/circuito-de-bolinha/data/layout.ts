export const W = 1280
export const H = 720

export const DEPTH = {
    stage: 0,
    manual: 50,
    slotBadge: 58,
    card: 60,
    cardFlying: 70,
    build: 62,
    header: 100,
    hud: 106,
    tap: 120,
    bubble: 130,
    banner: 140,
} as const

export const SD = {
    room: 0,
    veil: 1,
    table: 2,
    ghost: 3,
    bell: 4,
    piece: 5,
    box: 6,
    nico: 7,
    marble: 8,
    fx: 9,
} as const

export const HEADER = {
    h: 96,
    dividers: [300, 1140],
    lift: 120,
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
    titleX: 720,
    titleMaxW: 800,
} as const

export const CELL = 100

export const TABLE = {
    cx: 520,
    top: 440,
    imageTop: 13,
    w: 720,
    h: 320,
} as const

export const RAMP = {
    hi: { x: 0.06, y: 0.05 },
    lo: { x: 0.95, y: 0.79 },
} as const

export const BELL = {
    h: 92,
    cup: { x: -0.31, y: 0.11 },
} as const

export const MARBLE = { r: 15 } as const

export const GHOST = {
    rim: 4,
    rimAlpha: 0.4,
    fillAlpha: 0.75,
} as const

export const NICO = {
    x: 105,
    y: 534,
    h: 250,
    hands: { x: 78, y: -150 },
    head: { x: 20, y: -200 },
} as const

export const BOX = {
    x: 262,
    w: 150,
    held: { x: 70, y: -95 },
} as const

export const CARD = {
    w: 168,
    h: 116,
    inner: { w: 140, h: 76, y: 6 },
    hover: 1.04,
    pulse: 6,
} as const

export const TRAY = {
    cols: [970, 1150],
    rows: [180, 310, 440],
    rect: { x: 1060, y: 310, w: 376, h: 408 },
} as const

export const MANUAL = {
    y: 540,
    h: 180,
    slotY: 628,
    slotCx: 495,
    gap: 16,
    badgeR: 15,
    lift: 14,
} as const

export const BUILD = {
    x: 1120,
    y: 628,
    w: 220,
    h: 120,
    textX: 34,
} as const

export const STAGE = {
    closeZoom: 1.7,
    closeAt: { x: 420, y: 440 },
} as const

export const BUBBLE = {
    w: 360,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 110,
    w: 800,
    h: 84,
} as const

export const slotX = (count: number, i: number) => MANUAL.slotCx + (i - (count - 1) / 2) * (CARD.w + MANUAL.gap)

export const trayPos = (i: number) => ({ x: TRAY.cols[i % 2], y: TRAY.rows[Math.floor(i / 2)] })
