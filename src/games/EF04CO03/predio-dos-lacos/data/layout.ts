/**
 * Layout único do Prédio dos Laços — 1280x720.
 *
 * Duas colunas. O PRÉDIO à esquerda, o EDITOR DE BLOCOS à direita. Nada
 * atravessa a fronteira.
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

export const QUESTION = { cx: 400, cy: 126, wrap: 700 }

/**
 * A área onde o prédio cabe.
 *
 * O prédio cresce a partir do CHÃO: `bottom` é fixo e o topo sobe conforme os
 * andares. Prédio que cresce para baixo flutuaria no ar.
 */
export const SITE = {
    cx: 400,
    bottom: 686,
    top: 162,
    w: 660,
    pad: 22,
    roof: 22,
    gap: 8,
    /** Janela nunca maior que isso, ou um prédio de 1x4 vira um outdoor. */
    maxCell: 88,
    /** Nem menor: abaixo disso a sujeira não se distingue do vidro limpo. */
    minCell: 30,
}

/**
 * O limpador.
 *
 * Ele NÃO para em cima da janela: o vidro precisa ficar à vista para a criança
 * ver sujo virar limpo. Quem encosta na janela é o RODO — por isso a posição do
 * boneco é calculada a partir de onde a lâmina está DENTRO do desenho.
 *
 * Os offsets são frações da arte, não pixels: a arte encolhe junto com a janela
 * num prédio de dez andares, e o rodo continua caindo no mesmo lugar.
 */
export const CLEANER = {
    /** Altura da arte, presa ao tamanho da janela. */
    minH: 78,
    maxH: 112,
    /** A arte é 310x400; a caixa segue essa proporção. */
    ratio: 310 / 400,

    /** Onde a lâmina do rodo está dentro da arte (fração, a partir do centro). */
    bladeX: -0.345,
    bladeY: -0.19,
    /** Onde a corda prende no arnês. */
    ropeY: 0.1,

    /** Folga entre a borda da janela e a lâmina. */
    reach: 2,
    /** A roldana fica logo abaixo do HUD, senão a corda nasce fora da tela. */
    ropeTop: 108,

    /** Boneco de Graphics, quando as PNGs não estiverem na pasta. */
    w: 74,
    h: 58,
    /** No boneco desenhado o rodo aponta para a DIREITA. */
    fallbackBladeX: 37,
    fallbackBladeY: -3,
}

/**
 * O editor.
 *
 * ── TODO BLOCO TEM AS MESMAS TRÊS LINHAS ─────────────────────────────────
 *
 *      ▲  SUBIR UM ANDAR        ← o que ele faz (linha GRANDE)
 *      ● ● ● ○ ○                ← quantas vezes, em bolinhas
 *      [−]   3   [+]            ← o número
 *
 * A linha grande é a que MUDA entre os dois blocos. Antes o grande era
 * "REPITA" nos dois e a diferença ficava numa legenda de 17px: a criança via
 * a mesma palavra duas vezes e tinha que ler o miudinho para saber qual era
 * qual. Agora a palavra repetida é a pequena e a diferente é a que salta.
 *
 * O bloco de dentro é desenhado DENTRO do de fora, com recuo à esquerda. É a
 * única maneira de "aninhado" significar alguma coisa antes de a criança saber
 * a palavra.
 */
export const EDITOR = {
    cx: 1015,

    /* ── laço de FORA (níveis 2 e 3) — 108..470 ──────────────────────── */
    outerCY: 289,
    outerW: 452,
    outerH: 362,
    outerR: 26,
    /** As três linhas do de fora sobem: o de dentro ocupa o resto do bloco. */
    outerActionY: -139,
    outerPipsY: -103,
    outerStepY: -61,

    /* ── laço de DENTRO — 272..444 ───────────────────────────────────── */
    innerCY: 358,
    innerW: 380,
    innerH: 172,
    innerR: 20,
    innerDX: 16,

    /** Nível 1: um laço só, ocupando o lugar dos dois. */
    soloCY: 340,
    soloH: 240,

    /** As três linhas, medidas do centro do bloco. */
    actionY: -54,
    pipsY: -18,
    stepY: 26,

    /** Folga do buraco escuro em volta do bloco de dentro. */
    holePad: 8,

    /** Passo: [−] [ n ] [+] */
    stepGap: 16,
    stepR: 26,
    boxW: 148,
    boxH: 58,
    boxR: 18,
    /** A zona de toque é maior que o botão: dedo de criança erra o alvo. */
    stepHit: 74,

    /** Bolinhas de repetição: uma por volta do laço. */
    pipR: 7,
    pipGap: 26,
    pipMaxW: 330,

    /** Ícone à esquerda da linha grande. */
    iconR: 12,
    iconGap: 22,

    runY: 528,
    runW: 320,
    runH: 76,

    reportY: 610,
    reportWrap: 460,
}

export const TOAST = {
    y: 636,
    hiddenY: 790,
    w: 720,
    h: 74,
    r: 22,
}
