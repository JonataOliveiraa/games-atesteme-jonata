import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xf6d9f2,
    skyLow: 0xe6dcff,
    seaTop: 0x5fe0e8,
    seaMid: 0x3aa6e6,
    seaDeep: 0x4b3fa8,
    sand: 0xffe3b0,
    sandDark: 0xf2c88a,
    rock: 0x9b8fe0,
    rockDark: 0x6f62c4,
    wood: 0x7fd6d2,
    woodDark: 0x4fb3b0,
    pink: 0xff5fae,
    pinkDark: 0xe0398d,
    aqua: 0x3fe0e0,
    aquaDark: 0x22b5c4,
    lilac: 0xc9a6ff,
    violet: 0x7a5cff,
    lemon: 0xfff06a,
    lemonDark: 0xf2cf2e,
    orange: 0xff9a3c,
    dark: 0x14102e,
    fog: 0x0c0a26,
    glow: 0xfff38a,
    light: 0xfff9d6,
    paper: 0xfffaf0,
    paperLine: 0xc8c0e8,
    film: 0x2c2450,
    blue: 0x1cb0f6,
    blueDark: 0x1094d4,
    red: 0xff4b4b,
    white: 0xffffff,
    ink: 0x2a1f5c,
    inkSoft: 0x6a5f9c,
    shadow: 0x1a1440,
    yes: 0x2ec4a6,
    mint: 0x2ec4a6,
    cream: 0xfffaf0,
    creamDark: 0xeee3f5,
    panel: 0xe9e0ff,
    toucan: 0x2a2440,
    beak: 0xffa830,
    lava: 0xff4d4d,
    whale: 0x5b8ff0,
} as const

export const CSS = {
    ink: '#2a1f5c',
    inkSoft: '#6a5f9c',
    white: '#ffffff',
    blueDark: '#0b7fb8',
    red: '#d63b6b',
    yes: '#1f9e86',
    pink: '#e0398d',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    balloon: 28,
    ask: 30,
    chip: 26,
    count: 20,
    caption: 32,
    button: 28,
    panelTitle: 36,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
