import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    skyLow: 0xcdeafd,
    skyHigh: 0xd9cdf6,
    bubble: 0xffffff,
    panel: 0x6c5fb0,
    panelDark: 0x544893,
    columnLine: 0xffffff,

    tab: 0xffffff,
    tabTop: 0x7cc8f2,
    tabShade: 0xc9d8ee,
    dotRed: 0xff7a7a,
    dotYellow: 0xffcf4a,
    dotGreen: 0x5fd18b,
    gold: 0xffc93c,
    goldDark: 0xe0a21a,
    goldLight: 0xffe58f,
    home: 0xb9a6f0,
    homeDark: 0x9580dc,
    summit: 0x8a6fe0,
    summitDark: 0x6a51c4,
    summitLight: 0xc9b8ff,
    shadowSoft: 0x5a4f8a,

    phone: 0x3cc6c0,
    phoneDark: 0x26a19c,
    phoneLight: 0x8ce6df,
    screen: 0xfff8ec,
    eye: 0x2b2440,
    cheek: 0xffa3b8,
    foot: 0xffffff,
    footDark: 0xdcd6ea,
    sweat: 0x8fd0ff,

    paper: 0xfff6e0,
    paperDark: 0xe9d9b4,
    newsBand: 0x4f8ff0,
    line: 0xbfb7a6,
    chat: 0xffe08a,
    chatDark: 0xf0c24a,
    frame: 0xffffff,
    frameDark: 0xd9d3e6,
    hill: 0x6cc28a,
    hillDark: 0x4a9e68,
    sun: 0xffcf4a,
    photoSky: 0xbfe6ff,

    cloud: 0xffffff,
    cloudShade: 0xe3dcf7,
    tower: 0xa58cf0,
    towerDark: 0x7d63d6,
    star: 0xffd84a,
    starDark: 0xf0b414,
    wave: 0xffffff,

    clue: 0x6f84a6,
    clueLight: 0xffffff,

    ink: 0x2b2440,
    inkSoft: 0x5c5470,
    accent: 0x6c5fb0,
    headerFace: 0xfff8ec,
    headerSoft: 0xf6ead3,
    headerRim: 0xe6d3f2,
    headerLine: 0x544893,
    cream: 0xfaf1dc,
    creamDark: 0xe4d2ac,
    card: 0xffffff,
    cardEdge: 0xe2dcf0,
    row: 0xf3f0fa,
    shadow: 0x2a1f30,
    white: 0xffffff,
    yes: 0x3fbf6b,
    yesDark: 0x2c9452,
    yesSoft: 0xd9f5e2,
    no: 0xf05a5a,
    noDark: 0xc93d3d,
    noSoft: 0xffe0d6,
    oops: 0xff9d57,
    butter: 0xffe08a,
    spark: 0xffe066,
    skin: 0xf6c9a0,
    skinDark: 0xe0a77c,
} as const

export const CSS = {
    ink: '#2b2440',
    inkSoft: '#5c5470',
    white: '#ffffff',
    accent: '#6c5fb0',
    yes: '#2c9452',
    no: '#c93d3d',
    oops: '#c9640f',
    from: '#4f6e9e',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    ask: 32,
    caption: 42,
    chip: 22,
    from: 24,
    title: 36,
    caption2: 30,
    label: 21,
    value: 28,
    button: 30,
    why: 27,
    stamp: 54,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
