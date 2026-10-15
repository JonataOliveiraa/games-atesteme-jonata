import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Fig } from '../types'

export const C = {
    wall: 0xfaebd8,
    wallStripe: 0xf6e6cb,
    wood: 0xe9c08c,
    woodLight: 0xf4d7aa,
    woodDark: 0xcc9660,
    woodLine: 0xb07a45,
    belt: 0x8d9bb5,
    beltDark: 0x6d7a95,
    beltRidge: 0x7d8aa6,
    rail: 0xf1dcb4,
    linen: 0xfbf4e4,
    linenDark: 0xeee1c4,
    linenEdge: 0xc9b18a,
    stitch: 0xd2bb93,
    flower: 0xf5839a,
    flowerDark: 0xd73646,
    flowerCore: 0xfff3d6,
    star: 0xf8c24a,
    starDark: 0xcf7d01,
    heart: 0xf4625f,
    heartDark: 0xd32f2e,
    outer: 0x6f93e2,
    outerDark: 0x2f4590,
    inner: 0xc49ae0,
    innerDark: 0x5e2f84,
    button: 0xfff8ea,
    paper: 0xfffaf0,
    paperEdge: 0xe0cba2,
    tagFill: 0xfff6e6,
    tagStitch: 0xb9875a,
    metal: 0xdfe3ea,
    metalDark: 0x9aa1b3,
    rope: 0xe7d2a8,
    ropeDark: 0xb89b68,
    lamp: 0xffe58a,
    sky: 0xcfeaf5,
    skyLight: 0xeaf7fb,
    leaf: 0x8fd1a4,
    leafDark: 0x5ea878,
    pot: 0xe8987a,
    basket: 0xd9a46a,
    basketDark: 0xa8733f,
    accent: 0x4f86d6,
    yes: 0x3fbf6a,
    glow: 0xffd84d,
    lilac: 0xc4b2ee,
    mint: 0x8fdcc4,
    peach: 0xffc9a8,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    ink: 0x3d2c3e,
    inkSoft: 0x75667a,
    white: 0xffffff,
    shadow: 0x2a1f33,
} as const

export const FIG_COLOR: Record<Fig, { fill: number; dark: number }> = {
    flower: { fill: C.flower, dark: C.flowerDark },
    star: { fill: C.star, dark: C.starDark },
    heart: { fill: C.heart, dark: C.heartDark },
}

export const CSS = {
    ink: '#3d2c3e',
    inkSoft: '#75667a',
    white: '#ffffff',
    accent: '#3c6bb3',
    outer: '#3a5bb4',
    inner: '#7a46a6',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    tabOuter: 40,
    tabInner: 32,
    ask: 38,
    tagNumber: 78,
    tagWord: 30,
    count: 30,
    banner: 42,
} as const

export const hex = (tone: number) => `#${tone.toString(16).padStart(6, '0')}`

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
