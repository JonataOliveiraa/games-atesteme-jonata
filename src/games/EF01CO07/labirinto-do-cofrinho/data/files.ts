export const BG = 'bg-jardim'
export const HEDGES = 'sebes'
export const BIA_SHEET = 'bia'
export const PEOPLE_SHEET = 'pessoas'
export const PIECES = 'pecas'
export const TEACHER_SHEET = 'professora'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [BIA_SHEET]: { frameWidth: 256, frameHeight: 256 },
    [PEOPLE_SHEET]: { frameWidth: 256, frameHeight: 256 },
    [TEACHER_SHEET]: { frameWidth: 256, frameHeight: 256 },
}

export const TEACHER_ART = {
    cell: 256,
    h: 248,
    wait: 0,
    react: 1,
    feet: [252, 252],
    cx: [128, 128],
} as const

export type PieceFrame =
    | 'magnetAwake'
    | 'magnetPull'
    | 'magnetSleep'
    | 'card'
    | 'photo'
    | 'home'
    | 'school'
    | 'sticker'
    | 'vaultClosed'
    | 'vaultOpen'
    | 'hand'

export const PIECE_BOX: Record<PieceFrame, [number, number, number, number]> = {
    magnetAwake: [26, 72, 289, 268],
    magnetPull: [351, 78, 346, 258],
    magnetSleep: [721, 73, 299, 268],
    card: [1063, 80, 324, 221],
    photo: [19, 387, 312, 288],
    home: [363, 398, 301, 271],
    school: [708, 408, 339, 261],
    sticker: [1107, 399, 256, 254],
    vaultClosed: [21, 761, 288, 279],
    vaultOpen: [359, 762, 338, 278],
    hand: [1109, 726, 242, 296],
}

export const MAGNET_ART = { h: 268, bodyW: 289 } as const
export const VAULT_ART = { bodyW: 288, bodyH: 279, doorX: 126, doorY: 146 } as const
export const HAND = { tipX: 30, tipY: 16 } as const
export const CARD_ART = {
    photo: { x: -99, y: -6 },
    name: { x: 69, y: -38 },
    home: { x: 16, y: 58 },
    school: { x: 126, y: 58 },
} as const

export const HEDGE_GRID = { cols: 4, rows: 2 } as const

export const HEDGE_CELL = {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
    niche: 4,
    stone: 5,
    flowers: 6,
    mushroom: 7,
} as const

export const HEDGE_ART = { w: 240, top: 24, bottom: 248, nicheTop: 16 } as const

export const BIA_CELL = {
    downA: 0,
    downB: 1,
    upA: 2,
    upB: 3,
    sideA: 4,
    sideB: 5,
    idle: 6,
    happy: 7,
    oops: 8,
    show: 9,
} as const

export const BIA_ART = {
    cell: 256,
    h: 244,
    feet: [255, 255, 254, 254, 251, 252, 251, 248, 249, 250],
    cx: [136.5, 125.5, 134, 124.5, 140, 130.5, 129, 128, 128, 121],
} as const

export const PEOPLE_COL = { mom: 0, dad: 1, neighbor: 2, mascot: 3 } as const

export const PEOPLE_ART = {
    cell: 256,
    h: 248,
    react: 4,
    feet: [255, 255, 252, 248, 255, 255, 253, 252],
    cx: [131.5, 134.5, 135.5, 138.5, 123.5, 127, 141.5, 139.5],
} as const
