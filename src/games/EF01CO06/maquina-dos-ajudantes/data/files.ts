import type { DeviceArt, DeviceId, Person, Pose } from '../types'

export const BG = 'bg-casinha'
export const MACHINE = 'maquina'
export const DEVICES = 'aparelhos'
export const PEOPLE = 'pessoas'
export const PIECES = 'pecas'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [DEVICES]: { frameWidth: 384, frameHeight: 384 },
    [PEOPLE]: { frameWidth: 384, frameHeight: 576 },
    [PIECES]: { frameWidth: 256, frameHeight: 256 },
}

export const MACHINE_ART = {
    w: 640,
    h: 980,
    slot: { x: 320, y: 679 },
    hatch: { x: 319, y: 814, w: 224, h: 134 },
} as const

export const DEVICE_CELL: Record<DeviceArt, number> = {
    clock: 0,
    speaker: 1,
    phone: 2,
    tablet: 3,
}

export const DEVICE_ART: Record<DeviceId, DeviceArt> = {
    clock: 'clock',
    lullaby: 'speaker',
    dance: 'speaker',
    phone: 'phone',
    tablet: 'tablet',
    'tablet-call': 'tablet',
}

export const DEVICE_CELL_SIZE = 384
export const TABLET_SCREEN = { x: 212, y: 180, w: 130, h: 190 } as const

export const PERSON_COL: Record<Person, number> = {
    sleeper: 0,
    baby: 1,
    'missing-grandma': 2,
    bored: 3,
    party: 4,
}

export const POSE_ROW: Record<Pose, number> = {
    before: 0,
    helped: 1,
    funny: 2,
}

export const PEOPLE_COLS = 5
export const PERSON_CELL = { w: 384, h: 576, foot: 560 } as const

export const personFrame = (person: Person, pose: Pose): number => POSE_ROW[pose] * PEOPLE_COLS + PERSON_COL[person]

export const PERSON_HEAD: Record<Person, { x: number; y: number }> = {
    sleeper: { x: 185, y: 235 },
    baby: { x: 191, y: 240 },
    'missing-grandma': { x: 192, y: 242 },
    bored: { x: 193, y: 211 },
    party: { x: 193, y: 277 },
}

export const PIECE_CELL = {
    gift: 0,
    notesParty: 1,
    notesLullaby: 2,
    heart: 3,
    bunny: 4,
    grandmaFace: 5,
    guideHand: 6,
} as const

export const PIECE_SIZE = 256

export const HAND = { tipX: 65, tipY: 19 } as const
