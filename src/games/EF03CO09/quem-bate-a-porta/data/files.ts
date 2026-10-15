import type Phaser from 'phaser'
import type { DoorId, InfoId, PersonPose } from '../types'

export const BG = 'bg-corredor'
export const BG_ROOM = 'bg-sala'

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

export const DOOR_SHEET: Sheet = { key: 'portas', cols: 4, rows: 2, cellW: 300, cellH: 460, ref: [0] }
export const PEOPLE_SHEET: Sheet = { key: 'pessoas', cols: 3, rows: 5, cellW: 320, cellH: 400, ref: [0] }
export const INFO_SHEET: Sheet = { key: 'informacoes', cols: 3, rows: 3, cellW: 256, cellH: 256, ref: [0] }
export const PIECES_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 256, cellH: 256, ref: [0] }

export const SHEETS = [DOOR_SHEET, PEOPLE_SHEET, INFO_SHEET, PIECES_SHEET]

export const DOOR_CELL: Record<DoorId, number> = { grandma: 0, class: 1, davi: 2, school: 3, stranger: 4 }
export const DOORWAY = 5
export const FAR_OFF = 6
export const FAR_LIT = 7

const PERSON_ROW: Record<DoorId, number> = { grandma: 0, class: 1, school: 2, stranger: 3, davi: 4 }
const POSE_COL: Record<PersonPose, number> = { ask: 0, happy: 1, sad: 2 }
export const personCell = (who: DoorId, pose: PersonPose) => PERSON_ROW[who] * PEOPLE_SHEET.cols + POSE_COL[pose]

export const INFO_CELL: Record<InfoId, number> = {
    address: 0,
    phone: 1,
    face: 2,
    trip: 3,
    drawing: 4,
    color: 5,
    nickname: 6,
    friendPhoto: 7,
}

export const PIECE = {
    plane: 0,
    box: 1,
    boxOpen: 2,
    knock: 3,
    heart: 4,
    star: 5,
    trash: 6,
    ask: 7,
} as const

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
