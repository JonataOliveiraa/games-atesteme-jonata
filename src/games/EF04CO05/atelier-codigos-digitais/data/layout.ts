/**
 * Layout único do Ateliê de Códigos Digitais — 1280x720.
 *
 * ── DUAS GRADES IGUAIS, LADO A LADO ──────────────────────────────────────
 *
 *   ESQUERDA   A ENCOMENDA — o que a máquina pediu
 *   DIREITA    SEU QUADRO  — o que você está fazendo
 *   EMBAIXO    A LEGENDA   — a regra do código desta oficina
 *
 * As duas grades têm a MESMA caixa, o mesmo centro vertical e a mesma altura
 * de linha. Sem isso a criança não conseguiria comparar linha com linha, que é
 * a coisa que ela veio fazer aqui.
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
    dotsMaxW: 200,
    dotR: 8,

    titleX: 660,
    titleY: 40,
    titleW: 440,
    hintY: 70,
    hintW: 520,

    /** A plaquinha das oficinas: as quatro, e a de agora acesa. */
    tabsCX: 1040,
    tabW: 62,
    tabH: 40,
    tabGap: 6,
    tabR: 12,

    helpX: 1216,
    helpR: 27,
}

export const QUESTION = { cx: 640, cy: 118, wrap: 1120 }

/**
 * A caixa das grades.
 *
 * ── A CAIXA É UM TETO, NÃO UM ALVO ───────────────────────────────────────
 *
 * A célula se ajusta para a grade CABER na caixa, mas nunca passa de
 * `maxCell`. Sem esse teto, um 3x3 esticava a célula até 108px e a grade de
 * três casas ficava do tamanho da de trinta e seis — enorme, e sem motivo.
 *
 * O teto também é o que segura o jogo no celular: com `Scale.FIT` num aparelho
 * deitado tudo cai para perto da metade, e célula de 60px vira 30px de dedo.
 * Menos que isso não se acerta; muito mais que isso não cabe duas grades lado
 * a lado. As letras têm teto próprio, maior, porque letra pequena não se lê.
 */
export const GRID = {
    box: 316,
    gap: 4,
    minCell: 38,
    maxCell: 64,
    /** Teto das grades de letra: `A` precisa de mais espaço que um `1`. */
    asciiCell: 92,
    r: 7,

    encomendaCX: 380,
    quadroCX: 900,
    cy: 344,

    /** A seta entre as duas grades: uma vira a outra. */
    arrowX: 640,
    arrowW: 54,

    labelY: 148,
    /**
     * O visto que acende ao lado da linha que já bate.
     *
     * 40px e não 26: a moldura da grade avança 14px para fora, e em 26 o visto
     * nascia montado em cima dela.
     */
    checkDX: 40,
    checkR: 13,
}

/**
 * A legenda, embaixo.
 *
 * A ficha é grande de propósito. No celular ela é o alvo mais tocado do jogo,
 * e 150x96 vira uns 75x48 reais — que é tamanho de polegar. A grade não tem
 * como ser assim, mas a legenda tem, então tem.
 */
export const LEGENDA = {
    barX: 20,
    barY: 528,
    barW: W - 40,
    barH: 172,
    barR: 22,

    titleY: 552,
    cy: 624,
    chipMaxW: 220,
    chipH: 96,
    chipR: 16,
    chipGap: 10,
    chipSpan: 1160,
    /** Dentro da ficha: a tinta em cima, o código embaixo. */
    swatchH: 52,
    swatchR: 10,
    codeDY: 32,
    hitPad: 8,
}

/** As quatro cartas de formato, no Nível 3. */
export const CARDS = {
    cy: 396,
    w: 240,
    h: 224,
    gap: 24,
    r: 20,
    nameDY: -74,
    resumoDY: -44,
    sampleDY: 34,

    /** A encomenda em palavras, acima das cartas. */
    pedidoY: 224,
    pedidoWrap: 900,
}

export const TOAST = {
    cx: 640,
    y: 620,
    hiddenY: 800,
    w: 820,
    h: 82,
    r: 22,
}
