import Phaser from 'phaser'

export interface Sheet {
    key: string
    cols: number
    rows: number
    /** tamanho da célula em pixels de arte */
    cellW: number
    cellH: number
    /** recorta cada célula na caixa do desenho; sem recorte, a célula vai inteira */
    crop: boolean
}

export const TABLET_SHEET: Sheet = { key: 'tablet', cols: 1, rows: 1, cellW: 128, cellH: 96, crop: false }
export const CODER_SHEET: Sheet = { key: 'codificador', cols: 2, rows: 1, cellW: 48, cellH: 40, crop: false }
export const UI_SHEET: Sheet = { key: 'ui', cols: 4, rows: 2, cellW: 32, cellH: 32, crop: true }

export const SHEETS = [TABLET_SHEET, CODER_SHEET, UI_SHEET]

/** o fujão de cada cor é uma tira de 4 expressões (16 × 16), assada na hora em que a cor aparece */
export const FACE = { normal: 0, blink: 1, scared: 2, happy: 3 } as const
export type Face = keyof typeof FACE
export const fujaoKey = (color: number) => `fujao-${color.toString(16)}`
/** o fujão-letra (N3): uma plaquinha com a letra, uma tira de 4 expressões */
export const letterKey = (ch: string) => `fujao-letra-${ch.charCodeAt(0)}`
/** um quadradinho branco de 1 pixel: os cacos e a fumacinha da fuga (pintados com tint) */
export const DOT_KEY = 'pixel-ponto'
/** as caixinhas do código em cima do fujão: vazia, a da vez e preenchida, com o aro na cor da luz (RGB) */
export type BoxState = 'empty' | 'next' | 'done'
export const boxKey = (state: BoxState, rim: number) => `caixinha-${state}-${rim.toString(16)}`
/** o corpo do fujão, sem o contorno, em pixels de arte */
export const FUJAO_BODY = 12

export const CODER = { idle: 0, fire: 1 } as const

export const UI = { aimOpen: 0, aimLock: 1, button: 2, buttonDown: 3, joyBase: 4, joyKnob: 5, spark: 6, hole: 7 } as const

export const cellKey = (index: number) => `c${index}`

const ALPHA = 24

/** recorta as células (pela caixa do desenho, quando pedido) e deixa toda folha em NEAREST: é pixel art */
export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        texture.setFilter(Phaser.Textures.FilterMode.NEAREST)
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

/** quantos px da folha valem um pixel de arte (a folha pode chegar ampliada 8×) */
export function artScale(textures: Phaser.Textures.TextureManager, sheet: Sheet) {
    const source = textures.get(sheet.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    return source.width / (sheet.cols * sheet.cellW)
}
