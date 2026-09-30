export const W = 1280
export const H = 720

export const HUD = {
    h: 82,
    cy: 41,
    accent: 4,

    levelX: 18,
    levelY: 14,
    levelW: 164,
    levelH: 54,

    dotsX: 204,
    dotsR: 9,
    dotsGap: 26,

    timeCx: 900,
    timeW: 196,
    timeH: 24,

    livesX: 1032,

    helpCx: 1232,
    helpR: 27,
}

export const STRIP = {
    cx: 640,
    cy: 112,
    w: 690,
    h: 48,
    r: 24,
}

export const SKIP = {
    cx: 1168,
    cy: 112,
    r: 40,
}

export const LOG = {
    x1: 132,
    x2: 1148,
    y: 292,
    h: 46,
}

export const STONE = {
    frame: 128,
    y: 236,
    hit: 148,
    lift: 1.14,
}

export const BASKET = {
    frame: 128,
    display: 192,
    compact: 0.88,
    y: 594,
    dropW: 250,
    dropH: 230,
    shadowDY: 92,
}

export const SIGN = {
    y: 434,
    compact: 0.85,
    w: 236,
    h: 112,
    exampleSize: 48,
    exampleGap: 64,
    sizeGap: 72,
    postH: 66,
}

export const VINE = {
    frameW: 169,
    frameH: 441,
    height: 348,
    xs: [72, 1208],
}

export const SLOTS: Record<number, number[]> = {
    2: [430, 850],
    3: [280, 640, 1000],
    4: [212, 504, 796, 1088],
}

export const STONE_SLOTS: Record<number, number[]> = {
    4: [370, 550, 730, 910],
    5: [280, 460, 640, 820, 1000],
    6: [190, 370, 550, 730, 910, 1090],
}
