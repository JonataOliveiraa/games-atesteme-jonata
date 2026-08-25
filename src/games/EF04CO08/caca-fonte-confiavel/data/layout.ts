/**
 * Layout único da Caça à Fonte Confiável — 1280x720.
 *
 * ── A TELA É UMA TABELA DE COMPARAÇÃO ────────────────────────────────────
 *
 *   EM CIMA     A PERGUNTA — o que precisamos descobrir
 *   NO MEIO     AS PÁGINAS — duas, ou três no Nível 3
 *   EMBAIXO     ESCOLHER   — e, na revelação, o porquê
 *
 * Os cartões têm a MESMA anatomia, sempre, e as linhas ficam na mesma altura
 * em todos: endereço, ilustração, quem escreveu, quando, de onde tirou, e a
 * resposta que aquela página dá. É isso que permite comparar varrendo o olho
 * na horizontal, uma linha de cada vez — que é a coisa que a criança veio
 * fazer aqui. Cartão com altura própria por conteúdo tornaria a comparação
 * impossível.
 *
 * Por isso também não existe barra de critérios à parte: os quatro critérios
 * SÃO as quatro linhas, cada uma com o mesmo ícone em todos os cartões.
 */
export const W = 1280
export const H = 720

/**
 * O header ocupa a largura inteira, encostado no topo.
 *
 * Antes era a barra arredondada flutuando com margem dos quatro lados — a
 * mesma dos outros jogos do catálogo, e por isso todos tinham a mesma cara
 * antes mesmo de a criança olhar o que estava embaixo. Aqui ele é uma faixa de
 * ponta a ponta, sem cantos redondos, fechada por uma linha amarela e uma
 * sombra: parece a barra de uma janela de navegador, que é exatamente o mundo
 * em que este jogo se passa.
 */
export const HUD = {
    x: 0,
    y: 0,
    w: W,
    h: 82,
    cy: 42,
    /** A linha de acento que fecha o header por baixo. */
    linha: 3,

    pillX: 32,
    pillY: 22,
    pillW: 126,
    pillH: 40,

    dotsX: 182,
    dotsMaxW: 120,
    dotR: 7,

    titleX: 660,
    titleW: 460,

    helpX: 1224,
    helpR: 25,
}

/** A pergunta do caso, numa faixa com a lupa à esquerda. */
export const PERGUNTA = {
    x: 28,
    y: 92,
    w: W - 56,
    h: 62,
    r: 18,

    lupaX: 68,
    lupaR: 17,

    cx: 668,
    cy: 123,
    wrap: 1060,
}

/**
 * Os cartões de página.
 *
 * `w2` para os níveis de duas páginas e `w3` para o de três — o resto das
 * medidas de dentro é o mesmo, e sai da largura do cartão. Nada aqui é medido
 * a partir da borda esquerda da TELA: tudo é relativo ao centro do cartão, e é
 * por isso que o mesmo desenho serve para dois e para três.
 */
export const CARTAO = {
    cy: 360,
    h: 392,
    r: 16,

    w2: 470,
    gap2: 64,
    w3: 384,
    gap3: 24,

    /* ── barra de endereço, no topo ─────────────────────────────────── */
    barraY: -175,
    barraH: 42,
    /** As três bolinhas de janela de navegador, à esquerda. */
    bolhaDX: 22,
    bolhaGap: 14,
    bolhaR: 5,
    /** O selo com a letra da página (A, B, C), à direita. */
    letraDX: -26,
    letraR: 15,
    enderecoDX: 68,

    /* ── a ilustração do tema ───────────────────────────────────────── */
    temaY: -101,
    temaH: 98,
    temaPad: 14,

    /* ── as três linhas de critério ─────────────────────────────────── */
    linha1Y: -26,
    linhaGap: 44,
    linhaH: 40,
    iconeDX: 30,
    iconeR: 13,
    textoDX: 56,
    textoPadDir: 22,

    /* ── a resposta que a página dá ─────────────────────────────────── */
    respostaY: 134,
    respostaH: 80,
    respostaPad: 14,

    /**
     * O traço do marca-texto.
     *
     * Ele cobre a linha inteira de ponta a ponta, e não só o texto: grifar é um
     * gesto de varrer, e um traço que parasse na última letra pareceria uma
     * seleção de computador em vez de um marca-texto.
     */
    marcaPad: 16,
    marcaH: 30,
    marcaR: 6,

    hitPad: 4,
}

/** O botão de escolher, embaixo de cada cartão. */
export const ESCOLHER = {
    y: 598,
    h: 52,
    /** A largura sai da do cartão, menos uma folga de cada lado. */
    pad: 90,
}

/**
 * O carimbo da revelação.
 *
 * Ele cai EXATAMENTE em cima da ilustração, e não sobre as linhas: naquele
 * momento a criança precisa continuar vendo quem assinou e de onde a página
 * tirou — é ali que ela vai conferir se o veredito bate com o que ela grifou.
 * A ilustração já cumpriu o papel dela.
 */
export const CARIMBO = {
    y: -101,
    h: 98,
    pad: 12,
    r: 14,
    angulo: -5,
    palavraY: -122,
    veredictoY: -88,
}

/** O painel do porquê, que sobe por cima dos botões na revelação. */
export const EXPLICACAO = {
    x: 28,
    y: 566,
    w: W - 56,
    h: 130,
    r: 20,
    hiddenY: 740,

    textoX: 60,
    textoY: 631,
    textoWrap: 860,

    botaoCX: 1116,
    botaoCY: 631,
    botaoW: 244,
    botaoH: 58,
}

export const TOAST = {
    cx: W / 2,
    y: 320,
    hiddenY: 100,
    w: 840,
    h: 96,
    r: 22,
}
