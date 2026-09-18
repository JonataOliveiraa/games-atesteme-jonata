import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

/**
 * As cores saíram de `GetPixel` no `bg-salao.png`, não do olho: a parede, a
 * madeira da mesa e o papelão da caixa são os valores da própria arte, para o
 * que é desenhado em `Graphics` pertencer à mesma sala.
 */
export const C = {
    wall: 0xfaf1d8,
    wallDeep: 0xf0e3c4,

    wood: 0xfac37c,
    woodMid: 0xcd8c51,
    woodDeep: 0x9c5f34,
    woodLine: 0x6b3818,

    box: 0xdba26a,
    paper: 0xf8e6c2,
    paperEdge: 0xe3cfa4,
    cream: 0xfffdf6,

    /** O marrom do contorno da arte. Nenhum preto puro no jogo. */
    ink: 0x3b2a1e,
    inkSoft: 0x6d5844,
    header: 0x4a3526,

    gold: 0xe0a526,
    goldDeep: 0xa87415,
    goldSoft: 0xf7dfa4,

    green: 0x4a9e52,
    greenSoft: 0xd8efd6,
    amber: 0xe08a1e,
    amberSoft: 0xfae3c2,

    white: 0xffffff,
    grey: 0xa89d8d,
    shadow: 0x000000,
} as const

const css = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const CSS = {
    ink: css(C.ink),
    inkSoft: css(C.inkSoft),
    cream: css(C.cream),
    paper: css(C.paper),
    white: css(C.white),
    gold: css(C.gold),
    goldDeep: css(C.goldDeep),
    green: css(C.green),
    amber: css(C.amber),
    grey: css(C.grey),
    header: css(C.header),
    woodDeep: css(C.woodDeep),
} as const

export const A = {
    /** O fundo tem de virar fundo sem parecer apagado. */
    veil: 0.3,
    blur: 0.35,
    shadow: 0.2,
    dim: 0.4,
} as const

export const FONT = FONT_JOGO.black
/** O bilhete do verso é letra de gente: corpo, em itálico, nunca a display. */
export const FONT_NOTE = FONT_JOGO.body

export const SIZE = {
    prompt: 30,
    hudLevel: 24,
    seal: 40,
    note: 24,
    /** A legenda do selo. Pequena, mas acima do piso de 17. */
    sealNote: 19,
    plaqueName: 38,
    piece: 46,
    sign: 27,
} as const

export const TYPE_MS = 24
