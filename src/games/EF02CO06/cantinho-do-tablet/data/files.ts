export const BG = 'bg-quarto'
export const OBJECTS = 'objetos'
export const CAST = 'personagens'

export const OBJ_CELL = 350
export const CAST_CELL = 320
export const DRAWN_CELL = 320

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [OBJECTS]: { frameWidth: OBJ_CELL, frameHeight: OBJ_CELL },
    [CAST]: { frameWidth: CAST_CELL, frameHeight: CAST_CELL },
}

export const OBJ = {
    windowOpen: 0,
    windowShut: 1,
    table: 2,
    shelf: 3,
    tabletOk: 4,
    tabletWet: 5,
    tabletHot: 6,
    tabletBroken: 7,
    cup: 8,
    cupDown: 9,
    socket: 10,
    seal: 11,
} as const

export const POSE = {
    liaWait: 0,
    liaYay: 1,
    liaScared: 2,
    liaPoint: 3,
    catSit: 4,
    catJump: 5,
    catSniff: 6,
    catScared: 7,
    betoRun: 8,
    betoTrip: 9,
    betoWave: 10,
    betoOops: 11,
} as const

export const ART = {
    base: 322,
    table: { x: 177, top: 201, half: 166 },
    shelf: { x: 180, top: 172 },
    tablet: { x: 178 },
    cup: { x: 165 },
    socket: { x: 178, y: 183, plug: 292 },
    window: { x: 180, y: 183, sun: { x: 225, y: 125 } },
    castFoot: 316,
} as const

export const at = (x: number, y: number, cell = OBJ_CELL): [number, number] => [x / cell, y / cell]
