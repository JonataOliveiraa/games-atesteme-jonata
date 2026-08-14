export const C = {
    night: 0x1b2b46,
    nightSoft: 0x27405f,
    nightDeep: 0x111e33,

    wood: 0x8a5a35,
    woodDark: 0x5f3c22,
    cork: 0xc99a5f,
    corkDark: 0x9a713f,

    paper: 0xfaf6e8,
    paperSoft: 0xece5cf,
    paperEdge: 0xd6cbaa,
    white: 0xffffff,

    ink: 0x22344f,
    inkSoft: 0x5a7085,
    border: 0xb9c4d2,
    grey: 0x93a2b4,
    greySoft: 0xdde4ec,

    teal: 0x2aa6a1,
    tealDark: 0x1a6f6c,
    tealSoft: 0xc6ece9,

    blue: 0x3d7fd6,
    blueDark: 0x24548f,
    blueSoft: 0xd3e4fa,

    amber: 0xefa525,
    amberDark: 0xb2740c,
    amberSoft: 0xfceccb,

    green: 0x3faf62,
    greenDark: 0x27793f,
    greenSoft: 0xcdeed6,

    coral: 0xe0603f,
    coralDark: 0xa73f26,
    coralSoft: 0xfad9cf,

    violet: 0x8a6ed0,
    violetDark: 0x5f479b,
    violetSoft: 0xe0d7f7,

    gold: 0xf2c744,
    goldDark: 0xb08c14,

    shadow: 0x0b1424,
} as const

export const A = {
    veil: 0.36,
    shadow: 0.22,
    gloss: 0.26,
    overlay: 0.78,
    idle: 0.45,
    ghost: 0.32,
} as const

export const FONT = {
    black: 'Arial Black, Arial',
    body: 'Arial',
} as const

export const TEX = {
    central: 'bg-central-missoes',
    box: 'caixa-modulos',
} as const

export const MISSION_TEX: Record<string, { before: string; after: string }> = {
    cafe: { before: 'missao-cafe-antes', after: 'missao-cafe-depois' },
    festa: { before: 'missao-festa-antes', after: 'missao-festa-depois' },
    feira: { before: 'missao-feira-antes', after: 'missao-feira-depois' },
    acampamento: { before: 'missao-acampamento-antes', after: 'missao-acampamento-depois' },
}

export const TRACK_LABEL: Record<'voce' | 'colega', string> = {
    voce: 'VOCÊ',
    colega: 'COLEGA',
}

export const TRACK_COLOR: Record<'voce' | 'colega', number> = {
    voce: C.teal,
    colega: C.violet,
}

export const BLOCK_COLORS = [C.blue, C.amber, C.green, C.coral, C.violet, C.teal] as const

export const SCORE_LABEL = {
    completo: 'Nada ficou de fora',
    limpo: 'Tudo no lugar certo',
    rapido: 'Plano rápido',
    reuso: 'Reaproveitou pronto',
} as const

export const SCORE_COLOR = {
    completo: C.green,
    limpo: C.blue,
    rapido: C.amber,
    reuso: C.violet,
} as const

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const blockColor = (i: number) => BLOCK_COLORS[i % BLOCK_COLORS.length]

export const minutesLabel = (n: number) => (n === 1 ? '1 minuto' : `${n} minutos`)