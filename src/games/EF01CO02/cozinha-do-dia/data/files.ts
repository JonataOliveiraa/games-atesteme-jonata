import type Phaser from 'phaser'
import type { AnimalId, DishId, ObjectId, Pose } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    trim: boolean
}

export const WALL_KEY = 'cozinha'
export const COUNTER_KEY = 'bancada'
export const IMAGES = [WALL_KEY, COUNTER_KEY]

export const CLIENT_SHEET: Sheet = { key: 'clientes', cols: 3, rows: 3, cellW: 320, cellH: 400, trim: false }
export const OBJECT_SHEET: Sheet = { key: 'objetos', cols: 3, rows: 3, cellW: 256, cellH: 256, trim: true }
export const OBJECT_SHEET_2: Sheet = { key: 'objetos-2', cols: 3, rows: 3, cellW: 256, cellH: 256, trim: true }
export const DISH_SHEETS: Record<DishId, Sheet> = {
    cereal: { key: 'preparo-cereal', cols: 4, rows: 2, cellW: 320, cellH: 320, trim: false },
    hotdog: { key: 'preparo-hotdog', cols: 4, rows: 2, cellW: 320, cellH: 320, trim: false },
    smoothie: { key: 'preparo-vitamina', cols: 4, rows: 3, cellW: 320, cellH: 320, trim: false },
    sandwich: { key: 'preparo-sanduiche', cols: 4, rows: 2, cellW: 320, cellH: 320, trim: false },
    sundae: { key: 'preparo-sorvete', cols: 4, rows: 2, cellW: 320, cellH: 320, trim: false },
    pave: { key: 'preparo-pave', cols: 4, rows: 2, cellW: 320, cellH: 320, trim: false },
}

export const SHEETS: Sheet[] = [CLIENT_SHEET, OBJECT_SHEET, OBJECT_SHEET_2, ...Object.values(DISH_SHEETS)]

const OBJECT_ART: Record<ObjectId, { sheet: Sheet; cell: number }> = {
    bowl: { sheet: OBJECT_SHEET, cell: 0 },
    cereal: { sheet: OBJECT_SHEET, cell: 1 },
    milk: { sheet: OBJECT_SHEET, cell: 2 },
    bun: { sheet: OBJECT_SHEET, cell: 3 },
    sausage: { sheet: OBJECT_SHEET, cell: 4 },
    ketchup: { sheet: OBJECT_SHEET, cell: 5 },
    banana: { sheet: OBJECT_SHEET, cell: 6 },
    lid: { sheet: OBJECT_SHEET, cell: 7 },
    button: { sheet: OBJECT_SHEET, cell: 8 },
    bread: { sheet: OBJECT_SHEET_2, cell: 0 },
    cheese: { sheet: OBJECT_SHEET_2, cell: 1 },
    cup: { sheet: OBJECT_SHEET_2, cell: 2 },
    scoop: { sheet: OBJECT_SHEET_2, cell: 3 },
    syrup: { sheet: OBJECT_SHEET_2, cell: 4 },
    cookie: { sheet: OBJECT_SHEET_2, cell: 5 },
    cream: { sheet: OBJECT_SHEET_2, cell: 6 },
    berry: { sheet: OBJECT_SHEET_2, cell: 7 },
}

const ANIMAL_ROW: Record<AnimalId, number> = { cat: 0, dog: 1, monkey: 2 }
const POSE_COL: Record<Pose, number> = { wait: 0, eat: 1, yuck: 2 }

export const clientCell = (animal: AnimalId, pose: Pose) => ANIMAL_ROW[animal] * CLIENT_SHEET.cols + POSE_COL[pose]

export const DISH_FRAMES: Record<DishId, Record<string, number>> = {
    cereal: {
        mat: 0,
        bowl: 1,
        'bowl-cereal': 2,
        'bowl-full': 3,
        'mat-cereal': 4,
        'mat-milk': 5,
        'bowl-milk': 6,
        'bowl-heap': 7,
    },
    hotdog: {
        plate: 0,
        'plate-bun': 1,
        'plate-sausage': 2,
        hotdog: 3,
        'plate-ketchup': 4,
        'bun-ketchup': 5,
        'hotdog-double': 6,
    },
    smoothie: {
        jar: 0,
        'jar-banana': 1,
        'jar-full': 2,
        'jar-lid': 3,
        'jar-blend': 4,
        glass: 5,
        'jar-milk': 6,
        'jar-lid-empty': 7,
        'jar-over': 8,
        'jar-splat': 9,
        'jar-lid-banana': 10,
    },
    sandwich: {
        board: 0,
        'sand-1': 1,
        'sand-2': 2,
        'sand-3': 3,
        'sand-4': 4,
    },
    sundae: {
        tray: 0,
        'cup-0': 1,
        'cup-1': 2,
        'cup-1s': 3,
        'cup-2': 4,
        'cup-2s': 5,
    },
    pave: {
        dish: 0,
        'pave-1': 1,
        'pave-1c': 2,
        'pave-2': 3,
        'pave-2c': 4,
        'pave-3': 5,
    },
}

export const cellKey = (index: number) => `c${index}`

export const objectArt = (id: ObjectId) => ({ key: OBJECT_ART[id].sheet.key, frame: cellKey(OBJECT_ART[id].cell) })

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
        let pixels: Uint8ClampedArray | null = null
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
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
    })
}
