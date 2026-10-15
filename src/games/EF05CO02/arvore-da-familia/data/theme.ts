import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    skyTop: 0xcfeaec,
    skyLow: 0xa8d6db,
    sun: 0xf6dc7c,
    sunGlow: 0xfbeeb8,
    cloud: 0xfbf6ea,
    hillFar: 0xb4d596,
    hill: 0x9cc67a,
    grass: 0xa9cf86,
    grassTick: 0x7fae62,
    bush: 0x7fae62,
    canopy: 0x8cbb6a,
    canopyDark: 0x729f56,
    canopyLight: 0xb2d48f,
    trunk: 0x8a5a3c,
    trunkDark: 0x6a4029,
    ink: 0x3b2626,
    paper: 0xfff8ec,
    paperDark: 0xf0e0c4,
    edge: 0x74402c,
    edgeHi: 0xb57b55,
    accent: 0xe0684b,
    accentDark: 0xb84a33,
    me: 0xf4a261,
    yes: 0x6dbb6a,
    oops: 0xff9d57,
    butter: 0xffe08a,
    ring: 0xffbf1f,
    blush: 0xf2a0a0,
    pink: 0xf2a7b5,
    lilac: 0xc6b6ea,
    mint: 0x8fdcc6,
    leaf: 0x86b865,
    petal: 0xe9a3ae,
    petalCore: 0xe9b949,
    gust: 0xfffdf6,
    white: 0xffffff,
    cream: 0xfaf1dc,
    creamDark: 0xe4d2ac,
    shadow: 0x2b1d1d,
    headerFace: 0xfff8ec,
    headerRim: 0xead6b6,
    headerLine: 0x3b2626,
    pip: 0xf3e6cf,
    sand: 0xe9cfae,
    sandDark: 0xdcb88f,
    sea: 0x72adab,
    foam: 0xfbf3e2,
    yardSky: 0xa8d3d6,
    yardGrass: 0xc5c483,
} as const

export const SKIN = {
    brown: 0xc68a5e,
    tan: 0xe8b98f,
    fair: 0xf6d5bd,
    light: 0xdba57d,
} as const

export const HAIR = {
    black: 0x2e2323,
    brown: 0x6b4128,
    copper: 0xc0612f,
    white: 0xf1ede6,
} as const

export const SHIRT = {
    mustard: 0xe9b949,
    sage: 0x9cbf8a,
    pink: 0xe8a7a7,
    lilac: 0xc3aee0,
    slate: 0x6f86a0,
    cocoa: 0x8a5a3c,
    moss: 0x7f9a5a,
    petrol: 0x3f7f86,
    orange: 0xf0904a,
    white: 0xf7f3ea,
} as const

export const CSS = {
    ink: '#3b2626',
    inkSoft: '#6b5050',
    accent: '#b84a33',
    white: '#ffffff',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    goal: 26,
    label: 20,
    bubble: 28,
    banner: 36,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
