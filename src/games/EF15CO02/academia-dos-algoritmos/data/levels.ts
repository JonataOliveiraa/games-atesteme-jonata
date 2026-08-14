import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Treino dos Passos',
    objective: 'Montar sequencias simples com apoio visual intenso.',
    description: 'A crianca aprende que algoritmo e uma ordem de passos para resolver uma tarefa do cotidiano.',
    phases: [
      {
        id: 'n1-f1',
        title: 'Escova pronta',
        missionId: 'n1-escovar-dentes',
        unlockedTracks: ['sequencia'],
      },
      {
        id: 'n1-f2',
        title: 'Mochila da aula',
        missionId: 'n1-mochila',
        unlockedTracks: ['sequencia'],
      },
      {
        id: 'n1-f3',
        title: 'Lanche montado',
        missionId: 'n1-lanche',
        unlockedTracks: ['sequencia'],
      },
      {
        id: 'n1-f4',
        title: 'Material da quadra',
        missionId: 'n1-caminho-quadra',
        unlockedTracks: ['sequencia'],
      },
      {
        id: 'n1-f5',
        title: 'Figura de blocos',
        missionId: 'n1-figura-blocos',
        unlockedTracks: ['sequencia'],
      },
    ],
  },
  {
    level: 2,
    title: 'Treino dos Poderes',
    objective: 'Usar repeticoes e condicoes em problemas guiados.',
    description: 'As missoes mostram que uma solucao pode funcionar e ainda ser melhorada com lacos e decisoes.',
    phases: [
      {
        id: 'n2-f1',
        title: 'Quatro plantas',
        missionId: 'n2-regar-plantas',
        unlockedTracks: ['sequencia', 'repeticao'],
      },
      {
        id: 'n2-f2',
        title: 'Brinquedos por cor',
        missionId: 'n2-guardar-brinquedos',
        unlockedTracks: ['sequencia', 'repeticao', 'condicao'],
      },
      {
        id: 'n2-f3',
        title: 'Caminho com poca',
        missionId: 'n2-caminho-poca',
        unlockedTracks: ['sequencia', 'condicao'],
      },
      {
        id: 'n2-f4',
        title: 'Duas formas de regar',
        missionId: 'n2-comparar-plantas',
        unlockedTracks: ['sequencia', 'repeticao', 'depuracao'],
      },
    ],
  },
  {
    level: 3,
    title: 'Desafio dos Criadores',
    objective: 'Construir solucoes autorais, testar versoes e comparar escolhas.',
    description: 'A crianca combina sequencia, repeticao, condicao e depuracao em desafios mais abertos.',
    phases: [
      {
        id: 'n3-f1',
        title: 'Como brincar de esconde-esconde',
        missionId: 'n3-esconde-esconde',
        unlockedTracks: ['sequencia', 'repeticao', 'condicao', 'depuracao', 'final'],
        timeLimit: 90,
      },
      {
        id: 'n3-f2',
        title: 'Entrega pela escola',
        missionId: 'n3-entrega-materiais',
        unlockedTracks: ['sequencia', 'repeticao', 'condicao', 'depuracao', 'final'],
        timeLimit: 90,
      },
    ],
  },
]

export const getLevel = (level: 1 | 2 | 3) => LEVELS[level - 1]
