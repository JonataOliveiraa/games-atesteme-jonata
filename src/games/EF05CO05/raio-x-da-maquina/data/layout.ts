export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    screen: 10,
    bay: 14,
    piece: 20,
    stamp: 26,
    veil: 40,
    sign: 50,
    request: 60,
    hud: 100,
    /** O desafio toma a tela inteira, por cima de tudo. */
    trial: 150,
    fx: 200,
    frame: 300,
} as const

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 17,
    pillW: 178,
    pillH: 48,
    dotX: 226,
    dotGap: 36,
    dotR: 11,
    titleX: 664,
    titleW: 560,
    livesX: 1060,
    livesY: 41,
    helpX: 1218,
    helpR: 30,
    helpHit: 120,
} as const

/** O balão do pedido tem largura própria: o vão entre a borda e a máquina. */
export const REQUEST = {
    x: 40,
    y: 96,
    w: 880,
    h: 130,
    cx: 480,
    cy: 161,
    wrap: 812,
    tailW: 34,
} as const

export const MACHINE = {
    cx: 1096,
    cy: 162,
    scale: 0.3,
    lampDy: 52,
    lampGap: 30,
    lampR: 9,
} as const

export const XRAY = {
    x: 40,
    y: 244,
    w: 1200,
    h: 462,
    pad: 20,
    scanH: 96,
} as const

export const BAY = {
    w: 272,
    h: 400,
    gap: 24,
    top: 275,
    radius: 22,
} as const

export const PIECE = {
    cy: 412,
    /** Uma escala só para a folha inteira, tirada do quadro mais alto (246 px). */
    scale: 0.92,
} as const

/** A etiqueta da peça. Ela existe desde que a baia acende — só o brilho é prêmio. */
export const STAMP = {
    cy: 606,
    w: 248,
    h: 58,
} as const

/**
 * A plaquinha fica sobre a tela escurecida, e não numa faixa própria: é a única
 * forma de ela ser lida no celular sem roubar espaço permanente da tela.
 */
export const SIGN = {
    cy: 468,
    maxW: 740,
    padX: 30,
    h: 104,
    holdMs: 2400,
} as const

export function bayX(index: number): number {
    const left = XRAY.x + XRAY.pad
    return left + index * (BAY.w + BAY.gap) + BAY.w / 2
}

export const BAY_CY = BAY.top + BAY.h / 2
