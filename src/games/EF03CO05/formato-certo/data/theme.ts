/**
 * Paleta do Formato Certo.
 *
 * A cena é uma oficina de dados: parede fria, bancada de madeira quente, e
 * três cores que SÃO os três formatos. Nenhum literal de cor fora daqui.
 *
 * Ver VISUAL.md §2.
 */
export const C = {
    // ── parede e sombra ────────────────────────────────────────────────
    ink: 0x101a2b,
    wall: 0x1b2a41,
    wallLight: 0x24374f,

    // ── bancada ────────────────────────────────────────────────────────
    wood: 0xb4763c,
    woodDark: 0x8a5628,
    woodLight: 0xd0965c,

    /**
     * Identidade dos formatos. Nunca usadas para outra coisa: azul só aparece
     * em coisa de data, âmbar só em pixels, roxo só em texto. Ao fim do
     * Nível 1 a criança associa a cor ao tipo sem que ninguém tenha dito.
     *
     * Pixels é âmbar e não o verde da capa porque verde aqui significa "o
     * leitor conseguiu ler" — a informação mais importante da tela. A
     * identidade do formato cede para o feedback.
     */
    date: 0x3b82f6,
    pixels: 0xf59e0b,
    text: 0x8b5cf6,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    fail: 0xef4444,
    failSoft: 0xfadcdc,
    idle: 0x8ea3bd,

    // ── superfícies ────────────────────────────────────────────────────
    panel: 0xfff6e8,
    panelEdge: 0xe8dcc6,
    cream: 0xfff9f0,
    slate: 0x3b3b3b,
    muted: 0x7b6b5a,
    /** Vidro do leitor, apagado. */
    screen: 0x0b1a14,
    /** Fósforo verde do leitor. */
    screenGlow: 0x2ee6a8,
    white: 0xffffff,
    shadow: 0x000000,

    // ── cores que as peças de pixel representam ────────────────────────
    paintRed: 0xe23b3b,
    paintBlue: 0x2f7fe0,
    paintYellow: 0xf4c630,
} as const

export const A = {
    veil: 0.58,
    shadow: 0.26,
    gloss: 0.22,
    inset: 0.34,
    dim: 0.42,
    /**
     * Véu sobre o cenário em textura.
     *
     * A parede da arte é clara e cheia de objeto — ferramenta, prateleira,
     * vaso. Sem véu ela disputa atenção com a bancada, que é onde o jogo
     * acontece, e o texto claro do leitor perde contraste em cima dela. O véu
     * empurra o fundo para trás sem exigir arte nova: dá para calibrar aqui
     * em vez de reexportar o PNG.
     *
     * Só vale para o fundo em imagem. O desenho em Graphics já nasce escuro.
     */
    bgVeil: 0.28,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Nada abaixo de 17px na área jogável — 3º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    request: '25px',
    requestLong: '22px',

    boxTitle: '22px',
    boxSubtitle: '16px',
    fieldLabel: '17px',

    pieceLabel: '19px',
    pieceLabelSmall: '16px',
    pieceGlyph: '38px',
    pieceGlyphSmall: '30px',

    readerTitle: '17px',
    readerBody: '22px',
    readerBig: '30px',
    readerNote: '17px',

    button: '22px',
    help: '30px',
    toast: '21px',
} as const

export const TYPE_MS = {
    request: 16,
    reader: 22,
} as const

/** Acima disso o pedido cai para `requestLong` e cabe em duas linhas. */
export const LONG_REQUEST = 64

/** Acima disso o rótulo da peça encolhe. */
export const LONG_PIECE_LABEL = 7

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Cor de identidade do formato. `null` (peça intrusa) não tem dono. */
export const formatTone = (format: 'date' | 'pixels' | 'text' | null) =>
    format === 'date' ? C.date
        : format === 'pixels' ? C.pixels
            : format === 'text' ? C.text
                : C.idle
