import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Tool } from '../types'

export const C = {
    skyTop: 0x2ec5ff,
    skyLow: 0xcff4ff,
    cloud: 0xffffff,
    cloudShade: 0xe3d9ff,
    hill: 0x8ee6b0,
    hillDark: 0x4cc79a,
    teal: 0x36c9a0,
    rock: 0xb4a9d6,
    rockLight: 0xd6cdf0,
    cropA: 0xf6e27a,
    cropB: 0x9fe07a,
    roof: 0xff86c8,
    roofAlt: 0xffe14d,
    wall: 0xfff7e8,
    grass: 0x43d16a,
    grassDark: 0x22a854,
    soil: 0x9c5a3c,
    soilDark: 0x7a4029,
    indigo: 0x3a2a8c,
    indigoDark: 0x241a5e,
    pink: 0xff3fa4,
    pinkDark: 0xd81b82,
    cyan: 0x2ec5ff,
    cyanDark: 0x0f9fd8,
    royal: 0x2e6bff,
    royalDark: 0x1a4ad1,
    violet: 0x9b5cff,
    yellow: 0xffe14d,
    orange: 0xff8a1f,
    red: 0xff4b3a,
    leafRed: 0xe8452c,
    trunk: 0x8a4b2a,
    crown: 0x4cd964,
    wool: 0xffffff,
    woolShade: 0xe6e1f5,
    face: 0x3a2a3a,
    skin: 0x6b3d2a,
    skinDark: 0x55301f,
    eye: 0x19c37d,
    hair: 0x141218,
    hairShine: 0x4a5068,
    glass: 0xbff3ff,
    white: 0xffffff,
    ink: 0x1b1446,
    inkSoft: 0x5b5486,
    grey: 0xe5e5f0,
    shadow: 0x1b1446,
    hint: 0xffe14d,
    green: 0x58cc02,
    accent: 0xff3fa4,
    flame: 0xffb31f,
} as const

export const TOOL_COLOR: Record<Tool, number> = {
    blower: C.cyan,
    water: C.royal,
    pull: C.pink,
}

export const TOOL_DARK: Record<Tool, number> = {
    blower: C.cyanDark,
    water: C.royalDark,
    pull: C.pinkDark,
}

export const CONFETTI = [C.pink, C.cyan, C.yellow, C.violet, C.green]

export const CSS = {
    ink: '#1b1446',
    inkSoft: '#5b5486',
    white: '#ffffff',
    green: '#58cc02',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
