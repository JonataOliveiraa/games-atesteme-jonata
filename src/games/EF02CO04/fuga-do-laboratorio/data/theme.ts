export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4a5a70,
    white: 0xffffff,

    cream: 0xf2faff,
    creamDeep: 0xd8ecfb,
    creamEdge: 0x9fc4de,

    /** As duas categorias do jogo. Azul se toca, roxo dá ordens. */
    hard: 0x38bdf8,
    hardDark: 0x0d7fb4,
    soft: 0xa78bfa,
    softDark: 0x6a48cf,

    door: 0x8fc2f0,
    doorDark: 0x3d6fae,
    doorDeep: 0x24486f,

    steel: 0xcbd9e8,
    steelDark: 0x7e97b0,

    gold: 0xfacc15,
    goldDark: 0xb98a06,

    ok: 0x35d07f,
    okDark: 0x1f8f56,
    /** Erro é laranja: vermelho nunca entra como castigo. */
    warn: 0xf59e0b,
    warnDark: 0xb46b00,

    light: 0xfff3c4,

    wood: 0xc89a5b,
    woodDark: 0x8a6231,
    woodDeep: 0x5f4320,
}

export const CSS = {
    ink: '#1f2a37',
    inkSoft: '#4a5a70',
    white: '#ffffff',
    cream: '#f2faff',
    warn: '#b46b00',
    hard: '#0d7fb4',
    soft: '#6a48cf',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const KIND_LABEL = {
    hardware: 'PEÇA',
    software: 'PROGRAMA',
} as const

export const KIND_COLOR = {
    hardware: { base: C.hard, dark: C.hardDark },
    software: { base: C.soft, dark: C.softDark },
} as const

/** No máximo cinco palavras, e sempre dizendo o que a categoria FAZ. */
export const KIND_PHRASE = {
    hardware: 'Dá para tocar.',
    software: 'Dá ordens à peça.',
} as const

/** O que cada entrada do chassi aceita, dito no lugar onde ela recusou. */
export const SLOT_PHRASE = {
    tray: 'A bandeja só aceita peça.',
    reader: 'O leitor só aceita programa.',
} as const
