export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4a5867,
    cream: 0xfff8ec,
    creamEdge: 0xefdfc4,
    white: 0xffffff,
    shadow: 0x000000,

    wall: 0xf7dfa8,
    floor: 0x8bc6b0,
    rug: 0xf06a6a,
    pet: 0x7cc7ff,

    wood: 0xa86b3c,
    woodDark: 0x7a4a25,
    woodLight: 0xc98a55,

    green: 0x3faa6d,
    greenLight: 0x8fe0ac,
    red: 0xe14b4b,
    redSoft: 0xffd9d5,
    amber: 0xffc857,
    amberDark: 0xd99a1f,
    blue: 0x4da3ff,
    heart: 0xf25f5c,

    speaker: 0x6b7cff,
    tablet: 0x2f3a4a,
    phone: 0xff7a59,
    watch: 0xffc857,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Corpo de texto para 1º ano: nada menor que 18px na tela de jogo. */
export const SIZE = {
    title: '22px',
    hudLevel: '23px',
    hudPhase: '20px',
    askLabel: '40px',
    askPhrase: '25px',
    nicheLabel: '20px',
    toast: '26px',
    albumTitle: '30px',
    albumLine: '22px',
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
