import type { MazeChallenge } from '../types'

export const W = 1280
export const H = 720

/** Altura da barra da UIScene. A GameScene não desenha nada acima disso. */
export const UI_BAR_H = 76

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

/** Centro de um retângulo — as cenas trabalham com origem no meio. */
export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

// ── Painel do programa (coluna esquerda) ──────────────────────────────────
export const PANEL: Rect & { r: number } = {
    x: 20, y: UI_BAR_H + 16, w: 380, h: 604, r: 20,
}

const INNER_X = PANEL.x + 12   // 32
const INNER_W = PANEL.w - 24   // 356

export const PANEL_TITLE_Y = PANEL.y + 24

/** "Antes do laço": até duas ações que rodam uma vez só. */
export const SETUP_LABEL_Y = 142
export const MAX_SETUP = 2
export const SETUP_SLOTS: Rect[] = [
    { x: INNER_X, y: 156, w: 172, h: 52 },
    { x: INNER_X + 184, y: 156, w: 172, h: 52 },
]

/** Bloco ENQUANTO: pastilha da condição no topo, corpo embaixo. */
export const WHILE_BLOCK: Rect = { x: INNER_X, y: 222, w: INNER_W, h: 196 }
export const CHIP: Rect = { x: INNER_X + 10, y: 232, w: INNER_W - 20, h: 58 }

export const BODY_LABEL_Y = 302
export const MAX_BODY = 2
export const BODY_SLOTS: Rect[] = [
    { x: INNER_X + 22, y: 314, w: INNER_W - 44, h: 46 },
    { x: INNER_X + 22, y: 366, w: INNER_W - 44, h: 46 },
]

/** Bandeja de peças. Conteúdo muda por modo: botões V/F, condições ou ações. */
export const TRAY_LABEL_Y = 434
export const TRAY_SLOTS: Rect[] = [
    { x: INNER_X, y: 450, w: INNER_W, h: 56 },
    { x: INNER_X, y: 512, w: INNER_W, h: 56 },
    { x: INNER_X, y: 574, w: INNER_W, h: 56 },
]

/** Os dois botões grandes do nível 1 ocupam a bandeja inteira. */
export const VF_BUTTONS: Rect[] = [
    { x: INNER_X, y: 456, w: INNER_W, h: 78 },
    { x: INNER_X, y: 546, w: INNER_W, h: 78 },
]

export const BTN_RUN: Rect = { x: INNER_X, y: 640, w: 224, h: 50 }
export const BTN_RESET: Rect = { x: INNER_X + 236, y: 640, w: 120, h: 50 }

// ── Tabuleiro (coluna direita) ────────────────────────────────────────────
export const BOARD_AREA = {
    left: PANEL.x + PANEL.w + 16,   // 416
    right: W - 16,                  // 1264
    top: UI_BAR_H + 16,             // 92
    bottom: H - 24,                 // 696
}

/** Maior tabuleiro do jogo é 9x6; 92px cabe com folga nos dois eixos. */
export const TILE = 92

export function boardOrigin(ch: MazeChallenge) {
    const boardW = ch.width * TILE
    const boardH = ch.height * TILE
    const centerX = (BOARD_AREA.left + BOARD_AREA.right) / 2
    const centerY = (BOARD_AREA.top + BOARD_AREA.bottom) / 2
    return {
        /** Centro da célula (0,0). */
        x: centerX - boardW / 2 + TILE / 2,
        y: centerY - boardH / 2 + TILE / 2,
        boardW,
        boardH,
    }
}

export function cellCenter(ch: MazeChallenge, c: number, r: number) {
    const o = boardOrigin(ch)
    return { x: o.x + c * TILE, y: o.y + r * TILE }
}