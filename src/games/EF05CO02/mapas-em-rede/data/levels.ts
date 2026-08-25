import type { LevelConfig } from '../types'

/**
 * Os oito lugares onde um nó pode morar, num tabuleiro de 4x2.
 *
 * A fileira de cima desceu de 268 para 302. Com raio 42, o mapa passa a
 * começar em 260 — e é isso que dá à faixa de tarefa do topo espaço para duas
 * linhas de fichas sem pousar em cima do bairro (ver `BANDA.teto` em
 * `data/layout.ts`, que declara 252 como limite).
 *
 * A de baixo desceu 5px junto, para o conjunto continuar centrado: com o
 * rótulo 64px abaixo do nó, a última letra fica em ~593, contra o rodapé em
 * 618.
 */
const LOT = {
  a1: { x: 230, y: 302 }, a2: { x: 500, y: 302 }, a3: { x: 780, y: 302 }, a4: { x: 1050, y: 302 },
  b1: { x: 230, y: 505 }, b2: { x: 500, y: 505 }, b3: { x: 780, y: 505 }, b4: { x: 1050, y: 505 },
}

const on = (base: { id: string; label: string; textureKey: string }, lot: { x: number; y: number }) =>
  ({ ...base, x: lot.x, y: lot.y })

const L = {
  casa: { id: 'casa', label: 'Casa', textureKey: 'local-casa' },
  escola: { id: 'escola', label: 'Escola', textureKey: 'local-escola' },
  mercado: { id: 'mercado', label: 'Mercado', textureKey: 'local-mercado' },
  praca: { id: 'praca', label: 'Praça', textureKey: 'local-praca' },
  hospital: { id: 'hospital', label: 'Hospital', textureKey: 'local-hospital' },
  padaria: { id: 'padaria', label: 'Padaria', textureKey: 'local-padaria' },
  biblioteca: { id: 'biblioteca', label: 'Biblioteca', textureKey: 'local-biblioteca' },
  sorveteria: { id: 'sorveteria', label: 'Sorveteria', textureKey: 'local-sorveteria' },
}

const P = {
  ana: { id: 'ana', label: 'Ana', textureKey: 'avatar-ana' },
  bruno: { id: 'bruno', label: 'Bruno', textureKey: 'avatar-bruno' },
  caio: { id: 'caio', label: 'Caio', textureKey: 'avatar-caio' },
  duda: { id: 'duda', label: 'Duda', textureKey: 'avatar-duda' },
  elis: { id: 'elis', label: 'Elis', textureKey: 'avatar-elis' },
  nico: { id: 'nico', label: 'Nico', textureKey: 'avatar-nico' },
}

const at = (base: { id: string; label: string; textureKey: string }, x: number, y: number) =>
  ({ ...base, x, y })

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Ligando o bairro',
    objective: 'A lista no topo mostra quais lugares têm rua direta. Arraste de um até o outro para desenhar cada rua.',
    /**
     * O relógio do nível, em segundos.
     *
     * Antes só o Nível 3 tinha, e por isso os dois primeiros não mostravam
     * barra nenhuma. O orçamento é FOLGADO de propósito: a pior fase deste
     * nível pede seis arrastes, e zerar manda refazer a fase — perder tem que
     * acontecer com quem travou de verdade, não com quem lê devagar.
     */
    timeLimit: 110,
    phases: [
      {
        id: 'l1f1',
        kind: 'representar',
        context: 'mapa',
        name: 'Duas ruas',
        instruction: 'Arraste de um lugar até o outro para desenhar as duas ruas da lista.',
        rule: 'Casa e Escola não aparecem juntas na lista: para ir de uma à outra é preciso passar pela Praça.',
        nodes: [
          on(L.escola, LOT.a1),
          on(L.praca, LOT.b2),
          on(L.casa, LOT.a3),
        ],
        edges: [
          { a: 'escola', b: 'praca' },
          { a: 'praca', b: 'casa' },
        ],
      },
      {
        id: 'l1f2',
        kind: 'representar',
        context: 'mapa',
        name: 'Um quarteirão',
        instruction: 'Quatro ruas fecham este quarteirão.',
        rule: 'As quatro ruas formam um anel: dá para dar a volta inteira e voltar ao começo.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.escola, LOT.a3),
          on(L.mercado, LOT.b3),
          on(L.praca, LOT.b1),
        ],
        edges: [
          { a: 'casa', b: 'escola' },
          { a: 'escola', b: 'mercado' },
          { a: 'mercado', b: 'praca' },
          { a: 'praca', b: 'casa' },
        ],
      },
      {
        id: 'l1f3',
        kind: 'representar',
        context: 'mapa',
        name: 'Cinco pontos',
        instruction: 'Agora são cinco lugares no anel.',
        rule: 'Cada lugar liga só com o anterior e o seguinte da lista. Nenhuma rua corta o meio.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.padaria, LOT.a3),
          on(L.escola, LOT.a4),
          on(L.mercado, LOT.b4),
          on(L.praca, LOT.b2),
        ],
        edges: [
          { a: 'casa', b: 'padaria' },
          { a: 'padaria', b: 'escola' },
          { a: 'escola', b: 'mercado' },
          { a: 'mercado', b: 'praca' },
          { a: 'praca', b: 'casa' },
        ],
      },
      {
        id: 'l1f4',
        kind: 'representar',
        context: 'mapa',
        name: 'Atalho no meio',
        instruction: 'Uma das ruas corta o meio do bairro. Confira a lista.',
        rule: 'Estar perto no desenho não quer dizer ter rua direta: só vale o que está na lista.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.biblioteca, LOT.a2),
          on(L.escola, LOT.a4),
          on(L.hospital, LOT.b4),
          on(L.praca, LOT.b2),
        ],
        edges: [
          { a: 'casa', b: 'biblioteca' },
          { a: 'biblioteca', b: 'escola' },
          { a: 'escola', b: 'hospital' },
          { a: 'hospital', b: 'praca' },
          { a: 'praca', b: 'casa' },
          { a: 'biblioteca', b: 'praca' },
        ],
      },
    ],
  },

  {
    level: 2,
    title: 'Contando quadras',
    objective: 'Toque nos lugares em sequência para montar a rota e ver quantas quadras dá.',
    /** Achar o menor caminho é o passo mais lento do jogo: dois minutos. */
    timeLimit: 120,
    phases: [
      {
        id: 'l2f1',
        kind: 'rota',
        context: 'mapa',
        name: 'Da Casa até a Escola',
        instruction: 'Existem vários caminhos. Ache o que soma menos quadras.',
        startId: 'casa',
        endId: 'escola',
        explanation: 'Qualquer caminho vale aqui — o importante é sair da Casa e chegar na Escola.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.praca, LOT.b2),
          on(L.mercado, LOT.a3),
          on(L.escola, LOT.b4),
        ],
        edges: [
          { a: 'casa', b: 'praca', weight: 3 },
          { a: 'praca', b: 'mercado', weight: 4 },
          { a: 'mercado', b: 'escola', weight: 2 },
          { a: 'casa', b: 'mercado', weight: 8 },
        ],
      },
      {
        id: 'l2f2',
        kind: 'rota',
        context: 'mapa',
        name: 'Passando na Praça',
        instruction: 'Vá da Casa até a Escola, mas passe na Praça no caminho.',
        startId: 'casa',
        endId: 'escola',
        mustPass: ['praca'],
        explanation: 'A rota precisava incluir a Praça, mesmo que exista um caminho mais curto sem ela.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.padaria, LOT.a2),
          on(L.praca, LOT.b1),
          on(L.mercado, LOT.a3),
          on(L.escola, LOT.b4),
        ],
        edges: [
          { a: 'casa', b: 'padaria', weight: 2 },
          { a: 'padaria', b: 'mercado', weight: 3 },
          { a: 'casa', b: 'praca', weight: 4 },
          { a: 'praca', b: 'mercado', weight: 3 },
          { a: 'mercado', b: 'escola', weight: 2 },
        ],
      },
      {
        id: 'l2f3',
        kind: 'rota',
        context: 'mapa',
        name: 'O caminho mais curto',
        instruction: 'Agora ache a rota com o MENOR número de quadras.',
        startId: 'casa',
        endId: 'escola',
        requireOptimal: true,
        explanation: 'O menor caminho custa 9 quadras: Casa, Praça, Hospital, Escola.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.padaria, LOT.a2),
          on(L.praca, LOT.b1),
          on(L.mercado, LOT.a3),
          on(L.hospital, LOT.b3),
          on(L.escola, LOT.a4),
        ],
        edges: [
          { a: 'casa', b: 'padaria', weight: 3 },
          { a: 'casa', b: 'praca', weight: 2 },
          { a: 'padaria', b: 'praca', weight: 2 },
          { a: 'padaria', b: 'mercado', weight: 4 },
          { a: 'praca', b: 'hospital', weight: 5 },
          { a: 'mercado', b: 'escola', weight: 3 },
          { a: 'hospital', b: 'escola', weight: 2 },
        ],
      },
      {
        id: 'l2f4',
        kind: 'rota',
        context: 'mapa',
        name: 'Bairro inteiro',
        instruction: 'Menor caminho de novo, mas agora o bairro está maior.',
        startId: 'casa',
        endId: 'escola',
        requireOptimal: true,
        explanation: 'O menor caminho custa 9 quadras: Casa, Biblioteca, Padaria, Escola.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.biblioteca, LOT.a2),
          on(L.praca, LOT.b1),
          on(L.padaria, LOT.a3),
          on(L.hospital, LOT.b3),
          on(L.escola, LOT.a4),
        ],
        edges: [
          { a: 'casa', b: 'biblioteca', weight: 2 },
          { a: 'casa', b: 'praca', weight: 3 },
          { a: 'biblioteca', b: 'praca', weight: 2 },
          { a: 'biblioteca', b: 'padaria', weight: 3 },
          { a: 'praca', b: 'hospital', weight: 4 },
          { a: 'padaria', b: 'hospital', weight: 2 },
          { a: 'padaria', b: 'escola', weight: 4 },
          { a: 'hospital', b: 'escola', weight: 3 },
        ],
      },
    ],
  },

  {
    level: 3,
    title: 'Lendo o grafo',
    objective: 'Mapas e amizades viram o mesmo tipo de desenho. Responda usando as ligações.',
    /**
     * 90, e não 60.
     *
     * Duas das quatro fases daqui são perguntas de leitura ("Quem é amigo da
     * Ana E da Elis?"), e sessenta segundos incluindo LER o enunciado, ler a
     * pergunta e percorrer sete linhas com o dedo era corrida, não leitura.
     */
    timeLimit: 90,
    phases: [
      {
        id: 'l3f1',
        kind: 'rota',
        context: 'mapa',
        name: 'Rota esperta',
        instruction: 'Ache a rota mais curta da Casa até a Sorveteria.',
        startId: 'casa',
        endId: 'sorveteria',
        requireOptimal: true,
        explanation: 'O menor caminho custa 8 quadras: Casa, Padaria, Mercado, Sorveteria.',
        nodes: [
          on(L.casa, LOT.a1),
          on(L.padaria, LOT.a2),
          on(L.praca, LOT.b1),
          on(L.mercado, LOT.a3),
          on(L.hospital, LOT.b3),
          on(L.sorveteria, LOT.a4),
        ],
        edges: [
          { a: 'casa', b: 'padaria', weight: 2 },
          { a: 'casa', b: 'praca', weight: 3 },
          { a: 'padaria', b: 'mercado', weight: 3 },
          { a: 'praca', b: 'hospital', weight: 4 },
          { a: 'mercado', b: 'sorveteria', weight: 3 },
          { a: 'hospital', b: 'sorveteria', weight: 3 },
          { a: 'mercado', b: 'hospital', weight: 2 },
        ],
      },
      {
        id: 'l3f2',
        kind: 'consulta',
        context: 'rede',
        name: 'Amigo em comum',
        instruction: 'Agora as bolinhas são pessoas e as linhas são amizades.',
        question: 'Quem é amigo da Ana E da Elis ao mesmo tempo?',
        options: ['Bruno', 'Caio', 'Duda', 'Nico'],
        correctIndex: 0,
        explanation: 'Ana é amiga de Bruno e Duda. Elis é amiga de Bruno e Nico. O nome que aparece nas duas listas é o Bruno.',
        nodes: [
          at(P.ana, 340, 250),
          at(P.bruno, 640, 190),
          at(P.caio, 940, 260),
          at(P.duda, 340, 510),
          at(P.elis, 640, 570),
          at(P.nico, 940, 510),
        ],
        edges: [
          { a: 'ana', b: 'bruno' },
          { a: 'ana', b: 'duda' },
          { a: 'bruno', b: 'caio' },
          { a: 'bruno', b: 'elis' },
          { a: 'caio', b: 'nico' },
          { a: 'elis', b: 'nico' },
          { a: 'duda', b: 'caio' },
        ],
      },
      {
        id: 'l3f3',
        kind: 'consulta',
        context: 'rede',
        name: 'Distância de amizade',
        instruction: 'Conte quantas linhas você precisa percorrer.',
        question: 'Quantas ligações a Duda precisa percorrer para chegar até o Nico?',
        options: ['1', '2', '3', '4'],
        correctIndex: 2,
        explanation: 'O caminho mais curto é Duda, Elis, Caio, Nico: são 3 ligações.',
        nodes: [
          at(P.duda, 280, 330),
          at(P.elis, 540, 220),
          at(P.ana, 540, 520),
          at(P.caio, 830, 330),
          at(P.bruno, 830, 570),
          at(P.nico, 1060, 430),
        ],
        edges: [
          { a: 'duda', b: 'elis' },
          { a: 'duda', b: 'ana' },
          { a: 'elis', b: 'caio' },
          { a: 'ana', b: 'bruno' },
          { a: 'caio', b: 'nico' },
          { a: 'bruno', b: 'nico' },
          { a: 'ana', b: 'caio' },
        ],
      },
      {
        id: 'l3f4',
        kind: 'isomorfismo',
        context: 'rede',
        name: 'Mesmo grafo?',
        instruction: 'Arraste as bolinhas para comparar. O desenho muda, mas e as ligações?',
        sameGraph: true,
        explanation: 'São o mesmo grafo! Cada pessoa tem exatamente os mesmos amigos nos dois desenhos. Grafo é sobre quem liga com quem, não sobre a posição.',
        nodes: [
          at(P.ana, 250, 250),
          at(P.bruno, 480, 250),
          at(P.caio, 480, 480),
          at(P.duda, 250, 480),
        ],
        edges: [
          { a: 'ana', b: 'bruno' },
          { a: 'bruno', b: 'caio' },
          { a: 'caio', b: 'duda' },
          { a: 'duda', b: 'ana' },
        ],
        altNodes: [
          at(P.ana, 800, 200),
          at(P.caio, 1060, 360),
          at(P.bruno, 930, 360),
          at(P.duda, 800, 520),
        ],
        altEdges: [
          { a: 'ana', b: 'bruno' },
          { a: 'bruno', b: 'caio' },
          { a: 'caio', b: 'duda' },
          { a: 'duda', b: 'ana' },
        ],
      },
    ],
  },
]