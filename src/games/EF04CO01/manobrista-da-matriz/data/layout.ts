import type { Cell } from '../types'

export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    headers: 15,
    controls: 20,
    panel: 22,
    fx: 24,
    banner: 30,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** o asfalto do pátio (coordenadas do mundo, antes do zoom) */
export const YARD = { x: 200, y: 103, w: 881, h: 548 } as const

/**
 * Cada fileira é uma faixa de vagas com a frente aberta para o corredor logo abaixo.
 * À direita das vagas, o asfalto livre leva ao portão.
 */
export const GRID = { x0: 395, y0: 124, spotW: 130, spotH: 96, aisle: 82 }

export const spotRect = (cell: Cell) => ({
    x: GRID.x0 + (cell[1] - 1) * GRID.spotW,
    y: GRID.y0 + (cell[0] - 1) * (GRID.spotH + GRID.aisle),
    w: GRID.spotW,
    h: GRID.spotH,
})
export const spotCenter = (cell: Cell) => {
    const r = spotRect(cell)
    return { x: r.x + r.w / 2, y: r.y + r.h / 2 }
}

/** as placas dos números: linhas à esquerda, colunas no alto */
export const LABEL = { rowX: 352, colY: 100, w: 54, h: 42, font: 26 }

/** a grade fica centrada no asfalto: com 4 colunas ela começa mais à esquerda */
export function setGridCols(cols: number) {
    GRID.x0 = cols >= 4 ? 335 : 395
    LABEL.rowX = GRID.x0 - 43
}

/** o portão, embaixo à direita: o carro entra subindo */
export const GATE = { x: 994, startY: 790, y: 582 } as const

export const CAR = { w: 50, len: 84, wheelbase: 54, r: 24, spine: 28 } as const
export const DRIVE = {
    vmax: 170,
    vrev: 110,
    /** acelera aos poucos (0 → máxima em ≈ 0,75 s) */
    accel: 230,
    /** o pedal do outro sentido freia firme */
    brake: 650,
    /** soltou o pedal: o carro segue deslizando e perde velocidade devagar (≈ 1,3 s) */
    coast: 130,
    /** graus de giro das rodas no fim do volante */
    maxSteer: 35,
    /** quão torto o carro pode estar para valer a vaga (graus) */
    parkAngle: 50,
} as const

/** interface fixa na tela */
export const WHEEL = { x: 150, y: 584, r: 112, hit: 140, max: 135, back: 600 } as const
export const PEDALS = {
    rev: { x: 1040, y: 602, w: 104, h: 158 },
    gas: { x: 1168, y: 590, w: 104, h: 180 },
} as const
export const PARK_BTN = { x: 1104, y: 400, w: 210, h: 96 } as const
export const PANEL = { x: 640, y: 44, w: 520, h: 66 } as const

export type Shot = { x: number; y: number; zoom: number }
export const SHOT = {
    wide: { x: W / 2, y: H / 2, zoom: 1 },
    /** dirigindo, a câmera chega perto e segue o carro */
    follow: 1.5,
    /** quão rápido a câmera alcança o carro (por segundo) */
    chase: 5,
} as const

/** as placas grudam na borda quando a fileira ou a coluna sai da tela (como o cabeçalho de uma planilha) */
export const HEADERS = { left: 36, top: 104, bottom: H - 14, margin: 30 } as const

/** balão estreito do tutorial, à direita da matriz (sobre o asfalto livre) */
export const SIDE = { x: 1010, y: 250, w: 420 } as const

export const BANNER = { x: 640, y: 664, w: 900, h: 96 } as const
