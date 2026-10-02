import type Phaser from 'phaser'
import type { ItemId } from '../types'

export const BG = 'bg-patio'
export const ITEMS_SHEET = 'itens'
export const TRAIN_SHEET = 'trem'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {}

type Box = [x: number, y: number, w: number, h: number]

export const ITEM_FRAME: Record<ItemId, Box> = {
    mouse: [23, 25, 270, 284],
    keyboard: [305, 77, 331, 213],
    speaker: [652, 49, 266, 257],
    gamepad: [943, 70, 298, 233],
    screen: [23, 345, 286, 272],
    camera: [331, 375, 301, 236],
    robot: [664, 324, 254, 304],
    game: [951, 345, 280, 272],
    music: [27, 646, 277, 268],
    paint: [340, 646, 273, 269],
    alarm: [643, 646, 274, 268],
    photos: [951, 646, 275, 268],
    dance: [26, 937, 279, 271],
}

export const PIECE_FRAME = {
    blade: [395, 930, 154, 287] as Box,
    signHand: [636, 1014, 288, 165] as Box,
    signOrders: [980, 950, 229, 254] as Box,
}

export const TRAIN_FRAME = {
    wagon: [5, 152, 340, 167] as Box,
    engine: [359, 70, 337, 257] as Box,
    link: [5, 549, 339, 123] as Box,
}

export const ART = {
    bladeRing: { x: 77, y: 25 },
    wagonFrontTop: 38,
    engineChimney: { x: 231, y: 5 },
} as const

export const frameKey = (name: string) => `f-${name}`

export function addFrames(textures: Phaser.Textures.TextureManager) {
    const add = (key: string, frames: Record<string, Box>) => {
        if (!textures.exists(key)) return
        const texture = textures.get(key)
        Object.entries(frames).forEach(([name, [x, y, w, h]]) => {
            if (!texture.has(frameKey(name))) texture.add(frameKey(name), 0, x, y, w, h)
        })
    }
    add(ITEMS_SHEET, { ...ITEM_FRAME, ...PIECE_FRAME })
    add(TRAIN_SHEET, TRAIN_FRAME)
}
