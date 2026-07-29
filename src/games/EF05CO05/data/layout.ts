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

export function viewPlacement(texW: number, texH: number, view: View): Placement {
    const f = VIEW_FOCUS[view]
    const fw = f.w || texW
    const fh = f.h || texH

    const scale = Math.min(VIEW_AREA.w / fw, VIEW_AREA.h / fh)

    return {
        x: VIEW_AREA.x + (VIEW_AREA.w - fw * scale) / 2 - f.x * scale,
        y: VIEW_AREA.y + (VIEW_AREA.h - fh * scale) / 2 - f.y * scale,
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
    oficina: { x: 258, y: 654, w: 132, h: 56 },
    mesa: { x: 394, y: 654, w: 132, h: 56 },
}

export const FLOW_ROW_H = 62
export const FLOW_ROW_GAP = 26
export const FLOW_TOP = 92
export const FLOW_FOOTER = 132

export function flowPanel(rows: number): Rect & { r: number } {
    const body = rows * FLOW_ROW_H + Math.max(0, rows - 1) * FLOW_ROW_GAP
    const h = FLOW_TOP + body + FLOW_FOOTER
    return { x: W / 2 - 340, y: (H - h) / 2, w: 680, h, r: 30 }
}

export function flowRow(index: number, panel: Rect): Rect {
    return {
        x: panel.x + 30,
        y: panel.y + FLOW_TOP + index * (FLOW_ROW_H + FLOW_ROW_GAP),
        w: panel.w - 60,
        h: FLOW_ROW_H,
    }
}