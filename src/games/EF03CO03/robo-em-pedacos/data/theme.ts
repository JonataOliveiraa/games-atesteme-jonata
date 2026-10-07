import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    wall: 0xf7f7f7,
    panel: 0xddf4ff,
    floor: 0xe5e5e5,
    floorDark: 0xd2d2d2,
    lift: 0xffc800,
    liftDark: 0xe6a700,
    piston: 0xb9c2cc,
    wood: 0xf2d4a7,
    woodDark: 0xd9b480,
    blue: 0x1cb0f6,
    blueDark: 0x1094d4,
    yellow: 0xffc800,
    yellowDark: 0xe6a700,
    grey: 0xe5e5e5,
    greyDark: 0xc8cdd2,
    graphite: 0x4b4b4b,
    off: 0xaeb8c2,
    offDark: 0x8e99a4,
    offScreen: 0x5f6870,
    orange: 0xff9600,
    orangeDark: 0xe07f00,
    purple: 0xce82ff,
    skin: 0xa86b45,
    hair: 0x2f2a2a,
    maroon: 0x7a2a3a,
    red: 0xff4b4b,
    white: 0xffffff,
    ink: 0x3c3c3c,
    inkSoft: 0x6b6b6b,
    shadow: 0x2a2f36,
    yes: 0x2ec4a6,
    glow: 0xffe27a,
    tag: 0xffffff,
    cream: 0xfffaf0,
    creamDark: 0xeee3cf,
    mint: 0x2ec4a6,
    lilac: 0xce82ff,
} as const

export const CSS = {
    ink: '#3c3c3c',
    inkSoft: '#6b6b6b',
    white: '#ffffff',
    blueDark: '#0b7fb8',
    red: '#d63b3b',
    yes: '#1f9e86',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    balloon: 28,
    tag: 22,
    tagBig: 30,
    panelTitle: 40,
    panelCol: 30,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
