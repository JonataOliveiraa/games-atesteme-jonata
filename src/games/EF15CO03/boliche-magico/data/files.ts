import type Phaser from 'phaser'
import type { BallFace, Color, Face } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const PINS_SHEET: Sheet = { key: 'pinos', cols: 4, rows: 2, cellW: 192, cellH: 288 }
export const EXTRAS_SHEET: Sheet = { key: 'enfeites', cols: 3, rows: 1, cellW: 192, cellH: 288 }
export const BALL_SHEET: Sheet = { key: 'bola', cols: 3, rows: 2, cellW: 256, cellH: 256 }

export const SHEETS = [PINS_SHEET, EXTRAS_SHEET, BALL_SHEET]

export const BG_KEY = 'fundo'
export const IMAGES = [BG_KEY]

const BODY_CELL: Record<Color, number> = { azul: 0, verde: 1, vermelho: 2 }
const FACE_CELL: Record<Face, number> = { awake: 4, sleepy: 5, asleep: 6, dizzy: 7 }
const BALL_FACE_CELL: Record<BallFace, number> = { normal: 1, rolling: 2, happy: 3, oops: 4, power: 5 }

export const EXTRA_CELL = { star: 0, glasses: 1, pillow: 2 } as const
export const PILLOW_Y = 150
export const BALL_BODY_CELL = 0

export const bodyCell = (c: Color) => BODY_CELL[c]
export const faceCell = (f: Face) => FACE_CELL[f]
export const ballFaceCell = (f: BallFace) => BALL_FACE_CELL[f]

export const cellKey = (index: number) => `c${index}`

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const cw = source.width / sheet.cols
        const ch = source.height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            if (texture.has(cellKey(i))) continue
            const x = Math.round((i % sheet.cols) * cw)
            const y = Math.round(Math.floor(i / sheet.cols) * ch)
            texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
        }
    })
}

export const sheetScale = (scene: Phaser.Scene, sheet: Sheet) => {
    const source = scene.textures.get(sheet.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    return (sheet.cellW * sheet.cols) / source.width
}
