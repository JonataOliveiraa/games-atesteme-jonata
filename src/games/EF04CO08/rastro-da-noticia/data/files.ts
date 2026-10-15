import type Phaser from 'phaser'
import type { HeroPose, LiaPose } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    ref: number[]
    pin?: boolean
}

export interface FigureData {
    px?: number
    ox: number
    oy: number
    cellW: number
    cellH: number
}

export const HERO_SHEET: Sheet = { key: 'detetive', cols: 4, rows: 2, cellW: 320, cellH: 400, ref: [0], pin: true }
export const LIA_SHEET: Sheet = { key: 'lia', cols: 4, rows: 2, cellW: 320, cellH: 400, ref: [0], pin: true }
export const FACADE_SHEET: Sheet = { key: 'predios', cols: 3, rows: 2, cellW: 480, cellH: 520, ref: [0] }
export const LOGO_SHEET: Sheet = { key: 'logos', cols: 4, rows: 2, cellW: 160, cellH: 160, ref: [0] }
export const UI_SHEET: Sheet = { key: 'ui', cols: 4, rows: 2, cellW: 320, cellH: 320, ref: [0] }

export const SHEETS = [HERO_SHEET, LIA_SHEET, FACADE_SHEET, LOGO_SHEET, UI_SHEET]

export const STREET_KEY = 'rua'
export const PATIO_KEY = 'patio'
export const IMAGES = [STREET_KEY, PATIO_KEY]

export const WALK_CYCLE = [1, 2, 3, 4]

export const HERO_CELL: Record<HeroPose, number> = { idle: 0, look: 5, cheer: 6, oops: 7 }
export const LIA_CELL: Record<LiaPose, number> = { idle: 0, phone: 5, happy: 6, oops: 7 }

export const LOGO_CELL = { phone: 6, pen: 7 } as const

export const UI_CELL = {
    arrow: 0,
    look: 1,
    wide: 2,
    phone: 3,
    thumb: 4,
    palm: 5,
    plane: 6,
    ball: 7,
} as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 96
const SOLID = 200
const HEAD = 0.3

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
            const data: FigureData = { ox: box[0] - cx, oy: box[1] - cy, cellW: cw, cellH: ch }
            Object.assign(texture.get(cellKey(i)).customData, data)
            if (!sheet.pin) continue
            let h0 = Infinity
            let h1 = -1
            for (let y = box[1]; y < box[1] + box[3] * HEAD; y++)
                for (let x = box[0]; x < box[0] + box[2]; x++) {
                    if (pixels[(y * width + x) * 4 + 3] <= SOLID) continue
                    if (x < h0) h0 = x
                    if (x > h1) h1 = x
                }
            const px = h1 < 0 ? 0.5 : ((h0 + h1) / 2 - box[0]) / box[2]
            Object.assign(texture.get(cellKey(i)).customData, { px })
        }
        ;(texture.customData as { ref?: number }).ref = Math.max(...sheet.ref.map(i => heights[i]))
    })
}
