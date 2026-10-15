import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

/**
 * Fliperama à noite: fundo roxo-escuro, a tela do tablet quase preta, e três destaques — ciano (o raio
 * e a mira), rosa (os botões) e amarelo (o pixel aceso). O pixel apagado é um roxo fundo, nunca preto puro.
 */
export const C = {
    night: 0x17122b,
    screen: 0x100c20,
    grid: 0x0c0918,
    outline: 0x0b0818,
    panel: 0x241b45,
    panelTop: 0x2b2152,
    panelLight: 0x3a2d6c,
    panelDark: 0x1a1434,
    rim: 0x5b46a8,
    rimLight: 0x7c66cf,
    text: 0xf5f2ff,
    textSoft: 0xb9b0e0,
    lit: 0xffd23f,
    litLight: 0xfff2a8,
    litShade: 0xe0a21a,
    /** as luzes do RGB (vermelho, verde, azul e as misturas), só para as casas e os fujões coloridos */
    red: 0xff5a5a,
    green: 0x58e06a,
    blue: 0x5a86ff,
    magenta: 0xff5fd6,
    aqua: 0x5ff2e6,
    off: 0x2c2752,
    offLight: 0x423b78,
    offShade: 0x221e42,
    cyan: 0x3de0ff,
    cyanLight: 0xb4f6ff,
    cyanDark: 0x1a9fc2,
    pink: 0xff4fa0,
    pinkLight: 0xff9cc8,
    pinkDark: 0xc42f78,
    lime: 0x7ef06a,
    oops: 0xff8a3d,
    blush: 0xff7fb0,
    case: 0xcfc9ec,
    caseLight: 0xf0edff,
    caseShade: 0x9f97cf,
    hole: 0x0b0818,
    holeRim: 0x2a2150,
    holeMark: 0x8f86c0,
    tile: 0x1c1636,
    /** o balão da mensagem e os fujões-letra (N3) */
    paper: 0xfff4dc,
    paperShade: 0xe2d2b4,
    coder: 0x8e7cc3,
    coderLight: 0xb9a9ec,
    coderDark: 0x5b46a8,
    coderScreen: 0x0f0c1f,
    white: 0xffffff,
    shadow: 0x05030c,
} as const

export const CSS = {
    text: '#f5f2ff',
    textSoft: '#b9b0e0',
    cyan: '#3de0ff',
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const isDark = (tone: number) => {
    const r = (tone >> 16) & 0xff
    const g = (tone >> 8) & 0xff
    const b = tone & 0xff
    return 0.299 * r + 0.587 * g + 0.114 * b < 128
}

export const hex = (tone: number) => `#${tone.toString(16).padStart(6, '0')}`
