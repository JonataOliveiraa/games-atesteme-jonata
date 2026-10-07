export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    towel: 2,
    bather: 10,
    running: 30,
    nina: 20,
    cabin: 20.5,
    dog: 40,
    fx: 45,
    board: 50,
    balloon: 70,
    veil: 80,
    card: 82,
    finale: 90,
    hud: 100,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

/** A prancheta dos dados: carinha do cachorro + até 3 fichas. */
export const BOARD = {
    x: 800,
    y: 128,
    w: 800,
    h: 96,
    dogX: -350,
    dogSize: 74,
    chipX0: -298,
    chipW: 214,
    chipH: 66,
    chipGap: 12,
    icon: 46,
} as const

export const SEA_Y = 205

/** Baias 0–5: linha de cima e depois a de baixo. `feet` é onde o banhista pisa. */
export const BAY = {
    xs: [485, 790, 1095],
    feet: [428, 664],
    batherH: 190,
    towelW: 200,
    towelH: 84,
    hitW: 270,
    hitTop: 196,
    hitBottom: 15,
} as const

export const NINA = { x: 150, feet: 360, h: 210 } as const
export const DOG = { x: 222, y: 690, size: 104 } as const
export const RADIO = { x: 140, y: 468, size: 100, labelY: 545, hitW: 190, hitH: 172 } as const

export const SAY_BOX = { x: 610, y: 232, w: 600, minH: 150, pad: 22 } as const

export const CARD = {
    x: 800,
    y: 420,
    w: 700,
    h: 420,
    titleY: -172,
    feetY: 20,
    portraitH: 176,
    chipsY: 70,
    lineY: 126,
    buttonY: 174,
    buttonW: 200,
    buttonH: 54,
} as const

export const FIN = {
    x: 640,
    y: 390,
    w: 1080,
    h: 560,
    headY: -205,
    rowY0: -120,
    rowGap: 128,
    chipX0: -490,
    chipW: 176,
    chipH: 52,
    arrowX: 140,
    portraitX: 300,
    portraitH: 104,
    lineY: 240,
} as const
