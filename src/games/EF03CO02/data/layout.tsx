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

/** Centro de um retângulo - as cenas trabalham com origem no meio. */
export const cx = (r: Rect) => r.x + r.w / 2
export const cy = (r: Rect) => r.y + r.h / 2

// Painel do programa (coluna esquerda)
export const PANEL: Rect & { r: number } = {
    x: 20, y: UI_BAR_H + 16, w: 460, h: 604, r: 20,
}

export const PANEL_TITLE_Y = PANEL.y + 26

const IX = PANEL.x + 16
const IW = PANEL.w - 32

/** Um encaixe antes do laço e um dentro dele. Menos peças, menos dúvida. */
export const MAX_SETUP = 1
export const MAX_BODY = 1

/**
 * O painel muda conforme o modo do desafio: cada nível vê só as peças que
 * precisa usar. Nível 1 não tem executar, nível 2 não tem "antes do laço".
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
function whileGroup(top: number, height = 210) {
    return {
        whileBlock: { x: IX, y: top, w: IW, h: height } as Rect,
        chip: { x: IX + 12, y: top + 14, w: IW - 24, h: 72 } as Rect,
        bodyLabelY: top + 106,
        bodySlots: [{ x: IX + 24, y: top + 122, w: IW - 48, h: 66 }] as Rect[],
    }
}

export function programLayout(mode: ChallengeMode): ProgramLayout {
    if (mode === 'montar-programa') {
        return {
            setupLabelY: 190,
            setupSlots: [{ x: IX, y: 204, w: IW, h: 52 }],
            ...whileGroup(266, 188),
            trayLabelY: 462,
            trayLabel: 'PEÇAS PARA TOCAR',
            traySlots: [
                { x: IX, y: 478, w: IW, h: 50 },
                { x: IX, y: 536, w: IW, h: 50 },
                { x: IX, y: 594, w: IW, h: 50 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 650, w: 270, h: 46 },
            btnReset: { x: IX + 288, y: 650, w: 140, h: 46 },
        }
    }

    if (mode === 'escolher-condicao') {
        return {
            setupLabelY: 0,
            setupSlots: [],
            ...whileGroup(196),
            trayLabelY: 416,
            trayLabel: 'ESCOLHA A CONDIÇÃO',
            traySlots: [
                { x: IX, y: 432, w: IW, h: 58 },
                { x: IX, y: 502, w: IW, h: 58 },
                { x: IX, y: 572, w: IW, h: 58 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 642, w: IW, h: 50 },
            btnReset: null,
        }
    }

    // prever-condicao - os dois botões grandes ocupam a bandeja inteira.
    return {
        setupLabelY: 0,
        setupSlots: [],
        ...whileGroup(196),
        trayLabelY: 416,
        trayLabel: 'A CONDIÇÃO AGORA É...',
        traySlots: [],
        vfButtons: [
            { x: IX, y: 432, w: IW, h: 104 },
            { x: IX, y: 550, w: IW, h: 104 },
        ],
        btnRun: null,
        btnReset: null,
    }
}

// Tabuleiro (coluna direita)
export const BOARD_AREA = {
    left: PANEL.x + PANEL.w + 16,
    right: W - 16,
    top: UI_BAR_H + 16,
    bottom: H - 24,
}

/** Maior tabuleiro do jogo é 7x5; 104px deixa o robô e a casa testada mais legíveis. */
export const TILE = 104

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
