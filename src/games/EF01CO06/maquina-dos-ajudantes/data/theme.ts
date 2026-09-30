import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xcdeef7,
    skyDeep: 0xb3e2f2,
    cloud: 0xffffff,
    grass: 0x9fd98a,
    grassDark: 0x7cc46e,
    fence: 0xfff6e4,
    flower: 0xffb4c8,
    flowerCore: 0xffe07a,
    wood: 0xe8c48e,
    woodDark: 0xb98a52,
    rope: 0xa98663,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    wall: 0xf3dcb8,
    paper: 0xfff4df,
    floor: 0xe6c496,
    roof: 0xff9a86,
    roofDark: 0xe0735f,
    turquoise: 0x5fcfc4,
    turquoiseDark: 0x3aa89e,
    coral: 0xff9a86,
    coralDark: 0xe0735f,
    gold: 0xffd166,
    goldDark: 0xd9a53a,
    glass: 0xdff4fb,
    yellow: 0xffd84a,
    yellowDark: 0xe0b52a,
    lilac: 0xc4aef0,
    lilacDark: 0x9a82d4,
    blueGrey: 0x8fa9c6,
    blueGreyDark: 0x6b86a6,
    screen: 0xeaf4ff,
    screenLit: 0xfff8d6,
    skin: 0xf6c9a8,
    skinDark: 0xe2a986,
    cheek: 0xff9e9e,
    hair: 0x7a4e32,
    hairDark: 0x4a3226,
    grey: 0xf2f2f2,
    pyjama: 0xa8d4f5,
    blanket: 0x8fb8ee,
    onesie: 0xfff0a8,
    dress: 0xffa8c8,
    sofa: 0x7fd8c8,
    sofaDark: 0x55b8a6,
    shirt: 0xffc27a,
    cap: 0x6fcfc0,
    tear: 0x8fd3ff,
    mouth: 0xd9536b,
    heart: 0xff7a8a,
    mint: 0x7fd8be,
    mintDark: 0x3fae8f,
    green: 0x55c46a,
    glow: 0xfff3c4,
    hint: 0xffd166,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
} as const

export const PARTY = [0xff7a8a, 0x5fcfc4, 0xffd84a, 0xc4aef0] as const

export const CSS = {
    ink: '#2b3558',
    inkSoft: '#5b6384',
    white: '#ffffff',
    lilac: '#9a82d4',
} as const

export const A = {
    rim: 0.55,
    veil: 0.58,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    zzz: 34,
    question: 52,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
