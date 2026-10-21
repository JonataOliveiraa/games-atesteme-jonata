import type { OrderKind } from '../types'

const NAME: Record<OrderKind, { art: string; word: string }> = {
    morango: { art: 'O', word: 'MORANGO' },
    laranja: { art: 'A', word: 'LARANJA' },
    maca: { art: 'A', word: 'MAÇÃ' },
    folha: { art: 'A', word: 'FOLHA' },
    folhaGrande: { art: 'A', word: 'FOLHA GRANDE' },
    gigante: { art: 'A', word: 'FOLHA GIGANTE' },
}

/** As legendas: poucas palavras, grandes. */
export const SAY = {
    order: (k: OrderKind) => `TRAGA ${NAME[k].art} ${NAME[k].word}!`,
    small: 'SÓ PASSA PEDAÇO PEQUENO',
    walk: 'ANDE!',
    cut: 'CORTE!',
    carry: 'LEVE PARA A RAINHA!',
    you: 'SUA VEZ!',
    youCut: 'AGORA VOCÊ CORTA!',
    gauge: 'DESTE TAMANHO PASSA',
    stuck: 'GRANDE DEMAIS!',
    cutAgain: 'CORTE DE NOVO!',
    heavy: 'PESADA!',
    wind: 'PEQUENO DEMAIS VOA!',
    whole: 'INTEIRA!',
    clean: 'LIMPE!',
    wake: 'ACORDE AS AMIGAS!',
    together: 'LEVEM JUNTAS!',
    narrow: 'NÃO PASSA!',
    shiny: 'LIMPINHA!',
} as const

export const BLOWN = 'Pequeno demais! O vento levou.'
export const DIRTY = 'Folha suja! A rainha não quer.'

/** O `?`: o único lugar com balão de texto. */
export const HELP = {
    walk: 'Ande com o joystick.',
    cut: 'Passe o dedo de um lado ao outro para cortar.',
    gap: 'Pedaço grande não passa aqui.',
    wind: 'Pedaço pequenininho o vento leva.',
    queen: 'Leve todos os pedaços para a rainha.',
    leafCut: 'Passe o dedo para cortar.',
    heavy: 'Pedaço pesado: corte de novo.',
    scrub: 'Esfregue para limpar.',
    wake: 'Encoste para acordar.',
    wide: 'A folha gigante passa por aqui.',
    giantQueen: 'Leve a folha limpa, com as amigas.',
} as const

export const LABEL = {
    level: 'Nível',
} as const
