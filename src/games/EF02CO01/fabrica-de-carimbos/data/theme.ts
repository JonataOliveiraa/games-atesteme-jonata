import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Hue } from '../types'

export const C = {
    wall: 0xf3ecff,
    wallDark: 0xe2d8f7,
    floor: 0xd9cdb4,
    floorDark: 0xbfae8f,
    mint: 0x8fdcc4,
    mintDark: 0x4fb497,
    lilac: 0xc4b2ee,
    lilacDark: 0x9580cf,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    wood: 0xe8c48e,
    woodDark: 0xb98a52,
    steel: 0xcfd6e6,
    steelDark: 0x9aa5bf,
    belt: 0x9aa8c2,
    beltDark: 0x7a88a3,
    tunnel: 0x6f6a8f,
    tunnelDark: 0x4d4870,
    zone: 0xfffbe6,
    glow: 0xfff3c4,
    neutral: 0xc9c4d9,
    yes: 0x3fbf6a,
    no: 0x2b3558,
    stampInk: 0x2f9e5a,
    ribbon: 0xb98ae0,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
} as const

export const HUE: Record<Hue, number> = {
    blue: 0x1e88e5,
    red: 0xe53935,
    yellow: 0xfdd835,
}

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
    stampInk: '#2f9e5a',
} as const

export const A = {
    zone: 0.18,
    zoneLit: 0.34,
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    window: 15,
    window3: 12,
    chip: 18,
    note: 22,
    balloon: 28,
    sign: 50,
    approved: 26,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
