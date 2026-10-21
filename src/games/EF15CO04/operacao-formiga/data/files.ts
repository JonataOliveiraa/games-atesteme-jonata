import type Phaser from 'phaser'
import type { AntPose, QueenPose } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const ANT_SHEET: Sheet = { key: 'formiga', cols: 4, rows: 2, cellW: 192, cellH: 192 }
export const QUEEN_SHEET: Sheet = { key: 'rainha', cols: 3, rows: 1, cellW: 256, cellH: 256 }
export const FRUIT_SHEET: Sheet = { key: 'frutas', cols: 3, rows: 1, cellW: 512, cellH: 512 }
export const PROPS_SHEET: Sheet = { key: 'cenario', cols: 4, rows: 2, cellW: 256, cellH: 256 }

export const SHEETS = [ANT_SHEET, QUEEN_SHEET, FRUIT_SHEET, PROPS_SHEET]

export const BG_KEY = 'jardim'
export const IMAGES = [BG_KEY]

const ANT_CELL: Record<AntPose, number> = {
    idle: 0,
    walkA: 1,
    walkB: 2,
    carry: 3,
    carryA: 4,
    carryB: 5,
    happy: 6,
    push: 7,
}

const QUEEN_CELL: Record<QueenPose, number> = { calm: 0, ask: 1, happy: 2 }

export const PROP = {
    mound: 0,
    stoneA: 1,
    stoneB: 2,
    stoneC: 3,
    plate: 4,
    bush: 5,
    tuft: 6,
    puff: 7,
} as const

export const antCell = (p: AntPose) => ANT_CELL[p]
export const queenCell = (p: QueenPose) => QUEEN_CELL[p]

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

/** Quanto a célula real (do PNG ou da reserva) mede em relação ao contrato. */
export const sheetScale = (scene: Phaser.Scene, sheet: Sheet) => {
    const source = scene.textures.get(sheet.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    return (sheet.cellW * sheet.cols) / source.width
}
