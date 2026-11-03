import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Color, Rule, Shape, Size } from '../types'

export const C = {
    cabinet: 0x8f84bd,
    cabinetDark: 0x5f558f,
    cabinetLight: 0xc0b8d6,
    cream: 0xfae9ce,
    bear: 0xc8915f,
    turquoise: 0x6abfd4,
    glass: 0xbfe6ff,
    glassDark: 0x1d2a52,
    rail: 0xb7afcd,
    railDark: 0x6d6596,
    metal: 0xdfd6cd,
    metalDark: 0x8a8398,
    tray: 0xf5eee5,
    trayDark: 0xcdc5d7,
    trayRim: 0xa99fc4,
    box: 0xe9eaf1,
    boxLine: 0x9f95c1,
    visor: 0x3a4361,
    visorRim: 0xfbc34f,
    beam: 0x5fe3ff,
    gold: 0xfbc34f,
    goldDark: 0xd99a1e,
    amber: 0xffa53a,
    amberDark: 0xd9761a,
    green: 0x55c46a,
    greenDark: 0x2f8a45,
    ink: 0x1e2644,
    inkSoft: 0x5b6384,
    white: 0xffffff,
    hudBar: 0x3a4361,
    hudLine: 0xfbc34f,
    shadow: 0x1e2644,
} as const

export const CSS = {
    ink: '#1e2644',
    inkSoft: '#5b6384',
    white: '#ffffff',
    visorText: '#ffffff',
    amberInk: '#7a3d00',
} as const

export const A = {
    shadow: 0.2,
    glass: 0.16,
    veil: 0.6,
    back: 0.78,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    visor: 40,
    caption: 30,
    sorting: 34,
    hudLevel: 20,
} as const

export const PAINT: Record<Color, number> = {
    red: 0xee473a,
    yellow: 0xfcca39,
    green: 0x67bc58,
    blue: 0x4399f2,
    pink: 0xfc95bc,
}

export const WORD: Record<Color, string> = {
    red: 'VERMELHOS',
    yellow: 'AMARELOS',
    green: 'VERDES',
    blue: 'AZUIS',
    pink: 'ROSAS',
}

export const SIZE_WORD: Record<Size, string> = {
    big: 'GRANDES',
    small: 'PEQUENOS',
}

export const SHAPE_WORD: Record<Shape, string> = {
    round: 'REDONDOS',
    square: 'QUADRADOS',
    triangle: 'TRIÂNGULOS',
}

export function ruleWord(rule: Rule): string {
    const word =
        rule.feature === 'color' ? WORD[rule.color] : rule.feature === 'size' ? SIZE_WORD[rule.size] : SHAPE_WORD[rule.shape]
    return rule.not ? `NÃO ${word}` : word
}

export const SAME_WORD = 'IGUAIS'
export const DIFFERENT_WORD = 'DIFERENTES'

export const hex = (color: number) => `#${color.toString(16).padStart(6, '0')}`

export function inkOn(tone: number): string {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    const light = 0.299 * r + 0.587 * g + 0.114 * b
    return light > 160 ? CSS.ink : CSS.white
}
