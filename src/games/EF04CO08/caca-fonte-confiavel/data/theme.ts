/**
 * Paleta da Caça à Fonte Confiável.
 *
 * ── A COR DA DÚVIDA E A COR DO VEREDITO ──────────────────────────────────
 *
 *   AMARELO  = o que você GRIFOU     — a marca do marca-texto, e nada mais
 *   VERDE    = CONFIÁVEL             — só na revelação
 *   LARANJA  = DESCONFIE             — só na revelação
 *
 * A separação é a regra do jogo inteiro. Enquanto a criança está lendo, existe
 * uma cor só: amarelo, que não diz se ela acertou a pista. Verde e laranja
 * ficam trancados até o carimbo cair. Se grifar já pintasse de verde ou
 * laranja, o jogo faria o julgamento no lugar dela — que é exatamente o que a
 * versão anterior fazia, com os `✓✓✓✓✓` prontos.
 *
 * O resto da tela é biblioteca à noite: índigo escuro e madeira, para o papel
 * branco das páginas saltar.
 */
export const C = {
    // ── cenário: biblioteca à noite ────────────────────────────────────
    ink: 0x141428,
    estante: 0x241f33,
    estanteClara: 0x3a3350,
    edge: 0x5b5178,

    /** O marca-texto. A única cor viva enquanto a criança decide. */
    marca: 0xfacc15,
    marcaSoft: 0xfef3c7,

    /**
     * A cor de AGIR — o botão de escolher a página.
     *
     * Ela existe para o botão não ser amarelo. Amarelo aqui significa uma coisa
     * só, "isto foi grifado por mim", e um botão amarelo roubaria esse
     * significado justo no momento em que a criança está grifando. De quebra
     * resolve a legibilidade: texto branco sobre amarelo não se lê.
     */
    acao: 0x818cf8,

    // ── veredito ───────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    /** Desconfie. Laranja, nunca vermelho: a página não é um crime. */
    alerta: 0xf97316,
    alertaSoft: 0xffe2cc,

    // ── a página ───────────────────────────────────────────────────────
    /** O papel. */
    papel: 0xfdfbf5,
    papelEdge: 0xded7c8,
    /** A barra de endereço, no topo do cartão. */
    barra: 0xe8e4dc,
    /** A caixa da resposta que a página dá. */
    resposta: 0xf1ece0,
    /** O bloco cinza que fica no lugar da ilustração até ela existir. */
    vazio: 0xd8d2c4,

    // ── superfícies escuras ────────────────────────────────────────────
    painel: 0x1c1836,
    slate: 0x2f2a44,
    tinta: 0x2b2740,
    idle: 0x9a92b4,
    paper: 0xf3f1fa,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.46,
    gloss: 0.16,
    dim: 0.45,
    /** O traço do marca-texto por cima do texto: transparente, como o de verdade. */
    marca: 0.5,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
    /** O endereço do site: largura fixa, cara de barra de navegador. */
    mono: 'Consolas, Courier New, monospace',
} as const

/** Nada abaixo de 17px na área jogável — 4º ano, com Scale.FIT no celular. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '23px',

    pergunta: '23px',
    perguntaLonga: '20px',

    /** O cartão de página. */
    endereco: '17px',
    letra: '20px',
    linha: '17px',
    resposta: '19px',
    respostaLonga: '17px',

    /** O carimbo da revelação. */
    carimbo: '22px',
    veredito: '15px',

    explicacao: '19px',

    button: '20px',
    help: '30px',
} as const

export const TYPE_MS = { pergunta: 16 } as const

/** Acima disso a pergunta encolhe. */
export const LONGA = 54
/** Acima disso a resposta da página encolhe. */
export const RESPOSTA_LONGA = 34

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Texto escuro sobre fundo claro, texto claro sobre fundo escuro. */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.slate : C.paper
}
