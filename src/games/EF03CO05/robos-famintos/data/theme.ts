import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Format } from '../types'

export const C = {
    sky: 0xdcefff,
    panel: 0xddf4ff,
    wall: 0xeaf5ff,
    rivet: 0xc9def0,
    pipe: 0xf5c9d8,
    pipeDark: 0xe2a7bd,
    floor: 0xf2d29b,
    floorDark: 0xdcb377,
    rug: 0xffb3a7,
    wood: 0xe9b97a,
    woodDark: 0xc98f4c,
    band: 0x8a5a3c,
    blue: 0x1cb0f6,
    blueDark: 0x1094d4,
    yellow: 0xffc800,
    orange: 0xff9600,
    purple: 0xce82ff,
    red: 0xff4b4b,
    white: 0xffffff,
    ink: 0x4a3530,
    inkSoft: 0x7a6560,
    shadow: 0x2a2f36,
    yes: 0x2ec4a6,
    mint: 0x2ec4a6,
    lilac: 0xce82ff,
    glow: 0xffe27a,
    cream: 0xfffaf0,
    creamDark: 0xeee3cf,
    screen: 0xfff8e8,
    screenDark: 0xe9dcc4,
    cart: 0xfff3dc,
    cartRim: 0xc7a8e8,
    cartRimDark: 0xa486cc,
    blush: 0xffa8b8,
    metal: 0xdfe6ee,
    metalDark: 0xb7c3d0,
    crate: 0xf0c27a,
    crateDark: 0xc9924a,
    dot: 0xffffff,
} as const

export const ROBOT_TONE: Record<Format, { body: number; dark: number; accent: number }> = {
    music: { body: 0xc9b6f2, dark: 0xa48fd8, accent: 0xff8fc0 },
    photo: { body: 0xffbea6, dark: 0xec9a7e, accent: 0x5b6b7c },
    text: { body: 0xa6e6cf, dark: 0x7cc9ae, accent: 0xffd23f },
    video: { body: 0xa9d8f8, dark: 0x7fbbe6, accent: 0xff6b6b },
}

export const PLATFORM_TONE = [0xb8ecd6, 0xfff0a8, 0xe1d0ff, 0xffd4c2] as const

export const PIXEL: Record<string, number> = {
    o: 0xff9a3c,
    k: 0x3a2a2a,
    p: 0xff7eb6,
    y: 0xffd23f,
    g: 0x5cc46a,
    b: 0x4aa8ff,
    r: 0xf0524f,
    n: 0xb57a45,
    c: 0xf6e3b4,
    w: 0xffffff,
    l: 0xb98cf0,
}

export const CSS = {
    ink: '#4a3530',
    inkSoft: '#7a6560',
    white: '#ffffff',
    blueDark: '#0b7fb8',
    red: '#d63b3b',
    yes: '#1f9e86',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    help: 40,
    level: 22,
    balloon: 28,
    plate: 24,
    letter: 30,
    panelTitle: 40,
    panelCount: 28,
} as const

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? CSS.ink : CSS.white
}
