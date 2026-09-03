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

export const GOAL = { cx: 640, cy: 236, top: 122, w: 300, h: 210 }

export const SLOT = { cy: 316, w: 220, h: 200, gap: 40 }

export const TRAY = { cy: 570, w: 220, h: 200, gap: 26 }

export const STEP = { cy: 300, w: 190, h: 180, gap: 30 }

const MARGIN = 72
const RATIO = SLOT.h / SLOT.w

/** A bandeja encolhe quando enche: 6 cartas de 220 não cabem em 1280. */
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

export const LANE = { cx: 640, cy: 300, h: 196, pad: 26, scale: 0.78 }

export const RUN = { x: 640, y: 560, w: 260, h: 76, r: 38 }

export const slotX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (slotCard(n).w + SLOT.gap)

export const trayX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (trayCard(n).w + TRAY.gap)

export const stepX = (i: number, n: number) =>
    640 + (i - (n - 1) / 2) * (stepCard(n).w + STEP.gap)
