import type { Audience, DataKind } from '../types'

export interface Box {
    x: number
    y: number
    w: number
    h: number
}

export const SHEET = {
    room: 'suspect-room',
    ball: 'suspect-ball',
    photo: 'suspect-photo',
    destinations: 'suspect-destinations',
    data: 'suspect-data',
}

export const BALL_SHEET = { frameWidth: 350, frameHeight: 350 }
export const DEST_SHEET = { frameWidth: 300, frameHeight: 300 }
export const DATA_SHEET = { frameWidth: 300, frameHeight: 300 }

export const BALL_FRAME = { appearing: 0, flyA: 1, flyB: 2, impact: 3 }

export const BALL_BOX: Box[] = [
    { x: 44, y: 61, w: 268, h: 240 },
    { x: 47, y: 61, w: 264, h: 243 },
    { x: 52, y: 57, w: 258, h: 245 },
    { x: 48, y: 88, w: 265, h: 191 },
]

export const PHOTO_BOX: Box = { x: 35, y: 16, w: 433, h: 472 }

const DEST_FRAME: Record<Audience, number> = {
    teacher: 0,
    'closed-group': 1,
    'school-site': 2,
    public: 3,
    unknown: 3,
}

export const DEST_BOX: Box[] = [
    { x: 32, y: 30, w: 212, h: 261 },
    { x: 9, y: 47, w: 288, h: 195 },
    { x: 27, y: 56, w: 251, h: 201 },
    { x: 26, y: 59, w: 259, h: 188 },
    { x: 24, y: 13, w: 228, h: 277 },
    { x: 6, y: 61, w: 287, h: 233 },
    { x: 22, y: 45, w: 265, h: 216 },
    { x: 18, y: 56, w: 274, h: 201 },
]

const DATA_FRAME: Record<DataKind, number> = {
    address: 0,
    phone: 1,
    'live-location': 2,
    'school-routine': 3,
    'vehicle-plate': 4,
    'peer-image': 5,
    'peer-story': 6,
    'school-work': 7,
    preference: 8,
}

export const DATA_BOX: Box[] = [
    { x: 29, y: 46, w: 250, h: 212 },
    { x: 33, y: 52, w: 237, h: 198 },
    { x: 35, y: 19, w: 248, h: 250 },
    { x: 18, y: 33, w: 272, h: 233 },
    { x: 31, y: 67, w: 235, h: 189 },
    { x: 23, y: 61, w: 251, h: 200 },
    { x: 19, y: 47, w: 266, h: 217 },
    { x: 73, y: 53, w: 159, h: 213 },
    { x: 17, y: 55, w: 272, h: 209 },
]

export const destFrame = (audience: Audience, received = false) => DEST_FRAME[audience] + (received ? 4 : 0)

export const dataFrame = (kind: DataKind) => DATA_FRAME[kind]

export const fitInside = (box: Box, w: number, h: number) => Math.min(w / box.w, h / box.h)

export const originOf = (box: Box, frameW: number, frameH: number) => ({
    x: (box.x + box.w / 2) / frameW,
    y: (box.y + box.h / 2) / frameH,
})
