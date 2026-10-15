import type Phaser from 'phaser'

export const BG = 'bg-patio'

export interface Sheet {
    key: string
    cols: number
    rows: number
    /** tamanho da célula da arte de reserva */
    cellW: number
    cellH: number
    /** células que dão a altura de referência da folha (a maior delas) */
    ref: number[]
}

export const CAR_SHEET: Sheet = { key: 'carros', cols: 3, rows: 2, cellW: 256, cellH: 256, ref: [0] }
export const CONTROL_SHEET: Sheet = { key: 'controles', cols: 3, rows: 2, cellW: 320, cellH: 320, ref: [0] }
export const PIECES_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 256, cellH: 256, ref: [0] }

export const SHEETS = [CAR_SHEET, CONTROL_SHEET, PIECES_SHEET]

export const CAR_COLORS = 6

export const CONTROL = { wheel: 0, gas: 1, rev: 2, park: 3, gasDown: 4, revDown: 5 } as const

export const PIECE = {
    cone: 0,
    ticket: 1,
    puff: 2,
    star: 3,
    honk: 4,
    light: 5,
    driver: 6,
    arrow: 7,
} as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 128

/**
 * Recorta cada célula na caixa do desenho (alfa > 128), medida aqui mesmo: vale
 * para o PNG e para a arte de reserva. A altura de referência da folha fica no
 * `customData.ref`, para figuras da mesma folha manterem a proporção entre si.
 */
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
        const heights: number[] = []
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
            heights[i] = box[3]
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
        ;(texture.customData as { ref?: number }).ref = Math.max(...sheet.ref.map(i => heights[i]))
    })
}
