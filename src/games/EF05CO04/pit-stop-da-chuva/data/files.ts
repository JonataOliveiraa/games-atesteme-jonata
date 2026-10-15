import type Phaser from 'phaser'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    ref: number[]
    trim: boolean
    pin?: boolean
}

export interface FigureData {
    px?: number
}

export const KART_SHEET: Sheet = { key: 'karts', cols: 3, rows: 2, cellW: 384, cellH: 256, ref: [0], trim: false }
export const CREW_SHEET: Sheet = { key: 'equipe', cols: 4, rows: 2, cellW: 320, cellH: 400, ref: [0, 4, 6], trim: true, pin: true }
export const PIECE_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 3, cellW: 256, cellH: 256, ref: [0], trim: true }

export const SHEETS = [KART_SHEET, CREW_SHEET, PIECE_SHEET]

export const TRACK_KEY = 'autodromo'
export const BOX_KEY = 'box'
export const IMAGES = [TRACK_KEY, BOX_KEY]

export const KART_CELL = { idle: 0, race: 1, cheer: 2, dizzy: 3, worried: 4, rival: 5 } as const
export const CREW_CELL = { beto: 0, betoTalk: 1, betoFlag: 2, betoOops: 3, lua: 4, luaWork: 5, davi: 6, daviWork: 7 } as const
export const PIECE_CELL = {
    liso: 0,
    chuva: 1,
    inter: 2,
    flat: 3,
    cartLiso: 4,
    cartChuva: 5,
    cartInter: 6,
    hay: 7,
    rainCloud: 8,
    cloud: 9,
    sun: 10,
    puddle: 11,
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
        if (!sheet.trim) {
            for (let i = 0; i < sheet.cols * sheet.rows; i++) {
                const x = Math.round((i % sheet.cols) * cw)
                const y = Math.round(Math.floor(i / sheet.cols) * ch)
                if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
            }
            ;(texture.customData as { ref?: number }).ref = Math.floor(ch)
            return
        }
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
            Object.assign(texture.get(cellKey(i)).customData as FigureData, { px })
        }
        ;(texture.customData as { ref?: number }).ref = Math.max(...sheet.ref.map(i => heights[i]))
    })
}
