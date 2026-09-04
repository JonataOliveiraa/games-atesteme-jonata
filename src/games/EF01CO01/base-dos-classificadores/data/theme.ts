import type { Color } from '../types'

export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4b5a6b,
    cream: 0xfff8ec,
    creamEdge: 0xe8dcc6,
    white: 0xffffff,
    shadow: 0x000000,

    sky: 0xbfe7ff,
    grass: 0x7fcb8a,
    grassDark: 0x5aa96a,
    leaf: 0x2f7a44,
    leafLight: 0x4f9e5c,
    trunk: 0xa86b3c,
    trunkDark: 0x6b4a2f,
    straw: 0xd8c49b,
    strawDark: 0x8a6a3f,
    sun: 0xffd88a,

    wood: 0xc9a06a,
    woodLight: 0xe0bd8b,
    woodDark: 0x7d5a34,

    red: 0xe14b4b,
    blue: 0x4da3ff,
    green: 0x2fbf71,
    yellow: 0xffc857,
    purple: 0x8b5cf6,

    amber: 0xffc857,
    amberDark: 0xd99a1f,
    ok: 0x2fbf71,
    okLight: 0x62dd9b,
} as const

export const STONE_TINT: Record<Color, number> = {
    vermelho: C.red,
    azul: C.blue,
    verde: C.green,
    amarelo: C.yellow,
    roxo: C.purple,
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

export const SIZE = {
    hudLevel: '23px',
    strip: '25px',
    help: '30px',
    toast: '26px',
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
