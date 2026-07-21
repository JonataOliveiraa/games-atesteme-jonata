import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Verdadeiro ou Falso?',
    objective: 'A condição é VERDADEIRA ou FALSA agora? Você decide — o robô age conforme sua resposta!',
    tip: 'O laço ENQUANTO verifica a condição antes de cada passo. Verdadeiro = avança. Falso = para.',
    challenges: [
      // C1: path_clear — 3× verdadeiro, depois falso (parede em col 4, goalCol 3)
      { id: 'l1-c1', corridorLength: 7, walls: [4], goalCol: 3,
        fixedConditionId: 'path_clear', stepPredictMode: true },
      // C2: not_at_goal — 4× verdadeiro, depois falso (chega ao objetivo em col 4)
      { id: 'l1-c2', corridorLength: 7, walls: [], goalCol: 4,
        fixedConditionId: 'not_at_goal', stepPredictMode: true },
      // C3: count_lt_3 — 3× verdadeiro (0<3,1<3,2<3), depois falso (3<3=false)
      { id: 'l1-c3', corridorLength: 7, walls: [], goalCol: 3,
        fixedConditionId: 'count_lt_3', stepPredictMode: true },
      // C4: path_clear curto — 2× verdadeiro, depois falso (parede em col 3, goalCol 2)
      { id: 'l1-c4', corridorLength: 6, walls: [3], goalCol: 2,
        fixedConditionId: 'path_clear', stepPredictMode: true },
      // C5: count_lt_4 — 4× verdadeiro (0<4..3<4), depois falso (4<4=false)
      { id: 'l1-c5', corridorLength: 7, walls: [], goalCol: 4,
        fixedConditionId: 'count_lt_4', stepPredictMode: true },
    ],
  },
  {
    level: 2,
    title: 'Escolha a condição certa',
    objective: 'Qual condição faz o robô parar exatamente no objetivo ⭐?',
    tip: 'Cada condição para o robô num lugar diferente — pense antes de escolher!',
    challenges: [
      // C1: not_at_goal ✓ — path_clear ultrapassa (para em 6), count_lt_2 para cedo (para em 2)
      {
        id: 'l2-c1', corridorLength: 9, walls: [7], goalCol: 4,
        conditionOptions: ['path_clear', 'count_lt_2', 'not_at_goal'],
      },
      // C2: count_lt_5 ✓ — sem parede, path_clear vai até o fim (7), count_lt_3 para cedo (3)
      // (sem not_at_goal para evitar empate com count_lt_5)
      {
        id: 'l2-c2', corridorLength: 8, walls: [], goalCol: 5,
        conditionOptions: ['count_lt_3', 'path_clear', 'count_lt_5'],
      },
      // C3: count_lt_3 ✓ — sem parede, path_clear vai até o fim (7), count_lt_6 ultrapassa (6)
      // (sem not_at_goal para evitar empate com count_lt_3)
      {
        id: 'l2-c3', corridorLength: 8, walls: [], goalCol: 3,
        conditionOptions: ['count_lt_6', 'path_clear', 'count_lt_3'],
      },
      // C4: path_clear ✓ — parede em 5, para em 4; count_lt_2 para cedo (2); count_lt_7 bate na parede
      // (sem not_at_goal para evitar empate com path_clear quando wall = goalCol+1)
      {
        id: 'l2-c4', corridorLength: 8, walls: [5], goalCol: 4,
        conditionOptions: ['count_lt_2', 'count_lt_7', 'path_clear'],
      },
      // C5: not_at_goal ✓ — path_clear ultrapassa (para em 7), count_lt_3 para cedo (3)
      {
        id: 'l2-c5', corridorLength: 9, walls: [8], goalCol: 5,
        conditionOptions: ['path_clear', 'count_lt_3', 'not_at_goal'],
      },
    ],
  },
  {
    level: 3,
    title: 'Preveja a parada',
    objective: 'Leia a condição, analise o corredor e toque onde o robô vai parar.',
    tip: 'Siga a lógica: enquanto a condição for verdadeira, o robô avança. Quando for falsa, para.',
    challenges: [
      // path_clear — para em col 4 (parede em 5)
      { id: 'l3-c1', corridorLength: 8, walls: [5], fixedConditionId: 'path_clear', predictMode: true },
      // count_lt_4 — para em col 4 (sem parede, conta 4 passos)
      { id: 'l3-c2', corridorLength: 8, walls: [], fixedConditionId: 'count_lt_4', predictMode: true },
      // path_clear — parede logo em col 3, para em col 2 (surpresa!)
      { id: 'l3-c3', corridorLength: 9, walls: [3], fixedConditionId: 'path_clear', predictMode: true },
      // count_lt_6 — parede em 7, mas CONTAGEM para em col 6 antes da parede (momento pedagógico rico)
      { id: 'l3-c4', corridorLength: 9, walls: [7], fixedConditionId: 'count_lt_6', predictMode: true },
      // path_clear — para em col 3 (parede em 4)
      { id: 'l3-c5', corridorLength: 7, walls: [4], fixedConditionId: 'path_clear', predictMode: true },
    ],
  },
]
