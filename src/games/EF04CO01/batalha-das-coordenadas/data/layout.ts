/**
 * Layout único da Batalha das Coordenadas — 1280x720.
 *
 * Duas colunas. A GRADE à esquerda, o PAINEL DO PIRATA à direita. Nada
 * atravessa a fronteira.
 *
 *   HUD      10–94
 *   GRADE    150–700, centrada em x=400
 *   PAINEL   x 800–1256
 */
export const W = 1280
export const H = 720

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 84,
    r: 26,
    cy: 52,

    pillX: 42,
    pillY: 32,
    pillW: 134,
    pillH: 40,

    dotsX: 202,
    dotsMaxW: 190,
    dotR: 8,

    titleX: 660,
    titleY: 40,
    titleW: 560,
    hintY: 70,
    hintW: 600,

    helpX: 1216,
    helpR: 27,
}

/**
 * A grade.
 *
 * `cell` é 118 porque quatro linhas mais os rótulos precisam caber entre 150 e
 * 700, e porque alvo de toque não desce disso: dedo de criança de 9 anos, com
 * `Scale.FIT` encolhendo tudo junto.
 *
 * A largura muda com o número de colunas (4 ou 5); a grade é sempre centrada em
 * `cx`, então trocar de tamanho não desloca o tabuleiro na tela.
 */
export const GRID = {
    cx: 400,
    top: 150,
    cell: 118,
    gap: 12,
    r: 18,
    /** Distância dos rótulos A B C D / 1 2 3 4 até a borda das células. */
    labelGap: 34,
    chestSize: 84,
    ringSize: 62,
    markSize: 58,
}

/** Coluna do pirata: quem fala, as pistas e o contador. */
export const PANEL = {
    cx: 1024,
    w: 440,

    piradaY: 238,
    pirataSize: 172,

    cardY: 452,
    cardW: 424,
    cardH: 214,
    cardR: 26,
    mapX: -166,
    mapSize: 62,
    clueX: -122,
    clueWrap: 300,

    /** O cartão da coordenada, no Nível 1: a letra e o número, enormes. */
    bigY: 452,
    bigW: 300,
    bigH: 150,
    bigR: 26,

    countY: 622,
}

export const TOAST = {
    y: 656,
    hiddenY: 790,
    w: 720,
    h: 74,
    r: 22,
}
