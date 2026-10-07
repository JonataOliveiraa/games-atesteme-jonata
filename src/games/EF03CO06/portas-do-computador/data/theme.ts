import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    field: 0x2e2a63,
    fieldDeep: 0x231f4f,
    trace: 0x4a4396,
    pad: 0x7a70d0,
    rubber: 0xfdf7ff,
    sling: 0xff9cc8,
    rim: 0xb8a6ea,
    rimLight: 0xece5ff,
    chrome: 0xf6f3ff,
    cable: 0x5b5470,
    screenOff: 0x1b1838,
    glow: 0xfff3a0,
    wall: 0xefe6fb,
    wallLow: 0xe2f4ee,
    floor: 0xe9c99a,
    floorLine: 0xd6b07a,
    neon: 0xffc6e8,
    neonMint: 0xb8f0dc,
    cabinet: 0xd8cdf2,
    table: 0xdff5ec,
    tableLine: 0xbfe6d7,
    frame: 0xd9dde8,
    frameDark: 0xb6bccc,
    rail: 0x9be7d4,
    railGlow: 0xffffff,
    route: 0xffd84d,
    input: 0x3f8fe6,
    inputDark: 0x2c6cb8,
    output: 0xff8a3d,
    outputDark: 0xd96a20,
    process: 0x9a6ad8,
    chip: 0xc9c2e0,
    chipOn: 0xfff09a,
    chipGlow: 0xffe066,
    metal: 0xd9dde6,
    metalDark: 0x9aa1b3,
    device: 0xf4f5f8,
    deviceGrey: 0xc9ccd6,
    graphite: 0x4a4f5e,
    mint: 0x8fdcc4,
    mintDark: 0x4fb497,
    paper: 0xffffff,
    star: 0xffd23f,
    note: 0x9a6ad8,
    heart: 0xff6f8f,
    skin: 0xb7774c,
    hair: 0x3a2a24,
    shirt: 0x8fdcc4,
    shorts: 0xa9adb8,
    blush: 0xff9fb0,
    eye: 0x3a2a40,
    accent: 0x2fb3a6,
    yes: 0x3fbf6a,
    lilac: 0xc4b2ee,
    yellow: 0xffc93c,
    cream: 0xfff6e4,
    creamDark: 0xead9b8,
    asleep: 0xd6d6de,
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
    process: '#7a4ac0',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    kid: 26,
    button: 24,
    plate: 17,
    panel: 22,
    processing: 22,
    boardTitle: 32,
    boardLine: 19,
    synth: 20,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
