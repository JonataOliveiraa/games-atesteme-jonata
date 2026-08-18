/**
 * Layout único do Tribunal — 1280x720.
 *
 * Mudança estrutural em relação à versão anterior: a `UIScene` sumiu. A barra
 * dela ocupava 132px do topo e obrigava a `GameScene` a desenhar tudo abaixo
 * disso, apertando o cartão contra os botões. O HUD agora vive na própria
 * cena com 72px — os 60px devolvidos foram todos para o cartão de sentença,
 * que é onde a criança de fato olha.
 *
 * Duas colunas: o juiz mora na esquerda e nada mais entra ali; o cartão, o
 * cronômetro e os botões dividem a coluna da direita, todos centrados no
 * mesmo eixo (`CARD.cx`) para a leitura descer em linha reta.
 */
export const W = 1280
export const H = 720

/** Eixo vertical de tudo que é jogável. O juiz fica fora dele, à esquerda. */
export const AXIS = 758

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 84,
    r: 26,
    cy: 52,

    pillX: 42,
    pillY: 32,
    pillW: 134,
    pillH: 40,

    /** Primeiro pontinho de progresso; os demais andam de `dotGap`. */
    dotsX: 202,
    dotsMaxW: 190,
    dotR: 8,

    /** Título e dica dividem a coluna central: título em cima, dica embaixo. */
    titleX: 668,
    titleY: 40,
    titleW: 600,
    hintY: 70,
    hintW: 620,

    helpX: 1146,
    helpR: 27,
    muteX: 1216,
    muteR: 27,
}

/**
 * Cronômetro do Nível 3. Alinhado ao cartão de propósito: é o cartão que
 * está sendo cronometrado, e a barra por cima dele diz isso sem legenda.
 */
export const TIMER = {
    cx: AXIS,
    y: 112,
    w: 700,
    h: 26,
    r: 13,
    /** Piscar começa quando resta esta fração do tempo. */
    panicAt: 0.25,
    warnAt: 0.5,
}

/** Coluna do juiz. Ele não divide espaço com nada. */
export const JUDGE = {
    x: 178,
    y: 404,
    maxW: 268,
    maxH: 368,
    /** Estrado desenhado sob a personagem, para ela não flutuar no fundo. */
    benchY: 596,
    benchW: 300,
    benchH: 26,
    floatAmount: 6,
    floatDuration: 2600,
}

/**
 * Cartão de sentença. A altura é calculada a partir do texto, então só o
 * mínimo é fixo; `cy` é o centro e o topo se ajusta para os dois lados.
 */
export const CARD = {
    cx: AXIS,
    cy: 320,
    w: 700,
    minH: 236,
    maxH: 330,
    r: 26,
    pad: 38,
    headerH: 62,
    /** Largura de quebra do texto da sentença. */
    wrap: 700 - 96,
}

/**
 * Selo do NÃO. Mora DENTRO do cabeçalho do cartão, encostado à direita.
 *
 * Antes ele flutuava acima do cartão e a posição era calculada contra o teto
 * da tela a cada frase — com frase longa o cartão crescia para cima e os dois
 * se encontravam. Dentro do cabeçalho o problema deixa de existir, e o aviso
 * fica exatamente onde o olho já está: na mesma linha da origem da notícia.
 */
export const BADGE = {
    w: 232,
    h: 40,
    r: 20,
    /** Recuo a partir da borda direita do cartão. */
    inset: 20,
}

/** Botões de veredicto. `dx` é o afastamento a partir de `CARD.cx`. */
export const ANSWER = {
    y: 586,
    w: 322,
    h: 140,
    dx: 176,
    r: 32,
    /** Espessura da base escura: o botão tem volume, não é adesivo. */
    drop: 8,
    labelDY: -26,
    captionDY: 34,
    /** Altura do martelo pairando sobre o botão em foco. */
    gavelDY: -104,
    gavelSize: 92,
}

/**
 * Painel de explicação. Ocupa a MESMA faixa dos botões: durante o feedback os
 * botões recuam e o painel entra no lugar deles.
 *
 * A versão anterior desenhava o painel por cima dos botões (depth 70 contra
 * 5). Funcionava, mas ficava a silhueta verde e vermelha vazando pelas bordas
 * arredondadas, o que lia como erro de renderização.
 */
export const EXPLAIN = {
    cx: AXIS,
    cy: 586,
    w: 700,
    r: 26,
    padX: 28,
    rowH: 44,
    labelW: 210,
    /** Altura base + uma linha extra quando a frase tem negação. */
    baseH: 176,
    negationH: 222,
}

export const TOAST = {
    y: 656,
    hiddenY: H + 70,
    w: 720,
    h: 72,
    r: 22,
}

/** Carimbo de veredicto que bate no cartão. */
export const STAMP = {
    w: 262,
    h: 84,
    r: 16,
    angle: -11,
}
