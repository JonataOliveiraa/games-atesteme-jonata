/**
 * Layout único da Missão Ética Digital — 1280x720.
 *
 * ── TRÊS COISAS NA TELA, E SÓ ────────────────────────────────────────────
 *
 *   EM CIMA     A SITUAÇÃO — o que está acontecendo agora
 *   ESQUERDA    A FICHA    — o arquivo, e a etiqueta atrás dele
 *   DIREITA     AS AÇÕES   — três, grandes
 *   EMBAIXO     O PAINEL   — os quatro princípios, a partida inteira
 *
 * O painel nunca sai. Ele é o placar e o relatório ao mesmo tempo: no fim do
 * jogo não aparece nenhuma nota que a criança já não estivesse vendo crescer.
 */
export const W = 1280
export const H = 720

export const HUD = {
    x: 16,
    y: 10,
    w: W - 32,
    h: 76,
    r: 24,
    cy: 48,

    pillX: 40,
    pillY: 28,
    pillW: 130,
    pillH: 40,

    dotsX: 196,
    dotsMaxW: 190,
    dotR: 7,

    titleX: 700,
    titleY: 36,
    titleW: 520,
    hintY: 64,
    hintW: 620,

    helpX: 1214,
    helpR: 25,
}

/** A situação, numa faixa no alto. */
export const SITUACAO = {
    x: 28,
    y: 98,
    w: W - 56,
    h: 92,
    r: 20,

    cx: W / 2,
    cy: 144,
    wrap: 1140,
}

/**
 * A ficha do arquivo.
 *
 * Ela é o objeto central: a criança fica olhando para ela para decidir. Por
 * isso a arte entra em tamanho CHEIO, 230x264 sem redução — num prédio de
 * miniaturas a pergunta "tem gente nessa foto?" não teria resposta.
 */
export const FICHA = {
    cx: 300,
    cy: 400,
    w: 306,
    h: 400,
    r: 22,

    /* ── frente: a arte e o nome do arquivo ─────────────────────────── */
    arteCY: -36,
    /* Exatamente o tamanho do arquivo (230x264): a arte entra em escala 1.
     * Caixa maior faria o `fitImage` AMPLIAR a foto, e foto ampliada perde
     * justamente o detalhe do rosto que a criança precisa reconhecer. */
    arteW: 230,
    arteH: 264,
    nomeY: 130,
    nomeWrap: 268,
    tipoY: 158,

    /* ── verso: a etiqueta ──────────────────────────────────────────── */
    rotuloX: -118,
    autorRotuloY: -140,
    autorY: -112,
    permRotuloY: -32,
    permY: -4,
    avisoRotuloY: 76,
    avisoY: 104,
    textoWrap: 250,

    /** "Toque para virar" — o convite, sempre visível. */
    dicaY: 176,

    hitPad: 14,
}

/** As três ações, à direita. */
export const ACOES = {
    cx: 850,
    w: 600,
    h: 96,
    r: 20,
    gap: 20,
    primeiroCY: 268,
    textoWrap: 520,

    perguntaY: 216,
    perguntaWrap: 600,

    hitPad: 12,
}

/**
 * O impacto, no lugar exato onde estavam as ações.
 *
 * Ou o jogo te dá as opções, ou te dá a consequência da que você escolheu.
 * Um retângulo só para as duas coisas mantém o olho parado e evita a tela
 * crescer para caber mais um painel.
 */
export const IMPACTO = {
    cx: 850,
    cy: 372,
    w: 600,
    h: 300,
    r: 22,

    tituloY: 262,
    textoY: 306,
    textoWrap: 520,

    botaoY: 570,
    botaoW: 280,
    botaoH: 64,
}

/** O painel dos quatro princípios, embaixo. */
export const PAINEL = {
    x: 28,
    y: 616,
    w: W - 56,
    h: 88,
    r: 20,

    cy: 660,
    lampW: 290,
    lampH: 64,
    lampGap: 16,
    lampR: 14,
    nomeDY: -10,
    resumoDY: 14,
    /** A bolinha de aceso/alerta, à esquerda do nome. */
    bolaDX: -118,
    bolaR: 13,
}

export const TOAST = {
    cx: W / 2,
    y: 400,
    hiddenY: 120,
    w: 780,
    h: 96,
    r: 22,
}
