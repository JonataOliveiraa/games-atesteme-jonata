export const KID = 'crianca'
export const STEPS = 'passos'
export const PIECES = 'pecas'
export const PROBLEM_SHEETS = ['problemas-1', 'problemas-2', 'problemas-3', 'problemas-4'] as const

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [KID]: { frameWidth: 384, frameHeight: 384 },
    [STEPS]: { frameWidth: 256, frameHeight: 256 },
    [PIECES]: { frameWidth: 320, frameHeight: 320 },
    ...Object.fromEntries(PROBLEM_SHEETS.map(key => [key, { frameWidth: 256, frameHeight: 256 }])),
}

export const KID_CELL = {
    idle: 0,
    climbA: 1,
    climbB: 2,
    slide: 3,
    oops: 4,
    cheer: 5,
} as const

export const PIECE_CELL = {
    rails: 0,
    rung: 1,
    rungHollow: 2,
} as const
