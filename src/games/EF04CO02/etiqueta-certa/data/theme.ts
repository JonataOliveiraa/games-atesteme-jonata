import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    /** o véu do chão: um areia do meio, que achata o contraste da decoração sem escurecer o pátio */
    wash: 0xe8d9bd,
    /** o leito de brita debaixo dos trilhos */
    ballast: 0xc9beb1,
    ballastEdge: 0xa89b8e,
    floor: 0xf1e6d2,
    floorLine: 0xe2d2b6,
    wall: 0xe9e2f7,
    window: 0xcfeefc,
    safety: 0xffd45a,
    dock: 0x4c4560,
    dockLight: 0xbfe8ff,
    rubber: 0x5d566e,
    rubberLine: 0x47415a,
    rail: 0xfff0d6,
    steel: 0x7f8099,
    steelLight: 0xe6e8f4,
    routeGlow: 0xffe066,
    railDark: 0xd9c49c,
    disc: 0xd6d0e6,
    discDark: 0xb3abc9,
    roller: 0xf6f3ff,
    beam: 0x8ff0ff,
    cardboard: 0xe0b179,
    cardboardDark: 0xc48f55,
    tape: 0xf6e3b8,
    paper: 0xfffaf0,
    paperLine: 0xead9b8,
    wood: 0xe8c48f,
    woodDark: 0xc39a60,
    note: 0xfff2a8,
    coral: 0xff8f7a,
    sky: 0x86c8f4,
    mintTruck: 0x8fdcc4,
    shutter: 0xfff6e4,
    pill: 0x7d63c8,
    pillGlow: 0xffe066,
    link: 0x2fb3a6,
    star: 0xffd23f,
    accent: 0x2fb3a6,
    yes: 0x3fbf6a,
    lilac: 0xc4b2ee,
    mint: 0x8fdcc4,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    ink: 0x3d2c3e,
    inkSoft: 0x75667a,
    white: 0xffffff,
    shadow: 0x2a1f33,
    dirt: 0xf0dfc0,
    dirtDark: 0xdcc59c,
    gravel: 0xc9b38c,
    grass: 0xa9dfb8,
    grassDark: 0x7cc596,
    fence: 0xd9a86c,
    metal: 0xc9c3dc,
    metalDark: 0x8e86a8,
    knob: 0xf06a5a,
    lampRed: 0xff6b5b,
    lampGreen: 0x5ee08a,
    lampOff: 0x4c4560,
    button: 0x4fcf7f,
    buttonDark: 0x2f9e5c,
    roof: 0xc4b2ee,
    roofDark: 0x9c86d4,
    crate: 0xf0cf98,
    crateDark: 0xc9a066,
    stamp: 0xa98ce6,
    stampDark: 0x7d63c8,
    stampInk: 0xb49ae8,
    rubberPad: 0x7d63c8,
} as const

export const CSS = {
    ink: '#3d2c3e',
    inkSoft: '#75667a',
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
    rule: 32,
    pill: 26,
    value: 38,
    plaque: 26,
    go: 34,
    strip: 32,
    noteName: 44,
    noteValue: 34,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
