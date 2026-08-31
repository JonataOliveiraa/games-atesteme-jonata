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

const IX = PANEL.x + 16
const IW = PANEL.w - 32

/** Um encaixe antes do laço e um dentro dele. Menos peças, menos dúvida. */
export const MAX_SETUP = 1
export const MAX_BODY = 1

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O PAINEL É O LAÇO DESENHADO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Antes o painel era um bloco de código: "Enquanto...", "REPITA", "A CONDIÇÃO
 * AGORA É...". Três rótulos para explicar uma coisa que a criança de 8 anos
 * nunca viu escrita, e nenhum deles se mexia.
 *
 * Agora ele é um CICLO com duas estações — TESTAR e ANDAR — ligadas por uma
 * seta que volta. Uma luz percorre esse caminho junto com o robô: para na
 * estação de testar quando é hora de responder, desce para a de andar quando
 * ele anda, e sobe de novo. O "enquanto" deixa de ser palavra e vira o
 * movimento que a criança vê.
 */
export interface LoopCycle {
    /** Estação do teste (a condição). */
    testar: Rect
    /** Estação da ação repetida. */
    andar: Rect
    /** Coluna por onde a seta de retorno sobe. */
    loopX: number
}

export interface ProgramLayout {
    setupLabelY: number
    setupSlots: Rect[]
    whileBlock: Rect
    cycle: LoopCycle
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

/**
 * As estações moram à direita do painel; a coluna da esquerda é a passagem da
 * seta de retorno. Sem essa faixa livre a volta do laço não teria por onde
 * ser desenhada, e é ela que faz o desenho parecer um ciclo.
 */
function cycleGroup(top: number, testarH: number, andarH: number) {
    const stationX = IX + 54
    const stationW = IW - 54
    const testar: Rect = { x: stationX, y: top, w: stationW, h: testarH }
    const andar: Rect = { x: stationX, y: top + testarH + 54, w: stationW, h: andarH }

    return {
        whileBlock: {
            x: IX, y: top - 14,
            w: IW, h: testarH + andarH + 54 + 28,
        } as Rect,
        cycle: { testar, andar, loopX: IX + 26 } as LoopCycle,
        chip: testar,
        bodyLabelY: 0,
        bodySlots: [andar] as Rect[],
    }
}

/**
 * O painel vai de `PANEL.y` a `PANEL.y + PANEL.h` — 92 a 696 — e NADA pode
 * passar disso. O modo de montar programa estourava: os botões terminavam em
 * 724, fora do painel e fora da tela (que tem 720), e o rótulo PEÇAS caía em
 * cima da borda do laço. Os números abaixo somam de cima para baixo com folga
 * no fim; mexer num deles é mexer nos de baixo.
 */
export function programLayout(mode: ChallengeMode): ProgramLayout {
    if (mode === 'montar-programa') {
        return {
            setupLabelY: 126,
            setupSlots: [{ x: IX, y: 140, w: IW, h: 52 }],
            ...cycleGroup(216, 84, 62),
            trayLabelY: 452,
            trayLabel: 'PEÇAS',
            traySlots: [
                { x: IX, y: 468, w: IW, h: 46 },
                { x: IX, y: 520, w: IW, h: 46 },
                { x: IX, y: 572, w: IW, h: 46 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 632, w: 268, h: 50 },
            btnReset: { x: IX + 286, y: 632, w: 142, h: 50 },
        }
    }

    if (mode === 'escolher-condicao') {
        return {
            setupLabelY: 0,
            setupSlots: [],
            ...cycleGroup(132, 116, 92),
            trayLabelY: 424,
            trayLabel: 'QUAL CONDIÇÃO?',
            traySlots: [
                { x: IX, y: 442, w: IW, h: 56 },
                { x: IX, y: 504, w: IW, h: 56 },
                { x: IX, y: 566, w: IW, h: 56 },
            ],
            vfButtons: [],
            btnRun: { x: IX, y: 636, w: IW, h: 48 },
            btnReset: null,
        }
    }

    // prever-condicao — os dois botões grandes são a resposta, e ocupam a base.
    return {
        setupLabelY: 0,
        setupSlots: [],
        ...cycleGroup(132, 122, 96),
        trayLabelY: 0,
        trayLabel: '',
        traySlots: [],
        vfButtons: [
            { x: IX, y: 442, w: IW, h: 116 },
            { x: IX, y: 570, w: IW, h: 116 },
        ],
        btnRun: null,
        btnReset: null,
    }
}

/**
 * A BÚSSOLA DO ROBÔ — só no nível 3.
 *
 * Nos níveis 1 e 2 o programa nunca vira: a direção não muda e uma seta ali
 * seria enfeite. No nível 3 a criança monta a curva, e aí saber para onde o
 * robô está olhando é metade do problema. A seta sai de cima do robô, onde
 * ficava grudada e atrapalhando, e ganha um painel próprio acima do tabuleiro.
 */
export const COMPASS = { w: 232, h: 84, r: 22 }

export const needsCompass = (mode: ChallengeMode) => mode === 'montar-programa'

// Tabuleiro (coluna direita)
export const BOARD_AREA = {
    left: PANEL.x + PANEL.w + 16,
    right: W - 16,
    top: UI_BAR_H + 16,
    bottom: H - 24,
}

/**
 * A casa cresce até encher o espaço que sobra. Um número fixo deixava o
 * tabuleiro pequeno num canto, com fundo vazio em volta — e o robô, que é a
 * coisa que a criança tem que olhar, minúsculo.
 */
const boardTop = (ch: MazeChallenge) =>
    BOARD_AREA.top + (needsCompass(ch.mode) ? COMPASS.h + 20 : 0)

export function tileFor(ch: MazeChallenge) {
    const byWidth = (BOARD_AREA.right - BOARD_AREA.left - 40) / ch.width
    const byHeight = (BOARD_AREA.bottom - boardTop(ch) - 40) / ch.height
    return Math.floor(Math.min(byWidth, byHeight, 150))
}

/** O painel da bússola, centralizado na faixa reservada acima do tabuleiro. */
export function compassRect(ch: MazeChallenge): Rect {
    const centerX = (BOARD_AREA.left + BOARD_AREA.right) / 2
    return {
        x: centerX - COMPASS.w / 2,
        y: BOARD_AREA.top + 4,
        w: COMPASS.w,
        h: COMPASS.h,
    }
}

export function boardOrigin(ch: MazeChallenge) {
    const tile = tileFor(ch)
    const boardW = ch.width * tile
    const boardH = ch.height * tile
    const centerX = (BOARD_AREA.left + BOARD_AREA.right) / 2
    const centerY = (boardTop(ch) + BOARD_AREA.bottom) / 2
    return {
        /** Centro da célula (0,0). */
        x: centerX - boardW / 2 + tile / 2,
        y: centerY - boardH / 2 + tile / 2,
        boardW,
        boardH,
        tile,
    }
}

export function cellCenter(ch: MazeChallenge, c: number, r: number) {
    const o = boardOrigin(ch)
    return { x: o.x + c * o.tile, y: o.y + r * o.tile }
}
