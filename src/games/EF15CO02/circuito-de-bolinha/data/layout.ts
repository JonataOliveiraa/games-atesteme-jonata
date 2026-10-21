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
    cat: 7.5,
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

export const cellFor = (rows: number) => Math.min(CELL, Math.floor((TABLE.top - HEADER.h - 24) / rows))

export const TABLE = {
    cx: 520,
    top: 440,
    imageTop: 13,
    w: 720,
    h: 320,
} as const

export const RAMP = {
    groove: [
        { x: 0.081, y: 0.089 },
        { x: 0.177, y: 0.208 },
        { x: 0.306, y: 0.339 },
        { x: 0.435, y: 0.452 },
        { x: 0.565, y: 0.565 },
        { x: 0.694, y: 0.685 },
        { x: 0.823, y: 0.81 },
        { x: 0.935, y: 0.833 },
    ],
    sink: 0.75,
} as const

export const BELL = {
    h: 92,
    cup: { x: -0.32, y: 0.18 },
} as const

export const MARBLE = { r: 15 } as const

export const CAT = {
    w: 0.95,
    out: 0.18,
    head: 0.62,
    enterX: 1380,
    bob: 5,
} as const

export const GHOST = {
    rim: 7,
    rimAlpha: 0.9,
    fillAlpha: 0.92,
    choiceAlpha: 0.95,
    ask: 64,
} as const

export const NICO = {
    x: 105,
    y: 534,
    h: 250,
    hands: { x: 80, y: -154 },
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
    inner: { w: 146, h: 88, y: 4 },
    hover: 1.04,
    pulse: 6,
    stamp: { x: 58, y: -34, r: 21 },
} as const

export const MINI = {
    rim: 2,
    rimAlpha: 0.6,
    pop: 1.12,
} as const

export const IF = {
    w: 264,
    h: 132,
    word: { x: 0, y: -44 },
    photo: { y: -112, w: 210, h: 96, angle: -3 },
    pockets: { yes: 0.275, no: 0.725 },
    pocketY: 0.64,
    scale: 0.6,
    labelY: 77,
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

const SLOTS_LEFT = 16
const SLOTS_RIGHT = BUILD.x - BUILD.w / 2 - 14

export function slotXs(widths: number[]) {
    const sum = widths.reduce((a, b) => a + b, 0)
    const room = SLOTS_RIGHT - SLOTS_LEFT
    const gap = widths.length > 1 ? Math.min(MANUAL.gap, (room - sum) / (widths.length - 1)) : 0
    const total = sum + gap * (widths.length - 1)
    let x = Math.min(Math.max(MANUAL.slotCx - total / 2, SLOTS_LEFT), SLOTS_RIGHT - total)
    return widths.map(w => {
        const center = x + w / 2
        x += w + gap
        return center
    })
}

export const trayPos = (i: number) => ({ x: TRAY.cols[i % 2], y: TRAY.rows[Math.floor(i / 2)] })
