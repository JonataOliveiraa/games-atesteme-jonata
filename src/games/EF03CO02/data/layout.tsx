import type { MazeChallenge } from '../types'

export const W = 1280
export const H = 720

export const UI_BAR_H = 76

export const PANEL = {
    x: 20,
    y: UI_BAR_H + 16,      // 92
    w: 380,
    h: 604,
    r: 20,
}


export const PANEL_HEADER_H = 40

export const PROGRAM = {
    top: PANEL.y + PANEL_HEADER_H + 4,
    setupH: 60,
    whileHeaderH: 56,
    slotH: 52,
    slotGap: 6,
    maxBody: 3,
}

export const SETUP = {
    top: PROGRAM.top,
    slotH: 44,
}

export const WHILE_BLOCK = {
    top: PROGRAM.top + PROGRAM.setupH + 16,
    headerH: 96,
    slotH: PROGRAM.slotH,
    slotGap: PROGRAM.slotGap,
    maxBody: PROGRAM.maxBody,
}

export const TRAY = {
    top: 436,
    slotH: 58,
    gap: 8,
    count: 3,
}

export const CONTROLS = {
    y: 664,
    h: 52,
}

export const BOARD_AREA = {
    left: PANEL.x + PANEL.w + 16,        // 416
    right: W - 16,                       // 1264
    top: UI_BAR_H + 16,                  // 92
    bottom: H - 24,                      // 696
}

/** Maior tabuleiro do jogo é 9x6; 92px cabe com folga nos dois eixos. */
export const TILE = 92

export function boardOrigin(ch: MazeChallenge) {
    const boardW = ch.width * TILE
    const boardH = ch.height * TILE
    const cx = (BOARD_AREA.left + BOARD_AREA.right) / 2
    const cy = (BOARD_AREA.top + BOARD_AREA.bottom) / 2
    return {
        /** Centro da célula (0,0). */
        x: cx - boardW / 2 + TILE / 2,
        y: cy - boardH / 2 + TILE / 2,
        boardW,
        boardH,
    }
}

export function cellCenter(ch: MazeChallenge, c: number, r: number) {
    const o = boardOrigin(ch)
    return { x: o.x + c * TILE, y: o.y + r * TILE }
}