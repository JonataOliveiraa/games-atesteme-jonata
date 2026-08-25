/**
 * Layout único do Baralho das Listas — 1280x720.
 *
 * ── A TELA É UMA MESA VISTA DE CIMA ──────────────────────────────────────
 *
 *   EM CIMA      O OBJETIVO  — o que fazer agora, e quantas ações já foram
 *   NO MEIO      O TRILHO    — a lista, em cartas, com os espaços entre elas
 *   EMBAIXO      A MENINA, e o que ela está dizendo
 *   NO CENTRO    OS VIZINHOS — quem fica ao lado de quem
 *   NA DIREITA   A CARTA DE QUE O PASSO TRATA
 *
 * O trilho tem largura FIXA, e as cartas se centram dentro dele. Uma lista que
 * cresce de quatro para cinco cartas move as cartas, e é para mover mesmo — é
 * essa a lição. Mas o móvel onde elas moram não pode encolher e crescer junto,
 * senão a tela inteira respira a cada ação e a criança perde o ponto de
 * referência.
 *
 * ── A METADE DE BAIXO TEM TRÊS COLUNAS, E ELAS SE ALINHAM ────────────────
 *
 * Estava tudo espalhado: a menina num canto, um painel de vizinhos fora de
 * centro, uma carta solta na direita e faixas de aviso passando por cima de
 * tudo. Agora são três blocos com bordas que batem:
 *
 *   ESQUERDA  22..274   a menina
 *   CENTRO    340..940  vizinhos (392..488) e a fala dela (502..660)
 *   DIREITA   966..1252 a carta em questão (392..660)
 *
 * Os três topos e as três bases coincidem de propósito. É o que faz uma tela
 * cheia de coisas parecer arrumada em vez de cheia.
 */
export const W = 1280
export const H = 720

/**
 * O header ocupa a largura inteira, encostado no topo.
 *
 * Mesma decisão da Caça à Fonte: a barra arredondada flutuando com margem é o
 * que faz todos os jogos do catálogo terem a mesma cara. Aqui a faixa vai de
 * ponta a ponta e é fechada por uma linha dourada — a cor do aro de madeira da
 * mesa, que é a moldura em que este jogo se passa.
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

/**
 * A BARRA DE TEMPO, no vão livre do header entre o título e o `?`.
 *
 * Era um mostrador `m:ss` contando para cima. "2:14" é um dado que precisa ser
 * lido, convertido e comparado com um limite que a criança não conhece — e é
 * mais um bloco de texto na tela. Uma barra cheia que baixa se entende com o
 * canto do olho, e some do orçamento de leitura.
 *
 * **Ela não reprova ninguém.** Zerar não tira vida, não reinicia caso e não
 * empurra para a próxima tela: a barra fica vazia e apagada, e o jogo segue
 * igual. Quem termina com barra sobrando GANHA pontos; quem não termina não
 * perde nada. Pressa e "trave no erro até entender" não convivem.
 *
 * Ela mora no header de propósito. A faixa do objetivo já carrega o contador
 * de ações à direita, e as duas medidas na mesma faixa virariam uma linha de
 * placar; separadas, cada uma fica perto do que mede.
 *
 * O vão livre vai de 890 (fim do título) a 1199 (começo do `?`). O ícone fica
 * fora da barra, à esquerda: 929..1169 no total.
 */
export const RELOGIO = {
    cx: 1064,
    w: 210,
    h: 20,
    iconeDX: -127,
    iconeR: 13,
}

/** O objetivo do passo, e o contador de ações à direita. */
export const OBJETIVO = {
    x: 28,
    y: 92,
    w: W - 56,
    h: 62,
    r: 18,

    cx: 596,
    cy: 123,
    wrap: 900,

    /** "ações: 2 / 2" — o número que o briefing pede que conte. */
    acoesX: 1216,
}

/**
 * O trilho e as cartas.
 *
 * `cardW/cardH` saem da arte: os PNGs são 414x620, e 118 de largura dá 177 de
 * altura na mesma proporção. A pior lista deste jogo tem seis cartas e sete
 * espaços fechados — 1044px, folgado dentro dos 1120 do trilho.
 */
export const TRILHO = {
    cx: W / 2,
    cy: 276,

    /**
     * O móvel: largura fixa, não acompanha o tamanho da lista.
     *
     * A altura é simétrica em torno de `cy` (170..382 para um centro em 276) e
     * sobra folga em cima: a carta da vez fica LEVANTADA, e uma carta levantada
     * que corta a borda do trilho parece bug, não destaque.
     */
    x: 80,
    y: 170,
    w: W - 160,
    h: 212,
    r: 24,

    cardW: 118,
    cardH: 177,
    /** A proporção da arte, para o fallback desenhado bater com o PNG. */
    cardR: 14,

    /**
     * O espaço entre duas cartas.
     *
     * Era 34, e o espaço era uma barrinha de 8px que a criança precisava
     * adivinhar entre duas cartas de 118 — a interação central do jogo era a
     * coisa menos visível da tela. Agora ele tem largura de dedo e é desenhado
     * como uma fenda de encaixe amarela com um `+`, respirando enquanto está
     * ativo. Seis cartas e sete espaços dão 1044px, dentro dos 1120 do trilho.
     */
    gapW: 48,
    /** A fenda desenhada dentro do espaço. */
    fendaW: 34,
    fendaH: 150,
    /** E aberto, na hora de a carta entrar: exatamente uma carta. */
    gapAberto: 118,

    /** A folga da zona de toque de um espaço — dedo de criança. */
    gapHitW: 58,

    /**
     * Quanto a carta sobe.
     *
     * Os dois valores são IGUAIS de propósito: passar o dedo por cima da carta
     * da vez não pode empurrá-la para baixo. Quem diz "esta é a da vez" é o aro
     * creme aceso, e não a altura — a altura só tira a carta da fileira para o
     * olho achar por onde continuar.
     */
    liftApontada: 12,
    liftHover: 12,
}

/**
 * O painel de vizinhos.
 *
 * Ele existe porque o exemplo da BNCC manda "registrar as cartas vizinhas", e
 * porque numa lista o vizinho é a única coisa que uma carta sabe sobre o
 * mundo. Mostra três casas: quem vem antes, o alvo, quem vem depois — e casa
 * vazia quando não há ninguém daquele lado, que é a informação mais importante
 * das pontas.
 */
export const VIZINHOS = {
    x: 340,
    y: 392,
    w: 600,
    h: 96,
    r: 20,
    cy: 440,

    rotuloX: 372,
    cardsCX: 712,
    cardsGap: 152,
    miniW: 54,
    /**
     * A mini-carta encolheu para caber o rótulo de cada casa em cima dela.
     *
     * Sem "ANTES" e "DEPOIS" escritos, três cartinhas lado a lado não diziam
     * qual era qual — e a casa do meio, que é a carta em questão, parecia só
     * mais um vizinho.
     */
    miniH: 62,
    miniR: 8,
    /** O rótulo fica acima da cartinha; a cartinha desce para abrir espaço. */
    rotuloDY: -32,
    cardDY: 8,
    setaDX: 84,
}

/**
 * A COLUNA DA DIREITA — a carta de que o passo trata.
 *
 * ── ERA O BURACO DO NÍVEL 2 ──────────────────────────────────────────────
 *
 * Ali só havia o botão NÃO TEM, e a carta procurada existia unicamente como um
 * número no meio da frase do objetivo: a criança tinha que guardar "o 7" de
 * cabeça enquanto varria seis cartas parecidas. Agora o 7 está desenhado na
 * tela o tempo todo, do lado, no MESMO tamanho das cartas do trilho — para
 * comparar com o olho, e não com a memória.
 *
 * A moldura é fixa e nasce com a cena; só o conteúdo troca a cada passo. Um
 * painel que aparece e some a cada nove segundos é a própria definição de tela
 * inquieta.
 *
 * O rótulo muda com o verbo, e é ele que diz o que fazer com a carta:
 * NA SUA MÃO (inserir) · PROCURE ESTA (buscar) · TIRE ESTA (remover) ·
 * TROQUE ESTA (substituir).
 */
export const FOCO = {
    x: 966,
    y: 392,
    w: 286,
    h: 268,
    r: 20,

    cx: 1109,
    rotuloY: 424,
    /** Mesmo tamanho das cartas do trilho: é para comparar, não para enfeitar. */
    cardCY: 552,
    cardW: 118,
    cardH: 177,

    /** O NÃO TEM só existe nos passos de busca, logo abaixo da moldura. */
    botaoY: 690,
    botaoW: 238,
    botaoH: 46,
}

/**
 * O BALÃO DA MENINA — no lugar dos avisos que apareciam e sumiam.
 *
 * As faixas grandes no meio da tela eram "grandes e sumiam rápido": cobriam o
 * jogo, obrigavam a ler correndo e levavam embora justo a frase que explicava
 * o que tinha acabado de acontecer. Aqui a fala fica presa na menina e
 * PERMANECE até haver outra coisa a dizer — quem lê devagar lê devagar, e
 * ninguém precisa cobrir carta nenhuma para isso.
 *
 * O balão é a casa da `dica` de cada passo, que até agora era dado morto no
 * arquivo de casos: enquanto não acontece nada, ele mostra a dica.
 *
 * ── E ELE ENCOLHEU, E A LETRA CRESCEU ────────────────────────────────────
 *
 * Era 600x158 com letra de 19px: uma placa enorme com um bilhete pequeno no
 * meio, e um metro de papel vazio em volta. A fala tem teto de 52 caracteres
 * (§ o balão troca a cada toque), então duas linhas bastam — e o que sobra de
 * caixa não é generosidade, é ruído.
 *
 * Agora são 516x110 com letra de 25px: 40% menos papel e uma letra que se lê
 * de longe. O texto ocupa a caixa em vez de flutuar dentro dela.
 */
export const BALAO = {
    x: 340,
    y: 500,
    w: 516,
    h: 110,
    r: 22,
    /** A biqueira aponta para a menina, à esquerda. */
    biqueiraX: 340,
    biqueiraY: 555,
    biqueiraW: 26,
    biqueiraH: 34,

    textoX: 366,
    textoY: 555,
    wrap: 464,
}

/** A menina, no canto de baixo à esquerda. */
export const PERSONAGEM = {
    cx: 148,
    cy: 572,
    /** 252 e não 200: a 200 ela sumia contra a mesa e as cartas gigantes. */
    altura: 252,
}
