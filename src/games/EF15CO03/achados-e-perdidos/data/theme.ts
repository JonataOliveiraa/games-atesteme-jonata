import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { ColorValue } from '../types'

export const C = {
    /* a praça — amostrada de `bg-praca.png`, para o Graphics falar a mesma língua */
    sky: 0xfaecc5,
    skyLow: 0xf6e3b8,
    grass: 0xd0b99c,
    grassDark: 0xc5b298,

    /* o balcão */
    counter: 0xc9a074,
    counterDark: 0x9e7349,

    /* papel e tinta */
    paper: 0xfffaf0,
    paperEdge: 0xd8c6a8,
    ink: 0x2a2724,
    inkSoft: 0x8a7f72,

    /**
     * O contorno. A arte é traço chapado com linha preta grossa e uniforme —
     * o `Graphics` usa a MESMA linha, senão as cartas parecem coladas de
     * outro jogo.
     */
    line: 0x1a1a1a,

    /* o cartaz */
    coral: 0xe2673d,
    coralDark: 0xb44d2a,

    /* estados */
    green: 0x4fbf72,
    greenSoft: 0xd6f2de,
    orange: 0xf5a33c,

    /**
     * O vermelho deste jogo NÃO é bronca — é o risco do NÃO, uma categoria
     * lógica, e ele só aparece nesse lugar. O erro é laranja, como no resto
     * do catálogo.
     */
    no: 0xe2453d,

    white: 0xffffff,
    shadow: 0x000000,
} as const

export const CSS = {
    ink: '#2a2724',
    inkSoft: '#8a7f72',
    paper: '#fffaf0',
    white: '#ffffff',
    no: '#d62f28',
    green: '#2f7a48',
    orange: '#8a4a08',
} as const

export const A = {
    veil: 0.18,
    dimmed: 0.38,
    ghost: 0.22,
    shadow: 0.16,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    card: 32,
    cardMin: 24,
    term: 22,
    termMin: 17,
    op: 28,
    tag: 19,
    banner: 44,
    hint: 26,
} as const

/**
 * As quatro cores, AMOSTRADAS pixel a pixel de `bichinhos.png`. O ícone da
 * carta tem de ser a mesma tinta do bichinho — cor escolhida à parte nunca
 * casa, e aqui a cor é a pergunta.
 */
export const TONE: Record<ColorValue, number> = {
    blue: 0x4796f7,
    green: 0x69bc47,
    red: 0xca322b,
    yellow: 0xfcc203,
}

/** O acessório é sempre o MESMO tom em todos os bichos, para `é azul` não
 *  ficar ambíguo entre o bicho e o chapéu. É o conserto nº 5, feito na arte. */
export const HAT = 0x976339
export const HAT_DARK = 0x6f4726
export const GLASSES = 0x1a1a1a

/** A frase inteira, para a carta de UM termo só, que tem lugar para ela. */
export const WORD: Record<string, string> = {
    blue: 'É AZUL',
    green: 'É VERDE',
    red: 'É VERMELHO',
    yellow: 'É AMARELO',
    hat: 'TEM CHAPÉU',
    glasses: 'TEM ÓCULOS',
    big: 'É GRANDE',
    small: 'É PEQUENO',
}

/**
 * A palavra CURTA, para a moldura do termo na carta de dois termos. Ali a
 * frase inteira cairia para 18 px de fonte, e quem carrega o sentido é o
 * ícone — a palavra só confirma.
 */
export const WORD_SHORT: Record<string, string> = {
    blue: 'AZUL',
    green: 'VERDE',
    red: 'VERMELHO',
    yellow: 'AMARELO',
    hat: 'CHAPÉU',
    glasses: 'ÓCULOS',
    big: 'GRANDE',
    small: 'PEQUENO',
}

/** O operador, na moldura própria dele, entre os dois termos. */
export const OP_WORD: Record<string, string> = { e: 'E', ou: 'OU' }

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
