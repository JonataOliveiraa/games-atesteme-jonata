import type { Format, Payload, PieceType } from '../types'
import { PIXEL } from './theme'

export const BG = 'bg-sala'
export const ROBOTS = 'robos'
export const OBJECTS = 'objetos'
export const SCENERY = 'cenario'
export const SLINGSHOT = 'estilingue'

export const ROBOT_CELL = 320
export const OBJ_CELL = 350
export const SCENE_CELL = 256
export const SLING_CELL = 350

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [ROBOTS]: { frameWidth: ROBOT_CELL, frameHeight: ROBOT_CELL },
    [OBJECTS]: { frameWidth: OBJ_CELL, frameHeight: OBJ_CELL },
    [SCENERY]: { frameWidth: SCENE_CELL, frameHeight: SCENE_CELL },
    [SLINGSHOT]: { frameWidth: SLING_CELL, frameHeight: SLING_CELL },
}

export const FORMATS: Format[] = ['music', 'photo', 'text', 'video']

export const FACE = { idle: 0, open: 1, chew: 2, yuck: 3 } as const
export type Face = keyof typeof FACE

export const robotFrame = (format: Format, face: Face) => FACE[face] * 4 + FORMATS.indexOf(format)

export const OBJ = { sling: 0, prong: 1, pouch: 2, box: 3, cart: 4, cartFly: 5, plate: 6, crate: 7 } as const

export const ROBOT_ART = {
    foot: 304,
    top: 30,
    left: 60,
    right: 260,
    mouth: { dx: -20, y: 178 },
    belly: { w: 66, h: 40 },
    centerX: { music: 151, photo: 160, text: 160, video: 160 } as Record<Format, number>,
    bellyY: [250, 250, 252, 251, 250, 252, 256, 254, 254, 256, 260, 259, 247, 253, 252, 251],
} as const

export const SLING_FRAME = { back: 0, front: 1, pouch: 2 } as const

export const SLING_ART = {
    foot: 330,
    tipFront: { x: 140, y: 78 },
    tipBack: { x: 214, y: 66 },
    rest: { x: 178, y: 96 },
    pouch: { x: 175, y: 175 },
} as const

export const CART_ART = {
    w: 293,
    h: 253,
    window: { x: 166, y: 214, w: 211, h: 125 },
} as const

export const POUCH_ART = { x: 173, y: 208 } as const

export const PLATE_ART = { x: 176, y: 190 } as const

export const BOX_ART = { foot: 326, top: 150 } as const

export interface PieceArt {
    w: number
    h: number
    sheet: string
    cell: number
    box: { x: number; y: number; w: number; h: number }
}

export const PIECE: Record<PieceType, PieceArt> = {
    block: { w: 124, h: 72, sheet: SCENERY, cell: 0, box: { x: 3, y: 77, w: 249, h: 145 } },
    pillar: { w: 55, h: 150, sheet: SCENERY, cell: 1, box: { x: 80, y: 2, w: 93, h: 252 } },
    plank: { w: 220, h: 42, sheet: SCENERY, cell: 2, box: { x: 10, y: 114, w: 237, h: 45 } },
    stage: { w: 170, h: 112, sheet: SCENERY, cell: 3, box: { x: 6, y: 82, w: 245, h: 161 } },
    barrel: { w: 56, h: 90, sheet: SCENERY, cell: 4, box: { x: 52, y: 24, w: 141, h: 228 } },
    pipe: { w: 150, h: 55, sheet: SCENERY, cell: 5, box: { x: 4, y: 90, w: 249, h: 91 } },
    brick: { w: 62, h: 39, sheet: SCENERY, cell: 6, box: { x: 29, y: 80, w: 199, h: 126 } },
    crate: { w: 62, h: 62, sheet: OBJECTS, cell: 7, box: { x: 70, y: 76, w: 228, h: 216 } },
}

export const pieceFrame = (type: PieceType) => `piece-${type}`

export function formatOf(p: Payload): Format {
    if ('samples' in p) return 'music'
    if ('pixels' in p) return 'photo'
    if ('chars' in p) return 'text'
    return 'video'
}

const PALETTE = Object.keys(PIXEL)
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#@%&?!'

function raw(p: Payload): number[] {
    if ('samples' in p) return p.samples.map(s => Math.round(s * 97))
    if ('pixels' in p) return p.pixels.join('').split('').map(ch => (ch === '.' ? 3 : PALETTE.indexOf(ch) * 13 + 7))
    if ('chars' in p) return p.chars.map(ch => ch.charCodeAt(0))
    return p.frames.flat().join('').split('').map(ch => (ch === '.' ? 5 : PALETTE.indexOf(ch) * 11 + 3))
}

export function readAs(format: Format, p: Payload): Payload {
    const n = raw(p)
    const at = (i: number) => n[(i * 7 + 3) % n.length] + i * 31
    if (format === 'music') return { samples: Array.from({ length: 12 }, (_, i) => (at(i) % 10) / 10 + 0.08) }
    if (format === 'photo')
        return {
            pixels: Array.from({ length: 8 }, (_, r) =>
                Array.from({ length: 8 }, (_, c) => PALETTE[at(r * 8 + c) % PALETTE.length]).join(''),
            ),
        }
    if (format === 'text') return { chars: Array.from({ length: 5 }, (_, i) => LETTERS[at(i) % LETTERS.length]) }
    return {
        frames: Array.from({ length: 3 }, (_, f) =>
            Array.from({ length: 6 }, (_, r) =>
                Array.from({ length: 6 }, (_, c) => PALETTE[at(f * 36 + r * 6 + c) % PALETTE.length]).join(''),
            ),
        ),
    }
}
