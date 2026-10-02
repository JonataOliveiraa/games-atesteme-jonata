export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    belt: 4,
    zone: 6,
    toys: 10,
    tunnel: 14,
    boxBack: 16,
    boxToys: 17,
    boxFront: 18,
    stamp: 30,
    marks: 40,
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

export const BELT = {
    left: 107,
    right: 1004,
    top: 492,
    h: 62,
    roller: 27,
    slat: 64,
    fadeIn: 200,
    fadeOut: 900,
    fade: 60,
    wrap: 1100,
} as const

export const TUNNEL = {
    w: 110,
    top: 388,
    bottom: 594,
    leftX: 78,
    rightX: 1030,
} as const

export const ZONE = {
    x: 638,
    top: 330,
    bottom: 570,
} as const

export const STAMP = {
    x: ZONE.x,
    scale: 0.78,
    upTop: 66,
    hiddenTop: -320,
    rodTop: 128,
    rodW: 14,
    pressMs: 260,
    liftMs: 300,
} as const

export const BOX = {
    x: 1182,
    base: 575,
    scale: 0.58,
    toyLift: 28,
    toyGap: 46,
    toyScale: 0.8,
    dotsY: -27,
    dotGap: 34,
    dotR: 11,
} as const

export const BALLOON = {
    w: 300,
    h: 66,
    dy: 130,
} as const

export const SIGN = {
    x: 640,
    y: 150,
} as const

export const FINALE = {
    y: 400,
    gap: 400,
    w: 360,
    h: 300,
} as const

export const NOTE = {
    x: 185,
    y: 290,
    w: 250,
    h: 290,
    drawing: 1.25,
} as const

export const CHIPS = {
    x: 638,
    y: 440,
    gap: 178,
    w: 160,
    h: 124,
} as const

export const TOY = {
    unit: 150,
    antennaH: 52,
} as const
