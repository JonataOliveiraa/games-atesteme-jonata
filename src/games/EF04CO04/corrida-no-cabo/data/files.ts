import type Phaser from 'phaser'
import { PLAY } from './layout'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    /** recorta cada célula na caixa do desenho; sem recorte, a célula vai inteira */
    crop: boolean
    /** células de brilho: o recorte pega a franja macia, senão o halo sai quadrado */
    soft?: number[]
}

export const PISTA_SHEET: Sheet = { key: 'pista', cols: 3, rows: 2, cellW: 360, cellH: 360, crop: true, soft: [3, 4, 5] }
export const DEVICE_SHEET: Sheet = { key: 'aparelhos', cols: 2, rows: 1, cellW: 512, cellH: 512, crop: false }
export const PIECE_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 256, cellH: 256, crop: true }
export const UI1_SHEET: Sheet = { key: 'ui1', cols: 5, rows: 1, cellW: 350, cellH: 350, crop: true }
export const UI2_SHEET: Sheet = { key: 'ui2', cols: 1, rows: 1, cellW: 1050, cellH: 350, crop: true }

export const SHEETS = [PISTA_SHEET, DEVICE_SHEET, PIECE_SHEET, UI1_SHEET, UI2_SHEET]

export const PISTA = { tube: 0, plug: 1, gate: 2, glow1: 3, glow0: 4, spark: 5 } as const
export const DEVICE = { laptop: 0, computer: 1 } as const
export const PIECE = { car: 0, brake: 1, flame: 2, sparkle: 3 } as const
export interface Piece {
    sheet: Sheet
    cell: number
}

/** a interface veio em duas folhas: ui1 (botão 1, botão 0, caixinha, painel, cartão) e ui2 (o quadro) */
export const UI = {
    one: { sheet: UI1_SHEET, cell: 0 },
    zero: { sheet: UI1_SHEET, cell: 1 },
    slot: { sheet: UI1_SHEET, cell: 2 },
    panel: { sheet: UI1_SHEET, cell: 3 },
    card: { sheet: UI1_SHEET, cell: 4 },
    board: { sheet: UI2_SHEET, cell: 0 },
} satisfies Record<string, Piece>

/** o pedaço do tubo inteiro na largura e na altura do tubo da corrida: é a textura que dobra ao longo do fio */
export const TUBE_TILE = 'cabo-tubo'

export const cellKey = (index: number) => `c${index}`

const ALPHA = 96
const SOFT_ALPHA = 0

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const width = source.width
        const height = source.height
        const cw = width / sheet.cols
        const ch = height / sheet.rows
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
            const cx = Math.round((i % sheet.cols) * cw)
            const cy = Math.round(Math.floor(i / sheet.cols) * ch)
            let box = [cx, cy, Math.round(cw), Math.round(ch)]
            if (pixels) {
                const limit = sheet.soft?.includes(i) ? SOFT_ALPHA : ALPHA
                let x0 = Infinity
                let y0 = Infinity
                let x1 = -1
                let y1 = -1
                for (let y = cy; y < cy + Math.round(ch); y++)
                    for (let x = cx; x < cx + Math.round(cw); x++) {
                        if (pixels[(y * width + x) * 4 + 3] <= limit) continue
                        if (x < x0) x0 = x
                        if (x > x1) x1 = x
                        if (y < y0) y0 = y
                        if (y > y1) y1 = y
                    }
                if (x1 >= 0) box = [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
            }
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
        if (sheet === PISTA_SHEET && !textures.exists(TUBE_TILE)) {
            const frame = texture.get(cellKey(PISTA.tube))
            const k = PLAY.tube / frame.height
            const tile = document.createElement('canvas')
            tile.width = Math.max(32, Math.round(cw * k))
            tile.height = PLAY.tube
            tile.getContext('2d')?.drawImage(source, 0, frame.cutY, Math.round(cw), frame.height, 0, 0, tile.width, tile.height)
            textures.addCanvas(TUBE_TILE, tile)
        }
    })
}
