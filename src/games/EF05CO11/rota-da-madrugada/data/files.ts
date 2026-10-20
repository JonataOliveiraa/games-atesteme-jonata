import type Phaser from 'phaser'
import type { DeviceId } from '../types'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cell: number
    cellH?: number
}

export const ICON_SHEET: Sheet = { key: 'icones', cols: 4, rows: 1, cell: 192 }
export const PROP_SHEET: Sheet = { key: 'cenario', cols: 3, rows: 1, cell: 384 }
export const HOUSE_SHEET: Sheet = { key: 'casas', cols: 3, rows: 2, cell: 384 }
export const DOG_SHEET: Sheet = { key: 'cachorro', cols: 3, rows: 1, cell: 256 }
export const CIDA_SHEET: Sheet = { key: 'dona-cida', cols: 2, rows: 1, cell: 256 }
export const ICON2_SHEET: Sheet = { key: 'icones2', cols: 4, rows: 1, cell: 192 }
export const PROP2_SHEET: Sheet = { key: 'cenario2', cols: 4, rows: 1, cell: 384 }
export const VILLAGE_SHEET: Sheet = { key: 'vila-longe', cols: 2, rows: 1, cell: 768, cellH: 384 }
export const COW_SHEET: Sheet = { key: 'vaca', cols: 3, rows: 1, cell: 256 }
export const TOW_SHEET: Sheet = { key: 'guincho', cols: 2, rows: 1, cell: 512 }

export const SHEETS = [ICON_SHEET, PROP_SHEET, HOUSE_SHEET, DOG_SHEET, CIDA_SHEET, ICON2_SHEET, PROP2_SHEET, VILLAGE_SHEET, COW_SHEET, TOW_SHEET]

export const SKY_KEY = 'ceu'
export const DASH_KEY = 'painel'
export const WHEEL_KEY = 'volante'
export const WIPER_KEY = 'limpador'
export const SKY2_KEY = 'ceu-serra'
export const MAP_KEY = 'mapa'

export const IMAGES = [SKY_KEY, DASH_KEY, WHEEL_KEY, WIPER_KEY, SKY2_KEY, MAP_KEY]

export const SIZES: Record<string, { w: number; h: number }> = {
    [SKY_KEY]: { w: 1280, h: 300 },
    [DASH_KEY]: { w: 1280, h: 200 },
    [WHEEL_KEY]: { w: 384, h: 384 },
    [WIPER_KEY]: { w: 512, h: 64 },
    [SKY2_KEY]: { w: 1280, h: 300 },
    [MAP_KEY]: { w: 768, h: 512 },
}

export const ICON_CELL: Record<DeviceId, { sheet: Sheet; cell: number }> = {
    buzina: { sheet: ICON_SHEET, cell: 0 },
    farol: { sheet: ICON_SHEET, cell: 1 },
    mensagem: { sheet: ICON_SHEET, cell: 2 },
    limpador: { sheet: ICON_SHEET, cell: 3 },
    gps: { sheet: ICON2_SHEET, cell: 0 },
    altofalante: { sheet: ICON2_SHEET, cell: 1 },
    mapa: { sheet: ICON2_SHEET, cell: 2 },
    radio: { sheet: ICON2_SHEET, cell: 3 },
}

export const PROP_CELL = { pole: 0, tree: 1, bush: 2 } as const
export type PropKind = keyof typeof PROP_CELL

export const HOUSE_CELL = { a: 0, b: 1, cida: 2 } as const
export type HouseKind = keyof typeof HOUSE_CELL
export const HOUSE_WINDOW: Record<HouseKind, { x: number; y: number }> = {
    a: { x: -65, y: -80 },
    b: { x: 36, y: -74.5 },
    cida: { x: 0.5, y: -157.5 },
}
export const houseFrame = (kind: HouseKind, lit: boolean) => cellKey(HOUSE_CELL[kind] + (lit ? HOUSE_SHEET.cols : 0))

export const DOG_CELL = { sleep: 0, awake: 1, run: 2 } as const
export type DogPose = keyof typeof DOG_CELL

export const PROP2_CELL = { pine: 0, sign: 1, tower: 2, barrier: 3 } as const
export type Prop2Kind = keyof typeof PROP2_CELL

export const COW_CELL = { calm: 0, startled: 1, walk: 2 } as const
export type CowPose = keyof typeof COW_CELL

export const TOW_CELL = { front: 0, back: 1 } as const

export const VILLAGE_CELL = { dark: 0, lit: 1 } as const

export const CIDA_CELL = { wave: 0, box: 1 } as const
export type CidaPose = keyof typeof CIDA_CELL

export const cellKey = (index: number) => `c${index}`

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const cw = source.width / sheet.cols
        const ch = source.height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            if (texture.has(cellKey(i))) continue
            const x = Math.round((i % sheet.cols) * cw)
            const y = Math.round(Math.floor(i / sheet.cols) * ch)
            texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
        }
    })
}
