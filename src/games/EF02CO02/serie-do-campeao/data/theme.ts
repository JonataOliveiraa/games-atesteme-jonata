import type { Move } from '../types'

export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4a5a70,
    white: 0xffffff,

    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xd9b884,

    wood: 0xa9663b,
    woodDark: 0x71401f,

    skin: 0xb8754a,
    hair: 0x3b2a22,
    shirt: 0x2dd4bf,
    shorts: 0xf59e0b,
    shoes: 0x4da3ff,

    blue: 0x4da3ff,
    blueDark: 0x2a6fc4,
    amber: 0xf59e0b,
    amberDark: 0xb46b00,

    teal: 0x2dd4bf,
    tealDark: 0x1a8f83,
    gold: 0xfacc15,
    goldDark: 0xb98a06,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,
}

export const CSS = {
    ink: '#1f2a37',
    inkSoft: '#4a5a70',
    white: '#ffffff',
    cream: '#fff6e4',
    bad: '#c03b30',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const MOVE_LABEL: Record<Move, string> = {
    jump: 'PULO',
    spin: 'GIRO',
}

export const MOVE_COLOR: Record<Move, { base: number; dark: number }> = {
    jump: { base: C.blue, dark: C.blueDark },
    spin: { base: C.amber, dark: C.amberDark },
}
