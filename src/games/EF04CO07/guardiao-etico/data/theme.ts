import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    ink: 0x2a2233,
    inkSoft: 0x4a4055,

    wall: 0xdfe6ee,
    wallDeep: 0xc6d2e0,

    wood: 0x8a5f3c,
    woodTop: 0xa97a4f,
    woodLight: 0xc08e5c,

    cork: 0xc9a06a,
    paper: 0xfffaf0,
    paperShade: 0xe8ddc8,
    paperLine: 0xd9cfbc,

    glass: 0xbfe3f5,
    metal: 0x9aa7b8,
    metalDeep: 0x5c6472,

    green: 0x4eaa78,
    greenDeep: 0x35805a,
    amber: 0xe59a52,
    amberDeep: 0xb9702c,
    blue: 0x4b8fe0,
    slate: 0x5c6472,
    white: 0xffffff,
} as const

export const CSS = {
    ink: '#2a2233',
    inkSoft: '#4a4055',
    paper: '#fffaf0',
    wall: '#dfe6ee',
    white: '#ffffff',
    amber: '#e59a52',
    amberDeep: '#b9702c',
    green: '#4eaa78',
} as const

export const A = {
    veil: 0.18,
    shadow: 0.22,
    glass: 0.16,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
