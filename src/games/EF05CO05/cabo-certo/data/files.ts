import type Phaser from 'phaser'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const DEVICE_SHEET: Sheet = { key: 'aparelhos', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const PIECE_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 1, cellW: 128, cellH: 128 }

export const SHEETS = [DEVICE_SHEET, PIECE_SHEET]

export const PC_KEY = 'computador'
export const FLOOR_KEY = 'chao'
export const IMAGES = [PC_KEY, FLOOR_KEY]

export const PIECE_CELL = { plug: 0, entrada: 1, saida: 2, armazenamento: 3 } as const

export const cellKey = (index: number) => `c${index}`

/** Fatia as folhas em células iguais. A arte de reserva e o PNG usam a mesma grade. */
export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const cw = source.width / sheet.cols
        const ch = source.height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            const x = Math.round((i % sheet.cols) * cw)
            const y = Math.round(Math.floor(i / sheet.cols) * ch)
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
        }
    })
}
