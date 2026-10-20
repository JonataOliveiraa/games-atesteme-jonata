import type Phaser from 'phaser'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    crop: boolean
}

export const PIECES_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 256, cellH: 256, crop: true }
export const NICO_SHEET: Sheet = { key: 'nico', cols: 4, rows: 2, cellW: 256, cellH: 320, crop: false }
export const BOX_SHEET: Sheet = { key: 'caixa', cols: 2, rows: 1, cellW: 384, cellH: 320, crop: true }
export const UI_SHEET: Sheet = { key: 'ui', cols: 2, rows: 2, cellW: 256, cellH: 192, crop: true }

export const SHEETS = [PIECES_SHEET, NICO_SHEET, BOX_SHEET, UI_SHEET]

export const ROOM_KEY = 'quarto'
export const TABLE_KEY = 'mesa'
export const IMAGES = [ROOM_KEY, TABLE_KEY]

export const PIECE_CELL = { yellow: 0, blue: 1, green: 2, coral: 3, rampRight: 4, rampLeft: 5, bell: 6, marble: 7 } as const
export const BLOCK_CELLS = [PIECE_CELL.yellow, PIECE_CELL.blue, PIECE_CELL.green, PIECE_CELL.coral]
export const NICO_CELL = { idle: 0, box: 1, place: 2, cheer: 3, oops: 4, read: 5, release: 6, think: 7 } as const
export const BOX_CELL = { closed: 0, open: 1 } as const
export const UI_CELL = { page: 0, slot: 1, buildOn: 2, buildOff: 3 } as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 96

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const width = source.width
        const height = source.height
        const cw = width / sheet.cols
        const ch = height / sheet.rows
        let pixels: Uint8ClampedArray | undefined
        if (sheet.crop) {
            const canvas = document.createElement('canvas')
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d', { willReadFrequently: true })
            if (ctx) {
                ctx.drawImage(source, 0, 0)
                pixels = ctx.getImageData(0, 0, width, height).data
            }
        }
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            if (texture.has(cellKey(i))) continue
            const cx = Math.round((i % sheet.cols) * cw)
            const cy = Math.round(Math.floor(i / sheet.cols) * ch)
            let box = [cx, cy, Math.round(cw), Math.round(ch)]
            if (pixels) {
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
                if (x1 >= 0) box = [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
            }
            texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
    })
}
