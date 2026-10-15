export const W = 1280
export const H = 720

export const GROUND = 590

export const DEPTH = {
    backdrop: 0,
    facade: 10,
    sign: 11,
    screen: 12,
    lia: 20,
    hero: 22,
    veil: 30,
    focus: 32,
    flyer: 34,
    real: 90,
    header: 100,
    order: 104,
    hud: 106,
    edge: 108,
    controls: 110,
    phone: 120,
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
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const ORDER = {
    x: 716,
    y: 48,
    logo: 44,
    gap: 12,
    maxW: 820,
} as const

export const EDGE = {
    y: 300,
    w: 118,
    h: 74,
    margin: 14,
    logo: 44,
} as const

export type Box = readonly [x: number, y: number, w: number, h: number]

export const FACADE = {
    width: 480,
    reach: 150,
    signFill: 0.86,
    signLogo: 38,
    boards: [
        { screen: [120, 215, 277, 117], sign: [126, 138, 265, 49] },
        { screen: [76, 226, 302, 111], sign: [93, 159, 269, 40] },
        { screen: [84, 220, 351, 133], sign: [86, 141, 345, 53] },
        { screen: [112, 214, 302, 105], sign: [106, 136, 315, 49] },
        { screen: [73, 205, 305, 109], sign: [79, 127, 293, 49] },
        { screen: [118, 212, 294, 106], sign: [133, 145, 265, 42] },
    ] as { screen: Box; sign: Box }[],
    reserve: { screen: [40, 114, 400, 224], sign: [70, 56, 340, 48] } as { screen: Box; sign: Box },
} as const

export const PAGE = {
    w: 400,
    bar: 28,
    radius: 12,
    textW: 372,
    gap: 6,
    rowH: 40,
    rowHSmall: 30,
    rowGap: 4,
    idleLogo: 104,
    homeLogo: 62,
    homeTextFromBottom: 28,
    typeMs: 34,
} as const

export const HERO = { height: 172, speed: 340, accel: 1800, stride: 26, minX: 70 } as const
export const LIA = { height: 150, gap: 118, speed: 420, ease: 4 } as const

export const CONTROLS = {
    leftX: 86,
    rightX: 212,
    y: 652,
    r: 56,
    hit: 124,
    lookX: 1186,
    lookY: 648,
    lookR: 62,
} as const

export const DECIDE = {
    y: 640,
    w: 300,
    h: 118,
    faceY: -5,
    xs: [462, 818],
    icon: 58,
} as const

export const PHONE = {
    h: 460,
    logo: 34,
} as const

export const BUBBLE = {
    w: 380,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 150,
    w: 900,
    h: 84,
} as const

export const CAMERA = {
    follow: 220,
    lookW: 520,
    lookMin: 1.3,
    lookMax: 2.2,
    lookLift: 16,
    lookMs: 650,
    diveMs: 1100,
} as const

export const REAL = {
    ground: 664,
    liaX: 760,
    heroX: 1040,
    liaH: 300,
    heroH: 330,
    phoneX: 330,
    phoneY: 372,
} as const

export const LOOK = {
    stillMs: 260,
    armAfter: 36,
} as const

export const PACE = {
    beat: 500,
    reveal: 1300,
    cheer: 900,
} as const
