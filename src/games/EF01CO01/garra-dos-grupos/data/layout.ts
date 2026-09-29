export const W = 1280
export const H = 720

export const HUD = {
    chipLeft: { x: 12, y: 10, w: 232, h: 124 },
    chipRight: { x: 1010, y: 10, w: 252, h: 64 },
    levelPill: { x: 36, y: 22, w: 184, h: 40 },
    pipsX: 128,
    pipsY: 84,
    pipGap: 30,
    pipR: 9,
    livesX: 1040,
    livesY: 42,
    livesSize: 30,
    helpX: 1212,
    helpY: 42,
    helpR: 28,
    helpHit: 110,
} as const

export const VISOR = {
    x: 305,
    y: 47,
    w: 392,
    h: 80,
    cx: 501,
    cy: 87,
    dropX: 362,
    dropR: 28,
    wordX: 532,
    wordRoom: 290,
} as const

export const RAIL = {
    y: 197,
    minX: 140,
    maxX: 824,
} as const

export const SHOWCASE = {
    x: 50,
    y: 160,
    w: 865,
    h: 456,
    cx: 482,
    cy: 388,
} as const

export const TRAY = {
    cx: 482,
    cy: 548,
    rx: 350,
    ry: 66,
    ringRx: 290,
    ringRy: 52,
    count: 8,
    reachSin: 0.34,
    disc: 648,
} as const

export const ITEM = {
    cell: 256,
    front: 120,
    back: 74,
    footDy: 46,
} as const

export const CLAW = {
    cell: 320,
    scale: 0.56,
    hookY: 24,
    holdY: 250,
    restY: 215,
    cableW: 10,
    cableArt: 256,
    cableScale: 0.2,
    dropMs: 620,
    riseMs: 560,
    carryMs: 700,
    beamW: 54,
    swingPeriod: 460,
    swingMax: 0.5,
} as const

export const BOX = {
    cx: 1107,
    baseY: 575,
    w: 250,
    h: 192,
    artW: 268,
    artBaseY: 300,
    itemScale: 0.5,
    rowGap: 56,
    colGap: 70,
    slotY: 557,
    slotGap: 42,
    slotR: 15,
    mouthY: 400,
} as const

export const ENDING = {
    sameX: 1107,
    sameY: 340,
    diffX: 482,
    diffY: 380,
    holdMs: 2200,
} as const

export const DEPTH = {
    bg: 0,
    visor: 20,
    trayBack: 30,
    tray: 32,
    trayFront: 34,
    box: 40,
    boxFront: 44,
    claw: 50,
    carried: 52,
    balloon: 70,
    sorting: 80,
    hud: 100,
} as const

export const FLIGHT = {
    ms: 820,
    arcLift: 170,
    turns: 2,
    zoom: 1.25,
    zoomMs: 300,
    follow: 0.12,
    ghostMs: 45,
    behindAt: 0.82,
    holdMs: 180,
    backMs: 360,
} as const
