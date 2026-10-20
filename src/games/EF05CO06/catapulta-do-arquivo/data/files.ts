import type Phaser from 'phaser'
import type { DeviceId, FileId, Scenery } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    /** recorta cada célula na caixa do desenho; sem recorte, a posição dentro da célula é contrato */
    crop: boolean
}

/** cada lugar tem o seu céu fixo, o seu chão (repetido por baixo do relevo), a borda de cima e o túnel */
export const SCENERY: Record<Scenery, { sky: string; ground: string; edge: string; tunnel: string }> = {
    campo: { sky: 'bg-ceu', ground: 'terra', edge: 'borda-campo', tunnel: 'tunel-campo' },
    praia: { sky: 'bg-praia', ground: 'areia', edge: 'borda-praia', tunnel: 'tunel-praia' },
    serra: { sky: 'bg-serra', ground: 'pedra', edge: 'borda-serra', tunnel: 'tunel-serra' },
}

/** a borda repete na horizontal; a linha do chão fica em `line` do PNG */
export const EDGE = { w: 512, h: 96, line: 36 } as const
/** o túnel repete na vertical e encolhe/estica até a largura da boca */
export const TUNNEL = { w: 128, h: 256 } as const

export const SKY = SCENERY.campo.sky
export const DIRT = SCENERY.campo.ground
/** a tábua, esticada pelo meio até a largura de cada plataforma */
export const PLANK = 'tabua'
/** os pregos da tábua ficam a ~31 px das pontas (PNG 772 × 40): as pontas não esticam */
export const PLANK_CORNER = 48

export const DEVICE_SHEET: Sheet = { key: 'aparelhos', cols: 3, rows: 2, cellW: 320, cellH: 320, crop: false }
export const PIECE_SHEET: Sheet = { key: 'pecas', cols: 4, rows: 2, cellW: 200, cellH: 200, crop: true }
export const CATAPULT_SHEET: Sheet = { key: 'catapulta', cols: 1, rows: 1, cellW: 320, cellH: 320, crop: false }

export const SHEETS = [DEVICE_SHEET, PIECE_SHEET, CATAPULT_SHEET]

export const GABINETE_CELL = 0

export const DEVICE_CELL: Record<DeviceId, number> = {
    hdInterno: 1,
    penDrive: 2,
    cartao: 3,
    hdExterno: 4,
    nuvem: 5,
}

export const FILE_CELL: Record<FileId, number> = { video: 0, foto: 1, musica: 2, trabalho: 3 }

export const PIECE = { ball: 4, star: 5, spring: 6, springDown: 7 } as const

export const cellKey = (index: number) => `c${index}`

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

/** escala que leva a célula do tamanho de contrato ao tamanho da tela, qualquer que seja o PNG */
export function cellScale(scene: Phaser.Scene, sheet: Sheet, scale: number) {
    const source = scene.textures.get(sheet.key).getSourceImage() as { width: number }
    return (scale * sheet.cellW * sheet.cols) / source.width
}
