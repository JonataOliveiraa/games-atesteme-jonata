import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    ink: 0x2a2233,
    inkSoft: 0x4a4055,

    city: 0xe7eef3,
    cityDeep: 0xc9d7e0,
    grass: 0xb9d8a3,
    river: 0x8ec9ea,
    block: 0xd8ccbc,

    disc: 0xfffaf0,
    discShade: 0xe4dbcb,

    rail: 0x55606e,
    railLight: 0x7b8798,
    tie: 0xa97a4f,
    ghost: 0x9aa9b8,

    blue: 0x4b8fe0,
    blueDeep: 0x2f6ab4,
    green: 0x4eaa78,
    greenDeep: 0x35805a,
    amber: 0xe59a52,
    amberDeep: 0xb9702c,
    red: 0xd1584f,
    white: 0xffffff,
} as const

export const CSS = {
    ink: '#2a2233',
    inkSoft: '#4a4055',
    city: '#e7eef3',
    disc: '#fffaf0',
    white: '#ffffff',
    amber: '#e59a52',
    amberDeep: '#b9702c',
    green: '#4eaa78',
} as const

export const A = {
    shadow: 0.22,
    ghost: 0.75,
    veil: 0.55,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
