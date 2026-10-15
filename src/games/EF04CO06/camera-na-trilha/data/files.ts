import type Phaser from 'phaser'
import type { Pose } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    ref: number[]
    pin?: boolean
    rowRef?: boolean
}

export interface FigureData {
    px?: number
    h?: number
}

export const TEO_SHEET: Sheet = { key: 'teo', cols: 4, rows: 2, cellW: 320, cellH: 320, ref: [0, 1], pin: true }
export const WALK_SHEET: Sheet = { key: 'teo-andar', cols: 4, rows: 3, cellW: 350, cellH: 450, ref: [0], pin: true, rowRef: true }
export const NATURE_SHEET: Sheet = { key: 'natureza', cols: 4, rows: 2, cellW: 256, cellH: 256, ref: [0] }
export const SCENERY_SHEET: Sheet = { key: 'cenario', cols: 4, rows: 2, cellW: 320, cellH: 320, ref: [0] }
export const FALL_SHEET: Sheet = { key: 'cachoeira', cols: 2, rows: 1, cellW: 512, cellH: 512, ref: [0] }
export const APP_SHEET: Sheet = { key: 'camera-ui', cols: 4, rows: 2, cellW: 256, cellH: 256, ref: [0] }
export const UI_SHEET: Sheet = { key: 'ui', cols: 3, rows: 2, cellW: 640, cellH: 480, ref: [0] }
export const CAVE_SHEET: Sheet = { key: 'gruta', cols: 4, rows: 2, cellW: 350, cellH: 350, ref: [0] }
export const CRITTER_SHEET: Sheet = { key: 'gruta-bichos', cols: 4, rows: 2, cellW: 350, cellH: 350, ref: [0] }
export const WOOD_SHEET: Sheet = { key: 'bosque', cols: 4, rows: 2, cellW: 350, cellH: 350, ref: [0] }

export const SHEETS = [TEO_SHEET, WALK_SHEET, NATURE_SHEET, SCENERY_SHEET, FALL_SHEET, APP_SHEET, UI_SHEET, CAVE_SHEET, CRITTER_SHEET, WOOD_SHEET]

export const TEO_CELL: Record<Pose, number> = {
    front: 0,
    back: 1,
    side: 2,
    frontUp: 3,
    backUp: 4,
    sideUp: 5,
    cheer: 6,
    oops: 7,
}

export const WALK_ROW = { front: 0, back: 1, side: 2 } as const
export const WALK_FRAMES = 4
export const WALK_CYCLE: Record<keyof typeof WALK_ROW, number[]> = { front: [0, 2], back: [0, 2], side: [0, 1, 2, 3] }

export const NATURE_CELL = {
    mushroom: 0,
    butterflyA: 1,
    butterflyB: 2,
    sunflower: 3,
    frog: 4,
    frogJump: 5,
    duck: 6,
    lily: 7,
} as const

export const SCENERY_CELL: Record<'bigTree' | 'smallTree' | 'bush' | 'rock' | 'log' | 'reeds' | 'pier' | 'flowers', number> = {
    bigTree: 0,
    smallTree: 1,
    bush: 2,
    rock: 3,
    log: 4,
    reeds: 5,
    pier: 6,
    flowers: 7,
}

export const CAVE_CELL = {
    stalagmite: 0,
    crystal: 1,
    bluecrystal: 2,
    rock: 3,
    puddle: 4,
    shroomLit: 5,
    shroomPale: 6,
    gravel: 7,
} as const

export const CRITTER_CELL = {
    fish: 0,
    fireflyLit: 2,
    fireflyDim: 3,
    drop: 4,
    splash: 5,
    mossLit: 6,
    mossPale: 7,
} as const

export const WOOD_CELL = {
    bigtree: 0,
    ladybug: 1,
    nest: 2,
    anthill: 3,
    ant: 4,
    flower: 5,
    beeOpen: 6,
    beeShut: 7,
} as const

export const APP_CELL = {
    shutter: 0,
    record: 1,
    stop: 2,
    camera: 3,
    camcorder: 4,
    bulbOff: 5,
    bulbOn: 6,
    lens: 7,
} as const

export const UI_CELL = {
    order: 0,
    polaroid: 1,
    film: 2,
    joyBase: 3,
    joyKnob: 4,
    button: 5,
} as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 96
const SOLID = 200
const HEAD = 0.28

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
        const heads: number[] = []
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
            if (sheet.pin) {
                let h0 = Infinity
                let h1 = -1
                for (let y = box[1]; y < box[1] + box[3] * HEAD; y++)
                    for (let x = box[0]; x < box[0] + box[2]; x++) {
                        if (pixels[(y * width + x) * 4 + 3] <= SOLID) continue
                        if (x < h0) h0 = x
                        if (x > h1) h1 = x
                    }
                heads[i] = h1 < 0 ? 0.5 : ((h0 + h1) / 2 - box[0]) / box[2]
            }
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
        const ref = Math.max(...sheet.ref.map(i => heights[i]))
        ;(texture.customData as { ref?: number }).ref = ref
        if (!sheet.pin) return
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            const row = Math.floor(i / sheet.cols)
            const h = sheet.rowRef ? Math.max(...heights.slice(row * sheet.cols, (row + 1) * sheet.cols)) : ref
            Object.assign(texture.get(cellKey(i)).customData as FigureData, { px: heads[i], h })
        }
    })
}
