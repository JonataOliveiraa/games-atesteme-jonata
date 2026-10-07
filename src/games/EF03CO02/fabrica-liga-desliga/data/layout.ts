export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    glow: 3,
    belt: 4,
    ovenBack: 5.5,
    items: 6,
    oven: 10,
    tray: 12,
    switch: 20,
    card: 22,
    fx: 30,
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

export const VIEW = {
    scale: 0.81,
    x: -46,
    y: 0,
} as const

export const CARD = {
    x: 640,
    y: 118,
    w: 680,
    h: 100,
    icon: 34,
} as const

export const FLOOR = {
    y: 559,
} as const

export const FUNNEL = {
    x: 151,
    mouth: 429,
} as const

export const BELT = {
    left: 76,
    right: 1039,
    top: 463,
    h: 19,
    slat: 38,
    dropX: 151,
    itemBottom: 465,
    itemSize: 62,
    hubs: [
        { x: 77, y: 502 },
        { x: 1026, y: 502 },
    ],
    hubR: 11,
} as const

export const OVEN = {
    x: 640,
    top: 191,
    scale: 0.72,
    bakeX: 640,
    exitX: 842,
} as const

export const TRAY = {
    x: 1180,
    bottom: 497,
    w: 200,
    cols: 3,
    slotGap: 54,
    rowGap: 22,
    cookie: 42,
    counterY: 386,
} as const

export const CHEF = {
    x: 1124,
    y: 292,
    size: 150,
} as const

export const SWITCH = {
    x: 640,
    bottom: 690,
    y: 622,
    scale: 0.66,
    hitW: 320,
    hitH: 180,
} as const

export const BALLOON = {
    x: 640,
    y: 200,
    h: 64,
    minW: 300,
} as const

export const BOARD = {
    x: 640,
    y: 384,
    w: 1060,
    h: 470,
    barLeft: -330,
    barW: 760,
    barH: 30,
    rowGap: 44,
    phaseGap: 120,
} as const
