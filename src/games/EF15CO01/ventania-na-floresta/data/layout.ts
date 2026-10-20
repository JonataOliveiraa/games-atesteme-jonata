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

export const WHIRL = {
    x: 640,
    y: 268,
    size: 330,
    piece: { x: 640, y: 404 },
    pieceW: 140,
    houseY: 556,
    houseW: 186,
    gap: 270,
    pillY: 666,
    hit: 230,
    leaves: 6,
} as const

export const PIECE_TEXT_AT: Record<string, { x: number; y: number; size: number }> = {
    badge: { x: 0.2, y: -0.02, size: 0.24 },
    number: { x: 0, y: 0.02, size: 0.4 },
    word: { x: 0, y: -0.06, size: 0.3 },
}

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
    whirlY: 168,
    w: 760,
    h: 84,
} as const

export const TOUCH = {
    r: 22,
    reach: 3.2,
    wave: 6,
} as const
