export const BG = 'bg-fabrica'
export const BELT_TILE = 'esteira'
export const STAMP_SHEET = 'carimbo'
export const PIECES = 'pecas'

export const SHEETS: Record<string, { frameWidth: number; frameHeight: number }> = {
    [STAMP_SHEET]: { frameWidth: 512, frameHeight: 386 },
    [PIECES]: { frameWidth: 300, frameHeight: 300 },
}

export const PIECE = {
    robot: 0,
    antenna: 1,
    ball: 2,
    stripes: 3,
    box: 4,
    hand: 6,
} as const

export const ART = {
    robot: { cx: 150, bottom: 290, h: 247 },
    antenna: { cx: 146.5, bottom: 283, h: 244 },
    ball: { cx: 143.5, cy: 156.5, w: 240 },
    stripes: { cx: 138, cy: 155.5, w: 247 },
    box: { cx: 151, bottom: 263, frontTop: 176, w: 295 },
    hand: { tipX: 76, tipY: 30 },
    stamp: {
        cx: 256,
        top: 35,
        bottom: 381,
        w: 430,
        window: { w: 110, h: 95 },
        windows: [
            [
                { x: 175.5, y: 214 },
                { x: 334, y: 212 },
            ],
            [
                { x: 126, y: 214 },
                { x: 252.5, y: 214 },
                { x: 379.5, y: 215 },
            ],
        ],
    },
    belt: { w: 2048, h: 768, slat: 250 },
} as const
