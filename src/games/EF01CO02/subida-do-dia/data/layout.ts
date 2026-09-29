export const W = 1280
export const H = 720

export const HUD = {
    pipsX: 208,
    pipsY: 84,
    pipGap: 40,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 60,
    helpR: 36,
    helpHit: 100,
} as const

export const FRAME = {
    x: 42,
    y: 157,
    w: 333,
    h: 298,
    cx: 208,
    cy: 306,
    art: 250,
} as const

export const CLOUD = {
    cx: 792,
    cy: 128,
    w: 675,
    h: 215,
    artX: 792,
    artY: 128,
    art: 170,
} as const

export const GROUND_Y = 636

export const KID = {
    startX: 450,
    groundY: GROUND_Y,
    height: 150,
    cell: 384,
    footY: 360,
    artH: 311,
    railX: 660,
    cheerX: 610,
    cheerY: 205,
    walkPxPerMs: 0.4,
    climbMs: 460,
    slideMs: 640,
} as const

export const LADDER = {
    cx: 792,
    top: 240,
    bottom: GROUND_Y,
    railGap: 220,
    width: 300,
} as const

export const RUNG = {
    w: 200,
    h: 128,
    art: 190,
    artW: 290,
    artH: 175,
    ys: [570, 436, 302],
} as const

export const OPTIONS = {
    x: 1120,
    ys: [330, 540],
    card: 190,
    art: 170,
    flyMs: 560,
} as const

export const INTRO = {
    zoom: 1.5,
    focusX: 420,
    focusY: 400,
    inMs: 900,
    holdMs: 2200,
    outMs: 800,
    bubbleX: 580,
    bubbleY: 404,
    bubble: 128,
} as const

export const NEXT = {
    x: 1120,
    y: 440,
    size: 130,
} as const

export const DEPTH = {
    bg: 0,
    board: 10,
    ladder: 20,
    options: 30,
    kid: 40,
    flying: 45,
    replay: 50,
    bubble: 60,
    hud: 100,
} as const
