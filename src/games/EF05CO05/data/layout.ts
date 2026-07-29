import type { BBox, View } from '../types'

export const W = 1280
export const H = 720


export const UI_BAR_H = 76

export interface Rect { x: number; y: number; w: number; h: number }

export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

export const VIEW_AREA: Rect = { x: 0, y: UI_BAR_H, w: W, h: 590 }

export const BOTTOM_BAR: Rect = { x: 0, y: 645, w: W, h: 75 }

export interface Placement {
    x: number
    y: number
    scale: number
}

export interface Focus { x: number; y: number; w: number; h: number }

export const VIEW_FOCUS: Record<View, Focus> = {
    oficina: { x: 0, y: 0, w: 1536, h: 1024 },
    mesa: { x: 0, y: 0, w: 1536, h: 1024 },
}

export const VIEW_NUDGE: Record<View, { x: number; y: number; zoom: number }> = {
    oficina: { x: 0, y: 0, zoom: 1 },
    mesa: { x: 0, y: 0, zoom: 1 },
}

export function viewPlacement(texW: number, texH: number, view: View): Placement {
    const n = VIEW_NUDGE[view]
    const scale = Math.min(VIEW_AREA.w / texW, VIEW_AREA.h / texH) * n.zoom
    return {
        x: VIEW_AREA.x + (VIEW_AREA.w - texW * scale) / 2 + n.x,
        y: VIEW_AREA.y + (VIEW_AREA.h - texH * scale) / 2 + n.y,
        scale,
    }
}

export function toScreen(b: BBox, p: Placement): Rect {
    return {
        x: p.x + b.x * p.scale,
        y: p.y + b.y * p.scale,
        w: b.w * p.scale,
        h: b.h * p.scale,
    }
}

export const BTN_DRAWER: Rect = { x: 24, y: 654, w: 218, h: 56 }
export const BTN_VIEW: Rect = { x: 258, y: 654, w: 268, h: 56 }
export const BTN_CLEAR: Rect = { x: 900, y: 654, w: 148, h: 56 }
export const BTN_POWER: Rect = { x: 1064, y: 654, w: 192, h: 56 }

export const HAND_SLOT: Rect = { x: 546, y: 654, w: 336, h: 56 }

export const TOAST_Y = 596

export const CARD_FUNCTION: Rect = { x: W / 2 - 320, y: 500, w: 640, h: 104 }

export const DRAWER_PANEL: Rect & { r: number } = {
    x: 148, y: 118, w: 984, h: 486, r: 30,
}

export const DRAWER_TITLE_Y = 168

export function drawerGrid(count: number): Rect[] {
    const cols = count > 8 ? 5 : count > 3 ? 4 : Math.max(count, 1)
    const gap = 18
    const x0 = DRAWER_PANEL.x + 34
    const y0 = 206
    const w = Math.floor((DRAWER_PANEL.w - 68 - gap * (cols - 1)) / cols)
    const h = 168
    return Array.from({ length: count }, (_, i) => ({
        x: x0 + (i % cols) * (w + gap),
        y: y0 + Math.floor(i / cols) * (h + gap),
        w,
        h,
    }))
}

export const BOOT_BAR: Rect = { x: W / 2 - 300, y: 118, w: 600, h: 54 }

export const BOOT_CAPTION_Y = 200

export const VIEW_TAB: Record<View, Rect> = {
    oficina: { x: 500, y: 654, w: 132, h: 56 },
    mesa: { x: 394, y: 654, w: 132, h: 56 },
}

export const FLOW_ROW_H = 62
export const FLOW_ROW_GAP = 24

export const FLOW_PANEL: Rect & { r: number } = {
    x: W / 2 - 350, y: 92, w: 700, h: 540, r: 30,
}

export const FLOW_LIST: Rect = {
    x: FLOW_PANEL.x + 28,
    y: FLOW_PANEL.y + 84,
    w: FLOW_PANEL.w - 56,
    h: 300,
}

export const FLOW_SCROLLBAR: Rect = {
    x: FLOW_LIST.x + FLOW_LIST.w - 12,
    y: FLOW_LIST.y + 6,
    w: 9,
    h: FLOW_LIST.h - 12,
}

export function flowRow(index: number): Rect {
    return {
        x: FLOW_LIST.x + 8,
        y: FLOW_LIST.y + 10 + index * (FLOW_ROW_H + FLOW_ROW_GAP),
        w: FLOW_LIST.w - 34,
        h: FLOW_ROW_H,
    }
}

export const flowContentHeight = (rows: number) =>
    rows * FLOW_ROW_H + Math.max(0, rows - 1) * FLOW_ROW_GAP + 20

export const QUIZ_PANEL: Rect & { r: number } = {
    x: W / 2 - 380, y: 96, w: 760, h: 528, r: 30,
}

export function quizOption(index: number): Rect {
    return {
        x: QUIZ_PANEL.x + 44,
        y: 288 + index * 92,
        w: QUIZ_PANEL.w - 88,
        h: 78,
    }
}

export function classifyGroupRect(index: number, total: number): Rect {
    const gap = 30
    const w = Math.floor((QUIZ_PANEL.w - 88 - gap * (total - 1)) / total)
    return {
        x: QUIZ_PANEL.x + 44 + index * (w + gap),
        y: 300,
        w,
        h: 220,
    }
}

export function classifyCard(index: number): Rect {
    const w = 148
    const gap = 16
    const total = 4
    const x0 = W / 2 - (total * w + (total - 1) * gap) / 2
    return { x: x0 + index * (w + gap), y: 178, w, h: 96 }
}