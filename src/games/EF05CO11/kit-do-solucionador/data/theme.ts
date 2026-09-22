import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const FONT = FONT_JOGO

/**
 * A paleta é quente e dessaturada de propósito: a única coisa que pode brilhar
 * na tela é a janela amarela de uma casa que acabou de acender.
 */
export const C = {
    ceu: 0x8fbfe0,
    terra: 0xd8a45f,
    terraEscura: 0xb07f42,

    ink: 0x2b2118,
    inkSoft: 0x5b4a38,
    card: 0xf6ead3,
    cardBorda: 0x8a6a45,
    white: 0xfff8ec,

    ok: 0x4f9d4a,
    okClaro: 0x86c97e,
    warn: 0xe0a326,
    warnDark: 0xa5711a,
    coral: 0xc4533b,
    azul: 0x3f6f8f,

    luz: 0xffd24a,
    circulo: 0xffd98a,
    rastro: 0xbf8a3d,
    estrada: 0xa87b45,
    estradaLuz: 0xf3d9a8,
} as const

export const HEX = {
    ink: '#2b2118',
    inkSoft: '#5b4a38',
    card: '#f6ead3',
    white: '#fff8ec',
    warnDark: '#a5711a',
    ok: '#2f6d2b',
} as const
