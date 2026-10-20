import type Phaser from 'phaser'
import type { DecoKind } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const KID_SHEET: Sheet = { key: 'crianca', cols: 4, rows: 4, cellW: 192, cellH: 192 }
export const HOUSE_SHEET: Sheet = { key: 'casas', cols: 4, rows: 2, cellW: 384, cellH: 384 }
export const ICON_SHEET: Sheet = { key: 'icones', cols: 4, rows: 3, cellW: 128, cellH: 128 }
export const DECO_SHEET: Sheet = { key: 'enfeites', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const DECO2_SHEET: Sheet = { key: 'enfeites2', cols: 4, rows: 2, cellW: 256, cellH: 256 }

export const SHEETS = [KID_SHEET, HOUSE_SHEET, ICON_SHEET, DECO_SHEET, DECO2_SHEET]

export const GRASS_KEY = 'grama'
export const BAG_KEY = 'mochila'
export const IMAGES = [GRASS_KEY, BAG_KEY]

export const KID_FOOT = 0.92
export const HOUSE_FOOT = 352 / 384
export const HOUSE_PLATE = { x: 0, y: (96 - 352) / 384, d: 116 / 384 } as const

export const KID_FRAME = {
    run: { down: 0, up: 4, side: 8 },
    idle: { down: 12, up: 13, side: 14 },
    skid: 15,
} as const

export const DECO_CELL: Record<DecoKind, { sheet: string; cell: number }> = {
    arvore: { sheet: DECO_SHEET.key, cell: 0 },
    pinheiro: { sheet: DECO_SHEET.key, cell: 1 },
    arbusto: { sheet: DECO_SHEET.key, cell: 2 },
    flores: { sheet: DECO_SHEET.key, cell: 3 },
    banco: { sheet: DECO_SHEET.key, cell: 4 },
    poste: { sheet: DECO_SHEET.key, cell: 5 },
    chafariz: { sheet: DECO_SHEET.key, cell: 6 },
    lago: { sheet: DECO2_SHEET.key, cell: 0 },
    pedra: { sheet: DECO2_SHEET.key, cell: 1 },
    escorregador: { sheet: DECO2_SHEET.key, cell: 2 },
    gangorra: { sheet: DECO2_SHEET.key, cell: 3 },
    sorvete: { sheet: DECO2_SHEET.key, cell: 4 },
    hidrante: { sheet: DECO2_SHEET.key, cell: 5 },
    correio: { sheet: DECO2_SHEET.key, cell: 6 },
    canteiro: { sheet: DECO2_SHEET.key, cell: 7 },
}

export const cellKey = (index: number) => `c${index}`

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const cw = source.width / sheet.cols
        const ch = source.height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            const x = Math.round((i % sheet.cols) * cw)
            const y = Math.round(Math.floor(i / sheet.cols) * ch)
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
        }
    })
}
