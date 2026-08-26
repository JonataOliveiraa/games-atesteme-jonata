import type { NivelDef, PecaDef, PecaId, ProgramaDef, ProgramaId, Recorte } from '../types'

/**
 * OS TRÊS NÍVEIS.
 *
 * Cabem num arquivo, e é essa a diferença entre esta versão e a que foi
 * descartada — que precisava de dois arquivos e quatrocentas linhas para
 * descrever nove fases que ninguém conseguia ler na tela.
 *
 * Os três usam a MESMA cena e o MESMO layout. Cada um acrescenta exatamente uma
 * ideia: o Nível 1 o gesto, o Nível 2 a memória, o Nível 3 a fila viva.
 */

/* ═══════════════════════════════════════════════════════ o catálogo */

const P = {
    teclado: { id: 'teclado', nome: 'Teclado', textura: 'recurso-teclado' },
    mouse: { id: 'mouse', nome: 'Mouse', textura: 'recurso-mouse' },
    monitor: { id: 'monitor', nome: 'Monitor', textura: 'recurso-monitor' },
    arquivos: { id: 'arquivos', nome: 'Arquivos', textura: 'recurso-arquivos' },
    impressora: { id: 'impressora', nome: 'Impressora', textura: 'recurso-impressora' },
    memoria: { id: 'memoria', nome: 'Memória', textura: 'recurso-memoria' },
} as const satisfies Record<PecaId, PecaDef>

export const PROGRAMAS: Record<ProgramaId, ProgramaDef> = {
    editor: { id: 'editor', nome: 'Editor', textura: 'programa-editor' },
    navegador: { id: 'navegador', nome: 'Navegador', textura: 'programa-navegador' },
    player: { id: 'player', nome: 'Player', textura: 'programa-player' },
    fotos: { id: 'fotos', nome: 'Fotos', textura: 'programa-fotos' },
    impressao: { id: 'impressao', nome: 'Impressão', textura: 'programa-impressao' },
}

/* ═══════════════════════════════════════════════════════ Nível 1 */

/**
 * ── O ROTEIRO DOS SEIS PEDIDOS ───────────────────────────────────────────
 *
 *   1  teclado    livre         o gesto: ele pede, você entrega
 *   2  mouse      livre         o mesmo gesto, outra peça — confiança
 *   3  impressora SEM ENERGIA   o primeiro "não dá"
 *   4  monitor    livre         volta ao normal, e OCUPA o monitor por 6s
 *   5  monitor    OCUPADO       a mesma peça, agora em uso: esperar
 *   6  impressora SEM ENERGIA   confirma a regra do "não dá"
 *
 * O par 4-5 é o que impede este nível de ser um teste de múltipla escolha: o
 * pedido 5 pede a MESMA peça que acabou de ser entregue, e a resposta certa
 * muda com o tempo. E não custa nenhum elemento novo na tela — quem mostra que
 * a peça está ocupada é o ícone do programa pousado em cima dela.
 */
const N1: NivelDef = {
    numero: 1,
    cenario: 'bg-central',
    pecas: [P.teclado, P.mouse, P.monitor, P.impressora],
    semEnergia: ['impressora'],
    tempo: 100_000,
    tutorial: [
        'Um programa pede uma peça de cada vez.',
        'Toque na peça que ele pediu.',
        'Esta está sem energia. Repare no X vermelho.',
        'Quando não dá, toque aqui.',
    ],
    pedidos: [
        {
            id: 'n1-1', programa: 'editor', peca: 'teclado',
            frase: { antes: 'Preciso do ', palavra: 'teclado', depois: '.' },
        },
        {
            id: 'n1-2', programa: 'navegador', peca: 'mouse',
            frase: { antes: 'Quero o ', palavra: 'mouse', depois: '.' },
        },
        {
            id: 'n1-3', programa: 'impressao', peca: 'impressora',
            frase: { antes: 'Quero a ', palavra: 'impressora', depois: '.' },
        },
        {
            id: 'n1-4', programa: 'player', peca: 'monitor',
            frase: { antes: 'Preciso do ', palavra: 'monitor', depois: '.' },
        },
        {
            id: 'n1-5', programa: 'editor', peca: 'monitor',
            frase: { antes: 'Também quero o ', palavra: 'monitor', depois: '.' },
        },
        {
            id: 'n1-6', programa: 'fotos', peca: 'impressora',
            frase: { antes: 'Posso usar a ', palavra: 'impressora', depois: '?' },
        },
    ],
}

/* ═══════════════════════════════════════════════════════ Nível 2 */

/**
 * ── A MEMÓRIA ────────────────────────────────────────────────────────────
 *
 * A fileira troca de peças, e não de tamanho: sai o mouse, sai o monitor,
 * entram ARQUIVOS e MEMÓRIA. É literalmente a lista da planilha para este
 * nível — "arquivos, teclado, impressora e memória" — e mantém quatro nomes na
 * tela, que é o orçamento.
 *
 * QUATRO encaixes porque o pente de RAM desenhado tem quatro chips. A regra §0
 * da memória do projeto: a mecânica não pode contradizer os olhos.
 *
 * ── O ROTEIRO DOS SEIS PEDIDOS ───────────────────────────────────────────
 *
 * A memória começa com DOIS programas já abertos. Isso não é dificuldade
 * gratuita: é o que faz a criança encontrar a memória já ocupada e entender,
 * antes de qualquer pedido, que aquilo é um lugar com coisas dentro.
 *
 *   1  memória    2 de 4      abrir é pôr o programa na memória
 *   2  teclado    livre       o gesto do Nível 1 continua valendo
 *   3  impressora SEM ENERGIA "não dá" continua existindo
 *   4  memória    3 de 4      enche
 *   5  memória    CHEIA       feche um programa para abrir espaço
 *   6  arquivos   livre       termina numa peça, com a memória cheia
 *
 * O pedido 5 é o coração do nível: não é sim nem não, é "primeiro tire alguém".
 * É a primeira vez no jogo em que a resposta certa exige DOIS toques, e em que
 * a criança escolhe QUEM sai — e não existe escolha errada, de propósito.
 */
const N2: NivelDef = {
    numero: 2,
    cenario: 'bg-central',
    pecas: [P.teclado, P.arquivos, P.impressora, P.memoria],
    semEnergia: ['impressora'],
    memoria: { encaixes: 4, jaAbertos: ['player', 'fotos'] },
    tempo: 110_000,
    tutorial: [
        'Agora tem MEMÓRIA: é onde os programas ficam abertos.',
        'Quem pede memória, você põe num encaixe vazio.',
        'Cheia? Toque num programa aberto para fechar.',
        'A impressora continua sem energia.',
    ],
    pedidos: [
        {
            id: 'n2-1', programa: 'editor', peca: 'memoria',
            frase: { antes: 'Preciso de ', palavra: 'memória', depois: '.' },
        },
        {
            id: 'n2-2', programa: 'navegador', peca: 'teclado',
            frase: { antes: 'Quero o ', palavra: 'teclado', depois: '.' },
        },
        {
            id: 'n2-3', programa: 'impressao', peca: 'impressora',
            frase: { antes: 'Quero a ', palavra: 'impressora', depois: '.' },
        },
        {
            id: 'n2-4', programa: 'navegador', peca: 'memoria',
            frase: { antes: 'Tem ', palavra: 'memória', depois: ' pra mim?' },
        },
        {
            id: 'n2-5', programa: 'impressao', peca: 'memoria',
            frase: { antes: 'E eu, cabe na ', palavra: 'memória', depois: '?' },
        },
        {
            id: 'n2-6', programa: 'editor', peca: 'arquivos',
            frase: { antes: 'Abra os ', palavra: 'arquivos', depois: '.' },
        },
    ],
}

/* ═══════════════════════════════════════════════════════ Nível 3 */

/**
 * ── DOIS PEDIDOS AO MESMO TEMPO ──────────────────────────────────────────
 *
 * A planilha pede "equilibrar múltiplos pedidos simultâneos e evitar conflitos
 * entre programas". É a ÚNICA coisa nova deste nível — e ele não acrescenta
 * mais nada: sai a memória (que era a ideia do Nível 2), sai o relógio, e a
 * fileira volta a ser quatro peças no chão, como no Nível 1.
 *
 * ── O QUE ESTE NÍVEL PERDEU, E POR QUÊ ───────────────────────────────────
 *
 * A primeira versão tinha TRÊS pedidos vivos, cada um com um anel de paciência
 * de 26 segundos, e a memória ainda por cima. Duas coisas quebravam:
 *
 *   · os três anéis começavam JUNTOS, no segundo zero, e por isso acabavam
 *     JUNTOS. Quem demorasse perdia as três luzes em três quadros seguidos,
 *     com o som de erro em cima do som de erro e a tela parada por baixo. Não
 *     dava nem para ver o que tinha acontecido, quanto mais reagir;
 *   · e três relógios ao mesmo tempo é o contrário de equilibrar: é correr.
 *
 * Agora são DOIS pedidos e NENHUM relógio. Ninguém desiste, ninguém perde uma
 * luz por demorar, e o nível continua sendo exatamente sobre escolher a ordem:
 * enquanto um programa segura uma peça, o único caminho é atender o outro e
 * voltar depois.
 *
 * Sobraram DUAS formas de perder uma luz em todo o jogo — peça errada e NÃO DÁ
 * quando dava. As duas são coisas que a criança FEZ. Nenhuma é o relógio.
 *
 * ── O ROTEIRO DOS SEIS PEDIDOS ───────────────────────────────────────────
 *
 *   1  teclado    livre         atenda: o teclado fica em uso por 6s
 *   2  teclado    OCUPADO       o conflito, logo depois do tutorial falar dele
 *   3  monitor    livre         a saída do 2: atenda ESTE, e volte
 *   4  arquivos   livre         o mesmo gesto, outra peça
 *   5  arquivos   OCUPADO       o conflito de novo, agora sem tutorial nenhum
 *   6  impressora SEM ENERGIA   a saída do 5, e o "não dá" fecha o nível
 *
 * Os pares 1-2 e 4-5 são o nível inteiro: o segundo de cada par quer a peça que
 * o primeiro acabou de levar. E cada par tem, ao lado, um pedido que DÁ para
 * atender agora — é ele que ensina que aquilo ali embaixo não é uma fila de
 * espera, é uma escolha.
 *
 * NUNCA os dois pedidos vivos ficam bloqueados ao mesmo tempo: quando o 2 está
 * preso no teclado, o vivo ao lado é o 3 (monitor, que ninguém usou); quando o
 * 5 está preso nos arquivos, o vivo ao lado é o 6 (sem energia, que se resolve
 * sozinho no botão). É a invariante que o `check-so.mjs` simula.
 */
const N3: NivelDef = {
    numero: 3,
    cenario: 'bg-central',
    pecas: [P.teclado, P.monitor, P.arquivos, P.impressora],
    semEnergia: ['impressora'],
    ativos: 2,
    tempo: 120_000,
    tutorial: [
        'Agora DOIS programas pedem ao mesmo tempo.',
        'O outro fica esperando aqui embaixo.',
        'Toque nele para atender ele primeiro.',
        'Peça ocupada? Atenda o outro e volte depois.',
    ],
    pedidos: [
        {
            id: 'n3-1', programa: 'editor', peca: 'teclado',
            frase: { antes: 'Preciso do ', palavra: 'teclado', depois: '.' },
        },
        {
            id: 'n3-2', programa: 'navegador', peca: 'teclado',
            frase: { antes: 'Eu também quero o ', palavra: 'teclado', depois: '.' },
        },
        {
            id: 'n3-3', programa: 'player', peca: 'monitor',
            frase: { antes: 'Quero o ', palavra: 'monitor', depois: '.' },
        },
        {
            id: 'n3-4', programa: 'fotos', peca: 'arquivos',
            frase: { antes: 'Abra os ', palavra: 'arquivos', depois: '.' },
        },
        {
            id: 'n3-5', programa: 'editor', peca: 'arquivos',
            frase: { antes: 'Também quero os ', palavra: 'arquivos', depois: '.' },
        },
        {
            id: 'n3-6', programa: 'impressao', peca: 'impressora',
            frase: { antes: 'Quero a ', palavra: 'impressora', depois: '.' },
        },
    ],
}

export const NIVEIS: NivelDef[] = [N1, N2, N3]

/* ═══════════════════════════════════════════════════════ os números */

/**
 * Quanto tempo um programa segura a peça depois de recebê-la.
 *
 * Seis segundos, e o pedido seguinte entra pouco mais de um segundo depois do
 * anterior sair — então o pedido 5 do Nível 1 encontra o monitor com uns
 * quatro segundos de uso pela frente. É espera suficiente para a criança
 * perceber que a máquina está fazendo alguma coisa, e curta demais para virar
 * castigo.
 *
 * A MEMÓRIA não tem tempo: um programa aberto fica aberto até alguém fechar.
 * É essa a diferença entre usar um dispositivo e ocupar memória, e ela aparece
 * sozinha no jogo, sem ninguém explicar.
 */
export const USO_MS = 6_000

/** A pausa entre um pedido resolvido e o próximo entrar. */
export const ENTRE_PEDIDOS_MS = 1_100

export const LUZES_INICIAIS = 3

/**
 * ── DE ONDE SAEM OS `tempo` DE CADA NÍVEL ────────────────────────────────
 *
 * Não foram escolhidos no olho. A simulação do `check-so.mjs` mede quanto tempo
 * de BARRA (só o estado `pedindo` — fora animação, tutorial e troca de pedido)
 * uma criança gasta para terminar cada nível, com 3,5 s e com 6 s por decisão.
 * O teto é a maior dessas medidas com uma folga de pelo menos 40%.
 *
 * Por isso o N3 tem mais tempo que o N1: cada troca de atendido é uma decisão a
 * mais, e o conflito de peça ocupada custa um toque que não resolve nada.
 *
 * Se alguém mexer no roteiro de um nível, os três números são refeitos pela
 * simulação — não por chute.
 */

/**
 * Quando a criança trava, o jogo ajuda — sem entregar a resposta.
 *
 * Aos 9 segundos parada a frase do pedido pulsa (releia). Aos 18, a peça certa
 * ganha um brilho. Não é penalidade nem pressa: é a regra da casa de travar no
 * erro até entender, feita de um jeito que não abandona ninguém olhando para a
 * tela sem saber o que fazer.
 */
export const AJUDA_MS = { releia: 9_000, mostra: 18_000 }

/** Quantos pedidos o nível mais longo tem — o trilho da fila é medido por ele. */
export const MAX_PEDIDOS = Math.max(...NIVEIS.map(n => n.pedidos.length))

/* ═══════════════════════════════════════════════════════ o recorte da arte */

/**
 * O RECORTE ÚTIL DE CADA TEXTURA, em frações da imagem.
 *
 * ── POR QUE ISTO EXISTE ──────────────────────────────────────────────────
 *
 * Todos os PNGs são 363x388, mas a margem transparente é diferente em cada um:
 * o conteúdo do teclado ocupa 62% da altura, o da impressora 94% e o do pente
 * de memória só 49% (ele é um objeto largo e baixo). Encaixar as peças pela
 * IMAGEM — que é o que `fitImage` faz nos outros jogos — deixaria o teclado um
 * terço menor que a impressora, com os "pés" em alturas diferentes.
 *
 * Estes números foram MEDIDOS nos arquivos (canal alpha, caixa delimitadora),
 * não estimados. Se uma arte for redesenhada, remedir.
 *
 * Chave que não estiver aqui cai no recorte cheio e nada quebra.
 */
export const RECORTE: Record<string, Recorte> = {
    'programa-editor': { x: 0.033, y: 0.059, w: 0.926, h: 0.894 },
    'programa-fotos': { x: 0.017, y: 0.023, w: 0.956, h: 0.899 },
    'programa-impressao': { x: 0.050, y: 0.026, w: 0.928, h: 0.930 },
    'programa-navegador': { x: 0.033, y: 0.028, w: 0.906, h: 0.951 },
    'programa-player': { x: 0.055, y: 0.031, w: 0.909, h: 0.923 },
    'recurso-arquivos': { x: 0.135, y: 0.049, w: 0.733, h: 0.912 },
    'recurso-impressora': { x: 0.014, y: 0.026, w: 0.970, h: 0.943 },
    'recurso-memoria': { x: 0.022, y: 0.265, w: 0.948, h: 0.492 },
    'recurso-monitor': { x: 0.019, y: 0.152, w: 0.967, h: 0.765 },
    'recurso-mouse': { x: 0.171, y: 0.036, w: 0.675, h: 0.933 },
    'recurso-teclado': { x: 0.036, y: 0.206, w: 0.934, h: 0.621 },
}

export const RECORTE_CHEIO: Recorte = { x: 0, y: 0, w: 1, h: 1 }
