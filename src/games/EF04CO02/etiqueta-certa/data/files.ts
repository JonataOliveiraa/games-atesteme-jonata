import type Phaser from 'phaser'

export const BG = 'bg-patio'

export interface Sheet {
    key: string
    cols: number
    rows: number
    /** tamanho da célula da arte de reserva */
    cellW: number
    cellH: number
}

export const TRACK_SHEET: Sheet = { key: 'trilhos', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const TRAIN_SHEET: Sheet = { key: 'trens', cols: 4, rows: 2, cellW: 320, cellH: 320 }
export const SHED_SHEET: Sheet = { key: 'galpoes', cols: 2, rows: 1, cellW: 400, cellH: 400 }
export const UI_SHEET: Sheet = { key: 'ui', cols: 2, rows: 2, cellW: 640, cellH: 480 }
/** N2/N3: a etiqueta comprida (uma peça só) */
export const STRIP_SHEET: Sheet = { key: 'etiqueta-longa', cols: 1, rows: 1, cellW: 1600, cellH: 230 }
/** N3 */
export const STAMP_SHEET: Sheet = { key: 'carimbo', cols: 2, rows: 2, cellW: 320, cellH: 320 }

export const SHEETS = [TRACK_SHEET, TRAIN_SHEET, SHED_SHEET, UI_SHEET, STRIP_SHEET, STAMP_SHEET]

/** dormente e cabo em pé; o cabo gira pela ponta de baixo */
export const PART = { sleeper: 0, leverBase: 1, leverHandle: 2, signalRed: 3, signalGreen: 4, button: 5, star: 6, steam: 7 } as const

/** locomotivas 0–2 (coral, céu, menta), vagão 3, caixotes 4–7; tudo visto de cima, apontando para a direita */
export const CAR = { loco: 0, colors: 3, wagon: 3, crate: 4, crates: 4 } as const

/** porta na esquerda */
export const SHED = { open: 0, closed: 1 } as const

export const UI = { label: 0, sign: 1, note: 2, plaque: 3 } as const

/** carimbo de mão (em pé, borracha embaixo), marca de tinta, posto visto de cima, botão lilás em branco */
export const STAMP = { tool: 0, mark: 1, booth: 2, button: 3 } as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 128

/** Recorta cada célula na caixa do desenho (alfa > 128), medida aqui mesmo: vale para o PNG e para a arte de reserva. */
export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const width = source.width
        const height = source.height
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(source, 0, 0)
        const pixels = ctx.getImageData(0, 0, width, height).data
        const cw = width / sheet.cols
        const ch = height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            const cx = Math.round((i % sheet.cols) * cw)
            const cy = Math.round(Math.floor(i / sheet.cols) * ch)
            let x0 = Infinity
            let y0 = Infinity
            let x1 = -1
            let y1 = -1
            for (let y = cy; y < cy + Math.round(ch); y++)
                for (let x = cx; x < cx + Math.round(cw); x++) {
                    if (pixels[(y * width + x) * 4 + 3] <= ALPHA) continue
                    if (x < x0) x0 = x
                    if (x > x1) x1 = x
                    if (y < y0) y0 = y
                    if (y > y1) y1 = y
                }
            const box = x1 < 0 ? [cx, cy, Math.round(cw), Math.round(ch)] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
    })
}
