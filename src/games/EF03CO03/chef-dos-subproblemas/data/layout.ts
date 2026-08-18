/**
 * Layout único do jogo — 1280x720.
 *
 * Regra que o layout antigo quebrava: alvo de arraste para criança do 3º ano
 * não desce de ~100px, e legenda não desce de 17px. Aqui a bancada ocupa a
 * esquerda inteira e a cozinheira mora numa coluna própria à direita, então
 * nada mais disputa espaço com nada.
 */
export const W = 1280
export const H = 720

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 72,
    pillX: 40,
    pillY: 28,
    pillW: 132,
    pillH: 40,
    phaseX: 190,
    titleX: 640,
    cy: 46,
    helpX: 1226,
    helpR: 26,
}

/** Bancada: tudo que é jogável vive aqui. */
export const BOARD = {
    x: 24,
    y: 94,
    w: 936,
    h: 612,
    r: 30,
    cx: 492,
    headerH: 52,
}

/** Coluna da cozinheira: fala, botão de ação e a personagem. */
export const CHEF = {
    cx: 1120,
    bubbleY: 190,
    bubbleW: 288,
    bubbleMinH: 108,
    bubbleMaxH: 190,
    btnY: 336,
    btnW: 258,
    btnH: 82,
    y: 546,
    maxW: 262,
    maxH: 326,
}

export const MISSION_CARD = {
    cx: BOARD.cx,
    cy: 196,
    w: 872,
    h: 108,
    r: 26,
    iconX: -368,
    iconSize: 78,
    titleX: -300,
    titleDY: -22,
    textDY: 20,
}

/**
 * Pratos / slots / espaços de combinação — todos na mesma faixa vertical.
 * `splitH` precisa caber quatro faixas empilhadas: ícone, rótulo, fichas e
 * contador. Com menos de 200px elas se sobrepõem.
 */
export const DROPS = {
    cy: 366,
    splitH: 200,
    /**
     * O slot de ordem é mais alto que os outros porque empilha três faixas
     * que não podem se tocar: número, ficha e dica. Com 184 a ficha subia por
     * cima do disco do número, que é justamente a informação da etapa.
     */
    orderH: 210,
    combineH: 190,
    r: 30,
    maxRowW: 880,
    gapWide: 40,
    gapTight: 26,
    // Deslocamentos internos, medidos do centro do prato.
    splitIconDY: -58,
    splitLabelDY: -8,
    splitChipDY: 48,
    orderNumDY: -71,
    orderNumR: 28,
    orderChipDY: 22,
    combineChipDY: 18,
}

/** Prateleira de ícones arrastáveis. Sem rótulo: a cozinheira já diz o que fazer. */
export const BANK = {
    cx: BOARD.cx,
    singleY: 591,
    row1Y: 539,
    row2Y: 649,
    maxW: 880,
    cardW: 152,
    cardH: 110,
    cardWSubtask: 206,
    cardHSubtask: 126,
    gap: 16,
    r: 22,
}

/** Fichas já colocadas dentro de um prato. */
export const CHIP = {
    splitSize: 66,
    splitGap: 74,
    bigW: 176,
    bigH: 118,
    /** Mais baixa no slot de ordem, para não encostar no disco do número. */
    orderH: 104,
    r: 18,
}

export const TOAST = {
    y: 640,
    w: 720,
    h: 74,
    r: 22,
}

/**
 * Modo diálogo: a cena escurece, a cozinheira cresce e o balão vira um painel
 * grande no meio da bancada, com botão "Próximo". É o oposto do balão de canto
 * usado para comentários rápidos.
 */
export const DIALOG = {
    x: 566,
    y: 336,
    w: 740,
    minH: 190,
    maxH: 320,
    wrap: 648,
    r: 30,
    btnW: 244,
    btnH: 74,
    btnGap: 54,
    chefGrow: 1.16,
}
