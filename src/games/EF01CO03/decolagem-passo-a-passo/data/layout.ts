export const W = 1280
export const H = 720

export const HUD = {
    chipLeft: { x: 12, y: 10, w: 232, h: 64 },
    chipRight: { x: 1170, y: 10, w: 84, h: 64 },
    levelPill: { x: 24, y: 22, w: 128, h: 40 },
    pipsX: 196,
    pipsY: 42,
    pipGap: 24,
    pipR: 8,
    livesX: 1040,
    livesY: 42,
    livesSize: 30,
    helpX: 1212,
    helpY: 42,
    helpR: 28,
    helpHit: 110,
} as const

export const BENCH = {
    x: 190,
    w: 240,
    h: 150,
    rows: {
        3: { ys: [240, 410, 580], scale: 1 },
        4: { ys: [170, 315, 460, 605], scale: 0.85 },
    } as Record<number, { ys: number[]; scale: number }>,
    iconY: -14,
    icon: 100,
    labelY: 48,
    hopMs: 140,
} as const

export const STAGE = {
    cx: 660,
    cy: 430,
    w: 560,
    h: 560,
    groundY: 660,
    cell: 320,
    sceneFoot: 310,
    kidCell: 384,
    kidFoot: 360,
    kidBody: 320,
    kidH: 200,
    flameTop: 46,
    nozzle: 12,
    flameIdle: 0.35,
    flameLaunch: 0.6,
} as const

export const PAD = {
    top: 636,
    w: 220,
    h: 24,
} as const

export const PLACES = {
    rocket: {
        kid: 400,
        pump: 540,
        pumpScale: 0.6,
        hero: 740,
        heroScale: 0.95,
        doorY: 71,
        lift: 80,
        climb: 200,
        flameStart: 0.2,
    },
    balloon: {
        kid: 400,
        basket: 540,
        basketScale: 0.55,
        hero: 740,
        heroScale: 0.9,
        stakesScale: 0.8,
        lift: 160,
        mouth: 72,
        rim: 170,
        rope: 80,
        ropeX: 108,
        kidScale: 0.75,
        ride: 0,
        burnerScale: 0.2,
        burnerGap: 50,
        beside: 120,
    },
    kite: {
        kid: 560,
        hero: 400,
        heroScale: 0.6,
        runTo: 680,
        dragX: 520,
        lineX: 105,
        handX: 65,
        handY: 181,
        flyScale: 0.7,
        launchScale: 0.95,
        maxX: 950,
        kiteRight: 187,
        kiteTop: 299,
        minTop: 250,
    },
} as const

export const PROPS = {
    head: {
        idle: { x: 2, y: -216 },
        cheer: { x: -2, y: -217 },
        run: { x: 29, y: -210 },
        sooty: { x: -9, y: -224 },
        oops: { x: 0, y: -215 },
        wave: { x: -2, y: -213 },
    },
    helmetScale: 0.83,
    umbrella: { pose: 'wave', x: 93, y: -320, scale: 0.8 },
    icecream: { pose: 'cheer', x: 98, y: -290, scale: 0.7 },
    toothbrush: { pose: 'idle', x: 23, y: -150, scale: 0.55 },
    holdMs: 1200,
} as const

export const RULER = {
    x: 1090,
    w: 240,
    rows: {
        3: { ys: [600, 450, 300], h: 130 },
        4: { ys: [630, 510, 390, 270], h: 110 },
    } as Record<number, { ys: number[]; h: number }>,
    flyMs: 520,
    arc: 90,
} as const

export const BANNER = {
    x: 660,
    y: 150,
    w: 720,
    texW: 1024,
    texH: 256,
    midX: 512,
    midY: 92,
    safeW: 520,
    safeH: 78,
    fitW: 0.85,
    fitH: 0.8,
    fontSize: 72,
    fromY: -120,
} as const

export const COUNT = {
    x: 660,
    y: 170,
} as const

export const DEPTH = {
    bg: 0,
    stage: 10,
    kid: 20,
    fx: 30,
    ruler: 35,
    bench: 40,
    flying: 60,
    banner: 70,
    count: 75,
    hud: 100,
} as const
