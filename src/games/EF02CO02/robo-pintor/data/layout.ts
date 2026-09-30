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
    x: 440,
    y: 90,
    w: 400,
    h: 160,
    cy: 158,
    loopX: 560,
    loopSize: 150,
    brushX: 532,
    stepX: 590,
    iconSize: 54,
    timesX: 670,
    slotX: 752,
    slotSize: 92,
    dotsY: 230,
    dotGap: 30,
    dotR: 9,
} as const

export const FENCE = {
    pitch: 150,
    base: 555,
    scale: 150 / 256,
    robotBack: 82,
    enterDX: 900,
} as const

export const plankX = (boards: number, i: number): number => W / 2 - (boards + 2) * (FENCE.pitch / 2) + FENCE.pitch + i * FENCE.pitch

export const robotX = (boards: number, p: number): number => plankX(boards, p) - FENCE.robotBack

export const ROBOT = {
    foot: 578,
    scale: 0.52,
} as const

export const CAT = {
    foot: 584,
    scale: 0.56,
} as const

export const CARDS = {
    y: 650,
    xs: [440, 640, 840],
    w: 170,
    h: 124,
    scale: 0.86,
    numberDY: -16,
    dotsDY: 36,
    dotGap: 22,
    dotR: 7,
} as const

export const cardRect = (i: number): Rect => ({ x: CARDS.xs[i], y: CARDS.y, w: CARDS.w, h: CARDS.h })

export const ALL_CARDS: Rect = { x: 640, y: CARDS.y, w: 580, h: CARDS.h + 16 }

export const plankRect = (boards: number, i: number): Rect => ({
    x: plankX(boards, i),
    y: FENCE.base - 118,
    w: 96,
    h: 250,
})
