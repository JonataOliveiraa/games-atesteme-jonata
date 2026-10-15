import type Phaser from 'phaser'
import type { Color, Shape, Top } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export interface SheetData {
    maxW?: number
    maxH?: number
}

export const ROUND_SHEET: Sheet = { key: 'doces-redondos', cols: 3, rows: 3, cellW: 256, cellH: 256 }
export const SQUARE_SHEET: Sheet = { key: 'doces-quadrados', cols: 3, rows: 3, cellW: 256, cellH: 256 }
export const MEL_SHEET: Sheet = { key: 'mel', cols: 4, rows: 2, cellW: 256, cellH: 320 }

export const SHEETS = [ROUND_SHEET, SQUARE_SHEET, MEL_SHEET]

export const RIVER_KEY = 'rio'
export const NEAR_KEY = 'margem-partida'
export const FAR_KEY = 'margem-chegada'
export const IMAGES = [NEAR_KEY, FAR_KEY]

export const MEL_CELL = { idle: 0, crouch: 1, air: 2, land: 3, cheer: 4, oops: 5, sunk: 6, toe: 7 } as const

const COLOR_ROW: Record<Color, number> = { rosa: 0, verde: 1, marrom: 2 }
const TOP_COL: Record<Top, number> = { granulado: 0, listrado: 1, liso: 2 }

export const sweetSheet = (shape: Shape) => (shape === 'redondo' ? ROUND_SHEET : SQUARE_SHEET)
export const sweetCell = (color: Color, top: Top) => COLOR_ROW[color] * 3 + TOP_COL[top]

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
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(source, 0, 0)
        const pixels = ctx.getImageData(0, 0, width, height).data
        let maxW = 0
        let maxH = 0
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
            maxW = Math.max(maxW, box[2])
            maxH = Math.max(maxH, box[3])
        }
        Object.assign(texture.customData as SheetData, { maxW, maxH })
    })
}

export const sheetData = (scene: Phaser.Scene, sheet: Sheet) =>
    scene.textures.get(sheet.key).customData as SheetData
