export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    tree: 2,
    edges: 10,
    slots: 12,
    cards: 20,
    lifted: 30,
    wave: 36,
    carried: 38,
    fx: 40,
    header: 100,
    hud: 106,
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
    goalX: 716,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const ROWS = [165, 328, 491] as const

export const CARD = {
    w: 104,
    h: 133,
    face: 103,
    radius: 12,
    lift: 22,
    ring: 7,
} as const

export const GROUND = {
    y: 645,
    left: 200,
    right: 1080,
    tilt: 10,
} as const

export const TREE = {
    x: 640,
    y: 657,
    w: 1100,
    h: 607,
} as const

export const LINE = {
    w: 9,
    dim: 7,
    gap: 14,
} as const

export const BUBBLE = {
    w: 380,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 656,
    w: 820,
    h: 80,
} as const

export const BEACH = {
    x: 640,
    y: -190,
    scale: 0.97,
} as const

export const WAVE = {
    width: 1400,
    foamAt: 540,
    waterTop: 175,
    from: 40,
    to: 600,
    down: 1100,
    hold: 260,
    up: 900,
} as const

export const YARD = {
    zoom: 1.4,
    crop: 8,
    scrollY: 183,
    trees: [477, 1593, 2756],
    rows3: [355, 483, 611],
    rows2: [420, 548],
    pair: 60,
    slop: 12,
    basket: { x: 150, y: 668, w: 290 },
    spots: [64, 150, 236],
    spotY: 596,
    pigeon: { size: 120, fromX: 1400, fromY: 110, perchY: 470 },
    arrows: { y: 330, left: 46, right: 1234, r: 34 },
} as const
