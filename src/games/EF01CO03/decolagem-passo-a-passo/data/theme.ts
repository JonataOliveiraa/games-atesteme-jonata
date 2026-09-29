import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    skyTop: 0x7fb6d9,
    skyLow: 0xf7d9a8,
    grass: 0x8cc071,
    grassDark: 0x5e9a4c,
    paper: 0xfff6e3,
    paperEdge: 0xe0cfa8,
    ink: 0x3b2a3f,
    inkSoft: 0x75627a,
    white: 0xffffff,
    gold: 0xffc94d,
    goldDark: 0xd99a1e,
    amber: 0xffa53a,
    amberDark: 0xd9761a,
    green: 0x5fbf6a,
    greenDark: 0x2f8a45,
    rocket: 0xf1ede6,
    rocketTrim: 0x6a8fd6,
    fuel: 0x6a7ff0,
    smoke: 0xd9d6e0,
    flame: 0xffb03a,
    balloon: 0xf28fb0,
    balloonStripe: 0xffd166,
    wicker: 0xc88b4a,
    kite: 0x62c3e8,
    skin: 0xf6c9a0,
    shirt: 0x6a8fd6,
    hudBar: 0x3b2a3f,
    hudLine: 0xffc94d,
    pill: 0x8f6fc0,
    pillDark: 0x5f4a8f,
    pipIdle: 0xd8cfe6,
    shadow: 0x2a1d2e,
    pad: 0xc9cfd9,
    padDark: 0x6f7a8c,
} as const

export const CSS = {
    ink: '#3b2a3f',
    inkSoft: '#75627a',
    white: '#ffffff',
    count: '#ffffff',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    label: 22,
    count: 150,
    hudLevel: 20,
} as const
