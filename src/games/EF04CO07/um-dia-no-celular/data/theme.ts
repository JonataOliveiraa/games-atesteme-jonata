import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    ink: 0x2b2440,
    inkSoft: 0x5b5378,
    line: 0x3a3154,
    white: 0xffffff,
    paper: 0xfffdf8,
    shadow: 0x1b1530,
    accent: 0x6c5ce7,
    accentDark: 0x4b3fb8,
    accentSoft: 0xe6e1ff,
    yes: 0x34c38f,
    oops: 0xff8a5c,
    butter: 0xffd96a,
    coral: 0xff7f6e,
    mint: 0x7fdcc0,
    sky: 0x8fd3ff,
    lilac: 0xc9b6f5,
    lilacDark: 0x9a84d8,
    peach: 0xffd2b8,
    pink: 0xff9fc4,
    headerFace: 0xf7f4ff,
    headerSoft: 0xe4ddfb,
    headerRim: 0xd2c8f6,
    headerLine: 0x4b3f8f,
    phoneCase: 0xb8a6ee,
    phoneCaseDark: 0x8f7bd6,
    phoneCaseLight: 0xdcd2fb,
    screenOff: 0x0e0c18,
    statusInk: 0x2b2440,
    wallTop: 0xb9a8f5,
    wallBottom: 0x9ee3d0,
    chatBg: 0xf1eefb,
    chatTop: 0xffffff,
    mine: 0x6c5ce7,
    theirs: 0xffffff,
    inputBg: 0xffffff,
    inputPill: 0xefecf8,
    cameraBar: 0x14121c,
    cameraFrame: 0x1f1c2b,
    galleryBg: 0x0f0d17,
    night: 0x1a2350,
    veil: 0xfdfbff,
    skinLight: 0xffe0cc,
    skinTan: 0xf2c39d,
    skinMid: 0xc98a5e,
    skinBrown: 0x9a6440,
    cheek: 0xff9a9a,
    eye: 0x2b2440,
    gold: 0xffc94a,
    goldDark: 0xd99a1c,
    diary: 0x8e63d8,
    diaryDark: 0x6a43b4,
    cake: 0x7a4a2e,
    cakeDark: 0x5a3320,
    frosting: 0xfff6ee,
    flame: 0xffb340,
} as const

export const KID_TONE = {
    nina: 0xff7f6e,
    duda: 0x4fc387,
    bia: 0x9b7be6,
    caio: 0x4f9be8,
    rafa: 0xff9a3c,
} as const

export const ADULT_TONE = {
    prof: 0x3fb3a5,
    mae: 0xf2b632,
    vovo: 0xf48fb1,
} as const

export const CSS = {
    ink: '#2b2440',
    inkSoft: '#5b5378',
    white: '#ffffff',
    accent: '#5446d6',
    accentDark: '#4b3fb8',
    mineInk: '#ffffff',
    status: '#2b2440',
    camera: '#ffd96a',
    grey: '#8e88a6',
    oops: '#e0603a',
    yes: '#1f9a6c',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    level: 22,
    help: 36,
    order: 27,
    balloonName: 22,
    balloon: 29,
    chip: 25,
    status: 17,
    clock: 58,
    date: 18,
    appLabel: 17,
    bannerName: 18,
    banner: 19,
    chatName: 21,
    bubble: 20,
    reply: 19,
    camMode: 17,
    galleryButton: 16,
    remoteName: 24,
    lock: 46,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 165 ? CSS.ink : CSS.white
}
