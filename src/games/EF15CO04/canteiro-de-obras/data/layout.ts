/**
 * A GRADE — 1280 × 720, `Phaser.Scale.FIT`.
 *
 * Uma tela só: o canteiro é o jogo inteiro, e o que muda é de onde a criança
 * está olhando. Não existe painel que abre, ficha, prateleira nem miniatura.
 *
 * A coluna mental "no celular" é o tamanho real num aparelho de 390 px
 * (fator 0,30): a tesoura dá 45 px, a peça no chão dá 51.
 */

export const W = 1280
export const H = 720

export const HUD = {
    h: 76,
    dotsX: 44,
    dotsY: 38,
    dotR: 11,
    dotGap: 30,
    livesX: 1052,
    livesY: 38,
    helpX: 1212,
    helpY: 38,
    helpR: 30,
    helpHit: 120,
} as const

/** O terreno. A coluna da direita fica livre para a Tuca. */
export const TERR = {
    x: 90,
    y: 276,
    w: 850,
    h: 252,
    cx: 515,
    cy: 402,
    radius: 18,
} as const

/** O corte: o alvo é o círculo da tesoura, de 150 px. */
export const CUT = {
    r: 75,
    hit: 150,
    /** Quanto os pedaços se afastam depois de partidos. */
    gap: 16,
} as const

/** A câmera de perto. O zoom sai da ALTURA, para não invadir o chão das peças. */
export const NEAR = {
    cx: 515,
    cy: 348,
    h: 330,
    wMax: 900,
} as const

/** As peças, soltas no chão de terra. Sem prateleira e sem etiqueta. */
export const GROUND = {
    cx: 515,
    cy: 628,
    size: 170,
    gap: 30,
    /** Cinco peças só acontecem no nível 2, e por escolha da criança. */
    sizeMany: 150,
    gapMany: 22,
    many: 5,
} as const

export const PIECE = {
    cell: 400,
    /** A peça no chão: 170 px na grade. */
    ground: 170 / 400,
    /** O fantasma dentro do lote. */
    ghost: 92 / 400,
} as const

export const TUCA = {
    cx: 1120,
    offX: 180,
    baseY: 672,
    scale: 0.52,
    h: 266,
} as const

export const DEPTH = {
    bg: 0,
    terrain: 10,
    piece: 40,
    veil: 62,
    fly: 70,
    hint: 74,
    tuca: 80,
    banner: 90,
    hud: 100,
    overlay: 200,
} as const
