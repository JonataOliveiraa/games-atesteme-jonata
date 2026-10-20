export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    ground: 2,
    prop: 5,
    night: 20,
    glow: 22,
    person: 23,
    rain: 25,
    fog: 27,
    drops: 28,
    wiper: 30,
    pillar: 32,
    fx: 38,
    dash: 40,
    wheel: 42,
    console: 44,
    key: 45,
    flight: 50,
    header: 100,
    hud: 106,
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
    pipGap: 30,
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
    askH: 84,
} as const

export const ROAD = {
    horizon: 300,
    bottom: 720,
    half: 820,
    far: 30,
    near: 0.75,
    dashEvery: 2.2,
    dashLen: 1.1,
    edge: 0.06,
    line: 0.035,
} as const

export const SIDE = {
    pole: 1.3,
    tree: 2.1,
    bush: 1.6,
    house: 2.3,
    pine: 2.0,
    tower: 2.3,
} as const

export const SCALE = {
    pole: 1.45,
    tree: 1.5,
    bush: 1.1,
    house: 2.05,
    dog: 1.25,
    cida: 1.6,
    cow: 1.3,
    pine: 1.75,
    sign: 1.05,
    tower: 2.6,
    barrier: 1.15,
    tow: 1.35,
} as const

export const STOP = {
    dog: 3.1,
    house: 4.4,
    cow: 3.3,
    fork: 3.2,
    barrier: 3.3,
    mud: 0.4,
} as const

export const GLASS = {
    top: HEADER.h,
    bottom: 556,
} as const

export const BEAM = {
    nearL: 200,
    nearR: 1080,
    farL: 598,
    farR: 682,
    farY: ROAD.horizon + 14,
    soft: 110,
} as const

export const DASH = {
    y: 520,
    h: 200,
    lip: 30,
} as const

export const WHEEL = {
    x: 228,
    y: 700,
    size: 340,
    hubR: 58,
} as const

export const CONSOLE = {
    x: 438,
    y: 570,
    w: 818,
    h: 142,
    keyW: 184,
    keyH: 118,
    gap: 14,
    keyY: 641,
    iconY: -18,
    labelY: 36,
    iconSize: 66,
} as const

export const WIPER = {
    pivots: [
        { x: 318, y: 552 },
        { x: 752, y: 552 },
    ],
    length: 470,
    originX: 0.046875,
    rest: -0.04,
    sweep: -2.55,
} as const

export const CAPTION = {
    x: 640,
    y: 214,
    low: 400,
} as const

export const WINDSHIELD = { x: 640, y: (HEADER.h + GLASS.bottom) / 2, w: 1180, h: GLASS.bottom - HEADER.h - 16 } as const

export const ROAD_SPOT = { x: 640, y: 430, w: 860, h: 240 } as const

export const NIGHT = {
    vila: 0.42,
    estrada: 0.9,
    rua: 0.55,
    serra: 0.6,
    terra: 0.5,
} as const

/** O céu escurece junto quando a noite passa da vila (postes acesos): sem postes, a lua e as estrelas somem quase todas. */
export const SKY_SHADE = {
    from: NIGHT.vila,
    max: 0.85,
} as const

export const TARGET = {
    horn: { x: 640, y: 470 },
    lost: { x: 640, y: 250 },
    hornReach: 5,
    streetReach: 10,
    envelope: 0.35,
    dogSpawn: 20,
    streetSpawn: 24,
    run: 2.6,
    cowSpawn: 20,
    forkSpawn: 18,
    barrierSpawn: 20,
    mudSpawn: 12,
    towFrom: 16,
    towAt: 3.1,
    towGone: 9,
    towerSpawn: 20,
    roof: { x: 640, y: 130 },
    antenna: { x: 1150, y: 560 },
    hornShort: 2.4,
    towerAhead: 2.2,
    towerSide: 1.9,
    hookHeight: 180,
    carHook: { x: 640, y: 540 },
} as const

export const FORK = {
    spread: 0.5,
    half: 0.86,
    mergeDist: 2.6,
    signAway: 1.9,
    arrowTail: 0.5,
    arrowHead: 3.4,
    arrowWidth: 0.07,
} as const

export const GAP = {
    after: 0.7,
    width: 8,
    hang: 0.85,
} as const

export const MUD = {
    len: 3.2,
    side: 1.35,
} as const

export const SPLAT = {
    max: 18,
    top: 400,
    bottom: GLASS.bottom - 10,
} as const

export const VILLAGE = {
    x: 430,
    y: 306,
    scale: 0.6,
    one: 4,
    windows: [
        { x: 160, y: 300, w: 9, h: 14 },
        { x: 177, y: 300, w: 9, h: 14 },
        { x: 208, y: 266, w: 10, h: 14 },
        { x: 226, y: 266, w: 9, h: 14 },
        { x: 294, y: 273, w: 9, h: 14 },
        { x: 313, y: 273, w: 10, h: 14 },
        { x: 375, y: 262, w: 21, h: 29 },
        { x: 378, y: 232, w: 16, h: 16 },
        { x: 432, y: 246, w: 10, h: 15 },
        { x: 496, y: 267, w: 10, h: 14 },
        { x: 521, y: 267, w: 10, h: 14 },
        { x: 561, y: 294, w: 9, h: 14 },
        { x: 578, y: 294, w: 9, h: 14 },
    ],
} as const

export const NEIGHBOR = {
    x: 1010,
    y: 276,
    scale: 0.3,
    hillW: 300,
    hillH: 80,
    hillY: 310,
} as const

export const SIGNAL = {
    x: CONSOLE.x + CONSOLE.w - 16 - 50,
    y: CONSOLE.y + 14 + 24,
    w: 100,
    h: 48,
    reserve: 128,
    keyW: 160,
    gap: 12,
    badgeX: 52,
    badgeY: -38,
    badgeW: 46,
    badgeH: 28,
} as const

export const MAP = {
    x: 640,
    y: 400,
    scale: 0.74,
    w: 768,
    h: 512,
    trunk: [
        { x: 386, y: 427 },
        { x: 386, y: 350 },
        { x: 390, y: 300 },
        { x: 390, y: 289 },
    ],
    left: [
        { x: 369, y: 272 },
        { x: 319, y: 240 },
        { x: 282, y: 210 },
        { x: 257, y: 180 },
        { x: 227, y: 140 },
        { x: 213, y: 121 },
    ],
    right: [
        { x: 414, y: 275 },
        { x: 437, y: 250 },
        { x: 492, y: 210 },
        { x: 524, y: 180 },
        { x: 561, y: 140 },
        { x: 573, y: 129 },
    ],
} as const
