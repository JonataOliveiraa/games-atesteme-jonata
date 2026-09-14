/**
 * A paleta do §2 do TEXTURAS.md, com uma regra que vale para o jogo inteiro:
 * as cores de laço são RESERVADAS ao código. O fundo não tem painel ciano nem
 * âmbar na faixa da ficha, para as molduras não perderem a hierarquia.
 *
 * E cor nunca decide sozinha: o laço de fora também se chama FORA e o de
 * dentro, DENTRO, escritos na moldura.
 */
export const C = {
    ink: 0x24334b,
    inkSoft: 0x53647a,
    white: 0xffffff,

    curtain: 0x334365,
    wall: 0x53647a,
    floor: 0xb9865d,
    warm: 0xf4d8a0,

    /** A ficha: o papel claro onde o algoritmo mora. */
    sheet: 0xfff8e8,
    sheetDeep: 0xe7dcc4,

    /** Laço de FORA: os refrões. */
    outer: 0x54b4d7,
    outerDeep: 0x2c7f9e,
    /** Laço de DENTRO: o movimento repetido. */
    inner: 0xf2bd58,
    innerDeep: 0xb5851f,

    select: 0x43b8d8,
    good: 0x4eaa78,
    goodDeep: 0x2f7553,
    /** TRAVA: o âmbar do erro. Nunca vermelho. */
    stall: 0xe59a52,
    stallDeep: 0xa96524,

    /** A lâmpada do nível 3. */
    lampOn: 0xffd463,
    lampOff: 0x6b7489,
}

export const CSS = {
    ink: '#24334b',
    inkSoft: '#53647a',
    white: '#ffffff',
    sheet: '#fff8e8',
    outer: '#2c7f9e',
    inner: '#7a5a12',
    stallInk: '#3c2a05',
    good: '#2f7553',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

/** O nome que a criança lê, por movimento. */
export const MOVE_NAME = {
    step: 'PASSO',
    clap: 'PALMA',
    spin: 'GIRO',
} as const

/** O nome da condição, escrito como a criança a lê na moldura. */
export const SIGNAL_NAME = {
    lightOff: 'A LUZ APAGAR',
    lightOn: 'A LUZ ACENDER',
} as const
