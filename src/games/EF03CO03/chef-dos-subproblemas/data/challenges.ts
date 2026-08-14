import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  // ── NÍVEL 1 ── Distribuindo as tarefas ──────────────────────────────────
  // 2 subproblemas, 3 cartas cada, SEM ordenação interna.
  // O aluno classifica: cada ação pertence a qual parte do problema?
  {
    level: 1,
    title: 'Distribuindo as tarefas',
    objective: 'Cada ação pertence a um subproblema. Arraste cada card para o grupo certo.',
    tip: 'Pense no que cada parte do problema precisa fazer — separe antes de resolver!',
    challenges: [
      {
        id: 'l1-c1',
        mainTask: 'Preparar o café da manhã',
        subproblems: [
          {
            id: 'sp-leite',
            label: 'Fazer o leite quente',
            correctCardIds: ['ferver_leite', 'adicionar_acucar', 'mexer_bem'],
          },
          {
            id: 'sp-mesa',
            label: 'Montar a mesa',
            correctCardIds: ['pegar_pratos', 'colocar_talheres', 'dobrar_guardanapo'],
          },
        ],
        allCards: [
          { id: 'ferver_leite',      label: 'Ferver o leite' },
          { id: 'adicionar_acucar',  label: 'Adicionar açúcar' },
          { id: 'mexer_bem',         label: 'Mexer bem' },
          { id: 'pegar_pratos',      label: 'Pegar os pratos' },
          { id: 'colocar_talheres',  label: 'Colocar os talheres' },
          { id: 'dobrar_guardanapo', label: 'Dobrar o guardanapo' },
        ],
      },
      {
        id: 'l1-c2',
        mainTask: 'Organizar a festa de aniversário',
        subproblems: [
          {
            id: 'sp-decorar',
            label: 'Decorar o salão',
            correctCardIds: ['inflar_baloes', 'pendurar_faixas', 'colocar_enfeites'],
          },
          {
            id: 'sp-comida',
            label: 'Preparar a comida',
            correctCardIds: ['assar_bolo', 'rechear_bolo', 'fazer_salgados'],
          },
        ],
        allCards: [
          { id: 'inflar_baloes',   label: 'Inflar os balões' },
          { id: 'pendurar_faixas', label: 'Pendurar as faixas' },
          { id: 'colocar_enfeites', label: 'Colocar enfeites' },
          { id: 'assar_bolo',      label: 'Assar o bolo' },
          { id: 'rechear_bolo',    label: 'Rechear o bolo' },
          { id: 'fazer_salgados',  label: 'Fazer salgadinhos' },
        ],
      },
      {
        id: 'l1-c3',
        mainTask: 'Cuidar do jardim',
        subproblems: [
          {
            id: 'sp-plantar',
            label: 'Plantar as flores',
            correctCardIds: ['preparar_solo', 'colocar_sementes', 'cobrir_terra'],
          },
          {
            id: 'sp-regar',
            label: 'Regar as plantas',
            correctCardIds: ['pegar_mangueira', 'abrir_torneira', 'molhar_vasos'],
          },
        ],
        allCards: [
          { id: 'preparar_solo',    label: 'Preparar o solo' },
          { id: 'colocar_sementes', label: 'Colocar sementes' },
          { id: 'cobrir_terra',     label: 'Cobrir com terra' },
          { id: 'pegar_mangueira',  label: 'Pegar a mangueira' },
          { id: 'abrir_torneira',   label: 'Abrir a torneira' },
          { id: 'molhar_vasos',     label: 'Molhar os vasos' },
        ],
      },
    ],
  },

  // ── NÍVEL 2 ── Classifique e ordene ────────────────────────────────────
  // 2 subproblemas, 3 cartas cada, COM ordenação interna.
  // O aluno classifica E coloca cada ação na posição correta dentro do subproblema.
  {
    level: 2,
    title: 'Classifique e ordene',
    objective: 'Separe as ações entre os subproblemas E coloque cada uma na ordem certa.',
    tip: 'Dentro de cada parte, a ordem importa — pense passo a passo!',
    challenges: [
      {
        id: 'l2-c1',
        mainTask: 'Fazer uma pizza caseira',
        orderedWithin: true,
        subproblems: [
          {
            id: 'sp-massa',
            label: 'Preparar a massa',
            correctCardIds: ['misturar_ingredientes', 'amassar_massa', 'deixar_descansar'],
          },
          {
            id: 'sp-montar',
            label: 'Montar a pizza',
            correctCardIds: ['espalhar_molho', 'colocar_queijo', 'colocar_coberturas'],
          },
        ],
        allCards: [
          { id: 'misturar_ingredientes', label: 'Misturar ingredientes' },
          { id: 'amassar_massa',         label: 'Amassar a massa' },
          { id: 'deixar_descansar',      label: 'Deixar descansar' },
          { id: 'espalhar_molho',        label: 'Espalhar o molho' },
          { id: 'colocar_queijo',        label: 'Colocar queijo' },
          { id: 'colocar_coberturas',    label: 'Colocar coberturas' },
        ],
      },
      {
        id: 'l2-c2',
        mainTask: 'Preparar um piquenique',
        orderedWithin: true,
        subproblems: [
          {
            id: 'sp-sanduiches',
            label: 'Fazer os sanduíches',
            correctCardIds: ['cortar_pao', 'colocar_recheio', 'embrulhar'],
          },
          {
            id: 'sp-cesto',
            label: 'Montar o cesto',
            correctCardIds: ['guardar_lanches', 'colocar_bebidas', 'colocar_toalha'],
          },
        ],
        allCards: [
          { id: 'cortar_pao',      label: 'Cortar o pão' },
          { id: 'colocar_recheio', label: 'Colocar recheio' },
          { id: 'embrulhar',       label: 'Embrulhar' },
          { id: 'guardar_lanches', label: 'Guardar os lanches' },
          { id: 'colocar_bebidas', label: 'Colocar bebidas' },
          { id: 'colocar_toalha',  label: 'Colocar a toalha' },
        ],
      },
      {
        id: 'l2-c3',
        mainTask: 'Preparar um jantar especial',
        orderedWithin: true,
        subproblems: [
          {
            id: 'sp-frango',
            label: 'Cozinhar o frango',
            correctCardIds: ['temperar_frango', 'esquentar_frigideira', 'cozinhar_frango'],
          },
          {
            id: 'sp-sobremesa',
            label: 'Fazer a sobremesa',
            correctCardIds: ['misturar_chocolate', 'derreter_fogo', 'servir_tacinha'],
          },
        ],
        allCards: [
          { id: 'temperar_frango',     label: 'Temperar o frango' },
          { id: 'esquentar_frigideira', label: 'Esquentar frigideira' },
          { id: 'cozinhar_frango',     label: 'Cozinhar o frango' },
          { id: 'misturar_chocolate',  label: 'Misturar chocolate' },
          { id: 'derreter_fogo',       label: 'Derreter no fogo' },
          { id: 'servir_tacinha',      label: 'Servir nas tacinhas' },
        ],
      },
    ],
  },

  // ── NÍVEL 3 ── Três times, um plano ────────────────────────────────────
  // 3 subproblemas, 3 cartas cada, SEM ordenação interna.
  // O aluno classifica 9 ações em 3 grupos — complexidade maior, mais contextos.
  {
    level: 3,
    title: 'Três times, um plano',
    objective: 'Agora o problema tem TRÊS partes. Distribua cada ação no subproblema certo.',
    tip: 'Leia o nome de cada parte com atenção — algumas ações podem parecer parecidas!',
    challenges: [
      {
        id: 'l3-c1',
        mainTask: 'Montar uma barraca de feira',
        subproblems: [
          {
            id: 'sp-estrutura',
            label: 'Montar a estrutura',
            correctCardIds: ['armar_barraca', 'fixar_laterais', 'colocar_mesa'],
          },
          {
            id: 'sp-produtos',
            label: 'Organizar produtos',
            correctCardIds: ['separar_tipos', 'etiquetar_itens', 'arrumar_prateleira'],
          },
          {
            id: 'sp-atendimento',
            label: 'Preparar atendimento',
            correctCardIds: ['pendurar_placa', 'preparar_amostras', 'treinar_sorriso'],
          },
        ],
        allCards: [
          { id: 'armar_barraca',      label: 'Armar a barraca' },
          { id: 'fixar_laterais',     label: 'Fixar as laterais' },
          { id: 'colocar_mesa',       label: 'Colocar a mesa' },
          { id: 'separar_tipos',      label: 'Separar por tipo' },
          { id: 'etiquetar_itens',    label: 'Etiquetar itens' },
          { id: 'arrumar_prateleira', label: 'Arrumar prateleira' },
          { id: 'pendurar_placa',     label: 'Pendurar a placa' },
          { id: 'preparar_amostras',  label: 'Preparar amostras' },
          { id: 'treinar_sorriso',    label: 'Treinar o sorriso' },
        ],
      },
      {
        id: 'l3-c2',
        mainTask: 'Organizar uma viagem',
        subproblems: [
          {
            id: 'sp-rota',
            label: 'Planejar a rota',
            correctCardIds: ['estudar_mapa', 'escolher_paradas', 'calcular_tempo'],
          },
          {
            id: 'sp-malas',
            label: 'Fazer as malas',
            correctCardIds: ['separar_roupas', 'dobrar_guardar', 'conferir_docs'],
          },
          {
            id: 'sp-carro',
            label: 'Preparar o carro',
            correctCardIds: ['verificar_combustivel', 'checar_pneus', 'colocar_agua'],
          },
        ],
        allCards: [
          { id: 'estudar_mapa',           label: 'Estudar o mapa' },
          { id: 'escolher_paradas',       label: 'Escolher paradas' },
          { id: 'calcular_tempo',         label: 'Calcular o tempo' },
          { id: 'separar_roupas',         label: 'Separar as roupas' },
          { id: 'dobrar_guardar',         label: 'Dobrar e guardar' },
          { id: 'conferir_docs',          label: 'Conferir documentos' },
          { id: 'verificar_combustivel',  label: 'Checar combustível' },
          { id: 'checar_pneus',           label: 'Checar os pneus' },
          { id: 'colocar_agua',           label: 'Colocar água' },
        ],
      },
      {
        id: 'l3-c3',
        mainTask: 'Preparar um sarau escolar',
        subproblems: [
          {
            id: 'sp-cenario',
            label: 'Montar o cenário',
            correctCardIds: ['limpar_salao', 'organizar_cadeiras', 'decorar_palco'],
          },
          {
            id: 'sp-ensaios',
            label: 'Organizar ensaios',
            correctCardIds: ['definir_ordem', 'treinar_grupos', 'combinar_sinais'],
          },
          {
            id: 'sp-divulgacao',
            label: 'Fazer a divulgação',
            correctCardIds: ['escrever_convites', 'distribuir_turmas', 'colocar_cartazes'],
          },
        ],
        allCards: [
          { id: 'limpar_salao',      label: 'Limpar o salão' },
          { id: 'organizar_cadeiras', label: 'Organizar cadeiras' },
          { id: 'decorar_palco',     label: 'Decorar o palco' },
          { id: 'definir_ordem',     label: 'Definir a ordem' },
          { id: 'treinar_grupos',    label: 'Treinar os grupos' },
          { id: 'combinar_sinais',   label: 'Combinar os sinais' },
          { id: 'escrever_convites', label: 'Escrever convites' },
          { id: 'distribuir_turmas', label: 'Distribuir às turmas' },
          { id: 'colocar_cartazes',  label: 'Colocar cartazes' },
        ],
      },
    ],
  },
]
