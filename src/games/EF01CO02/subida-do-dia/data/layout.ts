export const W = 1280
export const H = 720

export const WORLD = {
    h: 1480,
    groundY: 1385,
    ladderX: 680,
    firstRung: 175,
    rungGap: 230,
    cloudAbove: 300,
    viewAbove: 250,
} as const

export const rungYs = (count: number): number[] =>
    Array.from({ length: count }, (_, i) => WORLD.groundY - WORLD.firstRung - i * WORLD.rungGap)

export const cloudYFor = (count: number): number => WORLD.groundY - WORLD.firstRung - (count - 1) * WORLD.rungGap - WORLD.cloudAbove

export const LADDER = {
    railW: 320,
    railCap: 40,
    hit: 300,
} as const

export const RUNG = {
    w: 250,
    h: 150,
    art: 172,
    artW: 290,
    artH: 175,
} as const

export const KID = {
    startX: 430,
    height: 175,
    cell: 384,
    footY: 360,
    artH: 311,
    sideX: WORLD.ladderX - 205,
    feet: 58,
    cloudX: WORLD.ladderX - 215,
    cloudFeet: 78,
    walkPxPerMs: 0.4,
    climbMs: 520,
    slideMs: 760,
} as const

export const CLOUD = {
    w: 660,
    h: 250,
    artDX: 70,
    art: 196,
} as const

export const PANEL = {
    x: 180,
    goalY: 140,
    goalW: 236,
    goalH: 168,
    goalArt: 128,
    arrowY: 262,
    stateY: 458,
    state: 296,
    stateArt: 258,
} as const

export const STAGE = {
    frameX: 790,
    frameY: 380,
    frameScale: 1.42,
    iconX: 370,
    iconY: 380,
    icon: 230,
    iconArt: 196,
    arrowX: 560,
} as const

export const OPTIONS = {
    x: 1095,
    two: { ys: [290, 530], card: 212, art: 182 },
    three: { ys: [208, 412, 616], card: 184, art: 156 },
} as const

export const HUD = {
    pipsX: 1040,
    pipsY: 42,
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

export const INTRO = {
    zoom: 1.7,
    lookDX: 60,
    lookUp: 150,
    cardDX: -175,
    cardUp: 140,
    card: 172,
    bubbleDX: 178,
    bubbleUp: 255,
    bubble: 150,
} as const

export const NEXT = {
    x: 1095,
    y: 420,
    size: 140,
} as const

export const DEPTH = {
    bg: 0,
    decor: 2,
    cloud: 25,
    ladder: 20,
    kid: 40,
    flying: 45,
    worldFx: 48,
    panel: 60,
    options: 70,
    veil: 80,
    stage: 82,
    next: 90,
    hud: 100,
    tap: 9500,
} as const
