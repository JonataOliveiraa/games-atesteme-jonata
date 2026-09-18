export const C = {
    sky: 0x9fd9fd,
    ground: 0xd2cece,
    wall: 0x452f23,
    counter: 0x573622,

    ink: 0x1b1b1b,
    inkSoft: 0x4a4038,

    paper: 0xf7f2e6,
    paperEdge: 0xdcd3bf,
    cream: 0xfff8ea,

    mustard: 0xf2b705,
    mustardDeep: 0xc98f00,
    red: 0xe0524a,

    green: 0x3e9b4f,
    greenSoft: 0xd6efd9,
    amber: 0xe08a1e,
    amberSoft: 0xfae3c2,
    blue: 0x2c6fb5,
    blueSoft: 0xd7e7f7,

    white: 0xffffff,
    grey: 0x9a938c,
    greyDim: 0x6d6761,
    shadow: 0x000000,
} as const

const css = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const CSS = {
    ink: css(C.ink),
    inkSoft: css(C.inkSoft),
    cream: css(C.cream),
    paper: css(C.paper),
    white: css(C.white),
    mustard: css(C.mustard),
    green: css(C.green),
    amber: css(C.amber),
    blue: css(C.blue),
    grey: css(C.grey),
    greyDim: css(C.greyDim),
    wall: css(C.wall),
} as const

export const A = {
    veil: 0.46,
    shadow: 0.22,
    dim: 0.55,
} as const

export const FONT = '"DynaPuff Black", "Arial Black", Arial, sans-serif'

export const SIZE = {
    prompt: 42,
    name: 28,
    headline: 38,
    clue: 25,
    sign: 30,
    hudLevel: 26,
    ticker: 28,
} as const
