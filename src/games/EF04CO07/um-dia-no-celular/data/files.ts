import type Phaser from 'phaser'
import type { Adult, AppId, Kid, Mood, Place, Thing } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
    pin?: boolean
}

export const NINA_SHEET: Sheet = { key: 'nina', cols: 3, rows: 2, cellW: 320, cellH: 420, pin: true }
export const FRIENDS_SHEET: Sheet = { key: 'amigos', cols: 4, rows: 3, cellW: 320, cellH: 420, pin: true }
export const THINGS_SHEET: Sheet = { key: 'objetos', cols: 3, rows: 2, cellW: 320, cellH: 320 }
export const THINGS2_SHEET: Sheet = { key: 'objetos2', cols: 5, rows: 1, cellW: 320, cellH: 320 }
export const APPS_SHEET: Sheet = { key: 'apps', cols: 4, rows: 2, cellW: 256, cellH: 256 }
export const ADULTS_SHEET: Sheet = { key: 'adultos', cols: 3, rows: 1, cellW: 256, cellH: 256 }

export const SHEETS = [NINA_SHEET, FRIENDS_SHEET, THINGS_SHEET, THINGS2_SHEET, APPS_SHEET, ADULTS_SHEET]

export const BACKDROPS: Record<Place, string> = {
    sala: 'bg-sala',
    patio: 'bg-patio',
    quarto: 'bg-quarto',
    festa: 'bg-festa',
}

export const HAND = { back: 'hand-layer1', body: 'hand-layer2', front: 'hand-layer3' } as const

export const FILE_KEYS = [...SHEETS.map(s => s.key), ...Object.values(BACKDROPS), ...Object.values(HAND)]

export interface Look {
    sheet: Sheet
    cell: number
}

export const LOOKS: Record<Kid, Partial<Record<Mood, number>>> = {
    nina: { idle: 0, pose: 1, cover: 2, hurt: 3, silly: 4, wave: 5 },
    duda: { open: 0, closed: 1 },
    bia: { worried: 2, hug: 3, hurt: 4 },
    caio: { ask: 5, thumb: 6, key: 7 },
    rafa: { eat: 8, no: 9, thumb: 10, hurt: 11 },
}

export const FIRST_MOOD: Record<Kid, Mood> = { nina: 'idle', duda: 'open', bia: 'worried', caio: 'ask', rafa: 'eat' }

export function lookOf(who: Kid, mood: Mood): Look {
    const sheet = who === 'nina' ? NINA_SHEET : FRIENDS_SHEET
    const cell = LOOKS[who][mood] ?? LOOKS[who][FIRST_MOOD[who]] ?? 0
    return { sheet, cell }
}

export const THING_LOOK: Record<Thing, Look> = {
    diaryOpen: { sheet: THINGS_SHEET, cell: 0 },
    diaryClosed: { sheet: THINGS_SHEET, cell: 1 },
    cake: { sheet: THINGS_SHEET, cell: 2 },
    drawing: { sheet: THINGS_SHEET, cell: 3 },
    key: { sheet: THINGS_SHEET, cell: 4 },
    trash: { sheet: THINGS_SHEET, cell: 5 },
    coin: { sheet: THINGS2_SHEET, cell: 0 },
    poster: { sheet: THINGS2_SHEET, cell: 1 },
    spam: { sheet: THINGS2_SHEET, cell: 2 },
    list: { sheet: THINGS2_SHEET, cell: 3 },
    stranger: { sheet: THINGS2_SHEET, cell: 4 },
}


export const APP_CELL: Record<AppId | 'flashlight' | 'map', number> = {
    camera: 0,
    gallery: 1,
    chat: 2,
    pet: 3,
    music: 4,
    settings: 5,
    flashlight: 6,
    map: 7,
}

export const ADULT_CELL: Record<Adult, number> = { prof: 0, mae: 1, vovo: 2 }

export const cellKey = (index: number) => `c${index}`

const ALPHA = 40

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
        let tallest = 0
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
            tallest = Math.max(tallest, box[3])
            if (texture.has(cellKey(i))) continue
            texture.add(cellKey(i), 0, box[0], box[1], box[2], box[3])
            if (!sheet.pin) continue
            let sum = 0
            let count = 0
            for (let y = Math.round(box[1] + box[3] * 0.8); y < box[1] + box[3]; y++)
                for (let x = box[0]; x < box[0] + box[2]; x++) {
                    if (pixels[(y * width + x) * 4 + 3] <= ALPHA) continue
                    sum += x
                    count += 1
                }
            const px = count ? (sum / count - box[0]) / box[2] : 0.5
            ;(texture.get(cellKey(i)).customData as { px?: number }).px = px
        }
        ;(texture.customData as SheetData).ref = tallest
    })
}

export interface SheetData {
    ref?: number
}

export function refOf(textures: Phaser.Textures.TextureManager, sheet: Sheet): number {
    return (textures.get(sheet.key).customData as SheetData).ref ?? sheet.cellH
}

export function pinOf(textures: Phaser.Textures.TextureManager, sheet: Sheet, cell: number): number {
    const frame = textures.getFrame(sheet.key, cellKey(cell))
    return (frame?.customData as { px?: number } | undefined)?.px ?? 0.5
}
