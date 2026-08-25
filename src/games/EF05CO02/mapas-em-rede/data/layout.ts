/**
 * Layout do Mapas em Rede — 1280x720.
 *
 * ── POR QUE ESTE ARQUIVO NASCEU ──────────────────────────────────────────
 *
 * O topo do jogo era três textos soltos com coordenadas absolutas escritas em
 * dois arquivos diferentes: o enunciado no meio, com quebra de 1120px, passava
 * por baixo do relógio e do botão `?`; a lista de pares ("Biblioteca — Praça")
 * media a própria largura por CHUTE (`texto.length * 9.5`) e, quando a conta
 * errava, o último par caía sozinho numa segunda linha em cima do mapa.
 *
 * Agora as duas cenas leem daqui, e as faixas do topo são três blocos com
 * limites declarados:
 *
 *   0..88     O HEADER, de ponta a ponta: nível, fases, enunciado, tempo, `?`
 *   ~108      O SUBTÍTULO, uma linha só (a regra da fase, ou a pergunta)
 *   106/132   A FAIXA DE TAREFA: os pares a ligar, ou o percurso a cumprir
 *   252       O TETO DOS NÓS — nada da faixa de tarefa pode passar daqui
 *
 * O último número é o que faltava: existia um limite, mas ninguém o escrevia,
 * então ninguém o respeitava.
 */
export const W = 1280
export const H = 720

/**
 * O header ocupa a largura inteira.
 *
 * Mesma decisão dos outros remakes: a barra flutuante com margem dos quatro
 * lados é o que fazia todos os jogos terem a mesma cara. Aqui a faixa vai de
 * ponta a ponta, fechada por uma linha azul.
 *
 * Os três blocos NÃO se sobrepõem, e é por isso que o enunciado agora tem
 * largura própria em vez de 1120: à esquerda o nível e as fases (24..232), à
 * direita a barra de tempo e o `?` (~945..1260), e o enunciado vive no vão
 * livre entre os dois.
 */
export const HUD = {
    h: 88,
    /** A linha de acento que fecha a faixa por baixo. */
    linha: 3,
    cy: 44,

    pillX: 24,
    pillY: 24,
    pillW: 118,
    pillH: 40,

    /** As bolinhas de fase, logo à direita da pílula. */
    dotsX: 160,
    dotGap: 22,
    dotR: 6,

    /** O enunciado, centrado no vão livre entre os dois blocos laterais. */
    instrCX: 588,
    instrW: 664,
    /** Ele encolhe até caber em duas linhas; nunca abaixo do último valor. */
    instrSizes: [24, 21, 18],
    instrMaxLinhas: 2,

    /** A barra de tempo (shared/hud/createTimeBar). */
    barCX: 1074,
    barW: 216,
    barH: 18,
    barIconDX: -128,
    barIconR: 12,

    helpX: 1234,
    helpS: 52,
}

/**
 * O subtítulo: a regra da fase, ou a pergunta da consulta.
 *
 * UMA linha. Ele encolhe para caber, e some de vez nas fases de rota — ali o
 * percurso já está desenhado em fichas logo abaixo, e repetir "Comece em Casa,
 * passe na Praça e termine na Escola" em texto corrido era dizer duas vezes a
 * mesma coisa, ocupando a linha que faltava para a faixa de tarefa.
 */
export const SUB = {
    y: 108,
    w: 1180,
    sizes: [18, 16, 15],
    maxLinhas: 2,
    /** Altura reservada quando ele existe, para a faixa de tarefa descer. */
    alturaUmaLinha: 24,
}

/**
 * A FAIXA DE TAREFA — a lista de pares, ou o percurso.
 *
 * `teto` é o contrato que faltava: os nós de cima moram em y=302 com raio 42,
 * ou seja o mapa começa em 260. Nada desta faixa pode cruzar 252.
 */
export const BANDA = {
    /** Onde a faixa começa, com e sem subtítulo. */
    comSub: 132,
    semSub: 106,

    maxLargura: 1180,
    /** O teto dos nós. Se a conta estourar isto, é bug de layout, não de dados. */
    teto: 252,

    /** A lista de pares do Nível 1. */
    chipH: 36,
    chipGap: 10,
    chipPadX: 20,
    /** O espaço do sinalzinho de "já liguei", à esquerda do texto. */
    chipMarcaDX: 26,
    chipMin: 140,
    /** O texto do par encolhe antes de a lista quebrar em mais uma linha. */
    chipSizes: [16, 15, 14],
    chipMaxLinhas: 2,
    tituloH: 22,

    /** A ficha de percurso do Nível 2. */
    fichaH: 38,
    fichaPadX: 18,
    fichaMin: 132,
    fichaGap: 0,
    setaW: 38,
    rotuloW: 104,
    stripPad: 12,
    stripSizes: [15, 14, 13],
}

/** A barra de baixo, onde ficam os botões. */
export const RODAPE = {
    top: 618,
    cy: 668,

    /** Confirmar, encostado na direita. */
    confirmX: 1140,
    confirmW: 220,
    confirmH: 54,

    /** As opções da consulta, centradas no que sobra à ESQUERDA do Confirmar. */
    opcoesCX: 580,
    opcaoW: 180,
    opcaoH: 54,
    opcaoGap: 16,

    custoX: 220,
    apagarX: 450,
    apagarW: 190,
}
