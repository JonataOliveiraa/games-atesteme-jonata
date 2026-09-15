/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS FOLHAS, MEDIDAS EM VEZ DE SUPOSTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O TEXTURAS.md pediu bloco 512 × 256, nave 1024 × 288 e máquina 1024 × 512.
 * Vieram 800 × 400, 1200 × 400 e 800 × 400. Os números abaixo são os da folha
 * entregue, medidos pelo canal alfa — é por eles que o layout se guia.
 *
 *   bloco    f0 aberto   caixa (6,14) 394×383   furo (78,88) 247×234
 *            f1 fechado  caixa (0,14) 400×383   sem furo
 *   nave     f0 chama curta  caixa (57,82) 535×293
 *            f1 chama longa  caixa (22,84) 577×291
 *   maquina  f0/f1 caixa (27,3) 348×395   furo da tela (115,133) 189×178
 */

export const SHEET = {
    tunnel: 'pb-tunnel',
    ship: 'pb-ship',
    block: 'pb-block',
    machine: 'pb-machine',
} as const

export const SHIP_SHEET = { frameWidth: 600, frameHeight: 400 }
export const BLOCK_SHEET = { frameWidth: 400, frameHeight: 400 }
export const MACHINE_SHEET = { frameWidth: 400, frameHeight: 400 }

export const SHIP_FRAME = { idle: 0, thrust: 1 } as const
export const BLOCK_FRAME = { open: 0, closed: 1 } as const
export const MACHINE_FRAME = { idle: 0, busy: 1 } as const

/**
 * O furo do bloco, em fração da célula.
 *
 * Não é quadrado (247 × 234) e não está exatamente no centro: o quadradinho
 * que o código desenha usa o MENOR lado e o centro medido, senão ele nasce
 * oval e encostado na borda de baixo.
 */
export const BLOCK_HOLE = {
    cx: (78 + 324 + 1) / 2 / 400,
    cy: (88 + 321 + 1) / 2 / 400,
    w: 247 / 400,
    h: 234 / 400,
} as const

/** A tela da máquina, em fração da célula. Também não está centrada. */
export const MACHINE_SCREEN = {
    cx: (115 + 303 + 1) / 2 / 400,
    cy: (133 + 310 + 1) / 2 / 400,
    w: 189 / 400,
    h: 178 / 400,
} as const

/** A proa da nave, em fração da célula: é onde a carga acende. */
export const SHIP_NOSE = { x: 591 / 600, y: 0.57 } as const
