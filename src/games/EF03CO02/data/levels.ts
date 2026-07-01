import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Laço ENQUANTO',
    objective: 'Veja como o robô verifica a condição antes de cada passo.',
    tip: 'Diferente de contar passos: o robô não sabe de antemão quantas vezes vai repetir!',
    challenges: [
      { id: 'l1-c1', corridorLength: 8, walls: [5], goalCol: 4, fixedConditionId: 'path_clear' },
      { id: 'l1-c2', corridorLength: 8, walls: [6], goalCol: 5, fixedConditionId: 'path_clear' },
      { id: 'l1-c3', corridorLength: 8, walls: [],  goalCol: 7, fixedConditionId: 'path_clear' },
    ],
  },
  {
    level: 2,
    title: 'Escolha a condição certa',
    objective: 'Qual condição faz o robô parar exatamente no objetivo?',
    tip: 'A condição controla quando o laço para — não um contador de passos!',
    challenges: [
      {
        id: 'l2-c1', corridorLength: 8, walls: [5], goalCol: 4,
        conditionOptions: ['path_clear', 'not_at_goal', 'count_lt_3'],
      },
      {
        id: 'l2-c2', corridorLength: 8, walls: [6], goalCol: 5,
        conditionOptions: ['count_lt_5', 'path_clear', 'not_at_goal'],
      },
      {
        id: 'l2-c3', corridorLength: 8, walls: [4], goalCol: 3,
        conditionOptions: ['not_at_goal', 'count_lt_2', 'path_clear'],
      },
    ],
  },
  {
    level: 3,
    title: 'Preveja a parada',
    objective: 'Antes de executar, toque na coluna onde o robô vai parar.',
    tip: 'Siga a lógica: enquanto a condição for verdadeira, o robô avança um passo.',
    challenges: [
      { id: 'l3-c1', corridorLength: 9, walls: [6], fixedConditionId: 'path_clear', predictMode: true },
      { id: 'l3-c2', corridorLength: 7, walls: [],  fixedConditionId: 'path_clear', predictMode: true },
      { id: 'l3-c3', corridorLength: 8, walls: [3], fixedConditionId: 'path_clear', predictMode: true },
    ],
  },
]
