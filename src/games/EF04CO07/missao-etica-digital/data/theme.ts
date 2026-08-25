/**
 * Paleta da Missão Ética Digital.
 *
 * ── UMA COR POR PRINCÍPIO ────────────────────────────────────────────────
 *
 *   ÂMBAR   = AUTORIA
 *   CIANO   = PERMISSÃO
 *   ROXO    = PRIVACIDADE
 *   VERDE-ÁGUA = GUARDA
 *
 * A lâmpada do painel, a borda da ficha e o título da missão usam a MESMA cor
 * ao mesmo tempo. A criança sabe qual princípio está em jogo antes de ler uma
 * palavra — e no painel ela vê, de relance, quais já acendeu.
 *
 * Verde é só "deu certo". Laranja é só "alerta". Vermelho não existe neste
 * jogo: uma escolha ruim aqui é uma consequência para entender, não uma falta
 * para punir.
 */
export const C = {
    // ── cenário: sala de servidores ────────────────────────────────────
    ink: 0x0e1a1f,
    rack: 0x1b2c33,
    rackDark: 0x142228,
    rackLight: 0x2b414b,
    edge: 0x456773,

    /** Os quatro princípios. */
    autoria: 0xfbbf24,
    permissao: 0x22d3ee,
    privacidade: 0xa78bfa,
    guarda: 0x34d399,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Alerta de risco. Laranja, nunca vermelho. */
    alerta: 0xf97316,
    alertaSoft: 0xffe2cc,

    // ── superfícies ────────────────────────────────────────────────────
    /** A frente da ficha: um arquivo é papel branco. */
    ficha: 0xfdfaf3,
    fichaEdge: 0xe0d8c8,
    /** O verso da ficha: a etiqueta, escura, como um carimbo de sistema. */
    verso: 0x17262c,
    painel: 0x152329,
    slate: 0x24353c,
    idle: 0x8fa6ae,
    paper: 0xf3f8f8,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.44,
    gloss: 0.16,
    dim: 0.45,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
    /** O nome do arquivo e a etiqueta: largura fixa, cara de sistema. */
    mono: 'Consolas, Courier New, monospace',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT no celular. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '24px',
    hudHint: '18px',

    situacao: '22px',
    situacaoLonga: '19px',
    pergunta: '23px',

    /** A ficha. */
    fichaNome: '18px',
    fichaTipo: '15px',
    fichaDica: '15px',
    etiquetaRotulo: '14px',
    etiquetaTexto: '18px',
    etiquetaAviso: '17px',

    acao: '20px',

    impactoTitulo: '24px',
    impactoTexto: '19px',

    lampadaNome: '15px',
    lampadaResumo: '13px',

    button: '23px',
    help: '30px',
} as const

export const TYPE_MS = { situacao: 14 } as const

/** Acima disso a situação encolhe. */
export const LONGA = 92

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Texto escuro sobre fundo claro, texto claro sobre fundo escuro. */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.slate : C.paper
}
