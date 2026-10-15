export const W = 1280
export const H = 720

export const GROUND = 604

export const DEPTH = {
    sky: 0,
    sun: 1,
    clouds: 2,
    strip: 4,
    box: 6,
    wet: 7,
    puddle: 8,
    hay: 9,
    crewBack: 10,
    rival: 11,
    beto: 12,
    kart: 14,
    crewFront: 16,
    fx: 20,
    rain: 30,
    header: 100,
    rule: 104,
    hud: 106,
    carts: 110,
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

export const RULE = {
    y: 48,
    h: 68,
    thenX: 522,
    elseX: 936,
    thenW: 468,
    elseW: 318,
    chipH: 40,
    icon: 54,
    tire: 50,
    bigX: 640,
    bigY: 330,
    bigScale: 1.5,
} as const

export const SKY = {
    h: 520,
    rect: { x: 640, y: 220, w: 1240, h: 236 },
} as const

export const SUN = { x: 1060, y: 168, size: 150 } as const

export const CLOUDS = [
    { x: 150, y: 150, s: 1 },
    { x: 420, y: 118, s: 0.8 },
    { x: 700, y: 170, s: 1.15 },
    { x: 960, y: 122, s: 0.9 },
    { x: 1190, y: 176, s: 0.85 },
] as const

export const CLOUD_SIZE = 230

export const STRIP = {
    y: 200,
    h: 520,
    w: 1280,
} as const

export const BOX = {
    x: 640,
    base: 502,
    w: 720,
} as const

export const LAP = {
    length: 3840,
    puddles: [960, 1900, 2800],
    puddleY: 608,
    puddleW: 200,
    crash: 960,
    slide: 330,
    hay: [1300, 2450],
    hayY: 700,
    haySize: 118,
} as const

export const KART = {
    x: 640,
    w: 330,
    cellW: 384,
    cellH: 256,
    rearFX: 0.245,
    frontFX: 0.79,
    axleFY: 0.8,
    wheelFR: 0.16,
    bottomFY: 0.96,
} as const

export const RIVAL = {
    ground: 552,
    scale: 0.82,
    fromX: 1460,
    toX: -360,
    startD: 500,
    endD: 3100,
} as const

export const CREW = {
    betoX: 340,
    luaX: 498,
    daviX: 790,
    idleFeet: 522,
    workFeet: GROUND + 12,
    betoH: 232,
    kidH: 176,
    workGap: 46,
} as const

export const CARTS = {
    y: 614,
    plateW: 206,
    plateH: 190,
    size: 168,
    artDY: -14,
    labelDY: 68,
    xs: [150, 1130],
} as const

export const BUBBLE = {
    w: 380,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 300,
    w: 920,
    h: 84,
} as const

export const CAMERA = {
    follow: 220,
    closeZoom: 1.6,
} as const
