/**
 * Controlador do Sistema — EF05CO07.
 *
 * ══════════════════════════════════════════════════════════════════════════
 *  SEM VOCÊ, NADA ACONTECE
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A planilha divide a habilidade em três etapas, e elas viraram os três níveis:
 *
 *   N1  "Entender que programas e dispositivos dependem do sistema para
 *        funcionar."  → um programa pede uma peça e fica parado até você
 *        entregar. A espera é o conteúdo.
 *
 *   N2  "Gerenciar pedidos simples de arquivos, teclado, impressora e
 *        memória."  → entra a MEMÓRIA, e com ela a primeira decisão que não é
 *        sim ou não: o espaço acabou, e alguma coisa precisa sair para outra
 *        entrar.
 *
 *   N3  "Equilibrar múltiplos pedidos simultâneos e evitar conflitos entre
 *        programas."  → DOIS programas pedem ao mesmo tempo, e a criança
 *        escolhe a ordem. Quando os dois querem a mesma peça, atender o outro
 *        primeiro deixa de ser esperteza e passa a ser a única saída.
 *
 *        E SEM RELÓGIO. A primeira versão deste nível dava a cada pedido um
 *        anel de paciência de 26 s — e os três anéis começavam no segundo
 *        zero, então acabavam no mesmo segundo: quem demorasse perdia as três
 *        luzes em três quadros seguidos, com o som de erro em cima do som de
 *        erro. Fora o erro de conceito: três relógios ao mesmo tempo não é
 *        equilibrar, é correr.
 *
 * ── A MEMÓRIA É UMA PEÇA, E NÃO UM PAINEL NOVO ───────────────────────────
 *
 * Repare que `'memoria'` é só mais um `PecaId`. Isso não é economia de código:
 * é o que mantém a tela do Nível 2 idêntica à do Nível 1 — mesma fileira,
 * mesmo gesto, mesmos sete blocos de texto. A versão anterior deste jogo dava
 * à memória uma régua própria com rótulo, e foi assim que a tela chegou a
 * vinte e cinco blocos de texto.
 *
 * A arte ajudou: `recurso-memoria.png` é um pente de RAM com QUATRO CHIPS
 * desenhados. Os quatro encaixes que aparecem acima dela não são invenção da
 * interface — são o que a peça já mostrava.
 */

export type PecaId =
    | 'teclado'
    | 'mouse'
    | 'monitor'
    | 'arquivos'
    | 'impressora'
    | 'memoria'

export type ProgramaId = 'editor' | 'navegador' | 'player' | 'fotos' | 'impressao'

export interface PecaDef {
    id: PecaId
    /** Uma palavra. É o vocabulário que a habilidade pede. */
    nome: string
    textura: string
}

export interface ProgramaDef {
    id: ProgramaId
    nome: string
    textura: string
}

/**
 * A frase do pedido, em três pedaços.
 *
 * O nome da peça é desenhado em OUTRA COR dentro da frase — "Preciso do
 * **teclado**." — e é isso que transforma ler numa tarefa de uma palavra só.
 * Guardar os três pedaços em vez de procurar a palavra depois é explícito de
 * mais e feio de menos: não há acento, artigo nem plural para o código
 * adivinhar, e o verificador consegue conferir que a palavra realçada é mesmo
 * o nome da peça pedida.
 */
export interface Frase {
    antes: string
    palavra: string
    depois: string
}

export interface Pedido {
    id: string
    programa: ProgramaId
    /** O que ele quer. `'memoria'` quer dizer "quero abrir". */
    peca: PecaId
    frase: Frase
}

/**
 * Um nível.
 *
 * Os TRÊS níveis usam a MESMA cena e o MESMO layout. O que muda é esta ficha:
 * quais peças estão na fileira, qual delas está sem energia, se existe memória,
 * quantos pedidos ficam vivos de uma vez e quais são eles.
 */
export interface NivelDef {
    numero: 1 | 2 | 3
    /** A textura de fundo. */
    cenario: string
    /** As peças da fileira, na ordem em que aparecem. No máximo quatro. */
    pecas: PecaDef[]
    semEnergia: PecaId[]
    /**
     * Quantos programas cabem abertos ao mesmo tempo, e quais já estão lá
     * quando o nível começa. Ausente = o nível não tem memória (Nível 1).
     */
    memoria?: { encaixes: number; jaAbertos: ProgramaId[] }
    /**
     * Quantos pedidos ficam VIVOS ao mesmo tempo.
     *
     * 1 nos Níveis 1 e 2: um programa pede e espera para sempre. 2 no Nível 3,
     * que é o "equilibrar múltiplos pedidos simultâneos" da planilha — e é a
     * única diferença de mecânica do nível.
     *
     * DOIS, e não três: com dois, a tela mostra um programa no balcão e UM no
     * trilho, e a escolha é entre duas coisas. Com três, a criança precisava
     * comparar três antes de tocar em qualquer uma.
     */
    ativos?: number
    /**
     * Quanto tempo o nível inteiro dura, em ms — a barra do canto de cima.
     *
     * É um teto de PLANTÃO, e não um relógio por pedido. A diferença é tudo: o
     * relógio por pedido (que este jogo já teve) cobra da criança a velocidade
     * de cada decisão; o teto do nível só existe para a atividade ter fim, e é
     * folgado o bastante para quem pensa devagar terminar com sobra. O
     * `check-so.mjs` mede essa sobra e reprova abaixo de 40%.
     *
     * E ele só corre no estado `pedindo`: parado em animação, tutorial, troca
     * de pedido e tela de fim. Cronômetro que anda enquanto o jogo não aceita
     * toque é cronômetro que mente.
     */
    tempo: number
    pedidos: Pedido[]
    /** As falas do tutorial, uma linha cada. */
    tutorial: string[]
}

/**
 * Em que momento a cena está.
 *
 * `pedindo` é o único estado em que um toque faz alguma coisa. Os outros três
 * existem para que animação, travamento e fim não precisem de meia dúzia de
 * flags: a checagem é uma linha no começo de cada handler.
 *
 * `travado` e `fim` são DEFINITIVOS: depois deles nada mais custa luz e nada
 * mais anima. Foi a falta dessa garantia que deixou o fim de jogo empilhar dois
 * overlays e dois sons de derrota.
 */
export type EstadoCena = 'pedindo' | 'servindo' | 'travado' | 'fim'

/** O recorte útil de uma textura, em frações — ver `data/niveis.ts`. */
export interface Recorte {
    x: number
    y: number
    w: number
    h: number
}
