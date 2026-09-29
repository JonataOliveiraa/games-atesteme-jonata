export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    cena: { frameWidth: 320, frameHeight: 320 },
    crianca: { frameWidth: 384, frameHeight: 384 },
    cartoes: { frameWidth: 256, frameHeight: 256 },
    'cartoes-2': { frameWidth: 256, frameHeight: 256 },
    'cena-2': { frameWidth: 320, frameHeight: 320 },
}

export const BG = 'bg-base'
export const SCENE = 'cena'
export const KID = 'crianca'
export const CARDS = 'cartoes'
export const BANNER = 'faixa'
export const CARDS2 = 'cartoes-2'
export const SCENE2 = 'cena-2'

export const SCENE_CELL = {
    rocketOpen: 0,
    rocketClosed: 1,
    pumpEmpty: 2,
    pumpFull: 3,
    flame: 4,
    smoke: 5,
    splash: 6,
    dust: 7,
    balloonFlat: 8,
    balloonFull: 9,
    basket: 10,
    stakes: 11,
    kiteGround: 12,
    kiteTied: 13,
    kiteFly: 14,
    controlBox: 15,
} as const

export const KID_CELL = {
    idle: 0,
    cheer: 1,
    run: 2,
    sooty: 3,
    oops: 4,
    wave: 5,
} as const

export const CARD_CELL = {
    fuel: 0,
    door: 1,
    button: 2,
    fill: 3,
    basket: 4,
    ropes: 5,
    knot: 6,
    run: 7,
    release: 8,
    card: 9,
    slot: 10,
    guideHand: 11,
} as const

export const CARD2_CELL = {
    count: 0,
    umbrella: 1,
    toothbrush: 2,
    icecream: 3,
    helmet: 4,
    climb: 5,
    tail: 6,
} as const

export const SCENE2_CELL = {
    umbrella: 0,
    toothbrush: 1,
    icecream: 2,
    helmet: 3,
    kiteBare: 4,
    kiteBareTied: 5,
} as const
