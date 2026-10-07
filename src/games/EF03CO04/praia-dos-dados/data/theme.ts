import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    sky: 0xbfe8ff,
    skyLow: 0xe2f5ff,
    cloud: 0xffffff,
    sea: 0x5fd0d6,
    seaDeep: 0x3fb3c4,
    foam: 0xffffff,
    sand: 0xf7e2b4,
    sandShade: 0xecd09a,
    tower: 0xff9f4a,
    towerDark: 0xd97a2e,
    wood: 0xf6f0e6,
    towel: 0xffffff,
    towelStripe: 0x7fd8cc,
    cap: 0xe8453c,
    capDark: 0xb92f2a,
    straw: 0xf3cf7a,
    strawDark: 0xd6a94e,
    band: 0x8a5a36,
    lens: 0x2e2430,
    bucket: 0x3f8fe6,
    bucketDark: 0x2c6cb8,
    ring: 0xffd23f,
    ringDark: 0xe0ac1a,
    ballRed: 0xe8453c,
    ballBlue: 0x3f8fe6,
    ballYellow: 0xffd23f,
    fins: 0xa6e23a,
    finsDark: 0x7ab81c,
    blush: 0xff9fb0,
    eye: 0x3a2a40,
    lifeguard: 0xff8a3d,
    radio: 0x5b5f6e,
    radioDark: 0x3c3f4b,
    whistle: 0xd7dbe3,
    heart: 0xff6f8f,
    chip: 0xffffff,
    board: 0xfff8ea,
    boardDark: 0xf0e2c4,
    yes: 0x3fbf6a,
    soft: 0xd8d2c8,
    accent: 0x2fb3a6,
    coral: 0xff8f70,
    lilac: 0xc4b2ee,
    yellow: 0xffc93c,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    ink: 0x3d2c3e,
    inkSoft: 0x75667a,
    white: 0xffffff,
    shadow: 0x2a1f33,
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
    chip: 24,
    nina: 30,
    button: 26,
    bubble: 24,
    radio: 20,
    cardTitle: 34,
    cardLine: 24,
    boardTitle: 34,
    boardLabel: 20,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
