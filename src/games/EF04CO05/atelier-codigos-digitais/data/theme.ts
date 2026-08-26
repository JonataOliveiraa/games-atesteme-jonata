/**
 * Paleta do Ateliê de Códigos Digitais.
 *
 * ── A COR AQUI TEM UM PROBLEMA PRÓPRIO ───────────────────────────────────
 *
 * Neste jogo a cor é o CONTEÚDO: preto, branco, cinza 128, vermelho puro. Se a
 * interface também fosse colorida, a criança não saberia o que é obra e o que
 * é moldura. Então o ateliê inteiro é escuro e dessaturado, e as únicas cores
 * saturadas da tela estão dentro da grade e da legenda.
 *
 * As cores de destaque marcam OFICINA, e cada uma vale por uma só:
 *   azul     = bitmap
 *   prata    = tons de cinza
 *   rosa     = cor
 *   amarelo  = letras   (o mesmo amarelo do Tradutor da Máquina, de propósito)
 */
export const C = {
    // ── cenário ────────────────────────────────────────────────────────
    ink: 0x171320,
    wood: 0x2a2336,
    woodDark: 0x1d1828,
    woodLight: 0x3d3450,
    edge: 0x574a70,

    /** As quatro oficinas. */
    bitmap: 0x60a5fa,
    cinza: 0xc3cbd8,
    cor: 0xfb7185,
    ascii: 0xfbbf24,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Não serve. Laranja, nunca vermelho — vermelho aqui é TINTA. */
    warn: 0xf97316,

    // ── superfícies ────────────────────────────────────────────────────
    /** O fundo de uma célula que mostra código em vez de imagem. */
    slot: 0x241f31,
    slotEdge: 0x4a3f63,
    paper: 0xfff6e8,
    cream: 0xfffbf3,
    slate: 0x2b2438,
    idle: 0x9c93b0,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.46,
    gloss: 0.18,
    dim: 0.45,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
    /** Código se lê melhor em largura fixa, e parece código. */
    mono: 'Consolas, Courier New, monospace',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '24px',
    hudHint: '18px',
    hudTab: '15px',

    question: '24px',
    questionLong: '21px',

    panelLabel: '17px',
    /** O código dentro de uma célula: encolhe sozinho quando é "255,0,0". */
    cellCode: '20px',
    cellCodeSmall: '14px',
    cellChar: '46px',

    chipCode: '19px',
    chipChar: '34px',

    cardName: '22px',
    cardResumo: '15px',

    pedido: '23px',
    toast: '21px',
    help: '30px',
} as const

export const TYPE_MS = { question: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONG_QUESTION = 62

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * Texto escuro sobre tinta clara, texto claro sobre tinta escura.
 *
 * A legenda pinta a ficha com a própria tinta, e sem isto o "255" sumiria no
 * branco e o "0" sumiria no preto — justamente os dois extremos que a criança
 * mais precisa ler.
 */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.slate : C.paper
}
