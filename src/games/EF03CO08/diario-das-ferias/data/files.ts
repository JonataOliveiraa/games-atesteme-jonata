import type Phaser from 'phaser'
import type { DudaPose } from '../types'

export const BG_BEACH = 'bg-praia'
export const BG_FARM = 'bg-sitio'
export const BG_NIGHT = 'bg-acampamento'
export const BG_STAGE = 'bg-teatrinho'
export const NOTE = 'ddf-note'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    ref: number[]
}

export const THINGS_SHEET: Sheet = { key: 'coisas-praia', cols: 4, rows: 2, cellW: 320, cellH: 320, ref: [0] }
export const UI_SHEET: Sheet = { key: 'interface', cols: 4, rows: 1, cellW: 256, cellH: 256, ref: [0] }
export const DUDA_SHEET: Sheet = { key: 'duda', cols: 3, rows: 2, cellW: 320, cellH: 440, ref: [0, 1, 2, 3, 4, 5] }

export const FARM_SHEET: Sheet = { key: 'coisas-sitio', cols: 4, rows: 2, cellW: 320, cellH: 320, ref: [0] }
export const NIGHT_SHEET: Sheet = { key: 'coisas-noite', cols: 3, rows: 2, cellW: 320, cellH: 320, ref: [0] }

export const SHEETS = [THINGS_SHEET, UI_SHEET, DUDA_SHEET, FARM_SHEET, NIGHT_SHEET]

export const FARM_CELL = {
    frog: 0,
    butterfly: 1,
    rooster: 2,
    cowEat: 3,
    cowMoo: 4,
    dog: 5,
    duck: 6,
    tractor: 7,
} as const

export const NIGHT_CELL = {
    moon: 0,
    fireflies: 1,
    fireA: 2,
    fireB: 3,
    star: 4,
    lantern: 5,
} as const

export const THING_CELL = {
    rainbow: 0,
    crabWalk: 1,
    crabScared: 2,
    dolphinJump: 3,
    dolphinDive: 4,
    splash: 5,
    castle: 6,
    wave: 7,
} as const

export const UI_CELL = { photo: 0, sound: 1, joyBase: 2, joyKnob: 3 } as const

export const DUDA_CELL: Record<DudaPose, number> = { smile: 0, talk: 1, cheer: 2, oops: 3, present: 4, bow: 5 }

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
