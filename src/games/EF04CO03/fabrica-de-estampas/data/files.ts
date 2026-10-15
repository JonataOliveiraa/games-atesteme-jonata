import type Phaser from 'phaser'
import type { Fig } from '../types'

export const BG = 'bg-estamparia'

export interface Sheet {
    key: string
    cols: number
    rows: number
    /** tamanho da célula da arte de reserva */
    cellW: number
    cellH: number
}

export const BELT_SHEET: Sheet = { key: 'esteira', cols: 3, rows: 2, cellW: 320, cellH: 320 }
export const PRINT_SHEET: Sheet = { key: 'estampas', cols: 4, rows: 3, cellW: 256, cellH: 256 }
export const STAMP_SHEET: Sheet = { key: 'carimbos', cols: 3, rows: 2, cellW: 320, cellH: 320 }
export const UI_SHEET: Sheet = { key: 'ui', cols: 3, rows: 2, cellW: 384, cellH: 384 }
/** opcional: sem a folha, a estampadora não aparece */
export const WORKER_SHEET: Sheet = { key: 'estampadora', cols: 2, rows: 2, cellW: 400, cellH: 520 }

export const SHEETS = [BELT_SHEET, PRINT_SHEET, STAMP_SHEET, UI_SHEET, WORKER_SHEET]

export const BELT = { piece: 0, window: 1, roll: 2, rolled: 3, rope: 4, hook: 5 } as const

export const PRINT = { linen: 3, hem: 7, button: 8, buttonSpot: 9, needle: 10, peg: 11 } as const
export const PRINT_OF: Record<Fig, number> = { flower: 0, star: 1, heart: 2 }
export const SMUDGE_OF: Record<Fig, number> = { flower: 4, star: 5, heart: 6 }

export const STAMP_OF: Record<Fig, number> = { flower: 0, star: 1, heart: 2 }
export const PAD_OF: Record<Fig, number> = { flower: 3, star: 4, heart: 5 }

export const UI = { paper: 0, frameOuter: 1, frameInner: 2, tabOuter: 3, tabInner: 4, tag: 5 } as const

export const WORKER = { wave: 0, think: 1, cheer: 2, oops: 3 } as const

/**
 * O canto de cada peça esticada (`NineSlice`), em fração do lado menor da célula recortada
 * (medido no ui.png de 13/10/2026: os alfinetes do papel e a fita das molduras ficam no canto).
 */
export const SLICE: Partial<Record<number, number>> = {
    [UI.paper]: 0.36,
    [UI.frameOuter]: 0.19,
    [UI.frameInner]: 0.19,
    [UI.tabOuter]: 0.25,
    [UI.tabInner]: 0.25,
}

/** as faixas que repetem na horizontal, para o TileSprite */
export const BELT_STRIP = 'esteira-faixa'
export const ROPE_STRIP = 'esteira-corda'

/**
 * O trecho da célula que repete sem emenda, em fração da largura. A esteira do PNG tem
 * rolinhos nas pontas e sulcos a cada ~40 px: o miolo entre dois sulcos repete. A arte de
 * reserva (assada) já vai de borda a borda e usa a célula inteira.
 */
const TILE: Record<number, [number, number]> = { [BELT.piece]: [152 / 350, 231 / 350], [BELT.rope]: [0, 1] }

/** marca de textura assada em código (arte de reserva) */
export const BAKED = 'baked'

export const cellKey = (index: number) => `c${index}`

const ALPHA = 128

/**
 * Recorta cada célula na caixa do desenho (alfa > 128), medida aqui mesmo: vale
 * para o PNG e para a arte de reserva. As poses da estampadora ficam com a célula
 * inteira, para os pés não pularem quando a pose troca.
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
            const whole = sheet === WORKER_SHEET || x1 < 0
            const box = whole ? [cx, cy, Math.round(cw), Math.round(ch)] : [x0, y0, x1 - x0 + 1, y1 - y0 + 1]
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
        }
        if (sheet !== BELT_SHEET) return
        const baked = (texture.customData as Record<string, unknown>)[BAKED] === true
        const strip = (key: string, index: number) => {
            if (textures.exists(key)) return
            const frame = texture.get(cellKey(index))
            const [from, to] = baked ? [0, 1] : TILE[index]
            const left = Math.round((index % sheet.cols) * cw + from * cw)
            const out = document.createElement('canvas')
            out.width = Math.round((to - from) * cw)
            out.height = frame.height
            out.getContext('2d')?.drawImage(source, left, frame.cutY, out.width, frame.height, 0, 0, out.width, frame.height)
            textures.addCanvas(key, out)
        }
        strip(BELT_STRIP, BELT.piece)
        strip(ROPE_STRIP, BELT.rope)
    })
}
