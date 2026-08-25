/**
 * Paleta da Batalha das Coordenadas.
 *
 * Praia de ilha do tesouro: areia quente, mar frio, madeira e ouro. Nenhum
 * literal de cor fora daqui.
 */
export const C = {
    // ── ilha ───────────────────────────────────────────────────────────
    ink: 0x14293a,
    water: 0x2f8fbf,
    waterDark: 0x1d5f82,
    sand: 0xf2d9a6,
    sandDark: 0xd9b978,
    sandDeep: 0xa8875a,
    wood: 0x8a5628,
    woodLight: 0xc08b52,

    /** Tesouro e alvo. O acento do jogo. */
    gold: 0xf0bc59,
    goldDark: 0xc4903a,
    goldSoft: 0xfde9c4,

    /** Achou. */
    ok: 0x22c55e,
    okSoft: 0xd8f3df,

    /** Engano — momentâneo, nunca fica na tela. */
    warn: 0xf59e0b,
    warnSoft: 0xfdecd0,

    /** Descarte: registro, não erro. Cinza calmo. */
    off: 0x6d7f92,
    offSoft: 0xc7d1db,

    // ── superfícies ────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe8dcc6,
    slate: 0x3b3b3b,
    muted: 0x7b6b5a,
    white: 0xffffff,
    shadow: 0x000000,
} as const

/**
 * ── DESCARTE NÃO É ERRO ──────────────────────────────────────────────────
 *
 * No Nível 3 a criança marca com X os baús que as pistas eliminam. Isso é o
 * "registro de descarte" que a habilidade pede — é o trabalho certo, não uma
 * falha. Por isso o X é CINZA e não vermelho: vermelho diria "você errou" toda
 * vez que ela acertasse.
 *
 * O engano de verdade (marcar um baú que as pistas não eliminam) é âmbar e
 * dura dois segundos. Nada fica marcado de errado na tela.
 */

export const A = {
    veil: 0.3,
    shadow: 0.24,
    gloss: 0.24,
    inset: 0.3,
    dim: 0.45,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    label: '24px',
    question: '22px',
    clue: '21px',
    big: '64px',
    counter: '20px',

    toast: '21px',
    help: '30px',
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** A coluna 0 é `A`. É assim que a criança lê a matriz. */
export const colName = (col: number) => String.fromCharCode(65 + col)

/** A linha 0 é `1`. */
export const rowName = (row: number) => `${row + 1}`

export const cellName = (col: number, row: number) => `${colName(col)}${rowName(row)}`
