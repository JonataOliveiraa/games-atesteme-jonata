import type { BoatPose, FishPose } from '../types'

export const BG = 'bg-lago'
export const BOAT_SHEET = 'barco'
export const FISH_SHEET = 'peixes'
export const PIECES = 'pecas'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [BOAT_SHEET]: { frameWidth: 512, frameHeight: 512 },
    [FISH_SHEET]: { frameWidth: 384, frameHeight: 384 },
    [PIECES]: { frameWidth: 320, frameHeight: 320 },
}

export const BOAT_CELL: Record<BoatPose, number> = {
    idle: 0,
    cast: 1,
    reel: 2,
    cheer: 3,
    oops: 4,
}

export const FISH_CELL = {
    swimA: 0,
    swimB: 1,
    hooked: 2,
    happy: 3,
    yuck: 4,
    gold: 5,
} as const

export const FISH_POSE: Record<FishPose, number> = {
    swim: FISH_CELL.swimA,
    hooked: FISH_CELL.hooked,
    happy: FISH_CELL.happy,
    yuck: FISH_CELL.yuck,
}

export const FISH_MARK: Record<number, { x: number; y: number }> = {
    [FISH_CELL.swimA]: { x: 192, y: 207 },
    [FISH_CELL.swimB]: { x: 201, y: 205 },
    [FISH_CELL.hooked]: { x: 196.5, y: 203.5 },
    [FISH_CELL.happy]: { x: 201, y: 197.5 },
    [FISH_CELL.yuck]: { x: 195, y: 201 },
}

export const FISH_BODY_W = 335
export const MARK_ART = 229
export const DRUM_ART = 249
export const BOARD_ART_W = 286
export const HOOK_ART = { h: 256, ringY: 32 } as const
export const BUCKET_ART = { w: 253, baseY: 279 } as const

export const PIECE_CELL = {
    board: 0,
    drum: 1,
    mark: 2,
    hook: 3,
    bucket: 4,
    sun: 5,
    littleFish: 6,
    banana: 7,
    rattle: 8,
    drop: 9,
    guideHand: 10,
} as const

export const HAND = { tipX: 81, tipY: 19 } as const
