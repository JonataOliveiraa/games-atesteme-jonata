import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xc9b8fb,
    skyPink: 0xf4d3fb,
    ink: 0x2a1aa8,
    inkSoft: 0x5b4bc4,
    shadow: 0x1e1050,
    cream: 0xfcf6e4,
    creamDark: 0xe9dcc4,
    lavender: 0xb07efb,
    lavenderDark: 0x7a4fe0,
    pink: 0xfc52d5,
    pinkSoft: 0xffd3f1,
    hot: 0xd4128f,
    cyan: 0x5ce1fb,
    mint: 0x37ddc8,
    mintDark: 0x14a894,
    yes: 0x22c58b,
    yesDark: 0x12916a,
    no: 0xff8a3d,
    noDark: 0xd9621c,
    yellow: 0xffe45c,
    chain: 0x8f7de6,
    chainDark: 0x2a1aa8,
    white: 0xffffff,
    night: 0x3a238f,
} as const

export const CSS = {
    ink: '#2a1aa8',
    inkSoft: '#5b4bc4',
    hot: '#d4128f',
    yesDark: '#12916a',
    noDark: '#d9621c',
    white: '#ffffff',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    balloon: 28,
    label: 30,
    board: 38,
    boardLine: 28,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
