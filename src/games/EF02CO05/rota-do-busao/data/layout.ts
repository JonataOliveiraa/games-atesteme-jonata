export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    marks: 2,
    scenery: 4,
    haze: 5,
    stop: 6,
    bus: 12,
    wheels: 13,
    focus: 16,
    stopFocus: 18,
    walker: 19,
    card: 20,
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
    pipGap: 34,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const STREET = {
    sidewalkTop: 499,
    sidewalkBottom: 580,
    roadTop: 588,
    dashY: 612,
    dashW: 64,
    dashGap: 70,
    dashH: 8,
    jointGap: 96,
    sceneryFoot: 504,
    sceneryScale: 0.85,
    haze: 0.42,
    sceneryGap: 36,
    sceneryLag: 0.5,
} as const

export const BUS = {
    left: 24,
    ground: 702,
    scale: 1.3,
    miniSize: 44,
} as const

export const STOP = {
    x: 985,
    foot: 545,
    scale: 1.45,
    travel: 1300,
    driveMs: 2600,
} as const

export const CARD = {
    x: STOP.x,
    y: 152,
    size: 184,
} as const

export const RIDER = {
    foot: 576,
    size: 150,
    slots: { 2: [-95, 90], 3: [-160, 0, 160] } as Record<2 | 3, number[]>,
    hitW: { 2: 170, 3: 150 } as Record<2 | 3, number>,
    nameSize: { 2: 17, 3: 15 } as Record<2 | 3, number>,
    hitTop: 400,
    hitBottom: 630,
    plateY: 602,
    plateH: 32,
} as const

export const BALLOON = {
    dy: -60,
    h: 64,
    minW: 260,
} as const

export const MAP = {
    x: 640,
    y: 384,
    w: 1060,
    h: 436,
    column: 168,
    pictureY: -82,
    pictureSize: 118,
    routeY: 18,
    riderY: 100,
    riderSize: 96,
    nameY: 158,
} as const
