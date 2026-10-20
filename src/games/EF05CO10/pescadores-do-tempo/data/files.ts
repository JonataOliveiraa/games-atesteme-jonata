import type Phaser from 'phaser'

export interface Sheet {
    key: string
    cols: number
    rows: number
    cellW: number
    cellH: number
}

export const FISHER_SHEET: Sheet = { key: 'pescadores', cols: 3, rows: 3, cellW: 256, cellH: 320 }
export const TALK_SHEET: Sheet = { key: 'pescadores2', cols: 4, rows: 2, cellW: 256, cellH: 320 }
export const FISH_SHEET: Sheet = { key: 'peixes', cols: 4, rows: 2, cellW: 192, cellH: 128 }
export const VILA_SHEET: Sheet = { key: 'vila', cols: 3, rows: 1, cellW: 320, cellH: 192 }
export const ICON_SHEET: Sheet = { key: 'icones', cols: 4, rows: 2, cellW: 128, cellH: 128 }
export const ICON2_SHEET: Sheet = { key: 'icones2', cols: 4, rows: 2, cellW: 128, cellH: 128 }
export const MARKET_SHEET: Sheet = { key: 'mercado', cols: 3, rows: 2, cellW: 256, cellH: 256 }
export const INVENT_SHEET: Sheet = { key: 'invencoes', cols: 3, rows: 2, cellW: 256, cellH: 256 }

export const SHEETS = [FISHER_SHEET, TALK_SHEET, FISH_SHEET, VILA_SHEET, ICON_SHEET, ICON2_SHEET, MARKET_SHEET, INVENT_SHEET]

export const BACKGROUNDS = ['margem-bisavo', 'margem-vovo', 'margem-hoje', 'margem-amanha']

export const IMAGES = [...BACKGROUNDS]

export const POSE = { idle: 0, throw: 1, cheer: 2 } as const

export const TALK = { buzio: 0, telefone: 1, audio: 2, voz: 3 } as const

export const BISNETA = { idle: 4, throw: 5, cheer: 6, cast: 7 } as const

export const FISH_FRAME = { small: 0, big: 2, school: 4, bottle: 5, spear: 6, buoy: 7 } as const

export const VILA_FRAME = { idle: 0, cheer: 1, phones: 2 } as const

export const MARKET = { jucaIdle: 0, jucaPhone: 1, jucaBusy: 2, biaBusy: 3, biaListen: 4, biaIdle: 5 } as const

export const INVENT = { robo: 0, roboFull: 1, bercario: 2, bercarioOpen: 3, drone: 4, tree: 5 } as const

export const ICON = {
    small: 0,
    big: 1,
    school: 2,
    party: 3,
    phone: 7,
    spear: 8,
    rod: 9,
    buzio: 10,
    vila: 11,
    mercado: 12,
    bisneta: 13,
    idea: 14,
    vovo: 15,
} as const

export const cellKey = (index: number) => `c${index}`

export const iconRef = (index: number) => ({ key: index < 8 ? ICON_SHEET.key : ICON2_SHEET.key, frame: cellKey(index % 8) })

export function addFrames(textures: Phaser.Textures.TextureManager) {
    SHEETS.forEach(sheet => {
        if (!textures.exists(sheet.key)) return
        const texture = textures.get(sheet.key)
        const source = texture.getSourceImage() as HTMLImageElement | HTMLCanvasElement
        const cw = source.width / sheet.cols
        const ch = source.height / sheet.rows
        for (let i = 0; i < sheet.cols * sheet.rows; i++) {
            const x = Math.round((i % sheet.cols) * cw)
            const y = Math.round(Math.floor(i / sheet.cols) * ch)
            if (!texture.has(cellKey(i))) texture.add(cellKey(i), 0, x, y, Math.floor(cw), Math.floor(ch))
        }
    })
}

export function cellScale(textures: Phaser.Textures.TextureManager, sheet: Sheet) {
    if (!textures.exists(sheet.key)) return 1
    const source = textures.get(sheet.key).getSourceImage() as HTMLImageElement | HTMLCanvasElement
    return sheet.cellW / (source.width / sheet.cols)
}
