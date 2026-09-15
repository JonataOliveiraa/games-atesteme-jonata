import { FONT_JOGO } from '../../../../shared/fonts/gameFont'

/**
 * A paleta saiu do fundo entregue: parede creme, madeira quente, cortiça.
 *
 * Verde só quer dizer "entregue"; âmbar só quer dizer "o cliente comentou".
 * Nada aqui é vermelho: o bilhete é dica, e nunca bronca.
 */
export const C = {
    ink: 0x2a2233,
    inkSoft: 0x4a4055,

    wall: 0xf0e3cd,
    wallDeep: 0xdcc9ab,
    floor: 0xd9a86a,

    wood: 0x8a5f3c,
    woodTop: 0xa97a4f,
    woodLight: 0xc08e5c,

    cork: 0xc9a06a,
    paper: 0xfffaf0,
    paperShade: 0xe8ddc8,

    green: 0x4eaa78,
    greenDeep: 0x35805a,
    amber: 0xe59a52,
    amberDeep: 0xb9702c,
    blue: 0x4b8fe0,
    slate: 0x5c6472,
    white: 0xffffff,
} as const

export const CSS = {
    ink: '#2a2233',
    paper: '#fffaf0',
    wall: '#f0e3cd',
    white: '#ffffff',
    amber: '#e59a52',
    green: '#4eaa78',
} as const

export const A = {
    veil: 0.18,
    shadow: 0.25,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

/**
 * Os quatro passos do título, em px na grade.
 *
 * O passo 3 é o que a fase 1 pede e ele cabe no cartaz com folga; o passo 4
 * não cabe, e é essa a única punição para apertar tudo no máximo. Mexer em
 * qualquer um destes números pede conferir os dois limites na tela.
 */
export const TITLE_STEPS = [15, 26, 42, 74] as const
