import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

/**
 * Praça de bairro em neon chapado. O jogo irmão da mesma habilidade (Caça à
 * Fonte Confiável) é biblioteca à noite — este é o oposto, de propósito.
 *
 * Os dois botões são azul e roxo, nunca verde e vermelho: verde é acerto e
 * âmbar é erro neste catálogo, e um botão verde diria a resposta antes da hora.
 */
export const C = {
    ink: 0x1b1626,
    inkSoft: 0x3a3048,

    sky: 0x4ec3f5,
    band: 0xf45fb0,
    pavement: 0xf2ecff,
    counter: 0xffb03b,
    counterDeep: 0xe0761c,

    paper: 0xfffdf5,
    bubble: 0xdfe7f5,
    sign: 0xffe9a8,
    signDeep: 0xe5c97f,

    spread: 0x2f7dff,
    spreadDeep: 0x1f57b8,
    hold: 0xa44dff,
    holdDeep: 0x7434c4,

    green: 0x35d98a,
    greenDeep: 0x1f9e61,
    amber: 0xffb020,
    amberDeep: 0xc47b00,

    white: 0xffffff,
    slate: 0xb9c6d8,
} as const

export const CSS = {
    ink: '#1b1626',
    paper: '#fffdf5',
    white: '#ffffff',
    amber: '#ffb020',
    amberDeep: '#8a5500',
    green: '#0f7a4a',
    band: '#f45fb0',
} as const

export const A = {
    veil: 0.55,
    shadow: 0.22,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const
