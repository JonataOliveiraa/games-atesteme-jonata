export const PLACES = 'lugares'
export const FINDS = 'achados'
export const SUBS = 'submarinos'
export const CLIENTS = 'clientes'
export const FILTERS = 'filtros'

export const CELL = 256
export const CLIENT_CELL = 350

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [PLACES]: { frameWidth: CELL, frameHeight: CELL },
    [FINDS]: { frameWidth: CELL, frameHeight: CELL },
    [SUBS]: { frameWidth: CELL, frameHeight: CELL },
    [CLIENTS]: { frameWidth: CLIENT_CELL, frameHeight: CLIENT_CELL },
    [FILTERS]: { frameWidth: CELL, frameHeight: CELL },
}

export const PLACE = { wreck: 0, cave: 1, reef: 2, chest: 3, shell: 4, amphora: 5, lighthouse: 6, rock: 7 } as const

export const SUB_FRAME = {
    yellow: { idle: 0, move: 1 },
    blue: { idle: 2, move: 3 },
} as const

export const BUBBLE_FRAME = { full: 4, pop: 5 } as const

export const POSE = { ask: 0, wait: 1, happy: 2, point: 3 } as const
export type Pose = keyof typeof POSE

export const clientFrame = (client: number, pose: Pose) => client * 4 + POSE[pose]

export const PLACE_ART = { foot: 244, width: 232, height: 214 } as const

export const SUB_ART = { width: 200, height: 120, nose: 100 } as const

export const CLIENT_ART = { foot: 324, height: 290 } as const

export const FILTER_FRAME: Record<string, number> = {
    tucano: 0,
    vulcão: 1,
    baleia: 2,
    foto: 3,
    vídeo: 4,
    texto: 5,
    desenho: 6,
    pelúcia: 7,
    chinelo: 8,
    maquete: 9,
    boia: 10,
    voando: 11,
    'de perto': 12,
    erupção: 13,
    parado: 14,
    pulando: 15,
    filhote: 16,
}
