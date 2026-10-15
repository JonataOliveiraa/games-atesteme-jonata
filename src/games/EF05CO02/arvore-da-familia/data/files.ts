import type Phaser from 'phaser'
import type { Human, Kin, Mood, Role, Species } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    names?: string[]
    crop?: boolean
}

export const FAMILY_SHEET: Sheet = { key: 'familia', cols: 4, rows: 4 }
export const JOAO_SHEET: Sheet = { key: 'joao', cols: 4, rows: 1 }
export const UI_SHEET: Sheet = {
    key: 'ui',
    cols: 4,
    rows: 2,
    crop: true,
    names: ['card', 'slot', 'leaf', 'flower', 'gust', 'shell', 'basket', 'spark'],
}

export const ANIMAL_SHEET: Sheet = { key: 'bichos', cols: 6, rows: 4 }

export const SHEETS = [FAMILY_SHEET, JOAO_SHEET, UI_SHEET, ANIMAL_SHEET]

export const PARK_KEY = 'parque'
export const TREE_KEY = 'arvore'
export const BEACH_KEY = 'praia'
export const WAVE_KEY = 'onda'
export const YARD_KEY = 'quintal'
export const IMAGES = [PARK_KEY, TREE_KEY, BEACH_KEY, WAVE_KEY, YARD_KEY]

export const FACE_CELL: Record<Human, number> = {
    me: 0,
    dad: 1,
    mom: 2,
    sister: 3,
    brother: 4,
    grandpa: 5,
    grandma: 6,
    uncle: 7,
    aunt: 8,
    cousinBoy: 9,
    cousinGirl: 10,
    grandpaM: 11,
    grandmaM: 12,
    auntM: 13,
    baby: 15,
}

const ANIMAL_ROW: Record<Species, number> = { cat: 0, dog: 1, rabbit: 2 }
const ANIMAL_COL: Record<Kin, number> = { grandpa: 0, grandma: 1, dad: 2, mom: 3, kid: 4, brother: 5 }

export const PIGEON = { flying: 18, landed: 19 } as const

export function faceSource(role: Role): { sheet: Sheet; cell: number } {
    if (role.includes('.')) {
        const [sp, kin] = role.split('.') as [Species, Kin]
        return { sheet: ANIMAL_SHEET, cell: ANIMAL_ROW[sp] * ANIMAL_SHEET.cols + ANIMAL_COL[kin] }
    }
    return { sheet: FAMILY_SHEET, cell: FACE_CELL[role as Human] }
}

export const JOAO_CELL: Partial<Record<Mood, number>> = { talk: 0, scared: 1, cheer: 2, worried: 3 }

export const ART = {
    slotBodyTop: 22,
    slotBodyH: 230,
} as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 96

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const width = source.width
        const height = source.height
        const cw = Math.floor(width / sheet.cols)
        const ch = Math.floor(height / sheet.rows)
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
            const cx = (i % sheet.cols) * cw
            const cy = Math.floor(i / sheet.cols) * ch
            let box = [cx, cy, cw, ch]
            if (pixels) {
                let x0 = Infinity
                let y0 = Infinity
                let x1 = -1
                let y1 = -1
                for (let y = cy; y < cy + ch; y++)
                    for (let x = cx; x < cx + cw; x++) {
                        if (pixels[(y * width + x) * 4 + 3] <= ALPHA) continue
                        if (x < x0) x0 = x
                        if (x > x1) x1 = x
                        if (y < y0) y0 = y
                        if (y > y1) y1 = y
                    }
                if (x1 >= 0) box = [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
            }
            const name = sheet.names?.[i] ?? cellKey(i)
            if (!texture.has(name)) texture.add(name, 0, box[0], box[1], box[2], box[3])
        }
    })
}
