import type Phaser from 'phaser'
import type { Bird, Bug, Cor, Home, Kind, Piece, Structure, Tone } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    trim?: boolean
}

export interface SheetData {
    maxW?: number
    maxH?: number
}

export const ANT_SHEET: Sheet = { key: 'formigas', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const BEE_SHEET: Sheet = { key: 'zuzu', cols: 3, rows: 2, cellW: 256, cellH: 256 }
export const FLOWER_SHEET: Sheet = { key: 'flores', cols: 3, rows: 3, cellW: 256, cellH: 256 }
export const PIPA_SHEET: Sheet = { key: 'pipa', cols: 4, rows: 2, cellW: 256, cellH: 320 }
export const OBJECT_SHEET: Sheet = { key: 'objetos', cols: 4, rows: 2, cellW: 256, cellH: 256 }

export const CHICK_SHEET: Sheet = { key: 'filhotes', cols: 3, rows: 3, cellW: 256, cellH: 256 }
export const SPIDER_SHEET: Sheet = { key: 'tece', cols: 3, rows: 2, cellW: 256, cellH: 256 }
export const BUG_SHEET: Sheet = { key: 'bichos', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const OBJECT2_SHEET: Sheet = { key: 'objetos2', cols: 4, rows: 2, cellW: 256, cellH: 256 }
// Both layers share the same canvas coordinates; trimming each one would misalign the rim.
export const NEST_SHEET: Sheet = { key: 'ninho', cols: 1, rows: 2, cellW: 256, cellH: 256, trim: false }
export const HOUSE_SHEET: Sheet = { key: 'casas', cols: 3, rows: 2, cellW: 256, cellH: 256 }
export const PIECE_SHEET: Sheet = { key: 'pedacos', cols: 4, rows: 3, cellW: 256, cellH: 256 }

export const SHEETS = [ANT_SHEET, BEE_SHEET, FLOWER_SHEET, PIPA_SHEET, OBJECT_SHEET, CHICK_SHEET, SPIDER_SHEET, BUG_SHEET, OBJECT2_SHEET, NEST_SHEET, HOUSE_SHEET, PIECE_SHEET]

export const TRAIL_KEY = 'bg-trilha'
export const GARDEN_KEY = 'bg-jardim'
export const NESTS_KEY = 'bg-ninhos'
export const WEB_KEY = 'bg-teia'
export const WHIRL_KEY = 'bg-redemoinho'
export const IMAGES = [TRAIL_KEY, GARDEN_KEY, NESTS_KEY, WEB_KEY, WHIRL_KEY]

export const BG_OF: Record<Structure, string> = {
    fila: TRAIL_KEY,
    grade: GARDEN_KEY,
    ficha: NESTS_KEY,
    teia: WEB_KEY,
    redemoinho: WHIRL_KEY,
}

export const SPIDER_CELL = { idle: 0, hang: 1, pull: 2, cheer: 3, fall: 4, dizzy: 5 } as const
export const OBJECT2_CELL = { nest: 0, card: 1, twig: 2, crest: 3, pena: 4, bico: 5, topete: 6, pile: 7 } as const
export const NEST_CELL = { back: 0, front: 1 } as const

const COR_INDEX: Record<Cor, number> = { laranja: 0, verde: 1, roxo: 2 }
export const chickCell = (b: Bird) => COR_INDEX[b.pena] * 3 + COR_INDEX[b.bico]

const BUG_INDEX: Record<Bug, number> = { joaninha: 0, borboleta: 1, grilo: 2, caracol: 3 }
export const bugCell = (b: Bug, scared = false) => BUG_INDEX[b] + (scared ? 4 : 0)

const HOME_INDEX: Record<Home, number> = { fila: 0, grade: 1, ficha: 2, teia: 3, solto: 4 }
export const houseCell = (h: Home) => HOME_INDEX[h]

export const PIECES: Piece[] = ['pebbles', 'list', 'grid', 'weather', 'card', 'badge', 'pair', 'map', 'number', 'word', 'yes']
export const pieceCell = (p: Piece) => PIECES.indexOf(p)

export const ANT_CELL = { idle: 0, walkA: 1, walkB: 2, dizzy: 3, tumble: 4, startled: 5, trip: 6, cheer: 7 } as const
export const BEE_CELL = { up: 0, down: 1, carry: 2, cheer: 3, startled: 4, sad: 5 } as const
export const PIPA_CELL = { idle: 0, wave: 1, talk: 2, brace: 3, surprised: 4, point: 5, cheer: 6, hop: 7 } as const
export const OBJECT_CELL = { signStake: 0, stake: 1, plot: 2, leaf: 3, windLeaf: 4, pebble: 5, dust: 6, bow: 7 } as const

const KIND_ROW: Record<Kind, number> = { margarida: 0, tulipa: 1, estrela: 2 }
const TONE_COL: Record<Tone, number> = { amarela: 0, azul: 1, rosa: 2 }

export const flowerCell = (kind: Kind, tone: Tone) => KIND_ROW[kind] * 3 + TONE_COL[tone]

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
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return
        ctx.drawImage(source, 0, 0)
        const pixels = ctx.getImageData(0, 0, width, height).data
        let maxW = 0
        let maxH = 0
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
            const frame = sheet.trim === false ? [cx, cy, Math.round(cw), Math.round(ch)] : box
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, frame[0], frame[1], frame[2], frame[3])
            maxW = Math.max(maxW, box[2])
            maxH = Math.max(maxH, box[3])
        }
        Object.assign(texture.customData as SheetData, { maxW, maxH })
    })
}

export const sheetData = (scene: Phaser.Scene, sheet: Sheet) =>
    scene.textures.get(sheet.key).customData as SheetData
