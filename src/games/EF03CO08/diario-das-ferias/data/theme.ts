import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xcfeaf7,
    skyLow: 0xe3f3f8,
    cloud: 0xfffaf0,
    sea: 0x9fd8e6,
    seaDeep: 0x86c9dc,
    seaLine: 0xd8f2f2,
    foam: 0xffffff,
    sand: 0xf6e3bf,
    sandDark: 0xe8cf9f,
    sandLine: 0xd9b97f,
    rock: 0xc9bfd6,
    rockDark: 0xa99dbb,
    palm: 0x9fd6a6,
    palmDark: 0x6fb784,
    trunk: 0xc9a27a,
    trunkDark: 0x9c7957,
    grass: 0xa8d8a0,
    wood: 0xe9c99a,
    woodDark: 0xc9a06c,
    roof: 0xf4a99a,
    coral: 0xf6a593,
    coralDark: 0xd97c68,
    peach: 0xffc9a8,
    peachDark: 0xe39c76,
    mint: 0xa8e3cf,
    mintDark: 0x5fb79a,
    lilac: 0xcdb8ec,
    lilacDark: 0x9c84c8,
    butter: 0xffe49a,
    dolphin: 0xa9c9ee,
    dolphinDark: 0x7f9fcf,
    skin: 0xc68a5f,
    skinDark: 0xa56e48,
    hair: 0x4a3226,
    denim: 0xa9c4e2,
    cheek: 0xf3a3a0,
    curtain: 0xf7b49b,
    curtainDark: 0xe08f74,
    screen: 0xfff8ea,
    floor: 0xe9c99a,
    floorLine: 0xcfa874,
    crowd: [0x4a3226, 0x8a5a3c, 0xe6c06a, 0x2e2a2a, 0xc77d5a, 0x6b4a3a],
    note: [0xf6a593, 0xcdb8ec, 0x8fd3c0, 0xffd27a, 0x9fc6ee],
    visorOpen: 0xd5d5dd,
    visorOn: 0xffffff,
    accent: 0x2fa9a0,
    yes: 0x3fbf6a,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    paper: 0xfffdf7,
    ink: 0x4a3540,
    inkSoft: 0x7d6a74,
    white: 0xffffff,
    shadow: 0x2a1f33,
} as const

export const CSS = {
    ink: '#4a3540',
    inkSoft: '#7d6a74',
    white: '#ffffff',
    accent: '#1f8f84',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    tool: 28,
    card: 22,
    banner: 44,
    title: 34,
    chip: 26,
    button: 28,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
