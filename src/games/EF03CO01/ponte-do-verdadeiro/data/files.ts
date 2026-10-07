import type { Item } from '../types'

export const BG = 'bg-riacho'
export const BRIDGE = 'ponte'
export const PARTS = 'outros'
export const CAST = 'bichinhos'

export const CAST_CELL = 300
export const PART_CELL = 400

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [CAST]: { frameWidth: CAST_CELL, frameHeight: CAST_CELL },
    [PARTS]: { frameWidth: PART_CELL, frameHeight: PART_CELL },
}

export const ITEM_COL: Record<Item, number> = { chapeu: 1, guardachuva: 2, balao: 3 }

export const CASTOR_ROW = 3

export const CASTOR_POSE = { talk: 12, yay: 13, worried: 14, point: 15 } as const

export const PART = { leverUp: 0, leverDown: 1, lock: 2 } as const

export const BG_SIZE = { w: 1672, h: 941 } as const

export const ART = {
    deck: {
        frame: { x: 0, y: 225, w: 900, h: 170 },
        hinge: { x: 845, y: 339 },
        ring: { x: 49, y: 290 },
        top: 318,
    },
    sign: {
        frame: { x: 15, y: 488, w: 875, h: 232 },
        face: { x: 92, y: 575, right: 797, bottom: 688 },
    },
    feet: [
        [149.5, 291], [155.5, 291], [119.5, 291], [112.5, 291],
        [137.5, 295], [158.5, 295], [126.5, 295], [122.5, 295],
        [147, 291], [157, 291], [120, 292], [126, 294],
        [138, 281], [151, 281], [136, 282], [137, 282],
    ] as [number, number][],
    lever: { feet: [221, 154] as number[], base: 397 },
    lock: { x: 202.5, y: 211 },
} as const

export const anchor = (frame: number): [number, number] => {
    const [x, y] = ART.feet[frame] ?? [CAST_CELL / 2, CAST_CELL]
    return [x / CAST_CELL, y / CAST_CELL]
}
