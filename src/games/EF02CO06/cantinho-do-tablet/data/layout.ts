import { ART } from './files'

export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    window: 4,
    beam: 17,
    shelf: 8,
    socket: 9,
    cat: 10,
    table: 12,
    tablet: 14,
    cable: 15,
    cup: 16,
    actors: 20,
    fx: 30,
    glow: 34,
    seals: 40,
    balloon: 50,
    play: 60,
    veil: 70,
    hand: 72,
    finale: 80,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const WALL_Y = 528

export const WINDOW = { x: 215, y: 268, scale: 0.95, hit: { w: 310, h: 270 } } as const

export const TABLE = { x: 600, footY: 580, scale: 1.265 } as const
export const TABLE_TOP = TABLE.footY - (ART.base - ART.table.top) * TABLE.scale
export const TABLE_LEFT = TABLE.x - ART.table.half * TABLE.scale
export const TABLE_RIGHT = TABLE.x + ART.table.half * TABLE.scale

export const TABLET = {
    mid: 575,
    edge: 776,
    scale: 0.48,
    tilt: 7,
    hit: { w: 164, h: 136, dy: -62 },
    floorY: 702,
} as const

export const CUP = {
    offset: -138,
    scale: 0.34,
    hit: { w: 100, h: 120, dy: -48 },
} as const

export const SHELF = { x: 1012, y: 330, scale: 0.76 } as const
export const SHELF_TOP = SHELF.y + (ART.shelf.top - 175) * SHELF.scale

export const SOCKET = { x: 955, y: 466, scale: 0.3 } as const
export const PLUG = { x: SOCKET.x, y: SOCKET.y + (ART.socket.plug - ART.socket.y) * SOCKET.scale }

export const CABLE = {
    hit: { x: 905, y: 616, w: 200, h: 170 },
    risk: [
        { x: TABLE_RIGHT + 2, y: TABLE_TOP + 2 },
        { x: TABLE_RIGHT + 26, y: 560 },
        { x: TABLE_RIGHT + 54, y: 668 },
        { x: 912, y: 692 },
        { x: 968, y: 650 },
        { x: 962, y: 594 },
    ],
    safe: [
        { x: TABLE_RIGHT + 2, y: TABLE_TOP - 8 },
        { x: TABLE_RIGHT + 4, y: 520 },
        { x: TABLE_RIGHT + 12, y: WALL_Y + 4 },
        { x: 870, y: WALL_Y + 5 },
        { x: 920, y: WALL_Y + 5 },
        { x: 950, y: WALL_Y + 4 },
    ],
    clips: [862, 918],
    width: 7,
} as const

export const SUN = {
    beam: [292, 168, 362, 372, TABLE_RIGHT + 30, TABLE_TOP, TABLE_LEFT + 80, TABLE_TOP],
    disc: {
        x: WINDOW.x + (ART.window.sun.x - ART.window.x) * WINDOW.scale,
        y: WINDOW.y + (ART.window.sun.y - ART.window.y) * WINDOW.scale,
        r: 40,
    },
} as const

export const LIA = { x: 288, footY: 684, scale: 0.88 } as const
export const CAT = { x: 140, footY: 688, scale: 0.62, sniffDX: 30 } as const
export const BETO = { from: 1380, footY: 698, scale: 0.72, trip: 1000, bump: TABLE_RIGHT + 70, out: 1420 } as const

export const PLAY = { x: 1128, y: 656, w: 248, h: 88 } as const

export const FOCUS: Record<'cup' | 'cable' | 'edge' | 'sun', { x: number; y: number; zoom: number }> = {
    cup: { x: 700, y: 430, zoom: 1.15 },
    cable: { x: 900, y: 520, zoom: 1.18 },
    edge: { x: 760, y: 500, zoom: 1.22 },
    sun: { x: 480, y: 360, zoom: 1.12 },
}

export const BALLOON = { h: 62, minW: 260 } as const

export const BOARD = { x: 640, y: 372, w: 760, h: 470, row: 80 } as const
