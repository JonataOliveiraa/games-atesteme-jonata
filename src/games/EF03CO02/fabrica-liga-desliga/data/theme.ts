import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    wall: 0xfdf3e3,
    wallLine: 0xf0dfc3,
    wainscot: 0xf6dfc0,
    floor: 0xd9b98a,
    floorLine: 0xc8a574,
    metal: 0x9aa5bf,
    metalDark: 0x6f7a96,
    beltTop: 0x8a96b2,
    slat: 0x6f7a96,
    funnel: 0xfff1d6,
    funnelBand: 0x8fdcc4,
    dough: 0xfbeccb,
    doughShade: 0xead2a4,
    cookie: 0xe0a24e,
    cookieShade: 0xc27f30,
    chip: 0x5a3a24,
    oven: 0xf29a7e,
    ovenDark: 0xd97a5f,
    brick: 0xe2876b,
    tunnel: 0x3b2f3f,
    windowOut: 0x5d6276,
    windowLit: 0xffe28a,
    flame: 0xff8a3d,
    flameCore: 0xffd166,
    glow: 0xfff0b8,
    glowWarn: 0xffe08a,
    spark: 0xffd84d,
    smell: 0xe8b07a,
    table: 0xc89b67,
    tableDark: 0xa77c4c,
    tray: 0xcfd6e6,
    switchBox: 0xeef1f7,
    lever: 0xff9f8a,
    lampOff: 0xb7bfd3,
    lampOn: 0x3fbf6a,
    mint: 0x8fdcc4,
    mintDark: 0x4fb497,
    lilac: 0xc4b2ee,
    coral: 0xff9f8a,
    yellow: 0xffc93c,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    yes: 0x3fbf6a,
    beltOn: 0x7fd39a,
    beltOff: 0xffffff,
    ovenOn: 0xff9f5a,
    ovenOff: 0xb9bfcc,
    ink: 0x2b3558,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    shadow: 0x1e2644,
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
    card: 30,
    counter: 30,
    balloon: 26,
    boardTitle: 34,
    boardLabel: 20,
    boardLine: 22,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
