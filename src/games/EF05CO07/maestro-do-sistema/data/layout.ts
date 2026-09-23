export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    spot: 4,
    desk: 10,
    slot: 12,
    ring: 14,
    score: 20,
    halo: 26,
    program: 30,
    balloon: 50,
    fly: 60,
    baton: 70,
    hud: 100,
    fx: 200,
    encore: 300,
    frame: 320,
} as const

export const HUD = {
    h: 92,
    cy: 44,
    livesX: 44,
    livesY: 44,
    levelX: 208,
    levelW: 150,
    missionX: 648,
    dotX: 1112,
    dotGap: 34,
    dotR: 11,
    helpX: 1216,
    helpR: 30,
    helpHit: 120,
} as const

/**
 * Os cinco refletores de `bg-palco.png`, já convertidos para a grade de 1280.
 * Cada programa mora embaixo de um deles — é o que faz o palco parecer feito
 * para eles, e não eles jogados em cima do palco.
 */
export const SPOT_X = [282, 456, 638, 821, 999] as const

/** O assoalho do fundo começa aqui: abaixo desta linha é chão. */
export const STAGE = { floorY: 268 } as const

export const SEAT = {
    footY: 470,
    /** A célula de 256 da folha desenhada com esta altura. */
    cell: 250,
    hitW: 270,
    hitH: 380,
} as const

export const BALLOON = { dy: -300, w: 132, h: 112, tail: 20 } as const

/** A partitura mora logo abaixo dos pés. */
export const SCORE = { dy: 36, r: 9, gap: 26, max: 8 } as const

export const DESK = {
    top: 568,
    cy: 640,
    w: 176,
    h: 140,
    gap: 34,
    ringR: 66,
} as const

/**
 * O botão FÉRIAS, à direita do atril.
 *
 * Com quatro peças o atril vai de x 237 a 1043 — este canto é o único espaço
 * na altura da bancada que nunca disputa toque com um encaixe.
 */
export const FERIAS = { x: 1152, y: 640, w: 166, h: 76 } as const

export function seatX(count: number): number[] {
    if (count <= 1) return [SPOT_X[2]]
    if (count === 2) return [SPOT_X[1], SPOT_X[3]]
    if (count === 3) return [SPOT_X[0], SPOT_X[2], SPOT_X[4]]
    return [SPOT_X[0], 520, 760, SPOT_X[4]]
}

export function deskSlots(count: number, center = W / 2): number[] {
    const total = count * DESK.w + (count - 1) * DESK.gap
    const left = center - total / 2
    return Array.from({ length: count }, (_, i) => left + i * (DESK.w + DESK.gap) + DESK.w / 2)
}
