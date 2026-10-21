import type { FruitKind } from '../types'

const NAME: Record<FruitKind, { art: string; word: string }> = {
    morango: { art: 'O', word: 'MORANGO' },
    laranja: { art: 'A', word: 'LARANJA' },
    maca: { art: 'A', word: 'MAÇÃ' },
}

/** As legendas: poucas palavras, grandes. */
export const SAY = {
    order: (k: FruitKind) => `TRAGA ${NAME[k].art} ${NAME[k].word}!`,
    small: 'SÓ PASSA PEDAÇO PEQUENO',
    walk: 'ANDE!',
    cut: 'CORTE!',
    carry: 'LEVE PARA A RAINHA!',
    you: 'SUA VEZ!',
    youCut: 'AGORA VOCÊ CORTA!',
    gauge: 'DESTE TAMANHO PASSA',
    stuck: 'GRANDE DEMAIS!',
    cutAgain: 'CORTE DE NOVO!',
    wind: 'PEQUENO DEMAIS VOA!',
    whole: 'INTEIRA!',
} as const

export const BLOWN = 'Pequeno demais! O vento levou.'

/** O `?`: o único lugar com balão de texto. */
export const HELP = {
    walk: 'Ande com o joystick.',
    cut: 'Passe o dedo de um lado ao outro para cortar.',
    gap: 'Pedaço grande não passa aqui.',
    wind: 'Pedaço pequenininho o vento leva.',
    queen: 'Leve todos os pedaços para a rainha.',
} as const

export const LABEL = {
    level: 'Nível',
} as const
