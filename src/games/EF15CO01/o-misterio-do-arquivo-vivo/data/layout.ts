export const W = 1280
export const H = 720

export const DEPTH = {
    fundo: 0,
    prateleira: 20,
    buraco: 30,
    encaixada: 40,
    arquivista: 50,
    solta: 60,
    naMao: 70,
    faixa: 90,
    hud: 120,
    intro: 140,
} as const

export const HUD = {
    y: 34,
    dotsX: 44,
    dotStep: 32,
    helpX: W - 46,
    livesX: 160,
    livesY: 34,
} as const

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  TAMANHO É REGRA, NÃO GOSTO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A grade de 1280 encolhe para 30 % num celular de 390 px. Então **nada que a
 * criança precise ver fica abaixo de 130 px aqui** — 130 vira 40 px reais lá.
 *
 * E as folhas entregues preenchem ~90 % da célula de 256, então o número aqui
 * é quase todo desenho. Foi o contrário disso que deixou a versão anterior
 * ilegível.
 */
export const BAGUNCA = { y: 196, xIni: 330, xFim: 1170 } as const

/** O arquivista mora no canto de baixo à esquerda, e nada encaixa em cima dele. */
export const TUCA = { x: 142, y: 560, escala: 0.78 } as const

/**
 * A FILA: uma tábua com buracos, e as peças mantêm o tamanho delas.
 *
 * ── POR QUE OS TAMANHOS SÃO GEOMÉTRICOS, E NÃO LINEARES ──────────────────
 *
 * A primeira versão usava 96, 132, 168, 204, 240 — passo fixo de 36 px. O olho
 * não lê diferença, lê **proporção**: esse passo vale +37 % no começo e só
 * +17 % no fim, então o maior e o "mais maior" ficavam parecidos.
 *
 * Com `razao`, cada peça é sempre 33 % maior que a anterior, e o degrau é tão
 * visível no fim quanto no começo. `maior` é o teto: ele cabe dentro do
 * `buraco` com folga dos dois lados, então nenhuma peça vaza.
 */
export const FILA = {
    y: 556,
    buraco: 180,
    passo: 202,
    maior: 158,
    razao: 1.29,
    /** A seta de "cresce para cá", desenhada acima da tábua. */
    guiaY: 396,
} as const

/** O tamanho da peça `i` numa fila de `n`: a maior sempre chega em `FILA.maior`. */
export function tamanhoNaFila(i: number, n: number): number {
    return Math.round(FILA.maior / Math.pow(FILA.razao, n - 1 - i))
}

/** A grade: 3 × 3, com o bichinho na borda esquerda e a forma no alto. */
export const GRADE = {
    x: 772,
    y: 470,
    cel: 132,
    vao: 12,
    /** Onde ficam as etiquetas, para fora da moldura. */
    rotuloFora: 58,
    ficha: 116,
} as const

/** A bandeja de peças soltas, quando elas são muitas e do mesmo tamanho. */
export const BANDEJA = { y: 180, passo: 118, ficha: 104 } as const

/** A ficha: campos empilhados, rótulo à esquerda e o buraco à direita. */
export const FICHA = {
    x: 700,
    y: 486,
    larg: 470,
    campoH: 108,
    vao: 12,
    buraco: 92,
    rotulo: 74,
} as const

/** A teia: uma moldura com pontos, e um buraco no meio de cada fio faltando. */
export const TEIA = {
    x: 720,
    y: 468,
    larg: 520,
    alt: 340,
    no: 96,
    buraco: 92,
} as const

/**
 * O NÍVEL 3 PÕE DUAS ESTRUTURAS NA TELA.
 *
 * Elas encolhem e vão para as laterais. É a única hora do jogo em que a criança
 * escolhe **em qual** arrumar — que é o verbo da habilidade, e por isso ele só
 * chega depois de ela ter montado as quatro uma a uma.
 */
export const DUPLA = { esqX: 420, dirX: 950, escala: 0.62, y: 496 } as const
