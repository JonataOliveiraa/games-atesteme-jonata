import type { CityChallenge, ChallengeMode } from '../types'

export const DEPTH = {
    fundo: 0,
    veu: 1,
    tabuleiro: 5,
    rastro: 6,
    props: 10,
    sombra: 12,
    jogador: 13,
    chuva: 20,
    veuChuva: 21,
    mochila: 40,
    balao: 50,
    faisca: 55,
    painel: 100,
    script: 101,
    scrollbar: 103,
    flash: 104,
    banner: 150,
    toast: 160,
    overlay: 300,
    modal: 301,
    botaoModal: 310,
}

export const W = 1280
export const H = 720

export const UI_BAR_H = 76

export interface Rect { x: number; y: number; w: number; h: number }

export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

export const BOARD_AREA = { left: 16, right: 706, top: 96, bottom: 712 }

/** Faixa reservada ABAIXO do tabuleiro para o rótulo do objetivo. */
export const LABEL_BAND = 48

const AREA_W = BOARD_AREA.right - BOARD_AREA.left
const AREA_H = BOARD_AREA.bottom - BOARD_AREA.top - LABEL_BAND

export const BOARD_CX = (BOARD_AREA.left + BOARD_AREA.right) / 2

export const tileSize = (ch: CityChallenge) =>
    Math.floor(Math.min(AREA_W / ch.width, AREA_H / ch.height, 124))

export function boardOrigin(ch: CityChallenge) {
    const t = tileSize(ch)
    const boardW = t * ch.width
    const boardH = t * ch.height
    return {
        tile: t,
        boardW,
        boardH,
        x: BOARD_AREA.left + (AREA_W - boardW) / 2 + t / 2,
        y: BOARD_AREA.top + (AREA_H - boardH) / 2 + t / 2,
    }
}

export function boardBottom(ch: CityChallenge) {
    const o = boardOrigin(ch)
    return o.y - o.tile / 2 + o.boardH
}

export function boardTop(ch: CityChallenge) {
    const o = boardOrigin(ch)
    return o.y - o.tile / 2
}

export function cellCenter(ch: CityChallenge, c: number, r: number) {
    const o = boardOrigin(ch)
    return { x: o.x + c * o.tile, y: o.y + r * o.tile }
}

export const PROP_SCALE: Record<string, number> = {
    escola: 1.2,
    mercado: 1.2,
    padaria: 1.2,
    biblioteca: 1.2,
    semaforo: 1.05,
    porta: 0.9,
    pedra: 0.78,
    item: 0.6,
}

export const PANEL: Rect & { r: number } = { x: 720, y: 86, w: 544, h: 620, r: 26 }
export const PANEL_TITLE_Y = 116
export const SCRIPT: Rect = { x: 736, y: 140, w: 512, h: 300 }
export const ROW_H = 52
export const ROW_GAP = 7
export const INDENT = 28

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

export const TRAY_LABEL_Y = 462

export function trayGrid(count: number): Rect[] {
    const cols = count > 4 ? 3 : 2
    const gap = 10
    const x0 = SCRIPT.x
    const y0 = 478
    const w = Math.floor((SCRIPT.w - gap * (cols - 1)) / cols)
    const h = count > 4 ? 62 : 70
    return Array.from({ length: count }, (_, i) => ({
        x: x0 + (i % cols) * (w + gap),
        y: y0 + Math.floor(i / cols) * (h + gap),
        w,
        h,
    }))
}

export const BTN_RUN: Rect = { x: 736, y: 634, w: 314, h: 62 }
export const BTN_RESET: Rect = { x: 1064, y: 634, w: 184, h: 62 }

export const VF_BUTTONS: [Rect, Rect] = [
    { x: 736, y: 478, w: 250, h: 148 },
    { x: 998, y: 478, w: 250, h: 148 },
]

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