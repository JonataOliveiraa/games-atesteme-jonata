export const W = 1280
export const H = 720

export const FLOOR = 690

export const DEPTH = {
    backdrop: 0,
    chef: 4,
    sill: 5,
    customer: 8,
    counter: 9,
    shadow: 10,
    helper: 20,
    stack: 22,
    drop: 30,
    fx: 34,
    header: 100,
    recipe: 104,
    hud: 106,
    controls: 110,
    bubble: 130,
    banner: 140,
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

export const RECIPE = {
    x: 716,
    y: 50,
    cardW: 84,
    cardH: 80,
    gap: 12,
    icon: 54,
    bigX: 640,
    bigY: 330,
    bigScale: 2,
} as const

export const HELPER = {
    height: 240,
    hands: 222,
    minX: 170,
    maxX: 900,
    speed: 520,
    accel: 3200,
    stride: 34,
    start: 600,
} as const

export const TRAY = {
    w: 210,
    catchHalf: 98,
} as const

export const LAYER = {
    w: 176,
    overlap: 0.8,
} as const

export const LANES = [200, 375, 550, 725, 900] as const

export const CHEF = {
    x: 650,
    y: 236,
    height: 150,
    window: { x: 405, y: 96, w: 495, h: 112 },
    sill: { x: 356, y: 206, w: 594, h: 30 },
} as const

export const TOSS = {
    fromY: 196,
    topY: 132,
} as const

export const COUNTER = {
    x: 1120,
    top: 410,
    customerX: 1120,
    customerY: 560,
    customerH: 370,
    serveX: 880,
} as const

export const CONTROLS = {
    leftX: 78,
    rightX: 1202,
    y: 648,
    r: 56,
} as const

export const BUBBLE = {
    w: 360,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 650,
    w: 860,
    h: 84,
} as const

export const CAMERA = {
    follow: 220,
    closeZoom: 1.55,
} as const
