/**
 * Layout único do Estúdio de Produção Digital — 1280x720.
 *
 * ── UMA DECISÃO POR TELA ─────────────────────────────────────────────────
 *
 * A primeira versão punha tudo junto: o pedido, quatro espaços vazios, a caixa
 * de ferramentas e o botão de publicar, ao mesmo tempo. Era informação demais
 * para 4º ano, ainda mais no celular — e nada dizia por onde começar.
 *
 * Agora o trabalho é uma TRILHA DE PASSOS, que é literalmente a "linha do
 * tempo de produção" do briefing da habilidade:
 *
 *      ① pedido → ② título → ③ imagem → ④ frase → ⑤ publicar
 *
 * Cada passo ocupa a tela inteira e pede UMA coisa. O que já ficou pronto
 * acende na trilha; o pedido continua embaixo, curto, porque toda escolha se
 * justifica nele.
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

    titleX: 620,
    titleY: 40,
    titleW: 520,
    hintY: 70,
    hintW: 620,

    /** A plaquinha das três mídias: a de agora acesa. */
    tabsCX: 1046,
    tabW: 74,
    tabH: 40,
    tabGap: 8,
    tabR: 12,

    helpX: 1216,
    helpR: 27,
}

/** A trilha de passos, logo abaixo do HUD. */
export const PASSOS = {
    cy: 132,
    r: 16,
    rNow: 21,
    /** Espaço máximo entre um passo e o outro. */
    gap: 128,
    maxW: 1000,
    lineH: 5,
    numSize: '17px',
}

/**
 * O título do passo, em cima do palco.
 *
 * 182 e não 206: em 206 ele caía exatamente na BORDA de cima do cartão do
 * pedido, e o cartão passava por cima da palavra.
 */
export const PALCO = {
    tituloY: 182,
    tituloWrap: 900,
}

/** O passo 1: o pedido, grande, antes de qualquer escolha. */
export const PEDIDO = {
    cx: 640,
    cy: 366,
    w: 720,
    h: 300,
    r: 24,

    /*
     * As medidas de dentro saem da BORDA de cima do cartão (216), e não de
     * números soltos. Antes o "pra quem" começava em 456 num cartão que
     * terminava em 506 — dois textos de 20px não cabem em 50 pixels, e o de
     * baixo vazava para fora da moldura.
     */
    textoY: 262,
    textoWrap: 624,
    dividerY: 392,
    quemLabelY: 416,
    quemY: 442,
    quemWrap: 624,

    botaoY: 592,
    botaoW: 300,
    botaoH: 84,
}

/** As opções de um passo: duas ou três cartas grandes, lado a lado. */
export const OPCOES = {
    cy: 396,
    w: 340,
    h: 268,
    gap: 24,
    r: 20,

    /** Opção de texto: a frase, grande e centrada. */
    textoWrap: 288,
    /** Opção de imagem: a foto em cima, o nome dela embaixo. */
    fotoCY: -22,
    fotoW: 210,
    fotoH: 186,
    fotoLabelY: 98,
    fotoLabelWrap: 296,

    hitPad: 12,

    /** O botão PULAR, para os passos opcionais. */
    pularY: 580,
    pularW: 220,
    pularH: 56,
}

/** A barra do pedido, embaixo, durante os passos de escolha. */
export const LEMBRETE = {
    x: 28,
    y: 620,
    w: W - 56,
    h: 84,
    r: 20,

    pedidoX: 60,
    pedidoY: 662,
    pedidoWrap: 660,

    quemX: 1220,
    quemY: 662,
    quemWrap: 400,
}

/**
 * A obra montada, no passo de publicar.
 *
 * As peças escolhidas uma a uma se juntam aqui pela primeira vez, empilhadas
 * dentro de uma moldura com a cara da mídia. É o "antes e depois" do briefing:
 * a criança decidiu por partes e vê o todo de uma vez.
 */
export const OBRA = {
    cx: 452,
    cy: 410,
    w: 440,
    h: 380,
    r: 20,
    pad: 26,
    /** Espaço entre uma peça e a outra, dentro da moldura. */
    gap: 14,
    /**
     * A caixa da foto: `fotoH` é TETO, não medida.
     *
     * A altura real sai do que sobra depois dos textos — é o que garante que a
     * pilha caiba na moldura mesmo num trabalho de quatro peças. `fotoMin` é o
     * piso: abaixo disso a foto vira um selo e deixa de mostrar qualquer coisa.
     */
    fotoW: 200,
    fotoH: 196,
    fotoMin: 96,
}

/** O botão de publicar, à direita da obra — no lugar onde os carimbos caem. */
export const PUBLICAR = {
    cx: 960,
    cy: 372,
    w: 320,
    h: 100,
}

/** Os três carimbos dos jurados. */
export const CARIMBOS = {
    cx: 960,
    /** Começa em 260 para o primeiro carimbo não bater no título do passo. */
    cyPrimeiro: 260,
    passo: 118,
    w: 320,
    h: 88,
    r: 16,

    vereditoY: 660,
    vereditoWrap: 1100,
}

/** As três cartas de mídia, no Nível 3. */
export const CARDS = {
    cx: 640,
    cy: 372,
    w: 300,
    h: 268,
    gap: 26,
    r: 20,
    nameDY: -92,
    resumoDY: -58,
    sampleDY: 6,
    recursosDY: 98,
}

export const TOAST = {
    cx: 640,
    y: 372,
    hiddenY: 130,
    w: 760,
    h: 100,
    r: 22,
}
