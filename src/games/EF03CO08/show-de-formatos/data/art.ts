import type { SoundId } from '../types'

export interface Box {
    x: number
    y: number
    w: number
    h: number
}

export const SHEET = {
    background: 'show-background',
    host: 'show-host',
    scenes: 'show-scenes',
    sounds: 'show-sounds',
}

export const HOST_SHEET = { frameWidth: 400, frameHeight: 550 }
export const SOUND_SHEET = { frameWidth: 300, frameHeight: 300 }

export const SCENE_GRID = { cols: 6, rows: 3, inset: 4 }

export const HOST_FRAME = { idle: 0, presenting: 1, dancing: 2, celebrating: 3 }
export const HOST_BOX: Box = { x: 38, y: 17, w: 334, h: 532 }

export const SOUND_FRAME: Record<SoundId, number> = { bells: 0, shaker: 1, drum: 2, claps: 3 }

export const SOUND_BOX: Record<SoundId, Box> = {
    bells: { x: 18, y: 48, w: 275, h: 215 },
    shaker: { x: 50, y: 35, w: 200, h: 252 },
    drum: { x: 34, y: 33, w: 228, h: 254 },
    claps: { x: 22, y: 56, w: 263, h: 190 },
}

export const SCENE_BOX: Box[] = [
    { x: 11, y: 10, w: 274, h: 218 },
    { x: 21, y: 23, w: 265, h: 210 },
    { x: 27, y: 10, w: 261, h: 236 },
    { x: 25, y: 36, w: 263, h: 207 },
    { x: 24, y: 39, w: 263, h: 202 },
    { x: 24, y: 26, w: 264, h: 225 },
    { x: 20, y: 29, w: 261, h: 206 },
    { x: 21, y: 24, w: 265, h: 215 },
    { x: 28, y: 41, w: 260, h: 208 },
    { x: 26, y: 9, w: 262, h: 240 },
    { x: 25, y: 32, w: 261, h: 191 },
    { x: 24, y: 35, w: 256, h: 214 },
    { x: 21, y: 24, w: 263, h: 230 },
    { x: 22, y: 14, w: 265, h: 240 },
    { x: 27, y: 23, w: 261, h: 237 },
    { x: 26, y: 25, w: 262, h: 219 },
    { x: 25, y: 25, w: 262, h: 226 },
    { x: 24, y: 39, w: 263, h: 222 },
]

export const cutAt = (index: number, total: number, count: number) => {
    const from = Math.round((index * total) / count)
    return { from, size: Math.round(((index + 1) * total) / count) - from }
}

export const soundFrame = (id: SoundId, active = false) => SOUND_FRAME[id] + (active ? 4 : 0)

export const fitInside = (box: Box, w: number, h: number) => Math.min(w / box.w, h / box.h)

export const TRACK: Record<SoundId, { period: number; beats: number[]; bars: number }> = {
    bells: { period: 1, beats: [0, 0.5], bars: 4 },
    shaker: { period: 0.5, beats: [0, 0.25], bars: 5 },
    drum: { period: 1, beats: [0, 0.5, 0.75], bars: 3 },
    claps: { period: 1, beats: [0, 0.18, 0.6], bars: 5 },
}
