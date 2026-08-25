/**
 * Layout do Controlador do Sistema — 1280x720.
 *
 * ── O QUE ESTAVA ERRADO NA VERSÃO ANTERIOR ───────────────────────────────
 *
 * A tela tinha um pedido no meio e uma fileira de ícones embaixo, e mais nada.
 * Não havia o que enquadrar porque não havia máquina nenhuma: o "computador"
 * era um enunciado de texto. Ajustar o enquadramento daquilo seria centralizar
 * melhor um quiz.
 *
 * ── A TELA AGORA É UMA MESA DE CONTROLE, E ELA TEM ANDARES ───────────────
 *
 * De cima para baixo, e cada faixa responde uma pergunta diferente:
 *
 *   0..84     O HEADER            — em que nível estou, o que é para fazer
 *   90..142   A ESTABILIDADE      — como está a máquina no geral
 *   152..364  O HARDWARE          — o que existe, e o que está livre AGORA
 *   354..410  A MEMÓRIA           — quanto cabe, e quem está lá dentro
 *   418..588  A FILA DE PEDIDOS   — quem está pedindo, e há quanto tempo
 *   600..720  OS CONTROLES        — pausar, negar, e a voz do sistema
 *
 * A ordem não é decorativa: ela é a ordem em que a criança precisa olhar. O
 * pedido chega embaixo, o recurso está no meio, e a consequência aparece em
 * cima. O olho sobe.
 *
 * ── A MEMÓRIA APARECE E SOME ─────────────────────────────────────────────
 *
 * No Nível 1 não existe memória: os pedidos são todos de hardware, e uma barra
 * de blocos vazia ali embaixo seria um painel que não faz nada — a criança
 * tentaria tocar nele. Quando `fase.blocos` é zero a faixa não nasce, e o
 * hardware usa as duas faixas: peças MAIORES, mais no centro. São os dois
 * conjuntos de números abaixo (`PECAS.comMemoria` e `PECAS.semMemoria`), e não
 * um ajuste no olho na hora de desenhar.
 */
export const W = 1280
export const H = 720

/**
 * O header ocupa a largura inteira, como nos outros remakes.
 *
 * Os três blocos NÃO se sobrepõem — é o que faz o enunciado ter largura própria
 * em vez de "a tela toda": à esquerda o nível e as fases (24..282), à direita a
 * barra de tempo e o `?` (944..1258), e o enunciado no vão livre entre os dois.
 */
export const HUD = {
    w: W,
    h: 84,
    /** A linha de acento que fecha a faixa por baixo. */
    linha: 3,
    cy: 42,

    pillX: 24,
    pillY: 22,
    pillW: 118,
    pillH: 40,

    /** As bolinhas de fase, logo à direita da pílula. */
    dotsX: 162,
    dotsMaxW: 120,
    dotR: 6,

    /** O enunciado, centrado no vão livre entre os dois blocos laterais. */
    instrCX: 606,
    instrW: 560,
    instrMaxLinhas: 2,

    /** A barra de tempo (shared/hud/createTimeBar). */
    barCX: 1080,
    barW: 210,
    barH: 18,
    barIconDX: -124,
    barIconR: 12,

    helpX: 1232,
    helpR: 26,
}

/**
 * A ESTABILIDADE — o indicador que a ficha da habilidade pede.
 *
 * ── POR QUE SEGMENTOS, E NÃO UMA BARRA LISA ──────────────────────────────
 *
 * Uma barra lisa que encolhe responde "quanto sobra". Dez segmentos que apagam
 * respondem "quantos erros ainda cabem", que é a pergunta que a criança faz de
 * verdade. E dá para CONTAR: perdi dois, sobraram oito. Uma barra contínua não
 * dá para contar, e o que não dá para contar não dá para planejar.
 *
 * Ela mora numa faixa própria, larga, no alto — porque é a única coisa da tela
 * que fala do sistema INTEIRO. Tudo abaixo dela fala de uma peça só.
 */
export const ESTAB = {
    top: 90,
    h: 52,
    cy: 116,

    rotuloX: 28,
    /** A barra começa depois do rótulo e vai até a margem direita. */
    x: 156,
    w: 1096,
    barraH: 26,
    segmentos: 10,
    segGap: 6,
    r: 8,
}

/**
 * O HARDWARE — a fileira de peças.
 *
 * Cada peça é um SOQUETE quadrado com a arte dentro, um aro de estado em volta
 * e o nome embaixo. O aro é o que muda: verde livre, âmbar ocupado (e ele
 * esvazia, mostrando quanto falta), vermelho desligado.
 *
 * ── A ARTE CABE DENTRO DA FORMA ──────────────────────────────────────────
 *
 * `arte` é a fração do soquete que a imagem pode ocupar, e ela é menor que 1 de
 * propósito. O erro que já apareceu duas vezes neste projeto é desenhar a forma
 * pelo raio do aro e a imagem pelo tamanho natural dela: a imagem escapa da
 * forma, e nenhum ajuste de posição conserta isso. A imagem é encaixada por
 * `fitImage` na caixa `tile * arte`, sempre.
 */
export const PECAS = {
    gapMin: 22,

    /** Com a faixa de memória embaixo: peças menores, mais no alto. */
    comMemoria: {
        cy: 230,
        tile: 146,
        gap: 26,
    },
    /** Sem memória: as peças herdam a faixa vazia e crescem. */
    semMemoria: {
        cy: 250,
        tile: 178,
        gap: 30,
    },

    r: 22,
    /** Quanto do soquete a imagem pode ocupar. */
    arte: 0.62,
    /** A espessura do aro de estado. */
    aro: 7,
    /** O nome, medido a partir da borda de baixo do soquete. */
    nomeDY: 22,
    /** O selo do programa que está usando a peça, no canto de cima. */
    seloR: 26,
    seloDX: 0.42,
    seloDY: 0.42,
}

/**
 * A MEMÓRIA — blocos, não porcentagem.
 *
 * O mesmo argumento dos segmentos da estabilidade, e aqui ele é ainda mais
 * forte: a memória é literalmente contável. "Cabem 6, o navegador ocupa 2,
 * sobram 4" é uma frase que uma criança de 5º ano resolve de cabeça. "62% de
 * uso" não é.
 *
 * Um programa aberto ocupa blocos VIZINHOS, com o ícone dele no meio do pedaço.
 * Tocar nesse pedaço fecha o programa — é a única forma de abrir espaço.
 */
export const MEM = {
    top: 348,
    h: 54,
    cy: 375,

    rotuloX: 28,
    x: 156,
    w: 1096,
    blocoH: 44,
    gap: 8,
    r: 8,
}

/**
 * A CHAPA DA MÁQUINA e a BANDEJA DOS PEDIDOS.
 *
 * ── POR QUE DUAS FORMAS, E NÃO UM FUNDO SÓ ───────────────────────────────
 *
 * Estabilidade, hardware e memória são A MÁQUINA: coisas que existem o tempo
 * todo, que têm estado e que a criança administra. Os pedidos são o que CHEGA
 * de fora: eles nascem, gritam e somem. Duas naturezas diferentes pedem duas
 * superfícies diferentes, e é isso que faz a tela ser lida em dois blocos em
 * vez de uma parede de widgets.
 *
 * A chapa é o enquadramento que faltava na versão anterior: sem ela, ícones
 * soltos sobre um render de sala de servidores não formavam objeto nenhum — e
 * era por isso que "ajustar o enquadramento" não tinha onde pegar.
 */
export const CHAPA = {
    x: 16,
    y: 88,
    w: 1248,
    h: 320,
    r: 26,
}

export const BANDEJA = {
    x: 16,
    y: 414,
    w: 1248,
    h: 182,
    r: 22,
}

/**
 * A FILA DE PEDIDOS — até três fichas, lado a lado.
 *
 * Três é o teto do Nível 3 ("equilibrar múltiplos pedidos simultâneos"), e é
 * também o que cabe legível numa tela de 1280 com letra de 19px. A fila NÃO
 * rola e NÃO empilha: um quarto pedido simplesmente não entra até uma vaga
 * abrir. Uma fila que cresce para fora da tela é uma fila que a criança não
 * consegue planejar.
 *
 * As fichas moram numa posição FIXA cada uma. Quando uma sai, as outras
 * deslizam para a esquerda — e o deslize é visível, com tween, porque é ele que
 * conta que uma vaga abriu.
 */
export const FILA = {
    top: 418,
    max: 3,

    w: 396,
    h: 170,
    gap: 14,
    /** A primeira ficha começa aqui; as outras somam `w + gap`. */
    x0: 32,
    cy: 503,
    r: 20,

    iconDX: -138,
    iconDY: -12,
    iconMax: 88,

    textoDX: -80,
    textoW: 244,
    nomeDY: -54,
    falaDY: -8,
    falaSizes: [19, 17, 16],
    falaMaxLinhas: 2,

    /** A paciência: a barrinha no pé da ficha. */
    barraDY: 58,
    barraW: 336,
    barraH: 12,

    /** Quanto a ficha selecionada sobe. */
    liftDY: -12,
    aro: 6,
}

/**
 * OS CONTROLES.
 *
 * Duas ações e uma voz:
 *
 *   PAUSA     congela tudo — o tempo, a paciência, os dispositivos. De graça,
 *             quantas vezes quiser, e sem poder agir enquanto está pausado.
 *   NEGAR     a resposta que não é um recurso. Ela precisa de um botão porque
 *             não existe lugar na tela para "tocar em nada".
 *   MENSAGEM  a plaquinha do meio, onde o sistema explica o que acabou de
 *             acontecer. É o balão da personagem dos outros jogos, sem
 *             personagem: aqui quem fala é a máquina.
 */
export const RODAPE = {
    top: 600,
    cy: 660,

    pausaX: 152,
    pausaW: 208,
    pausaH: 58,

    negarX: 1110,
    negarW: 236,
    negarH: 62,

    msgCX: 650,
    msgW: 524,
    msgH: 66,
    msgR: 16,
    msgIconR: 21,
}
