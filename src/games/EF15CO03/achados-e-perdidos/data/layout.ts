/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A GRADE — 1280 × 720, `Phaser.Scale.FIT`
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  A coluna "no celular" é o tamanho real num aparelho de 390 px (fator 0,30).
 *  Nada que a criança precise ver fica abaixo de 130 px nesta grade.
 *
 *  Três regiões, e só três: o bichinho à esquerda, o cartaz à direita, a mão
 *  embaixo. Não existe texto fixo além do `?`.
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
    /** O alvo do `?` é bem maior que o desenho: 120 px = 36 px reais. */
    helpHit: 120,
} as const

/** O balcão e o bichinho em cima dele. */
export const STAND = {
    cx: 390,
    /** O tampo, onde os pés pousam. */
    topY: 408,
    topW: 410,
    topH: 26,
    legH: 84,
} as const

/**
 * Uma escala só para a família (§4 do TEXTURAS.md): o tamanho é decidido em
 * código, nunca desenhado. `big` × `small` é a única diferença.
 *
 * `smallOf` vale 0,72 e não 0,86 por causa do CHAPÉU: um pequeno de chapéu
 * mede quase o mesmo que um grande sem chapéu, e a régua do nível 2 ficaria
 * ambígua justamente na fase que ela existe para resolver. Com 0,72 o maior
 * dos pequenos (175 px) e o menor dos grandes (228 px) não se encostam.
 */
export const CRITTER = {
    scale: 0.56,
    smallOf: 0.72,
} as const

/**
 * A régua. Ela é `Graphics` porque é GEOMETRIA QUE A REGRA LÊ: a marca e o pé
 * do bichinho saem da mesma conta que decide `é pequeno`. Num PNG de fundo ela
 * viraria um contrato de alinhamento para a arte cumprir.
 *
 * `markY` fica entre o maior dos pequenos e o menor dos grandes.
 */
export const RULER = {
    x: 552,
    baseY: 408,
    h: 268,
    w: 34,
    markY: 408 - 200,
} as const

/** A atendente fica ao lado do balcão, um pouco atrás dele. */
export const CLERK = {
    cx: 100,
    baseY: 470,
    scale: 0.44,
} as const

/**
 * O cartaz de ACHEI!, à direita. Ele tem DOIS tamanhos: com 2 campos sobra
 * lugar para o retrato do bichinho; com 3 e 4 o retrato sai e o corpo inteiro
 * vira grade. Retrato espremido entre quatro campos seria o quinto objeto de
 * uma coluna que já está cheia.
 */
export const POSTER = {
    x: 648,
    y: 96,
    w: 592,
    bandH: 74,
    /** Altura por número de campos. */
    hSmall: 348 as number,
    hBig: 404 as number,
    /** O retrato, só no layout de 2 campos. */
    portraitX: 728,
    portraitY: 320,
    portraitScale: 0.38,
} as const

/** Onde os campos moram, por quantidade. Uma conta só, e o voo da carta usa a mesma. */
export const FIELD_LAYOUT: Record<number, { size: number; spots: Array<{ x: number; y: number }> }> = {
    2: {
        size: 152,
        spots: [{ x: 908, y: 320 }, { x: 1088, y: 320 }],
    },
    3: {
        size: 140,
        spots: [{ x: 804, y: 335 }, { x: 944, y: 335 }, { x: 1084, y: 335 }],
    },
    4: {
        size: 136,
        spots: [
            { x: 866, y: 268 }, { x: 1022, y: 268 },
            { x: 866, y: 408 }, { x: 1022, y: 408 },
        ],
    },
}

/** A mão de três cartas. O alvo é a carta inteira. */
export const HAND = {
    cy: 614,
    cardW: 352,
    cardH: 176,
    xs: [248, 640, 1032],
    /** Quanto ela sobe e cresce para ser julgada, no próprio lugar. */
    liftY: 44,
    liftScale: 1.24,
} as const

/**
 * A carta de DOIS termos: uma fileira `[termo] [op] [termo]`, nunca uma frase
 * corrida. `NÃO TEM CHAPÉU E TEM ÓCULOS` numa linha só cairia para 18 px de
 * fonte — 5 px reais no celular. Na fileira, cada termo fica com a palavra
 * CURTA (`CHAPÉU`, `ÓCULOS`, `VERMELHO`) e o `NÃO` vira uma tarja vermelha em
 * cima do ícone.
 */
export const TERM = {
    boxW: 132,
    boxH: 140,
    gap: 10,
    opW: 52,
    opH: 52,
    iconSize: 54,
    /** y do ícone e da palavra, dentro da moldura do termo. */
    iconY: -6,
    wordY: 44,
    /** A tarja do NÃO, em cima do ícone — medida para não encostar nele. */
    tagY: -52,
} as const

export const DEPTH = {
    bg: 0,
    stand: 10,
    critter: 20,
    poster: 30,
    hand: 40,
    lifted: 60,
    hint: 70,
    hud: 100,
    overlay: 200,
} as const
