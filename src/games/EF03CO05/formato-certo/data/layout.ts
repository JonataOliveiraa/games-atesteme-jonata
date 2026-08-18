/**
 * Layout único do Formato Certo — 1280x720.
 *
 * Duas colunas. Bancada à esquerda, leitor à direita. Nada atravessa a
 * fronteira — é o mesmo princípio que fez o Chef parar de brigar por espaço.
 *
 * Ver VISUAL.md §3.
 */
export const W = 1280
export const H = 720

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

    dotsX: 202,
    dotsMaxW: 190,
    dotR: 8,

    titleX: 660,
    titleY: 40,
    titleW: 600,
    hintY: 70,
    hintW: 620,

    helpX: 1146,
    helpR: 27,
    muteX: 1216,
    muteR: 27,
}

export const TIMER = {
    cx: 490,
    y: 104,
    w: 880,
    h: 26,
    r: 13,
    warnAt: 0.5,
    panicAt: 0.25,
}

/** Bancada: tudo que é jogável. */
export const BENCH = {
    x: 24,
    y: 138,
    w: 932,
    h: 570,
    r: 30,
    cx: 490,
}

export const REQUEST = {
    cx: 490,
    cy: 188,
    w: 884,
    h: 92,
    r: 24,
    iconX: -382,
    iconSize: 62,
    textX: -318,
    wrap: 620,
}

/**
 * Faixa das caixas. A largura vem da quantidade — três para escolher (N1),
 * duas lado a lado (N2), uma sozinha e maior (N1 preenchendo, N3).
 */
export const BOXES = {
    cy: 364,
    h: 224,
    r: 26,
    gap: 24,
    w1: 560,
    w2: 424,
    w3: 288,
    /**
     * Título, subtítulo e campos em três faixas que não se tocam. Com o
     * subtítulo em -58 e os campos em 26, o rótulo "Mês" batia em cima de
     * "dia, mês e ano" — e o rótulo do campo é justamente o que dá sentido
     * ao dado que está dentro dele.
     */
    titleDY: -92,
    subtitleDY: -68,
    fieldsDY: 32,
}

/**
 * Campos dentro da caixa. O poço de pixel é quadrado e menor: precisa parecer
 * um ponto de imagem, não uma gaveta.
 */
export const FIELD = {
    w: 116,
    /** Menor que a largura: o poço precisa caber entre o subtítulo e os leds. */
    h: 108,
    r: 20,
    gap: 18,
    labelDY: -78,
    pixelSize: 92,
    /** Larguras reduzidas quando a caixa tem 4 campos e não cabe o tamanho cheio. */
    wTight: 96,
    gapTight: 12,
}

/** Bandeja de peças. Duas fileiras quando passa de 5. */
export const TRAY = {
    cx: 490,
    y: 496,
    w: 884,
    h: 206,
    r: 24,
    singleY: 600,
    row1Y: 558,
    row2Y: 656,
    cardW: 132,
    cardH: 112,
    cardWTight: 116,
    cardHTight: 90,
    gap: 16,
    cardR: 20,
    maxW: 850,
    /** Acima disso a bandeja quebra em duas fileiras. */
    perRowMax: 5,
}

/** Coluna do leitor. */
export const READER = {
    cx: 1114,
    x: 972,
    w: 284,
    labelY: 140,
    screenY: 300,
    screenW: 268,
    screenH: 300,
    screenR: 24,
    bezel: 14,
    btnY: 552,
    btnW: 244,
    btnH: 76,
    /** Rodapé da coluna: dica curta sob o botão. */
    noteY: 636,
}

export const TOAST = {
    y: 656,
    hiddenY: 790,
    w: 720,
    h: 72,
    r: 22,
}
