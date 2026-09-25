/**
 * Layout único da Missão Ética Digital — 1280x720.
 *
 * ── O QUE SAIU DA TELA ───────────────────────────────────────────────────
 *
 * A versão anterior mantinha dezessete blocos de texto no ar ao mesmo tempo.
 * Para 4º ano isso é uma parede: antes de escolher qualquer coisa, a criança
 * precisava atravessar título, dica, situação, nome do arquivo, tipo do
 * arquivo, convite de virar, pergunta, três rótulos longos e mais oito
 * palavras no rodapé.
 *
 * Saíram:
 *   · o PAINEL de quatro lâmpadas do rodapé  → viraram selos no HUD (−8 textos)
 *   · a DICA do nível no HUD                 → o tutorial já diz (−1)
 *   · o TIPO do arquivo em caps na ficha     → a arte já diz (−1)
 *   · o "toque para virar" escrito           → virou uma orelha de papel (−1)
 *
 * ── O QUE FICOU ──────────────────────────────────────────────────────────
 *
 *   EM CIMA     A SITUAÇÃO — o que está acontecendo agora
 *   ESQUERDA    A FICHA    — o arquivo, e a etiqueta atrás dele
 *   DIREITA     AS AÇÕES   — três, com ícone e rótulo curto
 *
 * O rodapé ficou vazio de propósito: é para lá que as cópias escapam quando um
 * arquivo vaza, e é lá que a ficha se desfaz quando é apagada.
 */
export const W = 1280
export const H = 720

/**
 * A sala viva: uma luz de teto espalhada na parede e os LEDs dos racks
 * piscando, um de cada vez e devagar. É fundo — nada ali pede atenção.
 */
export const SALA = {
    luzX: W / 2,
    luzY: 330,
    luzW: 1300,
    luzH: 820,
    /** Diâmetro do brilho de um LED aceso. */
    ledD: 26,
    /** Um LED novo acende a cada tanto... */
    piscaMs: 150,
    /** ...e leva isto para acender e apagar. */
    acesoMs: 900,
}

/**
 * Os LEDs dos dois racks que ficam à vista, medidos na arte
 * (`bg-missao-etica.png`, 1672 × 941, levada a 1280 × 720). Os dos switches
 * ficam atrás da ficha e das ações e não entram. O terceiro número é 1 para LED
 * verde e 0 para ciano. Se a arte mudar, a lista tem de ser medida de novo.
 */
export const LEDS: ReadonlyArray<readonly [number, number, number]> = [
    [42, 192, 0], [42, 203, 0], [42, 228, 0], [42, 240, 0], [42, 265, 1], [42, 276, 1], [42, 302, 1],
    [42, 325, 0], [42, 352, 0], [42, 364, 0], [42, 391, 0], [42, 403, 0], [42, 431, 0], [42, 445, 0],
    [42, 474, 0], [42, 488, 0], [42, 518, 0], [42, 532, 1], [49, 302, 0], [49, 444, 0], [50, 430, 0],
    [50, 487, 0], [55, 443, 0], [60, 429, 0], [60, 443, 0], [86, 267, 0], [87, 196, 0], [87, 207, 0],
    [87, 232, 0], [87, 242, 0], [87, 277, 0], [87, 351, 0], [87, 362, 0], [87, 468, 0], [88, 482, 0],
    [95, 481, 0], [96, 232, 0], [96, 325, 0], [96, 351, 0], [96, 467, 0], [101, 325, 0], [101, 480, 0],
    [109, 198, 0], [109, 209, 0], [109, 233, 0], [109, 243, 0], [109, 268, 0], [109, 278, 0], [109, 325, 0],
    [109, 350, 0], [109, 361, 0], [109, 387, 0], [109, 398, 0], [109, 425, 1], [109, 438, 0], [109, 466, 0],
    [109, 479, 0], [109, 520, 1], [1216, 326, 0], [1222, 206, 0], [1222, 266, 0], [1222, 277, 0], [1222, 302, 0],
    [1222, 364, 0], [1222, 389, 0], [1222, 403, 0], [1222, 429, 0], [1222, 443, 0], [1222, 471, 0], [1222, 515, 0],
    [1222, 529, 1], [1223, 241, 0], [1223, 326, 0], [1223, 487, 0], [1228, 302, 0], [1229, 265, 0], [1229, 277, 0],
    [1229, 326, 0], [1229, 390, 0], [1229, 430, 0], [1229, 472, 0], [1229, 516, 0], [1230, 205, 0], [1230, 364, 0],
    [1230, 403, 0], [1230, 444, 0], [1230, 488, 0], [1230, 531, 1], [1233, 325, 0], [1240, 204, 1], [1240, 229, 1],
    [1240, 240, 1], [1240, 265, 1], [1240, 277, 1], [1240, 302, 0], [1240, 325, 0], [1240, 352, 1], [1240, 364, 1],
    [1240, 391, 1], [1240, 404, 1], [1240, 431, 1], [1240, 445, 1], [1240, 474, 0], [1240, 489, 1], [1240, 518, 1],
    [1240, 533, 1],
]

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 72,
    r: 22,
    cy: 46,

    pillX: 40,
    pillY: 26,
    pillW: 126,
    pillH: 40,

    dotsX: 188,
    dotsMaxW: 120,
    dotR: 7,

    titleX: 560,
    titleW: 400,

    helpX: 1214,
    helpR: 25,
}

/**
 * Os quatro selos, no lugar do antigo painel de rodapé.
 *
 * Só a palavra: aceso é a pastilha preenchida na cor do princípio, apagado é o
 * contorno fino. Os alertas viram bolinhas laranja no canto de cima — eles
 * ficam registrados mesmo depois de o princípio acender, porque são parte do
 * relatório e não uma punição que some quando a criança acerta.
 */
export const SELOS = {
    cx: 980,
    cy: HUD.cy,
    w: 88,
    h: 40,
    gap: 8,
    r: 12,
    /** As bolinhas de alerta, no canto de cima à direita da pastilha. */
    alertaDX: -14,
    alertaDY: 13,
    alertaR: 4,
}

/** A situação, numa faixa no alto. */
export const SITUACAO = {
    x: 28,
    y: 94,
    w: W - 56,
    h: 86,
    r: 20,

    cx: W / 2,
    cy: 137,
    wrap: 1120,
}

/**
 * A ficha do arquivo.
 *
 * Ela é o objeto central: a criança fica olhando para ela para decidir, e é
 * nela que a consequência acontece. Por isso a arte entra grande — num prédio
 * de miniaturas a pergunta "tem gente nessa foto?" não teria resposta.
 */
export const FICHA = {
    cx: 316,
    cy: 438,
    w: 330,
    h: 424,
    r: 22,

    /* ── frente: a arte e o nome do arquivo ─────────────────────────── */
    arteCY: -46,
    arteW: 250,
    arteH: 276,
    nomeY: 126,
    nomeWrap: 280,

    /**
     * A orelha de papel, no canto de cima à direita.
     *
     * Ela substitui a linha "toque para virar ↻", que era mais um texto numa
     * tela que já tinha texto demais. Uma dobra de papel com uma seta dentro
     * diz a mesma coisa sem nenhuma palavra — e balança sozinha até a criança
     * virar a ficha pela primeira vez, aí para de chamar.
     */
    orelhaDX: -40,
    orelhaDY: 40,
    orelhaR: 34,

    /* ── verso: a etiqueta ──────────────────────────────────────────── */
    rotuloX: -132,
    autorRotuloY: -150,
    autorY: -122,
    permRotuloY: -40,
    permY: -12,
    avisoRotuloY: 72,
    avisoY: 100,
    textoWrap: 264,

    hitPad: 14,
}

/** As três ações, à direita. Ícone grande à esquerda, rótulo curto ao lado. */
export const ACOES = {
    cx: 872,
    w: 640,
    h: 112,
    r: 20,
    gap: 20,
    primeiroCY: 302,
    /** A faixa na cor do princípio, na borda esquerda do cartão. */
    lombada: 12,

    perguntaY: 224,
    perguntaWrap: 620,

    /** O ícone: o gesto desenhado, para quem ainda lê devagar. */
    iconeDX: -252,
    iconeR: 34,
    /** O rótulo ocupa o resto do cartão, centrado no espaço que sobra. */
    textoDX: 40,
    textoWrap: 470,

    hitPad: 12,
}

/**
 * O impacto, no lugar exato onde estavam as ações.
 *
 * Ou o jogo te dá as opções, ou te dá a consequência da que você escolheu. Um
 * retângulo só para as duas coisas mantém o olho parado e evita a tela crescer
 * para caber mais um painel.
 */
export const IMPACTO = {
    cx: 872,
    cy: 416,
    w: 640,
    h: 336,
    r: 22,

    /**
     * O título mora no MEIO da faixa colorida, não embaixo dela.
     *
     * A faixa vai de 248 a 310, e o título estava em 300: encostado na borda de
     * baixo, meio dentro e meio fora. 279 é o centro exato dela.
     */
    tituloY: 279,
    /**
     * E o texto é centrado no que sobra da caixa (310 a 584), com origem
     * `0.5, 0.5`. Preso pelo topo, um impacto de duas linhas ficava pendurado
     * lá em cima com um vão enorme embaixo, e um de cinco linhas quase
     * encostava no fundo. Centrado, os dois ficam no mesmo lugar do olho.
     */
    textoY: 447,
    textoWrap: 560,

    botaoY: 646,
    botaoW: 300,
    botaoH: 62,
}

export const TOAST = {
    cx: W / 2,
    y: 400,
    hiddenY: 120,
    w: 780,
    h: 96,
    r: 22,
}
