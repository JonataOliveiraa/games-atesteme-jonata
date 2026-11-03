import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    paper: 0xfcf9c4,
    paperLight: 0xfffde8,
    paperDark: 0xe9e2a0,
    ink: 0x37161d,
    inkSoft: 0x7a5a60,
    blush: 0xe2c6c2,
    wood: 0xf3e3b8,
    woodDark: 0xc9ab72,
    gold: 0xfbc34f,
    goldDark: 0xd99a1e,
    glow: 0xfff1a8,
    amber: 0xffa53a,
    green: 0x67bc58,
    greenDark: 0x3f8a3a,
    sky: 0xa9d8f0,
    skyTop: 0x7cc3ec,
    skyLow: 0xe6f6ff,
    grass: 0xa8d59a,
    grassDark: 0x7fb870,
    soil: 0xd9b48a,
    woodTint: 0xf0c48a,
    hollowTint: 0xfbe8c4,
    card: 0xffffff,
    cardLip: 0xd9cfa8,
    white: 0xffffff,
    shadow: 0x37161d,
} as const

export const CSS = {
    ink: '#37161d',
    inkSoft: '#7a5a60',
    white: '#ffffff',
    amberInk: '#7a3d00',
} as const

export const A = {
    shadow: 0.16,
    veil: 0.58,
    lit: 0.9,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    rung: 22,
    rungSmall: 19,
    name: 28,
    tag: 26,
    hudLevel: 20,
    help: 40,
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
