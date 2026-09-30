import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Paint } from '../types'

export const C = {
    sky: 0xdff3ff,
    skyDeep: 0xc8ebff,
    cloud: 0xffffff,
    grass: 0x9be07a,
    grassDark: 0x7ccf5c,
    wall: 0xfbe9d0,
    wallDark: 0xf2d7b4,
    wood: 0xf2d4a7,
    woodDark: 0xdcb780,
    easel: 0xc9955c,
    board: 0x2f6b55,
    boardDark: 0x24574a,
    orange: 0xff9600,
    orangeDark: 0xe07f00,
    grey: 0xe5e5e5,
    greyDark: 0xc9c9c9,
    graphite: 0x4b4b4b,
    screen: 0x3a4152,
    purple: 0xce82ff,
    purpleDark: 0xb066ea,
    cushion: 0xb9c2cf,
    maroon: 0x8a1c3c,
    card: 0xffffff,
    cardEdge: 0xe8ecf2,
    dot: 0xffffff,
    dotOff: 0x5c8f7c,
    ink: 0x3c3c3c,
    inkSoft: 0x6b6b6b,
    white: 0xffffff,
    shadow: 0x1d2433,
    heart: 0xff4b6e,
    glow: 0xfff3b0,
    hint: 0xffc800,
    green: 0x58cc02,
    flower: 0xff86d0,
    flowerCore: 0xffc800,
} as const

export const PAINT: Record<Paint, number> = {
    blue: 0x1cb0f6,
    pink: 0xff86d0,
    teal: 0x2ec4a6,
    yellow: 0xffc800,
}

export const CONFETTI = [PAINT.blue, PAINT.pink, PAINT.teal, PAINT.yellow, C.orange]

export const CSS = {
    ink: '#3c3c3c',
    inkSoft: '#6b6b6b',
    white: '#ffffff',
    chalk: '#fdfcf5',
} as const

export const A = {
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    card: 58,
    slot: 60,
    times: 46,
    count: 44,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
