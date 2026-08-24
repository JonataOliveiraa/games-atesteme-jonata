/**
 * Paleta do Detetives da Busca.
 *
 * A cena é um quadro de cortiça de detetive: parede quente, papel creme, e um
 * azul só, que é a busca. Nenhum literal de cor fora daqui.
 *
 * Ver VISUAL.md §2.
 */
export const C = {
    // ── parede e móvel ─────────────────────────────────────────────────
    ink: 0x1b2333,
    cork: 0xd9a566,
    corkDark: 0xb8853f,
    wood: 0x8a5628,
    woodLight: 0xc08b52,

    /**
     * A BUSCA — o único acento do jogo.
     *
     * Azul aparece na barra, na palavra ligada, no filtro ativo e no aro da
     * lupa, e em mais nada. É o que permite a criança aprender, sem ninguém
     * dizer, que tudo que é azul faz parte de "o que eu pedi".
     */
    search: 0x3b82f6,
    searchSoft: 0xdbeafe,
    searchDark: 0x1d4ed8,

    // ── estado ─────────────────────────────────────────────────────────
    ok: 0x22c55e,
    okSoft: 0xd8f3df,
    warn: 0xf59e0b,
    warnSoft: 0xfdecd0,
    idle: 0x8ea3bd,

    /**
     * O PINO, e nada mais.
     *
     * Não existe vermelho de erro neste jogo. O erro é âmbar, porque âmbar quer
     * dizer "olha isso" e vermelho quer dizer "você fez uma coisa ruim" — e o
     * jogo inteiro é construído sobre a ideia de que testar não é fazer coisa
     * ruim. Se o pino fosse a cor do erro, a parede diria "errado" cinco vezes
     * por busca, uma por cartão pregado.
     */
    pin: 0xe23b3b,
    pinDark: 0xa82c2c,

    // ── superfícies ────────────────────────────────────────────────────
    paper: 0xfff6e8,
    paperEdge: 0xe8dcc6,
    cream: 0xfff9f0,
    slate: 0x3b3b3b,
    muted: 0x7b6b5a,
    white: 0xffffff,
    shadow: 0x000000,
} as const

export const A = {
    veil: 0.34,
    shadow: 0.24,
    gloss: 0.22,
    inset: 0.3,
    /** Escurecimento do fundo quando a lupa abre um cartão. */
    dim: 0.55,
    /** Alfa da ficha de palavra desligada. */
    off: 0.42,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

/** Nada abaixo de 17px na área jogável — 3º ano, com Scale.FIT. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '25px',
    hudHint: '18px',

    question: '25px',
    questionLong: '22px',
    criterion: '17px',

    word: '22px',
    wordSmall: '19px',
    counter: '34px',
    counterLabel: '15px',
    filter: '19px',

    cardTitle: '20px',
    cardTitleSmall: '18px',
    cardSource: '16px',

    openTitle: '28px',
    openSource: '18px',
    openSnippet: '21px',
    openVerdict: '17px',

    button: '23px',
    toast: '21px',
    help: '30px',
    prompt: '22px',
} as const

export const TYPE_MS = {
    question: 16,
    snippet: 22,
} as const

/** Acima disso o pedido cai para `questionLong` e cabe em duas linhas. */
export const LONG_QUESTION = 62

/** Acima disso o título do cartão encolhe. */
export const LONG_CARD_TITLE = 22

/** Acima disso o rótulo da ficha encolhe. */
export const LONG_WORD = 12

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/**
 * O tipo do resultado NÃO tem cor.
 *
 * Site, imagem e vídeo se distinguem pela forma do selo — página com globo,
 * moldura de foto, retângulo com play. Uma quarta, quinta e sexta cor de
 * identidade quebrariam a promessa das quatro do §2.1: o azul deixaria de ser
 * "a busca" no instante em que também fosse "site". E forma funciona com
 * daltonismo e com projetor ruim de sala de aula, que é o ambiente real deste
 * jogo.
 *
 * Esta função existe só para o rótulo, que é texto.
 */
export const typeLabel: Record<'site' | 'imagem' | 'video', string> = {
    site: 'Sites',
    imagem: 'Imagens',
    video: 'Vídeos',
}

/** Como o navegador se refere ao tipo na frase do filtro. */
export const typePhrase: Record<'site' | 'imagem' | 'video', string> = {
    site: 'sites',
    imagem: 'imagens',
    video: 'vídeos',
}
