/**
 * Layout único do Arquivo dos Registros — 1280x720.
 *
 *   HUD        10–94
 *   PERGUNTA  104–150
 *   FORMULÁRIO 160–250   (só no Nível 3)
 *   FICHAS     depende do nível
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
    titleW: 580,
    hintY: 70,
    hintW: 620,

    helpX: 1216,
    helpR: 27,
}

export const QUESTION = { cx: 640, cy: 126, wrap: 1120 }

/** A ficha aberta do Nível 1. */
export const BIG = {
    cx: 640,
    cy: 430,
    w: 760,
    h: 440,
    r: 30,

    portraitX: -250,
    portraitY: -10,
    portraitSize: 210,

    nameX: -110,
    nameY: -168,

    /** As cinco linhas de campo, empilhadas. */
    rowX: 120,
    rowW: 460,
    rowH: 50,
    rowGap: 8,
    rowTop: -88,
    rowR: 16,
    labelDX: -206,
    valueDX: -40,
}

/** As fichas pequenas do Nível 2 e 3: três por fileira, duas fileiras. */
export const CARD = {
    w: 340,
    h: 190,
    r: 24,
    gap: 24,
    cols: 3,
    /** Centro vertical de cada fileira. */
    rowsY: [356, 564],

    portraitX: -118,
    portraitY: -18,
    portraitSize: 102,

    nameX: -56,
    nameY: -62,

    lineX: -56,
    lineTop: -14,
    lineH: 34,
    lineWrap: 190,

    pinX: 138,
    pinY: -80,
    pinSize: 46,

    sealX: 132,
    sealY: 62,
    sealSize: 44,
}

/** O formulário anônimo do Nível 3. */
export const FORM = {
    cx: 640,
    cy: 205,
    w: 900,
    h: 96,
    r: 22,
    titleX: -410,
    chipX: -232,
    chipW: 208,
    chipH: 62,
    chipGap: 18,
    chipR: 18,
}

export const TOAST = {
    y: 668,
    hiddenY: 790,
    w: 800,
    h: 74,
    r: 22,
}

export const COUNTER = { cx: 1136, cy: 126 }
