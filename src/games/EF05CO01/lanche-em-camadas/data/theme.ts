import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    wall: 0xfdf3e1,
    wallTile: 0xf6e6c8,
    mint: 0x8fdcc6,
    mintDark: 0x54b89d,
    kitchen: 0x5b4a6a,
    kitchenDark: 0x3f3150,
    sill: 0xc99a68,
    sillDark: 0x9a6c43,
    floorA: 0xf4ead8,
    floorB: 0xd8e9e3,
    counter: 0xd9a46d,
    counterDark: 0xb07c49,
    counterTop: 0xe9c49a,
    lamp: 0xffd77a,
    bun: 0xf2b45c,
    bunDark: 0xd18a35,
    bunLight: 0xffd796,
    seed: 0xfff6e0,
    meat: 0x8a4b2e,
    meatDark: 0x5e2f1b,
    cheese: 0xffd23f,
    cheeseDark: 0xe8a91f,
    lettuce: 0x7fd36a,
    lettuceDark: 0x4fa54a,
    tomato: 0xf2584a,
    tomatoDark: 0xc2352e,
    egg: 0xfffdf6,
    yolk: 0xffb72e,
    pickle: 0x9ccf5a,
    pickleDark: 0x6a9c32,
    tray: 0x8fd6cc,
    trayDark: 0x5aa79c,
    ink: 0x2b2440,
    inkSoft: 0x5c5470,
    line: 0x3a2f4a,
    accent: 0x2a9d93,
    accentDark: 0x1d7a72,
    headerFace: 0xfff8ec,
    headerSoft: 0xf6ead3,
    headerRim: 0xeacfa2,
    headerLine: 0x6b4a2f,
    white: 0xffffff,
    cream: 0xfaf1dc,
    creamDark: 0xe4d2ac,
    shadow: 0x2a1f30,
    yes: 0x49c27c,
    oops: 0xff9d57,
    butter: 0xffe08a,
    coral: 0xff8a6b,
    pink: 0xf5a0bf,
    lilac: 0xc6b6ea,
    sky: 0x9ed3f0,
    skinA: 0xb47a52,
    skinADark: 0x8c5a39,
    skinB: 0xf6cfaa,
    skinBDark: 0xe0a882,
    hairBrown: 0x6b4128,
    hairBlack: 0x2b2533,
    hairGinger: 0xe0793a,
    hairWhite: 0xf1eef5,
    apron: 0x7fd6c4,
    apronDark: 0x4fae98,
    shirt: 0xfff4dc,
    shorts: 0x9a6a46,
    shoe: 0xffffff,
    shoeDark: 0xdcdde8,
    cheek: 0xf59a9a,
    eye: 0x3a2418,
    chefCoat: 0xffffff,
    chefCoatDark: 0xe2e2ee,
    mustache: 0x5b3a26,
} as const

export const CSS = {
    ink: '#2b2440',
    inkSoft: '#5c5470',
    white: '#ffffff',
    accent: '#1d7a72',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    nth: 20,
    bubble: 27,
    banner: 40,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
