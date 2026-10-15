export const W = 1280
export const H = 720

export const DEPTH = {
    belt: 5,
    fabric: 6,
    worker: 7,
    window: 8,
    roll: 9,
    /** o véu da pergunta: o que fica acima dele continua aceso */
    veil: 9.5,
    order: 10,
    line: 11,
    hanging: 12,
    ask: 14,
    stamps: 16,
    flying: 20,
    fx: 24,
    banner: 30,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** o papel do pedido, no alto: a largura acompanha a estrutura */
export const ORDER = { x: 640, y: 178, w: 800, minW: 400, margin: 30, h: 188, corner: 26, enterDy: -300 } as const

/** a estrutura dentro do papel: estampas, molduras e abas */
export const LOOP = {
    icon: 96,
    pad: 14,
    gap: 14,
    corner: 22,
    tabCorner: 24,
    tab: [
        { w: 118, h: 142, font: 52, numberDy: -32 },
        { w: 100, h: 118, font: 42, numberDy: -24 },
    ],
    slot: 28,
    slotGap: 34,
    perRow: 3,
} as const

/**
 * A esteira fica sobre o balcão do fundo (no bg, o tampo vai de y 379 a 444); a janela de
 * estampa fica no meio, em cima do carimbo do meio. O azul da esteira está a 43% da altura
 * dela, e o tecido corre ali.
 */
export const BELT = { y: 400, h: 132 } as const

/** o tecido: o quadradinho da vez fica embaixo da janela */
export const FABRIC = { y: 391, cell: 112, enterFrom: 1150 } as const

/** o vão da janela fica 6% da altura abaixo do centro da imagem */
export const WINDOW = { x: 640, h: 206, openDy: 0.06 } as const
export const ROLL = { x: 1150, y: 352, size: 230 } as const
export const ROLLED = { x: 936, y: 391, size: 124 } as const

/** cada carimbo fica em pé sobre a tinta da almofada (a tinta está 15% acima do centro da lata) */
export const STAMPS = {
    xs: [360, 640, 920],
    y: 566,
    h: 140,
    padY: 652,
    padW: 140,
    hitW: 230,
    hitH: 230,
    hitY: 600,
    hideDy: 320,
    /** o carimbo bate com a base um pouco abaixo do centro do quadradinho */
    strikeDy: -46,
} as const

export const ASK = { x: 466, y: 391, w: 780, h: 112, icon: 80 } as const
export const TAGS = { y: 588, size: 188 } as const

/** o varal: desce na conferência, e o tecido fica pendurado nele */
export const LINE = { y: 290, x0: 40, x1: 1240, rope: 10, hook: 52, enterDy: -220 } as const
export const HANG = { gap: 6 } as const
export const COUNT = { r: 26 } as const

/** a estampadora, no canto de baixo à esquerda, pela base da célula */
export const WORKER = { x: 126, y: 720, h: 286 } as const

export const BANNER = { x: 640, y: 664, w: 980, h: 92 } as const

/** onde o balão do tutorial fica, longe do que ele explica */
export const BALLOON = { low: { balloonX: 640, balloonY: 470 }, high: { balloonX: 640, balloonY: 250 } } as const
