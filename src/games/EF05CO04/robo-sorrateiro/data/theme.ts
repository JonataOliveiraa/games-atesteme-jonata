import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    ink: 0x2a3550,
    inkSoft: 0x4a5878,

    night: 0x3a3350,
    wood: 0xc99a63,
    rug: 0xc96a5a,
    lamp: 0xffd9ae,

    path: 0xfff3d6,
    sign: 0xf4a259,
    cone: 0xffe08a,
    ring: 0x5ec8e8,

    card: 0xfffaf0,
    cardLift: 0xffe9a8,

    green: 0x4eaa78,
    greenDeep: 0x2f7f55,
    red: 0xe36a5c,
    amber: 0xe59a52,

    bip: 0x7fd1c9,
    white: 0xffffff,
    slate: 0xc6d2e2,
} as const

export const CSS = {
    ink: '#2a3550',
    white: '#ffffff',
    card: '#fffaf0',
    green: '#2f7f55',
    amber: '#8a5500',
} as const

export const A = {
    shadow: 0.24,
    veil: 0.58,
    cone: 0.3,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
