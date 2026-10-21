export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    veil: 1,
    trail: 4,
    plot: 6,
    stake: 8,
    ring: 9,
    piece: 20,
    flying: 40,
    bee: 50,
    pipa: 60,
    fx: 70,
    header: 100,
    hud: 106,
    bubble: 130,
    banner: 140,
    touch: 150,
} as const

export const HEADER = {
    h: 96,
    dividers: [300, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 186,
    pipGap: 32,
    pipR: 11,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const REQUEST = {
    x: 725,
    y: 48,
    chipH: 50,
    chipPad: 22,
    gap: 22,
    iconH: 54,
} as const

export const ANTHILL = { x: 140, y: 548 } as const

export const LINE = {
    slots: [330, 490, 650, 810],
    y: 530,
    march: { x: 236, y: 474 },
} as const

export const SCATTER: Record<number, { x: number; y: number }[]> = {
    3: [
        { x: 450, y: 352 },
        { x: 760, y: 300 },
        { x: 1060, y: 360 },
    ],
    4: [
        { x: 400, y: 346 },
        { x: 650, y: 296 },
        { x: 890, y: 356 },
        { x: 1120, y: 300 },
    ],
}

export const ANT = {
    w: 170,
    sizes: [1, 0.77, 0.58, 0.44],
    hit: 160,
    hop: 70,
    step: 120,
} as const

export const GRID = {
    x: 600,
    y: 462,
    cell: 150,
    gap: 18,
    rowStake: 92,
    colStake: 84,
    flowerH: 128,
    icon: 64,
} as const

export const BEE = {
    hold: { x: 1060, y: 300 },
    pile: { x: 1090, y: 610 },
    w: 128,
    hang: 82,
    flowerH: 104,
    bob: 6,
} as const

export const PILE = [
    { dx: -70, dy: 10, a: -78 },
    { dx: 20, dy: -14, a: 70 },
    { dx: 90, dy: 18, a: -64 },
    { dx: -20, dy: 40, a: 84 },
    { dx: 60, dy: 52, a: -88 },
    { dx: -90, dy: 60, a: 74 },
] as const

export const PIPA = {
    x: 1080,
    y: 676,
    h: 250,
    enterFrom: 1400,
} as const

export const NEST = {
    xs: { 3: [300, 610, 920], 4: [240, 460, 680, 900] } as Record<number, number[]>,
    y: 204,
    w: 148,
    chickH: 92,
    chickY: 224,
    cardY: 318,
    cardW: 132,
    cardTop: 50,
    row: 42,
    cardPad: 16,
    labelR: 17,
    dotR: 15,
    beak: { x: -0.16, y: -0.56 },
    crest: { x: 0, y: -0.98, w: 0.34 },
    pile: { x: 640, y: 704, w: 260 },
    spots: [
        { dx: -110, dy: -18, a: -18 },
        { dx: -38, dy: -30, a: 14 },
        { dx: 38, dy: -14, a: -10 },
        { dx: 110, dy: -26, a: 20 },
    ],
    pipa: { x: 1150, y: 708, pickX: 900 },
    hold: { x: 1146, y: 500 },
} as const

export const WEB = {
    center: { x: 640, y: 390 },
    rx: 330,
    ry: 180,
    angles: [-90, -30, 30, 90, 150, 210],
    bugW: 112,
    twigW: 132,
    spiderW: 112,
    hit: 150,
    reach: 104,
    thread: 7,
    fall: 130,
    floor: 560,
} as const

export const JEITO = {
    plates: { y: 628, gap: 340, h: 96, k: 1.3, hitW: 300, hitH: 120 },
    shape: { w: 70, h: 44 },
    wrong: { x: 640, y: 450, k: 4, item: 74 },
    ground: 700,
    look: 1700,
} as const

export const DUCK = {
    mom: { x: 200, y: 592 },
    momW: 200,
    w: 150,
    sizes: [1, 0.8, 0.62],
    slots: [370, 512, 634],
    y: 592,
    scatter: [
        { x: 520, y: 370 },
        { x: 790, y: 310 },
        { x: 1060, y: 380 },
    ],
    hit: 160,
} as const

export const SHROOM = {
    x: 690,
    y: 482,
    cell: 140,
    gap: 16,
    h: 112,
    rowStake: 90,
    icon: 78,
    hold: { x: 1070, y: 320 },
    pile: { x: 1070, y: 590 },
    scatter: [
        { x: 420, y: 340 },
        { x: 640, y: 290 },
        { x: 860, y: 350 },
        { x: 1080, y: 300 },
    ],
} as const

export const FISH = {
    xs: [350, 640, 930],
    shellY: 440,
    shellW: 150,
    sitY: 392,
    cardY: 492,
    cardW: 190,
    cardH: 140,
    row: 52,
    w: 140,
    hold: { x: 1080, y: 190 },
    scatter: [
        { x: 400, y: 240 },
        { x: 640, y: 200 },
        { x: 880, y: 250 },
    ],
} as const

export const FLY = {
    center: { x: 640, y: 400 },
    rx: 370,
    ry: 180,
    angles: [-90, -30, 30, 90, 150, 210],
    w: 110,
    hit: 150,
    card: { x: 640, y: 150, w: 220, h: 78 },
    line: 8,
} as const

export const SNAIL = {
    x: 170,
    y: 610,
    w: 210,
    pebble: { x: 360, y: 612 },
    pebbleW: 120,
    fly: { x: 640, y: 330 },
    basket: { x: 960, y: 640, w: 210 },
} as const

export const BUBBLE = {
    w: 400,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 168,
    lineY: 446,
    gridY: 664,
    nestY: 664,
    webY: 664,
    jeitoY: 168,
    w: 760,
    h: 84,
} as const

export const TOUCH = {
    r: 22,
    reach: 3.2,
    wave: 6,
} as const
