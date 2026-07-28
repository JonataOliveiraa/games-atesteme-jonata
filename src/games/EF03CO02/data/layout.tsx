import type { ChallengeMode, MazeChallenge } from '../types'

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

export const PANEL_TITLE_Y = PANEL.y + 26

const IX = PANEL.x + 12   // 32
const IW = PANEL.w - 24   // 356

/** Um encaixe antes do laço e um dentro dele. Menos peças, menos dúvida. */
export const MAX_SETUP = 1
export const MAX_BODY = 1

/**
 * O painel muda conforme o modo do desafio: cada nível vê só as peças que
 * precisa usar. Nível 1 não tem botões, nível 2 não tem "antes do laço".
 */
export interface ProgramLayout {
    setupLabelY: number
    setupSlots: Rect[]
    whileBlock: Rect
    chip: Rect
    bodyLabelY: number
    bodySlots: Rect[]
    trayLabelY: number
    trayLabel: string
    traySlots: Rect[]
    vfButtons: Rect[]
    btnRun: Rect | null
    btnReset: Rect | null
}

/** Bloco ENQUANTO: pastilha da condição no topo, corpo logo abaixo. */
function whileGroup(top: number) {
    return {
        whileBlock: { x: IX, y: top, w: IW, h: 196 } as Rect,
        chip: { x: IX + 10, y: top + 12, w: IW - 20, h: 62 } as Rect,
        bodyLabelY: top + 96,
        bodySlots: [{ x: IX + 22, y: top + 110, w: IW - 44, h: 58 }] as Rect[],
    }
}

export function programLayout(mode: ChallengeMode): ProgramLayout {
    if (mode === 'montar-programa') {
        return {
            setupLabelY: 142,
            setupSlots: [{ x: IX, y: 152, w: IW, h: 50 }],
            ...whileGroup(216),
            trayLabelY: 428,
            trayLabel: 'PEÇAS',
            traySlots: [
                { x: IX, y: 442, w: IW, h: 52 },
                { x: IX, y: 500, w: IW, h: 52 },
                { x: IX, y: 558, w: IW, h: 52 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 626, w: 224, h: 50 },
            btnReset: { x: IX + 236, y: 626, w: 120, h: 50 },
        }
    }

    if (mode === 'escolher-condicao') {
        return {
            setupLabelY: 0,
            setupSlots: [],
            ...whileGroup(150),
            trayLabelY: 384,
            trayLabel: 'ESCOLHA A CONDIÇÃO',
            traySlots: [
                { x: IX, y: 400, w: IW, h: 62 },
                { x: IX, y: 468, w: IW, h: 62 },
                { x: IX, y: 536, w: IW, h: 62 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 620, w: IW, h: 54 },
            btnReset: null,
        }
    }

    // prever-condicao — os dois botões grandes ocupam a bandeja inteira
    return {
        setupLabelY: 0,
        setupSlots: [],
        ...whileGroup(150),
        trayLabelY: 384,
        trayLabel: 'A CONDIÇÃO AGORA É...',
        traySlots: [],
        vfButtons: [
            { x: IX, y: 400, w: IW, h: 100 },
            { x: IX, y: 516, w: IW, h: 100 },
        ],
        btnRun: null,
        btnReset: null,
    }
}

// ── Tabuleiro (coluna direita) ────────────────────────────────────────────
export const BOARD_AREA = {
    left: PANEL.x + PANEL.w + 16,   // 416
    right: W - 16,                  // 1264
    top: UI_BAR_H + 16,             // 92
    bottom: H - 24,                 // 696
}

/** Maior tabuleiro do jogo agora é 7x5; 92px cabe com folga nos dois eixos. */
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