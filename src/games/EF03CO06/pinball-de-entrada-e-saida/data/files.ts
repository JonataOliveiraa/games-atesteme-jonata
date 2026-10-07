import type Phaser from 'phaser'
import type { ContentId, DeviceId, PoseId } from '../types'

export const BG = 'bg-fliperama'
export const TABLE_ART = 'mesa'

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

export const DEVICES_SHEET: Sheet = { key: 'aparelhos', cols: 3, rows: 2, cellW: 320, cellH: 320, ref: [0, 1, 2, 3, 4, 5] }
export const PIECES_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 4, cellW: 256, cellH: 256, ref: [0] }
export const KID_SHEET: Sheet = { key: 'lily', cols: 4, rows: 3, cellW: 320, cellH: 320, ref: [0] }

export const SHEETS = [DEVICES_SHEET, PIECES_SHEET, KID_SHEET]

export const DEVICE_CELL: Record<DeviceId, number> = { keyboard: 0, mic: 1, camera: 2, speaker: 3, screen: 4, printer: 5 }
export const PIECE = { chipOff: 0, chipOn: 1, flipper: 2, ball: 3, spring: 4, bumper: 5, paper: 6, star: 7 } as const
export const CONTENT_CELL: Record<ContentId, number> = {
    letters: 8,
    voice: 9,
    music: 10,
    drawing: 11,
    cartoon: 12,
    story: 13,
    invite: 14,
    name: 15,
}
export const POSE_CELL: Record<PoseId, number> = {
    ask: 0,
    happy: 1,
    sad: 2,
    listen: 3,
    look: 4,
    paper: 5,
    sing: 6,
    write: 7,
    show: 8,
    call: 9,
}

/** a tela apagada dentro da célula do monitor, em fração da caixa medida */
export const SCREEN_AREA = { x: 0.527, y: 0.355, w: 0.8, h: 0.57 } as const

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
