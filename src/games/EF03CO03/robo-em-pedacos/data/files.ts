import type { ModuleId, PointType } from '../types'

export const BG = 'bg-oficina'
export const MODULES = 'modulos'
export const POINTS = 'pontos'
export const NINA = 'nina'

export const MOD_CELL = 384
export const POINT_CELL = 192
export const NINA_CELL = { w: 384, h: 512 } as const

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [MODULES]: { frameWidth: MOD_CELL, frameHeight: MOD_CELL },
    [POINTS]: { frameWidth: POINT_CELL, frameHeight: POINT_CELL },
    [NINA]: { frameWidth: NINA_CELL.w, frameHeight: NINA_CELL.h },
}

export const MOD_FRAME: Record<ModuleId, { off: number; on: number }> = {
    head: { off: 0, on: 4 },
    body: { off: 1, on: 5 },
    arms: { off: 2, on: 6 },
    legs: { off: 3, on: 7 },
    shoes: { off: 8, on: 9 },
}

export const PLUG_FRAME = { off: 10, on: 11 } as const

export const POINT_ORDER: PointType[] = ['screw', 'wire', 'spring', 'gear', 'antenna', 'bulb', 'button', 'eye']
export const pointFrame = (type: PointType, loose: boolean) => POINT_ORDER.indexOf(type) * 2 + (loose ? 0 : 1)

export const NINA_FRAME = { talk: 0, cheer: 1, scared: 2, idle: 3 } as const

export interface ModuleArt {
    bottom: number
    top: number
    seat: number
    points: { x: number; y: number }[]
}

export const MODULE_ART: Record<ModuleId, ModuleArt> = {
    legs: {
        bottom: 311,
        top: 81,
        seat: 0,
        points: [
            { x: 113, y: 212 },
            { x: 255, y: 212 },
            { x: 185, y: 130 },
            { x: 118, y: 262 },
        ],
    },
    body: {
        bottom: 309,
        top: 85,
        seat: 46,
        points: [
            { x: 118, y: 222 },
            { x: 276, y: 208 },
            { x: 192, y: 160 },
            { x: 192, y: 278 },
        ],
    },
    head: {
        bottom: 308,
        top: 71,
        seat: 38,
        points: [
            { x: 192, y: 94 },
            { x: 160, y: 192 },
            { x: 292, y: 212 },
            { x: 252, y: 262 },
        ],
    },
    arms: {
        bottom: 297,
        top: 111,
        seat: 0,
        points: [
            { x: 80, y: 200 },
            { x: 304, y: 200 },
            { x: 192, y: 126 },
            { x: 80, y: 260 },
        ],
    },
    shoes: {
        bottom: 253,
        top: 142,
        seat: 0,
        points: [
            { x: 120, y: 200 },
            { x: 262, y: 200 },
            { x: 192, y: 220 },
            { x: 310, y: 210 },
        ],
    },
}

export const NINA_FOOT = 490
