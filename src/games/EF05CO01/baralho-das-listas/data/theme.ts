/**
 * Paleta do Baralho das Listas.
 *
 * ── O FUNDO É VERDE, E ISSO MANDA NA PALETA INTEIRA ──────────────────────
 *
 * A mesa de baralho ocupa a tela toda e é de feltro verde vivo. Duas
 * consequências que decidem tudo aqui:
 *
 *   · painel escuro, sempre. Faixa clara sobre feltro claro some.
 *   · "certo" NÃO pode ser o verde de sempre. Verde sobre verde não é sinal
 *     de nada, é camuflagem. O acerto virou um verde-menta bem mais claro que
 *     o feltro, e só aparece dentro de painel escuro.
 *
 * ── AS TRÊS CORES QUE SIGNIFICAM ALGUMA COISA ────────────────────────────
 *
 *   AMARELO = O ESPAÇO   — onde uma carta pode entrar
 *   AZUL    = VIZINHO    — quem fica ao lado
 *   MENTA   = CONFERIDO  — já olhei esta, e a lista continua em ordem
 *
 * O amarelo é o mesmo do `slot-insert-card.png`, de propósito: o espaço
 * desenhado em `Graphics` e o espaço em textura são a mesma coisa e precisam
 * ser a mesma cor.
 */
export const C = {
    // ── a mesa ─────────────────────────────────────────────────────────
    ink: 0x123020,
    feltro: 0x1d7a3f,
    feltroEscuro: 0x14562c,
    /** Só a mesa desenhada de emergência usa este marrom. */
    madeira: 0x8a5a2b,
    madeiraEscura: 0x5c3a19,

    /**
     * O metal da interface.
     *
     * O marrom-alaranjado da madeira estava emoldurando a tela inteira — pílula
     * do nível, botão de ajuda, linha do header, borda do trilho e do objetivo.
     * Sobre feltro verde ele dava um bege sujo, e brigava de perto com o laranja
     * do alerta: dois marrons parecidos querendo dizer coisas diferentes.
     * Latão é da mesma família da mesa, mas claro e limpo — lê como metal, não
     * como poça.
     */
    latao: 0xd9a441,
    lataoEscuro: 0x9a7226,

    // ── superfícies escuras, por cima do feltro ────────────────────────
    painel: 0x11291c,
    trilho: 0x0d2415,
    slate: 0x1b3a27,
    edge: 0x3f7a56,

    /** O ESPAÇO onde a carta entra. Mesmo amarelo do slot em textura. */
    espaco: 0xfacc15,
    espacoSoft: 0xfef3c7,

    /**
     * O VERSO da carta, na busca.
     *
     * Azul-marinho de baralho mesmo — longe do feltro, longe do amarelo do
     * espaço e longe do azul-claro do vizinho. Uma carta de costas precisa
     * parecer uma carta de costas à primeira vista, e não mais um painel.
     */
    verso: 0x24406e,
    versoLosango: 0x9fc0ef,

    /** VIZINHO. */
    vizinho: 0x60a5fa,
    vizinhoSoft: 0xdbeafe,

    /** CONFERIDO / deu certo. Menta, e nunca o verde do feltro. */
    ok: 0x4ade80,
    okSoft: 0xd9fbe6,
    /**
     * Não era ali. Rosa-coral, e não laranja.
     *
     * Laranja sobre feltro verde escurecia para marrom e ficava indistinguível
     * do latão da moldura. Rosa é a cor mais longe do verde que existe: aparece
     * na hora, em qualquer canto da mesa, e continua não sendo vermelho de
     * punição — é um aviso quente, não uma bronca.
     */
    alerta: 0xfb7185,
    alertaSoft: 0xffe4e6,

    // ── tinta ──────────────────────────────────────────────────────────
    paper: 0xf4f7f2,
    creme: 0xfff8e7,
    idle: 0x8fae9b,
    white: 0xffffff,
    shadow: 0x000000,
} as const

/**
 * A TINTA DA FALA.
 *
 * O balão não tem borda nem tarja lateral — nada em volta do texto. Então o
 * tipo do recado só pode aparecer num lugar: na cor da própria LETRA. São
 * quatro tintas escuras, porque o papel é creme e ler não pode depender do que
 * aconteceu. As cores de `C` não servem aqui: `C.ok` e `C.espaco` são claras,
 * feitas para brilhar sobre painel escuro, e sobre papel elas somem.
 */
export const TINTA = {
    /** O normal: a dica do passo, o comentário de sempre. */
    fala: 0x1a2e22,
    ok: 0x136c37,
    alerta: 0xa8143f,
    /** "Olhe isto agora" — sem ser erro. */
    atencao: 0x8a5a06,
} as const

/**
 * A BARRA DE TEMPO do header (`shared/hud/createTimeBar`).
 *
 * Fica aqui, junto do resto da paleta, e não solta dentro do `createHud`:
 * cores de jogo moram no arquivo de cores. Trocar o visual da barra é trocar
 * estas cinco linhas.
 *
 * As escolhas saem do CROMO — papel, metal, alerta — e nunca da paleta de
 * significado. Verde já quer dizer "certo" e amarelo já quer dizer "aqui cabe
 * uma carta": uma barra verde no header sugeriria que o tempo é uma resposta
 * certa, e uma amarela mandaria a criança tocar no header.
 */
export const BARRA = {
    track: 0x0d2415,
    border: 0xd9a441,
    borderAlpha: 0.6,
    /** Cheia: papel. */
    fill: 0xfff8e7,
    /** Acabando: o latão da moldura. */
    warn: 0xd9a441,
    /** Quase no fim: o mesmo rosa de "aqui não". */
    danger: 0xfb7185,
    idle: 0x8fae9b,
    icon: 0xfff8e7,
} as const

export const A = {
    /**
     * Escuro o bastante para o feltro nunca competir com as cartas.
     *
     * Com o desfoque agora quase imperceptível (força 0.35), é ESTE número que
     * faz o fundo virar fundo. Se a mesa parecer apagada demais, mexa aqui —
     * não no blur. 0.40 deixa o feltro respirar; 0.55 quase o apaga.
     */
    veil: 0.46,
    gloss: 0.16,
    dim: 0.45,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Nada abaixo de 17px na área jogável — 5º ano, com Scale.FIT no celular. */
export const SIZE = {
    hudLevel: '19px',
    hudTitle: '23px',

    objetivo: '22px',
    objetivoLongo: '19px',
    acoes: '17px',

    /** O painel de vizinhos. */
    vizinhoRotulo: '15px',
    /** "ANTES" / "ESTA" / "DEPOIS", acima de cada cartinha. */
    vizinhoCasa: '12px',
    vizinhoValor: '26px',

    /** "NA SUA MÃO" / "PROCURE ESTA", acima da carta da coluna da direita. */
    focoRotulo: '17px',

    /** O valor desenhado na carta, quando a textura dela não existir. */
    cartaValor: '44px',
    cartaMini: '24px',

    button: '20px',
    help: '30px',

    /**
     * A fala da menina.
     *
     * 25px, e era 19: num balão de 600x158 a letra de 19 virava um bilhete
     * perdido no meio do papel. Com o balão menor e a fala com teto de 52
     * caracteres, a letra pode ser grande — e num jogo de 5º ano ela deve ser.
     */
    balao: '25px',
} as const

export const TYPE_MS = { objetivo: 15 } as const

/** Acima disso o objetivo encolhe. */
export const LONGO = 52

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

/** Texto escuro sobre fundo claro, texto claro sobre fundo escuro. */
export function inkOn(color: number): number {
    const r = (color >> 16) & 0xff
    const g = (color >> 8) & 0xff
    const b = color & 0xff
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return lum > 0.62 ? C.ink : C.paper
}
