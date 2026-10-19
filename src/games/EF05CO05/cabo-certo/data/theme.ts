import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Kind } from '../types'

export const C = {
    rug: 0xcfe8f7,
    rugLine: 0xb8daf0,
    rugEdge: 0xa9cfe9,
    floor: 0xf3e9d8,
    floorDark: 0xe2d3b9,
    table: 0xfaf4ea,
    tableDark: 0xe6dccb,
    shelf: 0xc79a6b,
    shelfDark: 0xa57a4f,
    plant: 0x6cc28a,
    plantDark: 0x4a9e68,
    pot: 0xe8865f,
    puff: 0xf5b6c8,
    puffDark: 0xe393ab,

    caseFace: 0xf4f7fb,
    caseSide: 0x8ea3c4,
    caseSideDark: 0x6f84a6,
    board: 0x2f6b55,
    boardDark: 0x24543f,
    chip: 0x3a3f4b,
    chipLight: 0x5b6272,
    pin: 0xf2c14e,
    think: 0xfff3a6,

    graphite: 0x4a4f5c,
    graphiteDark: 0x353946,
    slate: 0x6f84a6,
    slateLight: 0xa9b8d2,
    ice: 0xf4f7fb,
    key: 0xe9edf4,
    keyDark: 0xc8d0dd,
    metal: 0xc9ced8,
    metalDark: 0x9aa1ae,
    screenOff: 0x1e2a44,
    screenOn: 0x29406b,
    lens: 0x2b3550,
    lensLight: 0x7fa7e0,
    accentBlue: 0x4f8ff0,
    accentPink: 0xf27fa6,
    accentYellow: 0xffcf4a,

    entrada: 0x3fbf6b,
    entradaDark: 0x2c9452,
    saida: 0xff9a3c,
    saidaDark: 0xd9761c,
    armazenamento: 0x9b6ee6,
    armazenamentoDark: 0x7650c2,
    hole: 0x262a35,

    cable: 0x3d4250,
    cableLight: 0x5d6374,
    plug: 0x4a4f5c,
    plugDark: 0x353946,

    ink: 0x2b2440,
    inkSoft: 0x5c5470,
    line: 0x2e2a40,
    accent: 0x2f7fd6,
    accentDark: 0x1f63ad,
    headerFace: 0xfff8ec,
    headerSoft: 0xf6ead3,
    headerRim: 0xeacfa2,
    headerLine: 0x6b4a2f,
    cream: 0xfaf1dc,
    creamDark: 0xe4d2ac,
    shadow: 0x2a1f30,
    white: 0xffffff,
    yes: 0x49c27c,
    oops: 0xff9d57,
    butter: 0xffe08a,
    asleep: 0x9aa1ae,
    spark: 0xffe066,
    coral: 0xff8a6b,
    lilac: 0xc6b6ea,
} as const

export const KIND_COLOR: Record<Kind, number> = {
    entrada: C.entrada,
    saida: C.saida,
    armazenamento: C.armazenamento,
}

export const KIND_DARK: Record<Kind, number> = {
    entrada: C.entradaDark,
    saida: C.saidaDark,
    armazenamento: C.armazenamentoDark,
}

export const CSS = {
    ink: '#2b2440',
    inkSoft: '#5c5470',
    white: '#ffffff',
    accent: '#2f7fd6',
    entrada: '#2c9452',
    saida: '#d9761c',
    armazenamento: '#7650c2',
    screen: '#bff3ff',
} as const

export const KIND_CSS: Record<Kind, string> = {
    entrada: CSS.entrada,
    saida: CSS.saida,
    armazenamento: CSS.armazenamento,
}

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    ask: 30,
    name: 24,
    plate: 26,
    bubble: 27,
    banner: 34,
    screen: 34,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
