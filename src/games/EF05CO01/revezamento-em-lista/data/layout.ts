export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    water: 10,
    swimmer: 20,
    deck: 30,
    coach: 40,
    balloon: 46,
    chip: 60,
    carried: 76,
    hud: 100,
    fx: 200,
    frame: 300,
} as const

export const HUD = {
    h: 92,
    cy: 46,
    livesX: 44,
    livesY: 44,
    dotX: 560,
    dotGap: 42,
    dotR: 12,
    helpX: 1216,
    helpR: 30,
    helpHit: 120,
} as const

/** A técnica fica no deque da esquerda, com a base logo acima da borda. */
export const COACH = { x: 118, base: 244, h: 156 } as const

export const BALLOON = {
    x: 214,
    y: 104,
    w: 946,
    h: 104,
    textX: 300,
    wrap: 820,
    iconX: 262,
    tailX: 196,
} as const

/**
 * A água mora dentro da bacia do `bg-parque.png`: a borda de cima cai em
 * y ≈ 276 na grade e o deque começa em y ≈ 536. Tudo aqui é medido nisso.
 */
export const POOL = {
    top: 286,
    bottom: 534,
    blockX: 152,
    wallX: 1146,
    laneH: 120,
    mineY: 288,
    rivalY: 414,
    swimmerH: 96,
} as const

/** A cena do tutorial: a treinadora de frente, e o painel de fala ao lado. */
export const TUT = {
    teacherX: 250,
    teacherBase: 528,
    teacherH: 390,
    panelX: 460,
    panelY: 118,
    panelW: 780,
    panelH: 240,
    textX: 500,
    textWrap: 700,
    btnX: 1104,
    btnY: 402,
    btnW: 240,
    btnH: 80,
    skipX: 1180,
    skipY: 46,
} as const

export const STRIP = { x0: 180, x1: 1060, w: 880, y: 540, h: 172, max: 6 } as const
export const BENCH = { x: 40, y: 540, w: 124, h: 172 } as const
export const WHISTLE = { x: 1082, y: 540, w: 158, h: 172 } as const

const CARD_W = [180, 180, 180, 164, 150, 134] as const
const CARD_GAP = [24, 24, 24, 20, 18, 16] as const

/** A ficha encolhe conforme a lista cresce; com 6 ela ainda tem 40 px reais. */
export function cardWidth(count: number): number {
    return CARD_W[Math.min(Math.max(count, 1), STRIP.max) - 1]
}

export interface Slot {
    x: number
    w: number
}

export function chipSlots(count: number): Slot[] {
    if (count <= 0) return []
    const w = cardWidth(count)
    const gap = CARD_GAP[Math.min(count, STRIP.max) - 1]
    const total = count * w + (count - 1) * gap
    const left = STRIP.x0 + (STRIP.w - total) / 2
    return Array.from({ length: count }, (_, i) => ({ x: left + i * (w + gap) + w / 2, w }))
}

/**
 * Os pinos dividem a tira inteira em `count + 1` faixas iguais: não existe
 * ponto da tira que não pertença a um pino desenhado.
 */
export function pinSlots(count: number): Slot[] {
    const tiles = count + 1
    const tile = STRIP.w / tiles
    return Array.from({ length: tiles }, (_, i) => ({
        x: STRIP.x0 + tile * i + tile / 2,
        w: Math.min(124, tile - 14),
    }))
}

/**
 * Com alguém na mão a tira se reorganiza: as fichas que ficaram encolhem e
 * abrem espaço para os `count + 1` pinos. Sem isso o pino nasce debaixo da
 * ficha e a criança não vê onde pode soltar.
 */
export function carrySlots(count: number): { chips: Slot[]; pins: Slot[]; pinHit: number } {
    const pins = count + 1
    const chipW = count >= 5 ? 96 : count >= 3 ? 118 : 140
    const pinW = Math.min(128, (STRIP.w - count * chipW) / pins - 12)
    const step = pinW + 12
    const total = count * chipW + pins * step
    let cursor = STRIP.x0 + (STRIP.w - total) / 2

    const pinSlots: Slot[] = []
    const chipList: Slot[] = []
    for (let i = 0; i < pins; i++) {
        pinSlots.push({ x: cursor + step / 2, w: pinW })
        cursor += step
        if (i < count) {
            chipList.push({ x: cursor + chipW / 2, w: chipW })
            cursor += chipW
        }
    }
    return { chips: chipList, pins: pinSlots, pinHit: step + chipW }
}
