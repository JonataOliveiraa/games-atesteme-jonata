import type { Rect } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    board: 5,
    fence: 10,
    cat: 14,
    robot: 20,
    fx: 30,
    cards: 40,
    flying: 50,
    hint: 60,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 196,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const BOARD = {
    x: 453,
    y: 106,
    w: 375,
    h: 144,
    cy: 166,
    loopX: 500,
    loopSize: 92,
    brushX: 568,
    stepX: 628,
    iconSize: 66,
    bodyX: 598,
    bodyW: 132,
    bodyH: 84,
    timesX: 684,
    slotX: 760,
    slotSize: 84,
    dotsY: 230,
    dotGap: 30,
    dotR: 9,
    rowsCy: [141, 213],
    rowScale: 0.72,
    rowDotsX: 726,
    rowDotGap: 22,
    rowDotR: 7,
} as const

export const boardRow = (rows: number, r: number) => {
    if (rows === 1) return { cy: BOARD.cy, s: 1, x: (x: number) => x }
    const s = BOARD.rowScale
    return { cy: BOARD.rowsCy[r], s, x: (x: number) => BOARD.x + (x - BOARD.x) * s }
}

export const FENCE = {
    pitch: 150,
    base: 500,
    scale: 0.66,
    robotBack: 100,
    enterDX: 900,
} as const

export const plankX = (boards: number, i: number): number => W / 2 - (boards + 2) * (FENCE.pitch / 2) + FENCE.pitch + i * FENCE.pitch

export const robotX = (boards: number, p: number): number => plankX(boards, p) - FENCE.robotBack

export const ROBOT = {
    foot: 522,
    scale: 0.62,
} as const

export const CAT = {
    foot: 528,
    scale: 0.54,
    originY: 0.91,
} as const

export const CARDS = {
    y: 650,
    xs: [440, 640, 840],
    w: 170,
    h: 124,
    scale: 0.67,
    numberDY: -22,
    dotsDY: 20,
    dotGap: 22,
    dotR: 7,
} as const

export const cardRect = (i: number): Rect => ({ x: CARDS.xs[i], y: CARDS.y, w: CARDS.w, h: CARDS.h })

export const ALL_CARDS: Rect = { x: 640, y: CARDS.y, w: 580, h: CARDS.h + 16 }

export const plankRect = (boards: number, i: number): Rect => ({
    x: plankX(boards, i),
    y: FENCE.base - 95,
    w: 96,
    h: 200,
})

export const stageRect = (boards: number): Rect => {
    const left = robotX(boards, 0) - 90
    const right = plankX(boards, boards) + 90
    return { x: (left + right) / 2, y: FENCE.base - 85, w: right - left, h: 270 }
}
