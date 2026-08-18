import type { CombineSlot, LevelConfig } from '../types'

const COMBINE_SLOTS: CombineSlot[] = [
  { id: 'first', label: 'Primeiro', helper: 'começa o plano' },
  { id: 'while-waiting', label: 'Enquanto espera', helper: 'aproveita a pausa' },
  { id: 'after', label: 'Depois', helper: 'finaliza tudo' },
]

/*
 * COMO ESTE CONTEÚDO É ORGANIZADO
 *
 * Cada nível ensina UMA coisa, e só ela:
 *
 *   N1  dividir                 um pedido grande vira partes menores
 *   N2  dividir + ordenar       cada parte tem começo, meio e fim
 *   N3  dividir + combinar      a parte que espera abre espaço para outra
 *
 * O N3 NÃO reordena. Sequenciar já foi ensinado no N2; repetir ali fazia a
 * criança atravessar cinco telas por missão e perder o que o nível queria
 * mostrar, que é o aproveitamento da espera.
 *
 * ── Os dois conjuntos de cartas ──────────────────────────────────────────
 *
 * `actionIds` são OBJETOS, para a etapa de dividir. Coisas concretas que a
 * criança classifica: pão, queijo, talher.
 *
 * `sequence` são QUADROS DE ESTADO, para a etapa de ordenar. O mesmo objeto
 * mudando ao longo do tempo: pão → queijo → sanduíche pronto.
 *
 * Eles são separados de propósito. Quando compartilhavam a mesma lista, um
 * quadro como "cesta fechada" aparecia na prateleira da divisão, onde ele
 * não é um ingrediente a classificar e não quer dizer nada.
 *
 * Ao criar sequência nova: exatamente UM quadro do meio. Dois "acréscimos"
 * na mesma história são permutáveis e voltam a ter duas respostas certas.
 */
export const LEVELS: LevelConfig[] = [
  /* ═══════════════════════════════════════════════ N1 — só dividir ═══ */
  {
    level: 1,
    title: 'Dividir em partes',
    missions: [
      {
        id: 'n1-cafe-manha',
        level: 1,
        mode: 'split-only',
        title: 'Preparar café da manhã',
        goalIconKey: 'mission-breakfast',
        chefLine: 'Vamos separar o pedido em dois pratos.',
        splitInstruction: 'Arraste cada ícone para o prato certo.',
        successMessage: 'Duas partes, sem misturar!',
        subtasks: [
          // `icon-copo` é ícone de GRUPO: nomeia o prato e nunca é arrastável.
          { id: 'bebida', label: 'Bebida', iconKey: 'icon-copo', actionIds: ['agua', 'cafe'] },
          { id: 'sanduiche', label: 'Sanduíche', iconKey: 'icon-sanduiche', actionIds: ['pao', 'queijo', 'manteiga'] },
        ],
        actions: [
          { id: 'agua', label: 'Água', iconKey: 'icon-agua', subtaskId: 'bebida', hint: 'A água entra na bebida.' },
          { id: 'cafe', label: 'Café', iconKey: 'icon-cafe', subtaskId: 'bebida', hint: 'Café combina com bebida.' },
          { id: 'pao', label: 'Pão', iconKey: 'icon-pao', subtaskId: 'sanduiche', hint: 'Pão é parte do sanduíche.' },
          { id: 'queijo', label: 'Queijo', iconKey: 'icon-queijo', subtaskId: 'sanduiche', hint: 'Queijo entra no sanduíche.' },
          { id: 'manteiga', label: 'Manteiga', iconKey: 'icon-manteiga', subtaskId: 'sanduiche', hint: 'Manteiga combina com o pão.' },
        ],
      },
      {
        id: 'n1-lancheira',
        level: 1,
        mode: 'split-only',
        title: 'Montar uma lancheira',
        goalIconKey: 'mission-lunchbox',
        chefLine: 'Agora separe o que é comida do que ajuda a servir.',
        splitInstruction: 'Divida os ícones entre lanche e utensílios.',
        successMessage: 'Lancheira organizada!',
        subtasks: [
          { id: 'lanche', label: 'Lanche', iconKey: 'icon-lanche', actionIds: ['maca', 'pao-lanche', 'suco-lanche'] },
          { id: 'utensilios', label: 'Utensílios', iconKey: 'icon-prato', actionIds: ['prato-lanche', 'talher-lanche', 'guardanapo-lanche'] },
        ],
        actions: [
          { id: 'maca', label: 'Maçã', iconKey: 'icon-maca', subtaskId: 'lanche', hint: 'A maçã é comida.' },
          { id: 'pao-lanche', label: 'Pão', iconKey: 'icon-pao', subtaskId: 'lanche', hint: 'Pão vai no lanche.' },
          { id: 'suco-lanche', label: 'Suco', iconKey: 'icon-suco', subtaskId: 'lanche', hint: 'Suco é parte do lanche.' },
          { id: 'prato-lanche', label: 'Prato', iconKey: 'icon-prato', subtaskId: 'utensilios', hint: 'Prato ajuda a servir.' },
          { id: 'talher-lanche', label: 'Talher', iconKey: 'icon-talher', subtaskId: 'utensilios', hint: 'Talher é utensílio.' },
          { id: 'guardanapo-lanche', label: 'Guardanapo', iconKey: 'icon-guardanapo', subtaskId: 'utensilios', hint: 'Guardanapo ajuda na mesa.' },
        ],
      },
    ],
  },

  /* ══════════════════════════════════════ N2 — dividir e ordenar ═══ */
  {
    level: 2,
    title: 'Dividir e ordenar',
    missions: [
      {
        id: 'n2-piquenique',
        level: 2,
        mode: 'split-and-order',
        title: 'Preparar piquenique',
        goalIconKey: 'mission-picnic',
        chefLine: 'Primeiro separe. Depois montamos cada parte em ordem.',
        splitInstruction: 'Arraste os ícones para os dois pratos.',
        orderInstruction: 'Agora a ordem dos passos.',
        successMessage: 'Piquenique pronto!',
        subtasks: [
          {
            id: 'sanduiches',
            label: 'Sanduíches',
            iconKey: 'icon-sanduiche',
            actionIds: ['pao-picnic', 'queijo-picnic', 'manteiga-picnic'],
            sequence: [
              { id: 'seq-pao', label: 'Pão', iconKey: 'icon-pao', hint: 'O pão é o começo.' },
              { id: 'seq-queijo', label: 'Recheio', iconKey: 'icon-queijo', hint: 'O recheio vai no meio.' },
              { id: 'seq-sanduiche', label: 'Pronto', iconKey: 'icon-sanduiche', hint: 'O sanduíche pronto é o fim.' },
            ],
          },
          {
            id: 'cesto',
            label: 'Cesta',
            iconKey: 'icon-cesta-fechada',
            actionIds: ['maca-picnic', 'guardanapo-picnic', 'suco-picnic'],
            sequence: [
              { id: 'seq-cesta-vazia', label: 'Vazia', iconKey: 'icon-cesto', hint: 'A cesta vazia é o começo.' },
              { id: 'seq-cesta-fruta', label: 'Maçã', iconKey: 'icon-maca', hint: 'A comida entra no meio.' },
              { id: 'seq-cesta-fechada', label: 'Fechada', iconKey: 'icon-cesta-fechada', hint: 'A cesta fechada é o fim.' },
            ],
          },
        ],
        actions: [
          { id: 'pao-picnic', label: 'Pão', iconKey: 'icon-pao', subtaskId: 'sanduiches', hint: 'Pão é do sanduíche.' },
          { id: 'queijo-picnic', label: 'Queijo', iconKey: 'icon-queijo', subtaskId: 'sanduiches', hint: 'Queijo é do sanduíche.' },
          { id: 'manteiga-picnic', label: 'Manteiga', iconKey: 'icon-manteiga', subtaskId: 'sanduiches', hint: 'Manteiga é do sanduíche.' },
          { id: 'maca-picnic', label: 'Maçã', iconKey: 'icon-maca', subtaskId: 'cesto', hint: 'A maçã vai na cesta.' },
          { id: 'guardanapo-picnic', label: 'Guardanapo', iconKey: 'icon-guardanapo', subtaskId: 'cesto', hint: 'O guardanapo vai na cesta.' },
          { id: 'suco-picnic', label: 'Suco', iconKey: 'icon-suco', subtaskId: 'cesto', hint: 'O suco vai na cesta.' },
        ],
      },
      {
        id: 'n2-bolo',
        level: 2,
        mode: 'split-and-order',
        title: 'Servir bolo simples',
        goalIconKey: 'mission-lunchbox',
        chefLine: 'Separe o preparo da mesa. Depois montamos cada um em ordem.',
        splitInstruction: 'Coloque cada ícone no prato correto.',
        orderInstruction: 'Uma parte de cada vez.',
        successMessage: 'Bolo planejado!',
        subtasks: [
          {
            id: 'preparo',
            label: 'Preparo',
            iconKey: 'icon-bolo',
            actionIds: ['ingredientes-bolo', 'manteiga-bolo'],
            sequence: [
              { id: 'seq-ingredientes', label: 'Ingredientes', iconKey: 'icon-ingredientes', hint: 'Os ingredientes são o começo.' },
              { id: 'seq-massa', label: 'Massa', iconKey: 'icon-massa-na-forma', hint: 'A massa na forma vem no meio.' },
              { id: 'seq-bolo', label: 'Bolo', iconKey: 'icon-bolo', hint: 'O bolo pronto é o fim.' },
            ],
          },
          {
            id: 'mesa',
            label: 'Mesa',
            iconKey: 'icon-mesa-posta',
            actionIds: ['prato-bolo', 'talher-bolo', 'guardanapo-bolo'],
            sequence: [
              { id: 'seq-prato', label: 'Prato', iconKey: 'icon-prato', hint: 'O prato sozinho é o começo.' },
              { id: 'seq-talher', label: 'Talheres', iconKey: 'icon-prato-com-talher', hint: 'Depois entram os talheres.' },
              { id: 'seq-mesa', label: 'Pronta', iconKey: 'icon-mesa-posta', hint: 'A mesa posta é o fim.' },
            ],
          },
        ],
        actions: [
          { id: 'ingredientes-bolo', label: 'Ingredientes', iconKey: 'icon-ingredientes', subtaskId: 'preparo', hint: 'Farinha e ovos são do preparo.' },
          { id: 'manteiga-bolo', label: 'Manteiga', iconKey: 'icon-manteiga', subtaskId: 'preparo', hint: 'A manteiga vai na massa.' },
          { id: 'prato-bolo', label: 'Prato', iconKey: 'icon-prato', subtaskId: 'mesa', hint: 'O prato é da mesa.' },
          { id: 'talher-bolo', label: 'Talher', iconKey: 'icon-talher', subtaskId: 'mesa', hint: 'O talher é da mesa.' },
          { id: 'guardanapo-bolo', label: 'Guardanapo', iconKey: 'icon-guardanapo', subtaskId: 'mesa', hint: 'O guardanapo é da mesa.' },
        ],
      },
    ],
  },

  /* ═════════════════════════════════════ N3 — dividir e combinar ═══ */
  {
    level: 3,
    title: 'Combinar com espera',
    missions: [
      {
        id: 'n3-cafe-rapido',
        level: 3,
        mode: 'split-and-combine',
        title: 'Café da manhã rápido',
        goalIconKey: 'mission-breakfast',
        chefLine: 'A bebida quente demora. A gente pode aproveitar essa espera.',
        splitInstruction: 'Separe as ações em três partes.',
        combineInstruction: 'A parte com ampulheta começa. Depois, as outras.',
        successMessage: 'Você usou a espera a seu favor!',
        combineSlots: COMBINE_SLOTS,
        expectedCombineOrder: ['bebida-quente', 'sanduiche-rapido', 'mesa-rapida'],
        subtasks: [
          { id: 'bebida-quente', label: 'Bebida quente', iconKey: 'icon-copo', hasWait: true, actionIds: ['agua-quente', 'cafe-quente'] },
          { id: 'sanduiche-rapido', label: 'Sanduíche', iconKey: 'icon-sanduiche', actionIds: ['pao-rapido', 'manteiga-rapida'] },
          { id: 'mesa-rapida', label: 'Mesa', iconKey: 'icon-mesa-posta', actionIds: ['prato-rapido', 'talher-rapido'] },
        ],
        actions: [
          { id: 'agua-quente', label: 'Água', iconKey: 'icon-agua', subtaskId: 'bebida-quente', hint: 'A água é da bebida.' },
          { id: 'cafe-quente', label: 'Café', iconKey: 'icon-cafe', subtaskId: 'bebida-quente', hint: 'O café é da bebida.' },
          { id: 'pao-rapido', label: 'Pão', iconKey: 'icon-pao', subtaskId: 'sanduiche-rapido', hint: 'O pão é do sanduíche.' },
          { id: 'manteiga-rapida', label: 'Manteiga', iconKey: 'icon-manteiga', subtaskId: 'sanduiche-rapido', hint: 'A manteiga é do sanduíche.' },
          { id: 'prato-rapido', label: 'Prato', iconKey: 'icon-prato', subtaskId: 'mesa-rapida', hint: 'O prato é da mesa.' },
          { id: 'talher-rapido', label: 'Talher', iconKey: 'icon-talher', subtaskId: 'mesa-rapida', hint: 'O talher é da mesa.' },
        ],
      },
      /*
       * A espera aqui é o FORNO. Antes esta missão era uma sopa quente numa
       * lancheira, com talher e guardanapo soltos: nem o cenário fechava, nem
       * os itens tinham a ver com a parte em que caíam. Bolo + mesa + bebida
       * é um lanche que a criança reconhece, e "o bolo precisa assar" é a
       * espera mais óbvia que existe numa cozinha.
       */
      {
        id: 'n3-lanche-tarde',
        level: 3,
        mode: 'split-and-combine',
        title: 'Lanche da tarde',
        goalIconKey: 'mission-lunchbox',
        chefLine: 'O bolo demora no forno. Dá para adiantar o resto nessa espera.',
        splitInstruction: 'Separe as ações em três partes.',
        combineInstruction: 'O bolo vai ao forno primeiro. Depois, as outras.',
        successMessage: 'Pronto, e sem perder tempo!',
        combineSlots: COMBINE_SLOTS,
        expectedCombineOrder: ['bolo-tarde', 'mesa-tarde', 'bebida-tarde'],
        subtasks: [
          { id: 'bolo-tarde', label: 'Bolo no forno', iconKey: 'icon-bolo', hasWait: true, actionIds: ['ingredientes-tarde', 'manteiga-tarde'] },
          { id: 'mesa-tarde', label: 'Mesa', iconKey: 'icon-mesa-posta', actionIds: ['prato-tarde', 'talher-tarde'] },
          { id: 'bebida-tarde', label: 'Bebida', iconKey: 'icon-copo', actionIds: ['suco-tarde', 'agua-tarde'] },
        ],
        actions: [
          { id: 'ingredientes-tarde', label: 'Ingredientes', iconKey: 'icon-ingredientes', subtaskId: 'bolo-tarde', hint: 'Farinha e ovos são do bolo.' },
          { id: 'manteiga-tarde', label: 'Manteiga', iconKey: 'icon-manteiga', subtaskId: 'bolo-tarde', hint: 'A manteiga vai na massa do bolo.' },
          { id: 'prato-tarde', label: 'Prato', iconKey: 'icon-prato', subtaskId: 'mesa-tarde', hint: 'O prato é da mesa.' },
          { id: 'talher-tarde', label: 'Talher', iconKey: 'icon-talher', subtaskId: 'mesa-tarde', hint: 'O talher é da mesa.' },
          { id: 'suco-tarde', label: 'Suco', iconKey: 'icon-suco', subtaskId: 'bebida-tarde', hint: 'Suco é bebida.' },
          { id: 'agua-tarde', label: 'Água', iconKey: 'icon-agua', subtaskId: 'bebida-tarde', hint: 'Água é bebida.' },
        ],
      },
    ],
  },
]
