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
