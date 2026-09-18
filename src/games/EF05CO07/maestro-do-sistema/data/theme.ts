import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    cream: 0xf7efe1,
    paper: 0xfffaf0,
    curtain: 0x8c3b4a,
    plum: 0x3d2b3f,
    plumSoft: 0x5b4359,
    wood: 0xc98f52,
    woodDark: 0x8d5f33,
    gold: 0xe8b04b,
    goldDeep: 0xb9812a,

    teal: 0x3f8f8a,
    coral: 0xe2725b,
    violet: 0x7a6bbd,
    leaf: 0x6aa84f,

    ink: 0x2f2230,
    gray: 0x9a8fa6,
    red: 0xc2553f,
    green: 0x4f9d6a,

    noteOff: 0xcfc3b2,
    white: 0xffffff,
} as const

export const CSS = {
    ink: '#2f2230',
    cream: '#f7efe1',
    white: '#ffffff',
    gold: '#e8b04b',
} as const

export const A = {
    shadow: 0.26,
    veil: 0.55,
    grayed: 0.5,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
