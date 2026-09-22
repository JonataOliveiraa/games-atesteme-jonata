import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

/**
 * As cores saem do `bg-canteiro.png` — terra, madeira e tapume —, para o
 * `Graphics` falar a mesma língua da arte. O contorno é COLORIDO, nunca preto:
 * é a regra da linha "vetor de conto".
 */
export const C = {
    dirt: 0xd9ab72,
    dirtDark: 0xb0834f,
    dirtLight: 0xeccb9b,

    wood: 0xb07a41,
    woodDark: 0x7c5027,

    ink: 0x463020,
    inkSoft: 0x8a6c4f,
    line: 0x6b4a2a,

    paper: 0xfff4e2,
    paperEdge: 0xd9bd94,
    white: 0xffffff,

    green: 0x5da34a,
    greenDark: 0x3d7a33,
    amber: 0xf0a33c,
    amberDark: 0xbd7414,
    gold: 0xffd166,
    sky: 0xf2b45f,
    shadow: 0x2b1d12,
} as const

export const CSS = {
    ink: '#463020',
    inkSoft: '#8a6c4f',
    paper: '#fff4e2',
    white: '#ffffff',
    green: '#2f6b2a',
    amber: '#8a4f08',
} as const

export const A = {
    ghost: 0.34,
    dimmed: 0.45,
    shadow: 0.18,
    veil: 0.6,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    speech: 30,
    button: 26,
} as const

export const TYPE_MS = 26
