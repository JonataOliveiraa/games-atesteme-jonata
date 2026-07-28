import type { CityChallenge, ChallengeMode } from '../types'

export const W = 1280
export const H = 720

export const UI_BAR_H = 76

export interface Rect { x: number; y: number; w: number; h: number }

export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

// ── Tabuleiro (esquerda) ──────────────────────────────────────────────────

export const BOARD_AREA = { left: 20, right: 700, top: 92, bottom: 700 }

const AREA_W = BOARD_AREA.right - BOARD_AREA.left
const AREA_H = BOARD_AREA.bottom - BOARD_AREA.top

export const BOARD_CX = (BOARD_AREA.left + BOARD_AREA.right) / 2

export const tileSize = (ch: CityChallenge) =>
    Math.floor(Math.min(AREA_W / ch.width, (AREA_H - 46) / ch.height, 116))

export function boardOrigin(ch: CityChallenge) {
    const t = tileSize(ch)
    const boardW = t * ch.width
    const boardH = t * ch.height
    return {
        tile: t,
        boardW,
        boardH,
        x: BOARD_AREA.left + (AREA_W - boardW) / 2 + t / 2,
        y: BOARD_AREA.top + 46 + (AREA_H - 46 - boardH) / 2 + t / 2,
    }
}

export function cellCenter(ch: CityChallenge, c: number, r: number) {
    const o = boardOrigin(ch)
    return { x: o.x + c * o.tile, y: o.y + r * o.tile }
}

export const PROP_SCALE: Record<string, number> = {
    escola: 1.45,
    mercado: 1.45,
    padaria: 1.45,
    biblioteca: 1.45,
    semaforo: 1.15,
    porta: 0.86,
    pedra: 0.72,
    item: 0.56,
}

// ── Painel do programa (direita) ──────────────────────────────────────────

export const PANEL: Rect & { r: number } = { x: 716, y: 88, w: 548, h: 616, r: 26 }

export const PANEL_TITLE_Y = 116

export const SCRIPT: Rect = { x: 732, y: 138, w: 516, h: 302 }

export const ROW_H = 46
export const ROW_GAP = 6
export const INDENT = 26

export const SCROLLBAR_W = 10

export const SCROLLBAR: Rect = {
    x: SCRIPT.x + SCRIPT.w - SCROLLBAR_W - 8,
    y: SCRIPT.y + 10,
    w: SCROLLBAR_W,
    h: SCRIPT.h - 20,
}

export function rowRect(index: number, depth = 0): Rect {
    return {
        x: SCRIPT.x + 12 + depth * INDENT,
        y: SCRIPT.y + 10 + index * (ROW_H + ROW_GAP),
        w: SCRIPT.w - 38 - SCROLLBAR_W - depth * INDENT,
        h: ROW_H,
    }
}

export const scriptContentHeight = (rows: number) =>
    rows * (ROW_H + ROW_GAP) + 20

// ── Bandeja e controles ───────────────────────────────────────────────────

export const TRAY_LABEL_Y = 460

export function trayGrid(count: number): Rect[] {
    const cols = count > 4 ? 3 : 2
    const gap = 10
    const x0 = SCRIPT.x
    const y0 = 476
    const w = Math.floor((SCRIPT.w - gap * (cols - 1)) / cols)
    const h = 60
    return Array.from({ length: count }, (_, i) => ({
        x: x0 + (i % cols) * (w + gap),
        y: y0 + Math.floor(i / cols) * (h + gap),
        w,
        h,
    }))
}

export const BTN_RUN: Rect = { x: 732, y: 630, w: 318, h: 58 }
export const BTN_RESET: Rect = { x: 1064, y: 630, w: 184, h: 58 }

export const VF_BUTTONS: [Rect, Rect] = [
    { x: 732, y: 476, w: 252, h: 138 },
    { x: 996, y: 476, w: 252, h: 138 },
]

// ── Layout resolvido por modo ─────────────────────────────────────────────

export interface ProgramLayout {
    script: Rect
    trayLabel: string
    traySlots: Rect[]
    vfButtons: [Rect, Rect]
    btnRun?: Rect
    btnReset?: Rect
}

export function programLayout(mode: ChallengeMode, trayCount = 4): ProgramLayout {
    if (mode === 'prever-decisao') {
        return {
            script: SCRIPT,
            trayLabel: 'O PROGRAMA RODA SOZINHO — RESPONDA AO SE',
            traySlots: [],
            vfButtons: VF_BUTTONS,
        }
    }

    return {
        script: SCRIPT,
        trayLabel: mode === 'escolher-condicao' ? 'ESCOLHA A CONDIÇÃO' : 'PEÇAS DISPONÍVEIS',
        traySlots: trayGrid(trayCount),
        vfButtons: VF_BUTTONS,
        btnRun: BTN_RUN,
        btnReset: BTN_RESET,
    }
}