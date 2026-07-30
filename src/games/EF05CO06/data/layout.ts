import type { StorageId } from '../types'

export const W = 1280
export const H = 720
export const UI_BAR_H = 96

export interface Rect { x: number; y: number; w: number; h: number }

export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

export const TRAY: Rect = { x: 0, y: 560, w: W, h: 160 }

export const DEST_W = 250
export const DEST_H = 300
export const DEST_Y = 138
export const DEST_GAP = 70

const ORDER: StorageId[] = ['disco', 'pendrive', 'nuvem']
const TOTAL_W = ORDER.length * DEST_W + (ORDER.length - 1) * DEST_GAP
const DEST_X0 = (W - TOTAL_W) / 2

export const DEST_RECT: Record<StorageId, Rect> = ORDER.reduce((acc, id, i) => {
    acc[id] = { x: DEST_X0 + i * (DEST_W + DEST_GAP), y: DEST_Y, w: DEST_W, h: DEST_H }
    return acc
}, {} as Record<StorageId, Rect>)

/** Offsets internos do card, a partir do topo. */
export const DEST_SLOT = {
    labelY: 34,
    badgeY: 84,
    iconY: 154,
    stackY: 226,
    dotsY: 276,
}

export const CARD_W = 150
export const CARD_H = 150

/** Documento sozinho fica no centro; com contexto, abre espaço para o botão. */
export const CARD_CX_SOLO = Math.round(W / 2)
export const CARD_CX_PAIR = Math.round(W / 2 - 100)
export const CTX_CX = Math.round(W / 2 + 100)
export const CARD_CY = 550

export const CARD_SLOT: Rect = {
    x: CARD_CX_SOLO - CARD_W / 2, y: CARD_CY - CARD_H / 2, w: CARD_W, h: CARD_H,
}

export const CTX_SLOT: Rect = {
    x: CTX_CX - CARD_W / 2, y: CARD_CY - CARD_H / 2, w: CARD_W, h: CARD_H,
}

export const TOAST_Y = 468

export const PANEL: Rect & { r: number } = {
    x: W / 2 - 300, y: 130, w: 600, h: 420, r: 28,
}

export const ACCIDENT_PANEL: Rect & { r: number } = {
    x: W / 2 - 320, y: 165, w: 640, h: 400, r: 28,
}

export const RESCUE_ASK: Rect = { x: W / 2 - 340, y: 462, w: 680, h: 96 }
export const BTN_CONFIRM: Rect = { x: W / 2 - 170, y: 588, w: 340, h: 62 }

export const INFO_PANEL: Rect & { r: number } = {
    x: W / 2 - 280, y: 170, w: 560, h: 380, r: 26,
}

export const CONTEXT_PANEL: Rect & { r: number } = {
    x: W / 2 - 310, y: 120, w: 620, h: 440, r: 28,
}

export const ICON = {
    destino: 130,
    arquivo: 96,
    pasta: 88,
    selo: 44,
    seloGrande: 90,
    evento: 240,
    barra: 58,
    badge: 40,
}

export const QUEUE_DOT_Y = 690
