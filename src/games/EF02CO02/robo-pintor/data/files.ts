export const BG = 'bg-quintal'
export const ROBOT = 'robo'
export const FENCE = 'cerca'
export const PIECES = 'pecas'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [ROBOT]: { frameWidth: 300, frameHeight: 300 },
    [FENCE]: { frameWidth: 256, frameHeight: 330 },
    [PIECES]: { frameWidth: 300, frameHeight: 300 },
}

export const ROBOT_CELL = { size: 300, foot: 297 } as const

export const POSE = {
    idle: 0,
    walk: 1,
    paint: 2,
    cheer: 3,
    oops: 4,
    puzzled: 5,
} as const

export type Pose = keyof typeof POSE

export const BOARD_CELL = { w: 256, h: 330, base: 329, top: 42, rails: [143, 252] } as const

export const PLANK = {
    raw: 0,
    painted: 1,
    post: 2,
} as const

export const PIECE = {
    card: 0,
    loop: 1,
    brush: 2,
    step: 3,
    catSleep: 4,
    catJump: 5,
    splat: 6,
    can: 7,
    hand: 8,
} as const

export const PIECE_SIZE = 300

export const HAND = { tipX: 77, tipY: 34 } as const
