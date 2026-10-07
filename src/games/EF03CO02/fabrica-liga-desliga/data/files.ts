import type Phaser from 'phaser'

export const BG = 'bg-fabrica'
export const OVEN_SHEET = 'forno'
export const OVEN_BACK_SHEET = 'forno-entrada'
export const PIECES_SHEET = 'pecas'

type Box = [x: number, y: number, w: number, h: number]

export const OVEN_FRAME = {
    ovenLit: [26, 29, 551, 467] as Box,
    ovenOut: [630, 29, 549, 467] as Box,
}

export const PIECE_FRAME = {
    dough: [28, 78, 245, 214] as Box,
    cookie: [324, 91, 257, 199] as Box,
    tray: [603, 140, 308, 119] as Box,
    switchOff: [952, 50, 231, 253] as Box,
    switchOn: [36, 316, 231, 258] as Box,
    chef: [316, 315, 292, 282] as Box,
    iconFlame: [646, 338, 211, 241] as Box,
    iconBelt: [909, 373, 278, 190] as Box,
    iconTray: [10, 685, 285, 154] as Box,
    iconWhistle: [326, 654, 261, 207] as Box,
    broken: [621, 635, 262, 237] as Box,
    potFull: [911, 636, 283, 225] as Box,
    potHalf: [4, 961, 299, 223] as Box,
    potEmpty: [307, 958, 294, 226] as Box,
    iconPot: [623, 970, 267, 199] as Box,
}

export type PieceName = keyof typeof PIECE_FRAME

export const ART = {
    switchBox: {
        switchOff: { x: 116, bottom: 218 },
        switchOn: { x: 116, bottom: 252 },
    },
    switchLamp: {
        switchOff: { x: 165, y: 72 },
        switchOn: { x: 165, y: 95 },
    },
    switchLampR: 22,
    switchBoxW: 212,
    ovenWindow: { x: 279, y: 306 },
    ovenTunnelFloor: 378,
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
    add(OVEN_SHEET, OVEN_FRAME)
    add(OVEN_BACK_SHEET, OVEN_FRAME)
    add(PIECES_SHEET, PIECE_FRAME)
}
