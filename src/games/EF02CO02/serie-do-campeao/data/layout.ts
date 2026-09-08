export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    veil: 10,
    band: 20,
    coach: 30,
    athlete: 40,
    card: 60,
    button: 70,
    hud: 90,
    fx: 120,
    edge: 140,
}

/** A faixa inteira, como no Tradutor da Máquina: nível, medalhas, recado, tempo. */
export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 84,
    r: 26,
    cy: 52,

    pillX: 42,
    pillY: 32,
    pillW: 156,
    pillH: 40,

    medalX: 236,
    medalGap: 42,
    medalR: 14,

    titleX: 654,
    titleY: 37,
    titleW: 440,
    hintY: 69,
    hintW: 520,

    timeCx: 1086,
    timeW: 164,
    timeH: 20,

    helpX: 1220,
    helpR: 27,
}

/**
 * A série mudou para a coluna da direita.
 *
 * No topo ela ficava exatamente onde a cabeça do atleta chega no auge do pulo
 * — o painel tapava o movimento que ele está contando.
 */
export const CARD = {
    cx: 1056,
    top: 112,
    bottom: 512,
    w: 360,
    maxH: 152,
    r: 28,
    gap: 20,
    badge: 34,
    badgeX: -110,
    dotR: 14,
    dotGap: 32,
    dotX: -2,
    icon: 88,
    iconX: 112,
    idleScale: 0.88,
}

export const cardH = (n: number) =>
    Math.min(CARD.maxH, (CARD.bottom - CARD.top - (n - 1) * CARD.gap) / n)

export const cardY = (i: number, n: number) => {
    const h = cardH(n)
    const total = n * h + (n - 1) * CARD.gap
    const start = (CARD.top + CARD.bottom) / 2 - total / 2
    return start + h / 2 + i * (h + CARD.gap)
}

const dotGapFor = (count: number) => (count >= 5 ? 26 : CARD.dotGap)

export const dotRFor = (count: number) => (count >= 5 ? 11 : CARD.dotR)

export const dotX = (i: number, n: number) =>
    CARD.dotX + (i - (n - 1) / 2) * dotGapFor(n)

export const ATHLETE = { x: 640, feetY: 512, h: 272, hop: 130 }

export const COACH = { x: 150, feetY: 512, h: 262, sign: 96, signDX: 140, signDY: -252 }

export const BTN = {
    cy: 616,
    w: 420,
    h: 152,
    r: 36,
    icon: 116,
    iconX: -106,
    labelX: 62,
    jumpX: 372,
    spinX: 892,
}
