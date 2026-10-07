import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0x6cc3fd,
    sidewalk: 0xf3e2c8,
    joint: 0xe2cdb0,
    road: 0x8a99b6,
    dash: 0xffffff,
    yellow: 0xffc93c,
    yellowDark: 0xe0a21c,
    mint: 0x8fdcc4,
    mintDark: 0x4fb497,
    lilac: 0xc4b2ee,
    coral: 0xe8806a,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    door: 0x2b3558,
    glow: 0xfff3c4,
    flake: 0xbfe6f5,
    heat: 0xff9f6b,
    ring: 0x7fc8f8,
    note: 0xe06aa0,
    star: 0xffd84d,
    light: 0xfff7b0,
    drop: 0x5aa7ef,
    yes: 0x3fbf6a,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
    haze: 0xeef7ff,
} as const

export const A = {
    focus: 0.5,
} as const

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    sign: 21,
    balloon: 26,
    mapTitle: 34,
    mapName: 16,
    tag: 13,
    mark: 46,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
