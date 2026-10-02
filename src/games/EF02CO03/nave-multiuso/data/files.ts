import type { Place, Tool } from '../types'

export const SHIP = 'nave'
export const PILOT = 'zuri'
export const PIECES = 'pecas'
export const CLOUD = 'nuvem'
export const STREAKS = 'rastros'

export const GROUND: Record<Place, string> = { earth: 'chao', space: 'espaco', moon: 'chao-lua' }
export const THINGS: Record<Place, string> = { earth: 'coisas', space: 'coisas-espaco', moon: 'coisas-lua' }
export const SCENERY: Record<Place, string> = { earth: 'cenario', space: 'cenario-espaco', moon: 'cenario-lua' }

export const THING_CELL: Record<Place, number> = { earth: 350, space: 420, moon: 420 }
export const SCENERY_CELL: Record<Place, number> = { earth: 300, space: 420, moon: 300 }
export const SCENERY_UNIT: Record<Place, number> = { earth: 256 / 300, space: 256 / 350, moon: 256 / 300 }

const PLACES: Place[] = ['earth', 'space', 'moon']

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [SHIP]: { frameWidth: 450, frameHeight: 600 },
    [PILOT]: { frameWidth: 550, frameHeight: 700 },
    [PIECES]: { frameWidth: 300, frameHeight: 300 },
    ...Object.fromEntries(PLACES.map(place => [THINGS[place], { frameWidth: THING_CELL[place], frameHeight: THING_CELL[place] }])),
    ...Object.fromEntries(PLACES.map(place => [SCENERY[place], { frameWidth: SCENERY_CELL[place], frameHeight: SCENERY_CELL[place] }])),
}

export const GROUND_TILE = { w: 1280, h: 1440 } as const

export const SHIP_CELL = { w: 450, h: 600, cx: 225, cy: 300, noseY: 34, tailY: 560, engineDX: 73 } as const

export const SHIP_FRAME: Record<Tool, number> = { blower: 0, water: 1, pull: 2 }

export const PILOT_CELL = { w: 550, h: 700, top: 153, bottom: 698, width: 490 } as const
export const PILOT_FRAME = { talk: 0, oops: 1, win: 2 } as const

export const THING_FRAME = {
    leaves: 0,
    clean: 1,
    fire: 2,
    saved: 3,
    sheep: 4,
    sheepFree: 5,
    soaked: 7,
    bigFire: 8,
    wetSheep: 9,
    dizzySheep: 10,
    leaf: 11,
} as const

export const PIECE = {
    blower: 0,
    water: 1,
    pull: 2,
    arrow: 3,
    drop: 4,
    sparkle: 5,
} as const

export const PIECE_SIZE = 300
