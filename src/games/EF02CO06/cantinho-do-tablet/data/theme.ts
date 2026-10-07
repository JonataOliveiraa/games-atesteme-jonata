import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    wall: 0xfbe3d3,
    wallDot: 0xfff1e4,
    baseboard: 0xfffaf2,
    floor: 0xeec594,
    floorDark: 0xd9a670,
    floorLine: 0xc98f58,
    rug: 0xbfe8d6,
    rugDark: 0x93d3ba,
    plant: 0x7fcf8f,
    plantDark: 0x4fa86a,
    pot: 0xf2a77e,
    wood: 0xf3d09b,
    woodDark: 0xcf9a5e,
    woodLight: 0xfde4bd,
    frame: 0xfff8ec,
    sky: 0xa6dcf7,
    skyLight: 0xd3effc,
    sun: 0xffd84d,
    sunGlow: 0xfff3b0,
    beam: 0xffdf5e,
    heat: 0xff8a3d,
    cool: 0x5aa7ef,
    curtain: 0xf7a9c2,
    curtainDark: 0xe0819f,
    mint: 0x8fe0c2,
    mintDark: 0x3fae88,
    lilac: 0xcbb6f2,
    lilacDark: 0x9a7fd6,
    coral: 0xff9f8a,
    coralDark: 0xe57a63,
    juice: 0xffa53b,
    juiceDark: 0xe97f17,
    glass: 0xeaf7ff,
    straw: 0xff6b6b,
    screen: 0x8fd3ff,
    screenDark: 0x5cb6ec,
    screenHot: 0xff7a4d,
    caseMint: 0x9fe6c9,
    skin: 0xb98159,
    skinDark: 0x9a6443,
    blush: 0xff9db0,
    hair: 0x3b2418,
    hairShine: 0x6b4430,
    yellow: 0xffd34d,
    eye: 0xc98a2e,
    shirtLia: 0x9ae6c8,
    shortsLia: 0xc9b2ef,
    cat: 0xf6a75e,
    catLight: 0xfff2dc,
    catEye: 0x7dcf6b,
    shirtBeto: 0xff9a3c,
    navy: 0x46589a,
    red: 0xe8574f,
    sweat: 0x8fd0ff,
    steam: 0xffffff,
    cream: 0xfff6e8,
    creamDark: 0xeedbc0,
    cork: 0xe2b27a,
    corkDark: 0xc48f55,
    ink: 0x4a2c2a,
    inkSoft: 0x7a5a52,
    white: 0xffffff,
    shadow: 0x3a2320,
    yes: 0x3fbf7f,
    glow: 0xffe27a,
    night: 0x2a1d3a,
} as const

export const CSS = {
    ink: '#4a2c2a',
    inkSoft: '#7a5a52',
    white: '#ffffff',
    mintDark: '#2f8f6e',
    coralDark: '#c9563f',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    balloon: 28,
    seal: 22,
    sealBig: 34,
    play: 34,
    board: 40,
    boardLine: 27,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
