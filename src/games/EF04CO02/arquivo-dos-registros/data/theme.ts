/**
 * Paleta do Arquivo dos Registros.
 *
 * Sala de arquivo: madeira, papel de ficha e um azul de carimbo. Nenhum literal
 * de cor fora daqui.
 */
export const C = {
    // ── sala ───────────────────────────────────────────────────────────
    ink: 0x22303f,
    inkSoft: 0x2f4054,
    wood: 0x8a5628,
    woodLight: 0xc08b52,

    /** Interface e carimbo: o campo em foco. */
    stamp: 0x3b82f6,
    stampSoft: 0xdbe9fd,
    stampDark: 0x1d4ed8,

    /** Passou no filtro / é a resposta. */
    ok: 0x22c55e,
    okSoft: 0xd8f3df,

    /** Não passou — momentâneo, nunca fica na tela. */
    no: 0xf59e0b,
    noSoft: 0xfdecd0,

    /** O pino que prende a ficha. */
    pin: 0xe23b3b,

    // ── papel ──────────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe8dcc6,
    cream: 0xfff9f0,
    line: 0xdfd3bd,
    slate: 0x33404e,
    muted: 0x7b6b5a,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.36,
    shadow: 0.24,
    gloss: 0.22,
    dim: 0.45,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    question: '26px',
    questionLong: '23px',

    bigName: '32px',
    rowLabel: '21px',
    rowValue: '22px',

    cardName: '21px',
    cardLine: '17px',

    formLabel: '16px',
    formValue: '20px',

    counter: '20px',
    toast: '21px',
    help: '30px',
} as const

export const TYPE_MS = { question: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONG_QUESTION = 58

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * O NOME de cada campo.
 *
 * É a tabela mais importante do jogo: a criança lê "Onde a Bia nasceu?" e
 * precisa chegar em "Cidade". A pergunta nunca usa a palavra do rótulo, senão
 * não sobra nada para pensar.
 */
export const FIELD_LABEL: Record<
    'cidade' | 'ano' | 'esporte' | 'comida' | 'bicho', string
> = {
    cidade: 'Cidade',
    ano: 'Ano',
    esporte: 'Esporte',
    comida: 'Comida',
    bicho: 'Bicho',
}

export const FIELD_ORDER = ['cidade', 'ano', 'esporte', 'comida', 'bicho'] as const
