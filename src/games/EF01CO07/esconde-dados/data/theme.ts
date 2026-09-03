export const C = {
    ink: 0x1f2a37,
    inkSoft: 0x4b5a6b,
    cream: 0xfff8ec,
    creamEdge: 0xe8dcc6,
    white: 0xffffff,
    shadow: 0x000000,

    sky: 0xbfe7ff,
    skyDeep: 0x8fd4f7,
    grass: 0x7fcb8a,
    grassDark: 0x5aa96a,
    path: 0xf0dcae,
    pathEdge: 0xd6bd8a,

    /* Paleta do arbusto, igual à do quadro "escondido" de `crianca.png`: a
     * moita desenhada em Graphics e a que vem na sprite precisam ser o mesmo
     * mato, senão a criança escondida parece estar atrás de outra planta. */
    bush: 0x389630,
    bushLight: 0x5cad29,
    bushOutline: 0x001026,

    trunk: 0xa86b3c,
    fence: 0xc98a55,

    shirt: 0x4da3ff,
    shorts: 0xffb84d,

    safeGreen: 0x2fbf71,
    safeLight: 0x35d07f,
    curious: 0x8b8f98,
    avatar: 0x8b5cf6,

    light: 0xffd24d,
    lightSoft: 0xfff0b8,
    amber: 0xffc857,
    amberDark: 0xd99a1f,
    red: 0xe14b4b,
    redSoft: 0xffd9d5,
    steel: 0x9fb0c4,
    steelDark: 0x60728a,
    gold: 0xf5c542,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** Corpo de texto para 1º ano: nada menor que 18px na tela de jogo. */
export const SIZE = {
    hudLevel: '23px',
    hudPhase: '20px',
    cardLabel: '22px',
    cue: '30px',
    toast: '26px',
    albumTitle: '30px',
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
