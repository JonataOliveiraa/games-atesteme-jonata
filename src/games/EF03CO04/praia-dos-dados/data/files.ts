import type Phaser from 'phaser'
import type { DogId, TraitId } from '../types'

export const BG = 'bg-praia'
/** a coluna da frente da cabine, na mesma tela do fundo: vai por cima da Nina */
export const BG_FRONT = 'bg-praia-madeira'

export interface Sheet {
    key: string
    cols: number
    rows: number
    /** tamanho da célula da arte de reserva */
    cellW: number
    cellH: number
    /** células que dão a altura de referência da folha (a maior delas) */
    ref: number[]
}

export const BATHERS_SHEET: Sheet = { key: 'banhistas', cols: 6, rows: 2, cellW: 256, cellH: 384, ref: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] }
export const DOGS_SHEET: Sheet = { key: 'cachorros', cols: 4, rows: 3, cellW: 256, cellH: 256, ref: [0] }
export const PIECES_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 256, cellH: 256, ref: [0] }
export const LIFEGUARD_SHEET: Sheet = { key: 'salva-vidas', cols: 4, rows: 1, cellW: 256, cellH: 256, ref: [0, 1, 2] }

export const SHEETS = [BATHERS_SHEET, DOGS_SHEET, PIECES_SHEET, LIFEGUARD_SHEET]

export type DogPose = 'sit' | 'run' | 'jump' | 'cry'
const POSE: Record<DogPose, number> = { sit: 0, run: 1, jump: 2, cry: 3 }
const DOG_ROW: Record<DogId, number> = { pacoca: 0, salsicha: 1, floco: 2 }
export const dogCell = (dog: DogId, pose: DogPose) => DOG_ROW[dog] * DOGS_SHEET.cols + POSE[pose]

export type NinaPose = 'talk' | 'cheer' | 'worry'
export const NINA_CELL: Record<NinaPose, number> = { talk: 0, cheer: 1, worry: 2 }
export const RADIO_CELL = 3
export const TOWEL_CELL = 0
const ICON_CELL: Record<TraitId, number> = { cap: 1, hat: 2, glasses: 3, bucket: 4, ring: 5, ball: 6, fins: 7 }
export const iconCell = (trait: TraitId) => ICON_CELL[trait]

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
