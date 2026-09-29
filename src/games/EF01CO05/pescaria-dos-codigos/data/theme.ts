import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Hue } from '../types'

export const C = {
    sky: 0xcdeef0,
    skyDeep: 0xa9dfe0,
    cloud: 0xffffff,
    hill: 0x8fcf8a,
    hillDark: 0x6bb36a,
    water: 0x9fdccb,
    waterMid: 0x7cc9b6,
    waterDeep: 0x5bb3a0,
    waterLine: 0xe9fbf5,
    wood: 0xe8c48e,
    woodDark: 0xb98a52,
    sail: 0xfff4dc,
    sailDark: 0xead8b4,
    board: 0x2f5a4a,
    boardDark: 0x224536,
    lilac: 0xb9a4e6,
    lilacDark: 0x8a74c4,
    fish: 0xd9d2ef,
    fishDark: 0xb2a8d6,
    fin: 0x7fd8be,
    mint: 0x7fd8be,
    mintDark: 0x3fae8f,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    coral: 0xffb4a2,
    skin: 0xf6c9a8,
    hair: 0x9a6b4a,
    hat: 0x6cc9b0,
    shirt: 0xc7b3ee,
    green: 0x55c46a,
    beam: 0xfffbe6,
    glow: 0xfff3c4,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
} as const

export const HUE: Record<Hue, number> = {
    red: 0xe53935,
    blue: 0x1e88e5,
    yellow: 0xfdd835,
}

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
} as const

export const A = {
    beam: 0.2,
    beamLit: 0.32,
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    sign: 44,
    sign2: 34,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
