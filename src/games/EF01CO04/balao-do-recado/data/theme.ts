import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xbfe6fb,
    skyDeep: 0x8fcdf0,
    cloud: 0xffffff,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    coral: 0xff8a7a,
    coralDark: 0xd9604f,
    sun: 0xffc94d,
    sunDark: 0xe0a21c,
    mint: 0x7fd8be,
    mintDark: 0x3fae8f,
    lilac: 0xb9a4e6,
    leaf: 0x7cc36a,
    roof: 0xf4a261,
    cork: 0xd9a86c,
    corkDark: 0xa8763e,
    wood: 0xf1d3a0,
    gold: 0xfbc34f,
    goldDark: 0xd99a1e,
    green: 0x55c46a,
    greenDark: 0x2f8a45,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
} as const

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
} as const

export const A = {
    shadow: 0.18,
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    card: 30,
    note: 20,
    help: 40,
    level: 22,
    placeholder: 17,
} as const

export const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
