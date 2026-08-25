/**
 * Paleta do Tradutor da Máquina.
 *
 * ── AS TRÊS CORES SÃO A AULA ─────────────────────────────────────────────
 *
 *   AMARELO  = LETRA    → o mundo humano
 *   ROXO     = NÚMERO   → a ponte, o que a tabela combina
 *   CIANO    = ACESO    → o mundo da máquina
 *
 * Nada mais no jogo usa essas três cores. A ficha da tabela mostra a letra em
 * amarelo e o número em roxo; a lâmpada acesa é ciano e o valor dela também;
 * a placa de leitura repete os três. A criança aprende a tradução pela cor
 * antes de aprender pela palavra.
 *
 * Verde é só "o circuito fechou". Laranja é só "não bateu" — e não existe
 * vermelho neste jogo: errar uma soma não é acidente, é o meio de descobrir.
 */
export const C = {
    // ── cenário ────────────────────────────────────────────────────────
    ink: 0x0d1526,
    steel: 0x27354d,
    steelDark: 0x1a2438,
    steelLight: 0x3d5170,
    edge: 0x4c6488,

    /** LETRA — mundo humano. */
    letra: 0xfbbf24,
    letraSoft: 0xfef0c3,
    letraDark: 0xb45309,

    /** NÚMERO — a ponte. */
    numero: 0xa78bfa,
    numeroSoft: 0xe9e0ff,
    numeroDark: 0x6d28d9,

    /** ACESO — mundo da máquina. */
    bit: 0x22d3ee,
    bitSoft: 0xcffafe,
    bitDark: 0x0e7490,
    /** Lâmpada apagada: escura de verdade, senão não dá para ver quem acendeu. */
    off: 0x1c2b40,
    offEdge: 0x36486a,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Não bateu. Laranja, nunca vermelho. */
    warn: 0xf97316,
    warnSoft: 0xffe2cc,

    // ── superfícies ────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe0d6c4,
    cream: 0xfffbf3,
    slate: 0x2b3a4f,
    idle: 0x8fa3c0,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.42,
    gloss: 0.2,
    dim: 0.45,
    /** O brilho em volta da lâmpada acesa. */
    halo: 0.28,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
    /** O visor da máquina: fonte de largura fixa, como um painel de verdade. */
    mono: 'Consolas, Courier New, monospace',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    question: '24px',
    questionLong: '21px',

    /** Placas de leitura. */
    plateLabel: '16px',
    plateChar: '46px',
    plateNumber: '42px',
    plateEquals: '30px',

    /** Chaves. */
    digit: '34px',
    bitValue: '19px',

    /** Fichas da tabela. */
    chipChar: '30px',
    chipCode: '19px',
    chipDots: '26px',

    /** Visor da máquina. */
    screenLabel: '17px',
    slotChar: '46px',
    slotCode: '18px',
    rowChar: '28px',

    button: '25px',
    toast: '21px',
    help: '30px',
} as const

export const TYPE_MS = { question: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONG_QUESTION = 64

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
