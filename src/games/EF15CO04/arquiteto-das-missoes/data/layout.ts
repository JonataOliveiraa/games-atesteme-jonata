export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    veil: 10,
    band: 20,
    panel: 40,
    card: 60,
    glyph: 70,
    hud: 90,
    fx: 120,
    edge: 140,
    overlay: 300,
}

export const STATUS = {
    x: 16,
    y: 12,
    w: 210,
    h: 92,
    pill: { x: 28, y: 24, w: 186, h: 38, r: 19 },
    dotY: 82,
    dotR: 9,
    dotGap: 34,
}

export const HELP = { x: 1216, y: 44, r: 30 }

/** O pedido entra grande no meio e sobe inteiro: ele é o enunciado. */
export const GOAL = { cx: 640, cy: 320, top: 176, w: 300, h: 190 }

export const TAG = { cy: 46, h: 38 }

export const SLOT = { cy: 436, w: 152, h: 138, gap: 36 }

export const TRAY = { cy: 594, w: 164, h: 149, gap: 26 }

export const STEP = { cy: 282, w: 170, h: 160, gap: 30 }

export const PICK = { cy: 456 }

export const TASK = { cy: 116, h: 70, badge: 96, pad: 30 }

export const SPLIT_HINT = { cy: 322 }

const MARGIN = 72
const RATIO = SLOT.h / SLOT.w

/** A bandeja encolhe quando enche: 6 cartas de 164 não cabem em 1280. */
export const rowWidth = (n: number, max: number, gap: number) =>
    Math.min(max, (W - MARGIN - (n - 1) * gap) / n)

export const trayCard = (n: number) => {
    const w = rowWidth(n, TRAY.w, TRAY.gap)
    return { w, h: w * RATIO }
}

export const slotCard = (n: number) => {
    const w = rowWidth(n, SLOT.w, SLOT.gap)
    return { w, h: w * RATIO }
}

export const stepCard = (n: number) => {
    const w = rowWidth(n, STEP.w, STEP.gap)
    return { w, h: w * (STEP.h / STEP.w) }
}

/**
 * O "já fiz" saiu do rodapé para a lateral: o rodapé virou o lugar da
 * instrução do passo, que é o que a criança precisa ler agora.
 */
export const RAIL = {
    x: 946,
    w: 300,
    top: 150,
    head: 46,
    rowH: 118,
    pad: 14,
    cardW: 104,
    cardH: 92,
    labelGap: 14,
}

export const railHeight = (n: number) => RAIL.head + n * RAIL.rowH + RAIL.pad

export const railRowY = (i: number) => RAIL.top + RAIL.head + RAIL.rowH * i + RAIL.rowH / 2

export const RAIL_CARD_X = RAIL.x + 24 + RAIL.cardW / 2

export const BAR = { x: 44, y: 598, w: 880, h: 102, r: 34, pipX: 110, textX: 160 }

export const CONFIRM = { x: 800, y: 649, w: 216, h: 74 }

export const LANE = { cx: 640, cy: 300, h: 196, pad: 26, scale: 0.78 }

export const RUN = { x: 640, y: 560, w: 260, h: 76, r: 38 }

export const slotX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (slotCard(n).w + SLOT.gap)

export const trayX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (trayCard(n).w + TRAY.gap)

export const stepX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (stepCard(n).w + STEP.gap)
