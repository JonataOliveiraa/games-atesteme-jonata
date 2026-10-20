import type Phaser from 'phaser'
import type { Expr, Pose } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    trim: boolean
}

export const OWNER_SHEET: Sheet = { key: 'donos', cols: 6, rows: 4, cellW: 256, cellH: 256, trim: false }
export const DUDA_SHEET: Sheet = { key: 'duda', cols: 4, rows: 1, cellW: 320, cellH: 400, trim: false }
export const COVER_SHEET: Sheet = { key: 'capas', cols: 4, rows: 2, cellW: 256, cellH: 256, trim: false }
export const UI_SHEET: Sheet = { key: 'ui', cols: 4, rows: 2, cellW: 256, cellH: 256, trim: true }
export const OWNER2_SHEET: Sheet = { key: 'donos2', cols: 6, rows: 4, cellW: 256, cellH: 256, trim: false }
export const COVER2_SHEET: Sheet = { key: 'capas2', cols: 4, rows: 3, cellW: 256, cellH: 256, trim: false }
export const UI2_SHEET: Sheet = { key: 'ui2', cols: 4, rows: 2, cellW: 256, cellH: 256, trim: true }

export const SHEETS = [OWNER_SHEET, DUDA_SHEET, COVER_SHEET, UI_SHEET, OWNER2_SHEET, COVER2_SHEET, UI2_SHEET]

export const STAGE_KEY = 'palco'
export const IMAGES = [STAGE_KEY]

export const UI_CELL = { note: 0, spark: 1, paper: 2, case: 3, disc: 4, heart: 5, live: 6, star: 7 } as const
export const UI2_CELL = { kick: 0, snare: 1, clap: 2, cymbal: 3, unknown: 4 } as const

export const POSE_CELL: Record<Pose, number> = { talk: 0, sing: 1, startled: 2, cheer: 3 }
export const EXPR_CELL: Record<Expr, number> = { listen: 0, happy: 1, upset: 2 }

export const cellKey = (index: number) => `c${index}`

const COVERS = COVER_SHEET.cols * COVER_SHEET.rows
const OWNER_CELLS = OWNER_SHEET.cols * OWNER_SHEET.rows

export function coverFrame(n: number): { key: string; frame: string } {
    if (n < COVERS) return { key: COVER_SHEET.key, frame: cellKey(n) }
    return { key: COVER2_SHEET.key, frame: cellKey(n - COVERS) }
}

export function ownerFrame(cell: number): { key: string; frame: string } {
    if (cell < OWNER_CELLS) return { key: OWNER_SHEET.key, frame: cellKey(cell) }
    return { key: OWNER2_SHEET.key, frame: cellKey(cell - OWNER_CELLS) }
}

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
        if (sheet.trim) {
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
            const cellW = Math.round(cw)
            const cellH = Math.round(ch)
            let box = [cx, cy, cellW, cellH]
            if (pixels) {
                let x0 = Infinity
                let y0 = Infinity
                let x1 = -1
                let y1 = -1
                for (let y = cy; y < cy + cellH; y++)
                    for (let x = cx; x < cx + cellW; x++) {
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
