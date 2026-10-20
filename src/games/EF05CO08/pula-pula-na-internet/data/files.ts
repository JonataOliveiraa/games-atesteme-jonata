import type Phaser from 'phaser'
import type { ClueId, ItemKind, PlatformKind } from '../types'
import { PLATFORM } from './layout'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const PHONE_SHEET: Sheet = { key: 'celular', cols: 3, rows: 2, cellW: 256, cellH: 256 }
export const ITEM_SHEET: Sheet = { key: 'itens', cols: 3, rows: 1, cellW: 192, cellH: 192 }
export const CLUE_SHEET: Sheet = { key: 'pistas', cols: 3, rows: 1, cellW: 96, cellH: 96 }
export const PHOTO_SHEET: Sheet = { key: 'fotos', cols: 2, rows: 2, cellW: 400, cellH: 260 }
export const PLATFORM_SHEET: Sheet = { key: 'plataformas', cols: 1, rows: 4, cellW: PLATFORM.cellW, cellH: PLATFORM.cellH }
export const CLOUD_SHEET: Sheet = { key: 'nuvem', cols: 2, rows: 1, cellW: 400, cellH: 180 }

export const SHEETS = [PHONE_SHEET, ITEM_SHEET, CLUE_SHEET, PHOTO_SHEET, PLATFORM_SHEET, CLOUD_SHEET]

export const SUMMIT_KEY = 'topo'
export const SKY_KEY = 'fundo'
export const NET_KEY = 'rede'
export const HAND_KEY = 'mao'
export const IMAGES = [SUMMIT_KEY, SKY_KEY, NET_KEY, HAND_KEY]

export const HAND_TIP = { x: 0.34, y: 0.07 } as const

export const PHONE_FOOT = 240 / 256

export const CLOUD_BASE = 170 / 180

export const POSE = { up: 0, fall: 1, read: 2, happy: 3, sad: 4, dizzy: 5 } as const
export type Pose = keyof typeof POSE

export const ITEM_CELL: Record<ItemKind, number> = { jornal: 0, alerta: 1, imagem: 2 }

export const CLUE_CELL: Record<ClueId, number> = { quem: 0, quando: 1, onde: 2 }

export const PLATFORM_ROW: Record<PlatformKind, number> = { aba: 0, parada: 1, chao: 2, topo: 3 }

export const cellKey = (index: number) => `c${index}`

export const sliceKey = (row: number, part: 'l' | 'm' | 'r') => `${part}${row}`

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
        if (sheet !== PLATFORM_SHEET) return
        const cap = Math.round((PLATFORM.cap / PLATFORM.cellW) * cw)
        for (let row = 0; row < sheet.rows; row++) {
            const y = Math.round(row * ch)
            const h = Math.floor(ch)
            if (!texture.has(sliceKey(row, 'l'))) texture.add(sliceKey(row, 'l'), 0, 0, y, cap, h)
            if (!texture.has(sliceKey(row, 'm'))) texture.add(sliceKey(row, 'm'), 0, cap, y, Math.floor(cw) - cap * 2, h)
            if (!texture.has(sliceKey(row, 'r'))) texture.add(sliceKey(row, 'r'), 0, Math.floor(cw) - cap, y, cap, h)
        }
    })
}
