/**
 * Layout do jogo — 1280x720, IGUAL NOS TRÊS NÍVEIS.
 *
 * ── QUATRO REGIÕES. NÃO EXISTE UMA QUINTA. ───────────────────────────────
 *
 *   0..90      as 3 LUZES (à esquerda), a BARRA DE TEMPO e o `?` (à direita)
 *   118..324   o PEDIDO — a placa de vidro com o programa e a frase
 *   349..403   os 4 ENCAIXES da memória (só no Nível 2)
 *   411..610   as 4 PEÇAS, em fileira, com o nome embaixo
 *   638..706   a FILA de quem espera, e o botão NÃO DÁ
 *
 * Nenhum nível acrescenta uma região: o Nível 2 preenche os encaixes, o Nível 3
 * deixa a faixa deles vazia e dá vida ao trilho que já existia. Foi essa a
 * condição para os três caberem nos mesmos sete blocos de texto.
 *
 * ── OS ALVOS SÃO DE CELULAR ──────────────────────────────────────────────
 *
 * Este jogo é jogado no telefone. Nenhuma área de toque tem menos de 60px de
 * lado, os dois botões cresceram e nenhuma delas encosta na do vizinho — a
 * conta está em `scripts/check-so.mjs`, que reprova quem encostar.
 *
 * O miolo entre 324 e 349 fica VAZIO de propósito: é o respiro que separa
 * "o que estão me pedindo" de "o que eu tenho para dar". Sem ele, as duas
 * coisas viram um bloco só e a criança não sabe qual olhar primeiro.
 *
 * ── ESTES NÚMEROS FORAM OLHADOS, NÃO CHUTADOS ────────────────────────────
 *
 * Eles saíram de uma maquete montada em cima da arte de verdade (`bg-central`)
 * antes de qualquer linha de cena — a única forma de conferir enquadramento
 * sem abrir o navegador. Mexer num deles pede refazer a maquete.
 */
export const W = 1280
export const H = 720

/**
 * AS TRÊS LUZES — quantas vezes ainda dá para errar.
 *
 * Não é barra, não é porcentagem, não tem rótulo. Três luzes se contam de
 * relance, do outro lado da sala, sem saber ler. Uma barra de estabilidade com
 * a palavra "ESTABILIDADE" em cima (o que este jogo tinha) informa a mesma
 * coisa cobrando uma leitura.
 *
 * Elas são CIANO, a cor da sala, e não verde: verde aqui quer dizer "deu
 * certo", e uma luz verde permanente no canto diria isso o tempo todo.
 */
export const LUZES = {
    x: 46,
    cy: 44,
    r: 13,
    gap: 40,
    /** O halo por trás da luz acesa. */
    halo: 26,
}

export const AJUDA = {
    x: 1228,
    cy: 46,
    r: 30,
}

/**
 * A BARRA DE TEMPO — o plantão inteiro numa barra que baixa.
 *
 * Ela mora na MESMA faixa das luzes e do `?`, entre as duas: as luzes dizem
 * quantas vezes ainda dá para errar, a barra diz quanto tempo ainda há, e o `?`
 * traz o tutorial de volta. Três informações de estado no mesmo lugar, nenhuma
 * delas escrita.
 *
 * ── UMA BARRA, E NÃO UM `m:ss` ───────────────────────────────────────────
 *
 * `createTimeBar` sabe escrever o tempo restante dentro dela (`label: true`) e
 * este jogo não usa: a barra JÁ é o mostrador, e o número em cima seria o
 * oitavo bloco de texto de uma tela com teto de sete. "Está acabando" se lê de
 * relance; "faltam 40 segundos" precisa ser lido, convertido e comparado com um
 * limite que a criança não conhece.
 *
 * ── AS MEDIDAS ───────────────────────────────────────────────────────────
 *
 * A barra vai de 937 a 1167, e o relógio dela fica em 896. As luzes acabam em
 * 139 e o `?` começa em 1198 — ninguém encosta em ninguém. A altura de 24px é
 * de celular: a barra de 20 do exemplo do componente some numa tela de telefone.
 */
export const TEMPO = {
    cx: 1052,
    cy: 46,
    w: 230,
    h: 24,
    /** O relógio desenhado à esquerda da barra. */
    iconR: 15,
    iconDX: -141,
    /** As frações em que ela troca de tom, e em que começa a pulsar. */
    warnAt: 0.34,
    dangerAt: 0.15,
}

/**
 * O PEDIDO.
 *
 * Uma placa de vidro translúcida — o cenário continua aparecendo por trás dela,
 * que é o pedido do usuário de deixar o fundo visível. Ela existe só para o
 * texto ter contraste garantido; se fosse opaca, seria um painel tapando a arte.
 *
 * Dentro dela: o ícone do programa e a frase. Nessa ordem porque é a ordem em
 * que a criança precisa — QUEM está pedindo, e O QUE quer.
 *
 * O NOME do programa ("EDITOR") existia aqui e foi cortado. Contando os blocos
 * de texto da tela ele era o oitavo, num limite de sete que a memória do
 * projeto estabelece — e era o mais fraco de todos, porque o ícone logo acima
 * já diz quem está pedindo. O vocabulário que a habilidade cobra é o das PEÇAS
 * (teclado, mouse, monitor, impressora), e esse continua na tela.
 */
export const PEDIDO = {
    x: 340,
    y: 118,
    w: 600,
    h: 206,
    r: 18,
    cx: 640,

    /** O ícone do programa, medido pelo CONTEÚDO da textura. */
    iconeCY: 194,
    iconeAlt: 118,

    /**
     * A frase mora numa linha só, sempre.
     *
     * É o que permite realçar o nome da peça em outra cor: a frase é montada
     * com três textos lado a lado, e alinhar três textos em duas linhas com
     * quebra automática é um problema que não vale a pena existir. O teto de
     * 30 caracteres em `nivel1.ts` é o que garante a linha única, e o
     * verificador reprova se alguém passar dele.
     */
    fraseCY: 296,
    fraseMaxW: 560,
}

/**
 * AS QUATRO PEÇAS.
 *
 * ── SEM PLACA ATRÁS ──────────────────────────────────────────────────────
 *
 * Elas ficam direto no chão da sala, com sombra. Foi a mesma correção que o
 * Mapas em Rede precisou: pôr um disco arredondado atrás de uma peça que mora
 * sobre um cenário ilustrado faz a peça parecer um adesivo. Quem dá apoio é a
 * SOMBRA; quem dá contorno é a própria arte.
 *
 * ── TODAS DO MESMO TAMANHO ÓPTICO ────────────────────────────────────────
 *
 * `alt` é a altura do CONTEÚDO da textura, não da imagem. Os PNGs têm margem
 * transparente diferente em cada arquivo — o teclado usa 62% da altura e a
 * impressora 94%. Encaixar pela imagem (o `fitImage` de sempre) deixaria o
 * teclado visivelmente menor que a impressora sem nenhum motivo. Ver `RECORTE`
 * em `nivel1.ts`.
 */
export const PECAS = {
    /** O centro ÓPTICO da peça — o meio do conteúdo, não da imagem. */
    cy: 495,
    /**
     * A caixa em que o conteúdo da arte tem que caber.
     *
     * São DOIS limites, e o segundo não é preciosismo: o pente de memória é
     * largo e baixo (344x191 de conteúdo). Encaixando só pela altura ele sairia
     * com 238px de largura e encostaria na peça vizinha, que está a 208px de
     * distância. Escalar pelo menor dos dois é o que mantém a fileira inteira
     * dentro das próprias raias.
     */
    alt: 132,
    maxW: 168,
    /** Os quatro centros. Espaçados o bastante para o dedo não errar. */
    xs: [328, 536, 744, 952],
    nomeCY: 592,

    /** A sombra no chão, logo abaixo do conteúdo. */
    sombraDY: 76,
    sombraRX: 0.46,
    sombraRY: 15,

    /**
     * A ÁREA DE TOQUE — generosa na largura, contida na altura.
     *
     * 176x210 subia até y=390 e invadia a faixa dos encaixes da memória. Como
     * os encaixes ficam por CIMA (depth 17 contra 15), um dedo mirado no canto
     * de cima da IMPRESSORA caía num encaixe vazio; encaixe vazio chama
     * `onPeca('memoria')`, memória não era a peça pedida, e a criança perdia
     * uma luz por acertar a peça que queria.
     *
     * 168 de altura para em y=411, três pixels abaixo do encaixe mais baixo. A
     * arte tem 132 de altura: a área continua sobrando por todos os lados.
     */
    toqueW: 176,
    toqueH: 168,

    /** O selo de "sem energia", no canto de cima da peça. */
    seloR: 22,
    seloDX: 0.5,
    seloDY: 0.5,

    /** O ícone do programa que está usando a peça, pousado em cima dela. */
    ocupanteAlt: 62,
    ocupanteDY: -92,
}

/**
 * OS ENCAIXES DA MEMÓRIA — só no Nível 2.
 *
 * Quatro quadradinhos logo acima da peça de memória, porque o pente de RAM
 * desenhado tem QUATRO CHIPS. A mecânica não pode contradizer os olhos.
 *
 * Eles não têm rótulo e não têm número: um encaixe vazio é um lugar livre, um
 * encaixe com ícone é um programa aberto, e dá para contar. Foi assim que a
 * memória entrou no jogo sem gastar nenhum dos sete blocos de texto — a régua
 * com a palavra "MEMÓRIA" em cima, que a versão anterior tinha, gastava um.
 *
 * `depth` maior que a zona das peças: os encaixes ficam por cima da área de
 * toque da peça de memória, e o Phaser entrega o toque ao objeto mais alto.
 * Tocar num encaixe fecha o programa; tocar na peça, abaixo, abre.
 */
export const SLOTS = {
    /**
     * Eles moram acima da peça de memória, acompanham o X dela — e param ANTES
     * de a área de toque das peças começar.
     *
     * A 386 eles se sobrepunham a ela por 28px de altura, e a sobreposição
     * custava uma luz (ver `PECAS.toqueH`). A 376 as duas faixas não se tocam:
     * encaixe vai até 408, peça começa em 411. O toque não precisa mais de
     * desempate por `depth` — precisa de espaço.
     */
    cy: 376,
    lado: 54,
    gap: 12,
    r: 12,
    /** O ícone do programa dentro do encaixe. */
    iconeAlt: 38,
}

/**
 * A FILA de quem ainda vai pedir.
 *
 * É o indicador de progresso E o conceito de "fila de processos" da planilha,
 * sem escrever nenhum dos dois. Ela encolhe a cada pedido resolvido, então a
 * criança vê quanto falta sem nenhum número.
 *
 * O trilho por trás existe para os ícones lerem como UMA coisa — soltos, cinco
 * ícones pequenos no canto parecem sujeira de tela.
 */
export const FILA = {
    x: 36,
    cy: 672,
    alt: 46,
    gap: 70,
    padX: 32,
    h: 64,
    r: 32,

    /**
     * A ÁREA DE TOQUE do trilho, e o halo de quem está esperando.
     *
     * No Nível 3 o trilho deixa de ser um enfeite de progresso e vira a FILA
     * VIVA: quem está esperando fica aceso, ganha um halo e aceita toque —
     * tocar nele o traz para o balcão. É o mesmo objeto de sempre, com uma
     * coisa a mais e nenhuma palavra a mais.
     *
     * O halo entrou no lugar do anel de paciência, e a diferença é o que ele
     * NÃO diz: o anel encolhia, então era um relógio, e relógio no canto da
     * tela vira pressa. O halo só diz "este aqui aceita toque".
     *
     * 66px de alvo num passo de 70: dedo de criança em celular, com folga entre
     * um alvo e o vizinho.
     */
    toque: 66,
    haloR: 30,
}

/**
 * O botão NÃO DÁ.
 *
 * Ele é vermelho porque vermelho, nesta tela, quer dizer exatamente uma coisa:
 * não vai dar. É a cor do selo da peça sem energia. O botão que responde "não
 * vai dar" tem que ser da cor da coisa que ele responde.
 *
 * E o rótulo é "NÃO DÁ" e não "NEGAR": negar é vocabulário de sistema
 * operacional, e a criança ainda vai chegar nele. Aos dez anos, "não dá" é a
 * frase que ela já usa para esta situação exata.
 */
export const BOTAO = {
    cx: 1134,
    cy: 670,
    w: 224,
    h: 68,
}
