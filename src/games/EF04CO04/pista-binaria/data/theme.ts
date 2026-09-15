/**
 * A paleta saiu dos PNGs de papel, não de um gerador de cores: túnel em azul
 * de papel, nave coral, máquina turquesa, papel creme.
 *
 * Regra que vale para o jogo inteiro: CHEIO e VAZIO nunca se separam por cor,
 * e sim por forma — papel colado contra buraco. A cor só diz de que material
 * a peça é.
 */
export const C = {
    navyDeep: 0x16223f,
    navy: 0x23406b,
    blue: 0x35789c,
    blueSoft: 0x4d8ab0,

    cream: 0xf6ecd4,
    creamDeep: 0xe3d3b0,
    creamShade: 0xc9b795,

    coral: 0xe8654f,
    coralDeep: 0xbf4a38,
    turquoise: 0x35b3a6,
    yellow: 0xf2b33d,

    ink: 0x2a2a33,
    white: 0xffffff,
    green: 0x4eaa78,
    amber: 0xe59a52,
    red: 0xd8503f,
} as const

export const CSS = {
    cream: '#f6ecd4',
    creamDeep: '#e3d3b0',
    ink: '#2a2a33',
    navyDeep: '#16223f',
    coral: '#e8654f',
    white: '#ffffff',
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
} as const
