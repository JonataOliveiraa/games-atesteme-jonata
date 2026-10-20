export const W = 1280
export const H = 720

export const DEPTH = {
    backdrop: 0,
    beams: 1,
    stars: 2,
    board: 6,
    flash: 7,
    note: 8,
    disc: 9,
    spark: 10,
    judge: 12,
    live: 20,
    hearts: 22,
    cutin: 30,
    veil: 40,
    crate: 42,
    flyer: 50,
    header: 100,
    hud: 106,
    bubble: 130,
    banner: 140,
} as const

export const HEADER = {
    h: 76,
    dividers: [266, 1150],
} as const

export const HUD = {
    y: 38,
    levelX: 22,
    levelW: 124,
    levelH: 42,
    pipsX: 172,
    pipGap: 30,
    pipR: 10,
    askX: 708,
    askW: 820,
    helpX: 1222,
    helpY: 38,
    helpR: 28,
    helpHit: 80,
    livesX: 1100,
    livesY: 38,
    livesSize: 28,
} as const

export const HIGHWAY = {
    cx: 640,
    vanishY: 73,
    farY: 170,
    hitY: 600,
    bottom: 720,
    halfW: 380,
    lanes: 4,
    perspective: 0.5,
    zoneTop: 300,
    padH: 48,
} as const

export const NOTE = {
    width: 0.86,
    aspect: 0.3,
    gone: 1.18,
} as const

export const DISC = {
    x: 640,
    y: 128,
    size: 96,
    label: 0.36,
    hole: 0.06,
    spin: 1000,
} as const

export const JUDGE = {
    x: 640,
    y: 512,
} as const

export const COMBO = {
    x: 1135,
    labelY: 292,
    numY: 354,
} as const

export const LIVE = {
    x: 150,
    y: 330,
    r: 92,
    ring: 236,
    face: 0.46,
    nameY: 120,
} as const

export const CUTIN = {
    x: 230,
    waist: 742,
    height: 460,
    bigX: 300,
    bigHeight: 560,
    stripeY: 520,
} as const

export const STAGE = {
    lights: [
        { x: 92, y: 92, angle: 38 },
        { x: 1188, y: 92, angle: -38 },
    ],
    stars: [
        { x: 60, y: 140 },
        { x: 210, y: 110 },
        { x: 330, y: 180 },
        { x: 120, y: 470 },
        { x: 290, y: 400 },
        { x: 60, y: 600 },
        { x: 960, y: 110 },
        { x: 1080, y: 190 },
        { x: 1240, y: 150 },
        { x: 1000, y: 430 },
        { x: 1220, y: 470 },
        { x: 1180, y: 600 },
        { x: 470, y: 110 },
        { x: 820, y: 104 },
    ],
    crowdY: 700,
} as const

export const CRATE = {
    window: 0.84,
    noteTop: 0.38,
    pad: 14,
    row: { gap: 380, caseY: 318, caseSize: 268, noteY: 548, noteW: 340, noteH: 0, font: 26, sign: 24 },
    row4: { gap: 306, caseY: 206, caseSize: 220, noteY: 450, noteW: 286, noteH: 200, font: 21, sign: 19 },
    grid: { cols: 3, gapX: 260, gapY: 224, y: 340, caseSize: 180 },
    card: {
        x: 640,
        y: 340,
        w: 800,
        h: 430,
        caseX: 440,
        caseY: 278,
        caseSize: 250,
        noteX: 820,
        noteY: 278,
        noteW: 380,
        noteH: 250,
        font: 28,
        sign: 26,
        buttonY: 480,
        buttonW: 280,
        buttonH: 88,
        buttonGap: 60,
        step: 8,
    },
} as const

export const LANE_ICON = {
    y: 662,
    size: 78,
    alpha: 0.95,
} as const

export const BUBBLE = {
    w: 380,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 250,
    w: 820,
    h: 84,
} as const
