import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

export const C = {
    navy: 0x1b3a5c,
    navyDeep: 0x0f2438,
    navySoft: 0x35618c,

    sky: 0x8ecdf2,
    skyDeep: 0x4f9dcb,
    cream: 0xfbf0da,
    creamSoft: 0xfffaf0,

    orange: 0xef7c35,
    orangeDeep: 0xc9561c,

    green: 0x46b25a,
    red: 0xdd4a38,
    amber: 0xf2a341,
    gold: 0xffcf4d,

    grey: 0x8a98a6,
    greyDeep: 0x5b6874,

    white: 0xffffff,
    shadow: 0x000000,
} as const

export const CSS = {
    navy: '#1b3a5c',
    navyDeep: '#0f2438',
    cream: '#fbf0da',
    creamSoft: '#fffaf0',
    white: '#ffffff',
    orange: '#ef7c35',
    amberInk: '#5a3407',
    grey: '#7b8894',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    ask: 46,
    shelf: 30,
    card: 26,
    sign: 28,
    title: 26,
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
