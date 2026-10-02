import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    wall: 0xfdf3e3,
    wallLine: 0xf0dfc3,
    wood: 0xe8c48e,
    woodDark: 0xb98a52,
    woodLight: 0xf3d9ae,
    floor: 0xd9b98a,
    sky: 0xbfe6f5,
    mint: 0x8fdcc4,
    mintDark: 0x4fb497,
    lilac: 0xc4b2ee,
    lilacDark: 0x9580cf,
    coral: 0xffb4a2,
    coralDark: 0xe8806a,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    steel: 0xcfd6e6,
    steelDark: 0x8f9ab4,
    rail: 0x9aa5bf,
    sleeper: 0xb98a52,
    device: 0xeef1f7,
    deviceDark: 0xb7bfd3,
    glow: 0xfff3c4,
    yes: 0x3fbf6a,
    no: 0x2b3558,
    smoke: 0xffffff,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
} as const

export const APP = {
    game: 0x9b7be0,
    music: 0xf28fb3,
    paint: 0xf6a35b,
    alarm: 0x4fc3b5,
    photos: 0x5aa7ef,
    dance: 0xe7c14a,
} as const

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
} as const

export const A = {
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    plate: 26,
    sign: 20,
    signSub: 15,
    balloon: 26,
    board: 30,
    boardSub: 22,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
