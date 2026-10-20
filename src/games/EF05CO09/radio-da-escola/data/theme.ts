import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    space: 0x150b33,
    spaceMid: 0x24124f,
    spaceHi: 0x3a1d7a,
    nebulaPink: 0xb2369a,
    nebulaViolet: 0x6b3fd8,
    ink: 0x1b1446,
    inkSoft: 0x4a3f7a,
    line: 0x1b1446,
    pink: 0xff3fa4,
    pinkDark: 0xc81f7c,
    pinkLight: 0xff9ad2,
    cyan: 0x2ec5ff,
    cyanDark: 0x1a8fc4,
    cyanLight: 0xa5e8ff,
    lemon: 0xffe14d,
    lemonLight: 0xfff3a6,
    violet: 0x9b5cff,
    violetDark: 0x6b3fd8,
    violetLight: 0xc9a8ff,
    indigo: 0x3a2a8c,
    indigoDark: 0x261a63,
    mint: 0x3fd9a0,
    mintDark: 0x1fa878,
    mintLight: 0xa8f0d2,
    orange: 0xff9a3c,
    red: 0xff4f6d,
    redDark: 0xc92a52,
    lamp: 0xff3355,
    aqua: 0x7fe0d0,
    peach: 0xffb38a,
    sky: 0x7fd1ff,
    white: 0xffffff,
    cream: 0xfff6fb,
    paper: 0xfffdf4,
    paperLine: 0xd9e8ff,
    tape: 0xff8fcf,
    silver: 0xdfe6f5,
    silverDark: 0x8f97b8,
    shadow: 0x0b0620,
    glow: 0xffe14d,
    yes: 0x3fd9a0,
    oops: 0xff9a3c,
    accent: 0xff3fa4,
    accentDark: 0xc81f7c,
    headerFace: 0x1d1046,
    headerRim: 0x6b3fd8,
    headerSoft: 0x3a2a8c,
    blush: 0xff9ec4,
    eye: 0x1b1446,
    play: 0x3fd9a0,
    playDark: 0x1fa878,
    back: 0x8f86b8,
    backDark: 0x5f5788,
    card: 0x261a63,
    cardRim: 0x9b5cff,
} as const

export const LANE_TONES = [0xff3fa4, 0xffe14d, 0x3fd9a0, 0x2ec5ff] as const

export const CSS = {
    ink: '#1b1446',
    inkSoft: '#4a3f7a',
    white: '#ffffff',
    cream: '#fff6fb',
    accent: '#c81f7c',
    pink: '#ff3fa4',
    cyan: '#2ec5ff',
    lemon: '#ffe14d',
    lamp: '#ff5577',
    dim: '#a99bd6',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    ask: 32,
    bubble: 27,
    banner: 40,
    note: 26,
    sign: 24,
    onAir: 24,
    credit: 30,
    judge: 52,
    comboLabel: 26,
    combo: 76,
    name: 24,
    button: 32,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
