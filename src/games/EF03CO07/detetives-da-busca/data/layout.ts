/**
 * Layout único do Detetives da Busca — 1280x720.
 *
 * Uma coluna só, em faixas horizontais. Sem coluna lateral de personagem, então
 * a largura inteira é do jogo.
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

    helpX: 1216,
    helpR: 27,
}

export const CASE = {
    cx: 640,
    cy: 162,
    w: 1160,
    h: 92,
    r: 24,
    iconX: -520,
    iconSize: 62,
    /**
     * Caixa do selo quando ele vem de textura.
     *
     * Maior que `iconSize` porque o PNG é 350x350 com folga transparente em
     * volta: o desenho útil ocupa cerca de 85% do quadro, e a caixa maior
     * devolve ao selo o mesmo peso visual que o desenho em Graphics tinha.
     */
    iconTexBox: 72,
    textX: -456,
    wrap: 860,
    /** Etiqueta do critério, só no N3. Fica à direita do pedido. */
    chipX: 452,
    chipW: 240,
    chipH: 40,
    chipR: 20,
}

export const SEARCH = {
    cx: 520,
    cy: 264,
    w: 920,
    h: 72,
    r: 36,
    lensX: -420,
    lensSize: 44,
    slot0X: -300,
    slotW: 260,
    slotH: 48,
    slotR: 24,
    slotGap: 18,
    /** O contador fica FORA da barra: é o placar silencioso do N2. */
    counterX: 1092,
    counterY: 252,
    counterLabelY: 284,
}

export const FILTERS = {
    cy: 340,
    w: 210,
    h: 56,
    r: 28,
    gap: 18,
    seloSize: 34,
    seloDX: -66,
    labelDX: -30,
}

/**
 * O mural muda de altura conforme as faixas que existem no nível.
 *
 * A faixa que não existe não deixa buraco: o mural come o espaço dela. Sem
 * filtros ele sobe 40px; sem bandeja ele desce até 660.
 */
export const MURAL = {
    x: 60,
    w: 1160,
    r: 28,
    /** N2: com filtros e com bandeja. */
    withFilters: { y: 380, h: 224 },
    /** N1: sem filtros, com bandeja. */
    withoutFilters: { y: 340, h: 264 },
    /** N3: sem filtros e sem bandeja, duas pistas grandes. */
    big: { y: 340, h: 320 },
}

export const CARD = {
    w: 248,
    /** Largura com cinco cartões. Nunca há segunda fileira. */
    wTight: 202,
    h: 196,
    r: 22,
    gap: 22,
    /** Acima disso o cartão encolhe para `wTight`. */
    perRowMax: 4,

    seloDY: -54,
    seloSize: 62,
    titleDY: 26,
    titleWrap: 200,
    sourceDY: 66,

    /** O pino crava na borda de cima do cartão, sem pedir espaço extra. */
    pinDY: -98,
    pinSize: 44,

    /** Marca de "já li", canto superior direito. */
    readDX: 96,
    readDY: -74,
    readR: 11,

    /** N3: duas pistas grandes. */
    bigW: 420,
    bigH: 300,
    bigGap: 60,
    bigSeloDY: -78,
    bigSeloSize: 84,
    bigTitleDY: 24,
    bigTitleWrap: 350,
    bigSourceDY: 92,

    /**
     * Inclinação máxima, em graus.
     *
     * Cada cartão nasce com um ângulo próprio derivado do índice, nunca
     * sorteado: papel pregado à mão não fica reto, mas um mural que dança a
     * cada repintura é pior do que um mural quadrado.
     */
    tilt: 3,
}

export const TRAY = {
    cx: 640,
    y: 616,
    w: 1160,
    h: 90,
    r: 24,
    chipW: 230,
    chipH: 62,
    chipR: 31,
    gap: 22,
}

/** A lupa em repouso, no canto de baixo à direita. */
export const LENS = {
    restX: 1186,
    restY: 646,
    size: 118,
}

/** O cartão aberto pela lupa. Cobre o mural, com o resto escurecido. */
export const OPEN = {
    cx: 640,
    cy: 430,
    w: 800,
    h: 320,
    r: 28,
    seloX: -300,
    seloSize: 84,
    /**
     * Coluna de texto. Título, fonte e trecho começam TODOS aqui.
     *
     * O trecho começava em -350, à esquerda do selo (que ocupa de -342 a -258),
     * e passava por cima dele. Uma coluna só para os três textos resolve e ainda
     * alinha a leitura: o olho desce em linha reta do título ao trecho.
     */
    textX: -216,
    titleDY: -104,
    titleWrap: 520,
    sourceDY: -66,
    snippetDY: 6,
    /** Até a margem direita do cartão (+370), a partir de `textX`. */
    snippetWrap: 566,
    verdictDY: 62,
    btnY: 118,
    btnW: 260,
    btnH: 66,
}

export const TOAST = {
    y: 660,
    hiddenY: 790,
    w: 760,
    h: 72,
    r: 22,
}
