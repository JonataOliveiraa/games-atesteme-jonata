import type { MediumId } from '../types'

export const C = {
    ink: 0x1b2333,
    inkSoft: 0x4a5a70,
    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xdcc199,
    white: 0xffffff,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,
    warn: 0xffc42e,
    warnDark: 0xd99400,

    shirt: 0x3fa9f5,
    shirtDark: 0x1d7cc4,

    grass: 0x6fbf5a,
    grassDeep: 0x63ad51,
    grassEdge: 0x4e8f41,
    paint: 0xf2fbef,

    dust: 0xefe3c8,
    dustDeep: 0xcfbe99,

    voz: 0x5ed2e8,
    vozDark: 0x2a94ad,
    carta: 0xffa94d,
    cartaDark: 0xd4761f,
    celular: 0xb79bf0,
    celularDark: 0x7a4fd0,
}

export const CSS = {
    ink: '#1b2333',
    inkSoft: '#4a5a70',
    cream: '#fff6e4',
    white: '#ffffff',
    ok: '#2b8a44',
    bad: '#c03b30',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const MEDIUM_COLOR: Record<MediumId, { main: number; dark: number }> = {
    voz: { main: C.voz, dark: C.vozDark },
    carta: { main: C.carta, dark: C.cartaDark },
    celular: { main: C.celular, dark: C.celularDark },
}
