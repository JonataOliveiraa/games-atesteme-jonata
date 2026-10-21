export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    bench: 60,
    veil: 90,
    header: 100,
    hud: 106,
    sign: 110,
    fly: 120,
    bubble: 130,
    banner: 140,
    touch: 150,
} as const

export const WD = {
    bg: 0,
    shadow: 2,
    pin: 10,
    ball: 20,
    zz: 30,
    fx: 35,
    rake: 40,
} as const

export const HEADER = {
    h: 96,
    dividers: [298, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 180,
    pipGap: 23,
    pipR: 9,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const SIGN = {
    x: 640,
    y: 48,
    left: 312,
    right: 1136,
    chipH: 58,
    chipPad: 16,
    pillW: 92,
    slotW: 150,
    gap: 12,
    icon: 40,
    lead: 23,
    text: 27,
    badgeR: 19,
} as const

export const LANE = {
    top: 470,
    floor: 502,
    front: 515,
    bottom: 560,
    end: 1280,
} as const

export const PIN = {
    xs: [440, 650, 860, 1070],
    xs5: [400, 572, 744, 916, 1088],
    cellW: 192,
    cellH: 288,
    foot: 278,
    headY: 74,
    scale: 0.78,
    small: 0.72,
    zzDX: 46,
    zzDY: 236,
    hop: 150,
    fallX: -14,
    lieBack: 34,
    lieScale: 0.64,
    lieScale5: 0.56,
    pillow: 0.5,
    shadowW: 96,
    shadowH: 16,
} as const

export const BALL = {
    x: 210,
    r: 46,
    cell: 256,
    body: 236,
    stopGap: 112,
    exitX: 1360,
    mouthX: 132,
} as const

export const GAUGE = {
    x: 210,
    y: 384,
    r: 104,
    band: 26,
    sweep: 820,
    auto: 4200,
    weak: 0.55,
    max: 0.84,
    back: 30,
} as const

export const BENCH = {
    top: 588,
    y: 654,
    cardW: 270,
    cardH: 96,
    cardXs2: [196, 490],
    cardXs1: [343],
    notX: 768,
    opXs: [372, 650],
    opW: 196,
    notXs: [300, 652],
    notWide: 300,
    notW: 150,
    playX: 1086,
    playW: 236,
    playH: 100,
    hide: 150,
    icon: 44,
} as const

export const RAKE = {
    from: 340,
    to: 1330,
    w: 30,
    top: 96,
    bottom: 508,
} as const

export const CAMERA = {
    zoom: 1.7,
    at: { x: 640, y: 420 },
} as const

export const BUBBLE = {
    w: 400,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 176,
    w: 900,
    h: 84,
} as const

export const TOUCH = {
    r: 22,
    reach: 2.6,
    wave: 5,
} as const
