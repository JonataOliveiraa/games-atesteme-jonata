/**
 * Paleta do Prédio dos Laços.
 *
 * As duas cores mais importantes do jogo são as dos LAÇOS, e elas não são
 * decoração: o bloco de fora, o andar que está sendo percorrido e o pulso do
 * contador externo usam a MESMA cor; o bloco de dentro, a janela em lavagem e o
 * contador interno usam a outra. É assim que a criança vê, sem ninguém dizer,
 * qual laço está rodando agora.
 */
export const C = {
    // ── prédio ─────────────────────────────────────────────────────────
    ink: 0x16203a,
    wall: 0x6b7a99,
    wallDark: 0x4d5a75,
    wallLight: 0x8b9ab8,
    roof: 0x3d4964,
    base: 0x2b3550,

    // ── janelas ────────────────────────────────────────────────────────
    dirty: 0x8d8f7e,
    dirtyEdge: 0x6f7263,
    clean: 0x8fd8ff,
    cleanEdge: 0x3fa8dd,

    /** LAÇO DE FORA — andares. */
    outer: 0x8b5cf6,
    outerSoft: 0xe6dcff,
    outerDark: 0x6d28d9,

    /** LAÇO DE DENTRO — janelas. */
    inner: 0xf59e0b,
    innerSoft: 0xfdecd0,
    innerDark: 0xb4740a,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Bateu no telhado ou passou da última janela. */
    bump: 0xef7c3b,

    // ── superfícies ────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe8dcc6,
    cream: 0xfff9f0,
    slate: 0x33404e,
    muted: 0x7b6b5a,
    idle: 0x9aa8bd,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.3,
    shadow: 0.26,
    gloss: 0.24,
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

    question: '24px',
    questionLong: '21px',

    /** A linha que MUDA entre os dois blocos — é ela que tem que saltar. */
    blockAction: '23px',
    /** A palavra repetida ("repita ... vezes") e as notas do laço indefinido. */
    blockNote: '16px',
    count: '38px',
    countWord: '22px',
    stepper: '32px',

    button: '25px',
    report: '19px',
    toast: '21px',
    help: '30px',
} as const

export const TYPE_MS = { question: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONG_QUESTION = 62

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
