import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    ink: 0x2a3550,
    inkSoft: 0x4a5878,

    sky: 0xffd9ae,
    water: 0x5ec8e8,
    waterDeep: 0x2f9fd0,
    foam: 0xffffff,
    rope: 0xf4a259,
    tile: 0xf3e2cd,

    card: 0xfffaf0,
    cardLift: 0xffe9a8,
    pin: 0x4b8fe0,
    pinDeep: 0x2f66b0,

    green: 0x4eaa78,
    greenDeep: 0x2f7f55,
    red: 0xe36a5c,
    amber: 0xe59a52,

    white: 0xffffff,
    slate: 0xc6d2e2,
} as const

export const CSS = {
    ink: '#2a3550',
    white: '#ffffff',
    card: '#fffaf0',
    amber: '#8a5500',
    green: '#2f7f55',
} as const

export const A = {
    shadow: 0.24,
    veil: 0.28,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
