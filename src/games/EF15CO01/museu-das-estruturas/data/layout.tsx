export const W = 1280
export const H = 720
export const TOPBAR = 84

export const BG = { w: 1672, h: 941 }

export const HEADER = {
    pillX: 24,
    pillY: 44,
    pillW: 128,
    pillH: 38,
    dotsX: 176,
    dotsY: 44,
    dotGap: 26,
    dotR: 9,
    titleX: 640,
    helpX: 1240,
    helpY: 44,
    helpR: 25,
}

export const HUB = {
    doorW: 262,
    doorH: 320,
    doorWSmall: 196,
    doorHSmall: 240,
    gap: 34,
    gapSmall: 24,
    doorY: 262,
    plateGap: 34,
    plateH: 54,
    techGap: 26,
    tinoX: 128,
    tinoY: 700,
    tinoH: 236,
    balloonX: 268,
    balloonY: 552,
    balloonW: 988,
    balloonH: 132,
    tailX: 250,
    tailY: 614,
}

export const ROOM = {
    plaqueX: 24,
    plaqueY: 100,
    plaqueW: 300,
    plaqueH: 208,
    plaqueIconY: 168,
    plaqueKidY: 236,
    plaqueTechY: 268,
    tinoX: 172,
    tinoY: 708,
    tinoH: 292,
    balloonX: 336,
    balloonY: 566,
    balloonW: 920,
    balloonH: 130,
    tailX: 318,
    tailY: 620,
    backX: 92,
    backY: 44,
    backW: 128,
    backH: 46,
}

export const STAGE = {
    x: 336,
    y: 100,
    w: 920,
    h: 440,
    cx: 796,
    cy: 320,
}

export const LISTA = {
    cardW: 128,
    cardH: 148,
    gap: 18,
    gapY: 24,
    trayY: 236,
    slotY: 434,
    labelDY: 52,

    /*
     * O RAIO DA PEÇA TEM TETO, E O TETO É A CARTA.
     *
     * Era `10 + size * 11`, e o tamanho 5 dava raio 65 numa carta de meia
     * largura 64: a bolinha "maior" saía pelos dois lados e ainda cobria o
     * rótulo. Com base 14 e passo 5.5 a escala vai de 19,5 a 41,5 — a maior
     * continua sendo visivelmente a maior, mas cabe entre as bordas e para
     * acima do texto. Mexer nestes dois números exige refazer a conta:
     * shapeRBase + 5 * shapeRStep tem que caber em cardW / 2 e não pode
     * passar de labelDY + shapeDY.
     */
    shapeDY: -8,
    shapeRBase: 14,
    shapeRStep: 5.5,
}

export const MATRIZ = {
    cx: 796,
    cy: 336,
    cell: 92,
    gap: 10,
    headSize: 62,
    headGap: 12,
}

export const REGISTRO = {
    cx: 796,
    cardW: 540,
    cardTop: 128,
    rowW: 476,
    rowH: 52,
    keyDX: -212,
    valDX: 212,
    optionW: 210,
    optionH: 60,
    optionGap: 20,
}

export const GRAFO = {
    x: 396,
    y: 206,
    w: 800,
    h: 318,
    nodeR: 44,
    hitR: 56,
    labelDY: 64,
    listX: 796,
    listY: 118,
    lineGap: 24,
}

export const SOLTO = {
    cx: 796,
    tokenW: 148,
    tokenH: 74,
    tokenGap: 18,
    rowY: 156,
    rowGapY: 20,
    binY: 392,
    binW: 250,
    binH: 136,
    binGap: 34,
}

export const MODAL = {
    w: 720,
    padTop: 58,
    titleDY: 128,
    bodyDY: 176,
    btnW: 320,
    btnH: 74,
}