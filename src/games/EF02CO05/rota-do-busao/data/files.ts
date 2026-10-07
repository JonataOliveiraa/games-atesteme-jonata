import type Phaser from 'phaser'
import type { RiderId, SceneryId, SituationId } from '../types'

export const BG = 'bg-rua'
export const RIDERS_SHEET = 'passageiros'
export const SITUATIONS_SHEET = 'situacoes'
export const SCENERY_SHEET = 'cenario'
export const BUS_SHEET = 'onibus'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {}

type Box = [x: number, y: number, w: number, h: number]

export const RIDER_FRAME: Record<RiderId, Box> = {
    clock: [26, 37, 199, 211],
    fridge: [299, 20, 182, 231],
    speaker: [544, 38, 208, 214],
    phone: [826, 30, 168, 223],
    tv: [7, 266, 234, 186],
    microwave: [246, 289, 226, 160],
    computer: [534, 310, 211, 196],
    projector: [789, 373, 226, 133],
    camera: [7, 573, 243, 193],
    cardMachine: [306, 514, 177, 231],
    scale: [540, 579, 221, 184],
    trafficLight: [844, 535, 128, 230],
    pencil: [68, 783, 117, 239],
    wateringCan: [263, 837, 248, 186],
}

export const SITUATION_FRAME: Record<SituationId, Box> = {
    time: [7, 7, 247, 245],
    iceCream: [261, 7, 248, 245],
    music: [514, 7, 247, 245],
    grandma: [769, 7, 246, 245],
    cartoon: [7, 258, 247, 249],
    soup: [261, 258, 248, 249],
    rollCall: [518, 258, 246, 249],
    story: [773, 260, 246, 250],
    photo: [7, 514, 247, 249],
    fare: [261, 514, 248, 249],
    fruit: [514, 514, 248, 249],
    cross: [773, 514, 246, 249],
    notebook: [7, 770, 247, 251],
    garden: [261, 770, 248, 251],
}

export const SCENERY_FRAME: Record<SceneryId, Box> = {
    houseA: [13, 101, 331, 246],
    houseB: [410, 63, 259, 288],
    houseC: [709, 96, 338, 253],
    tree: [1124, 67, 230, 283],
    school: [0, 424, 345, 274],
    market: [389, 471, 293, 228],
    square: [727, 423, 306, 274],
    lamp: [1172, 425, 135, 275],
}

export const BUS_FRAME = {
    bus: [22, 188, 517, 155] as Box,
    stop: [692, 125, 284, 226] as Box,
    wheel: [203, 474, 130, 128] as Box,
    terminal: [647, 478, 395, 218] as Box,
}

export const ART = {
    windows: [57, 109, 161, 213, 265, 317].map(x => ({ x, y: 58 })),
    windowSize: 40,
    door: { x: 349, y: 36, w: 56, h: 104 },
    wheels: [
        { x: 94, y: 148 },
        { x: 290, y: 148 },
    ],
    wheelSize: 76,
    sign: { x: 71, y: 60, w: 142, h: 52 },
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
    add(RIDERS_SHEET, RIDER_FRAME)
    add(SITUATIONS_SHEET, SITUATION_FRAME)
    add(SCENERY_SHEET, SCENERY_FRAME)
    add(BUS_SHEET, BUS_FRAME)
}

export const frameSize = (box: Box) => ({ w: box[2], h: box[3] })
