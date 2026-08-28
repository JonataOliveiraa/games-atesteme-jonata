import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Uma cena, uma mudança',
    objective: 'Monte uma cena que mostre o que a tecnologia mudou.',
    phases: [
      {
        id: 'l1f1',
        kind: 'cena',
        instruction: 'Monte a sua primeira cena.',
        moment: 'depois',
        themeOptions: ['audio'],
        characterOptions: ['crianca', 'adulto', 'idoso'],
        sceneryOptions: ['casa', 'escola', 'rua'],
      },
      {
        id: 'l1f2',
        kind: 'cena',
        instruction: 'Agora, uma cena sobre achar o caminho.',
        moment: 'depois',
        themeOptions: ['gps'],
        characterOptions: ['adulto', 'idoso', 'crianca'],
        sceneryOptions: ['rua', 'casa', 'trabalho'],
      },
      {
        id: 'l1f3',
        kind: 'cena',
        instruction: 'Agora, uma cena na escola.',
        moment: 'depois',
        themeOptions: ['aulasOnline'],
        characterOptions: ['crianca', 'adulto', 'idoso'],
        sceneryOptions: ['escola', 'casa', 'rua'],
      },
      {
        id: 'l1f4',
        kind: 'cena',
        instruction: 'Agora o tema é você quem escolhe.',
        moment: 'depois',
        themeOptions: ['audio', 'gps', 'aulasOnline'],
        characterOptions: ['crianca', 'adulto', 'idoso', 'robo'],
        sceneryOptions: ['casa', 'escola', 'rua'],
      },
    ],
  },
  {
    level: 2,
    title: 'Antes, depois e o que mudou',
    objective: 'Conte a história em 3 quadros: antes, depois e o que mudou.',
    phases: [
      {
        id: 'l2f1',
        kind: 'sequencia',
        instruction: 'Conte as compras em 3 quadros.',
        theme: 'comprasApp',
        slots: [
          { moment: 'antes', label: 'Como era antes' },
          { moment: 'depois', label: 'Como ficou depois' },
          { moment: 'consequencia', label: 'O que isso mudou' },
        ],
        characterOptions: ['adulto', 'idoso', 'crianca'],
        sceneryOptions: ['rua', 'casa', 'trabalho'],
      },
      {
        id: 'l2f2',
        kind: 'sequencia',
        instruction: 'Conte o robô na fábrica em 3 quadros.',
        theme: 'roboFabrica',
        slots: [
          { moment: 'antes', label: 'Antes da máquina' },
          { moment: 'depois', label: 'Com o robô' },
          { moment: 'consequencia', label: 'Um cuidado novo' },
        ],
        characterOptions: ['adulto', 'robo', 'idoso'],
        sceneryOptions: ['trabalho', 'rua', 'casa'],
      },
      {
        id: 'l2f3',
        kind: 'sequencia',
        instruction: 'Conte o trabalho em casa em 3 quadros.',
        theme: 'trabalhoRemoto',
        slots: [
          { moment: 'antes', label: 'Antes do remoto' },
          { moment: 'depois', label: 'Trabalhando em casa' },
          { moment: 'consequencia', label: 'O que mudou no dia' },
        ],
        characterOptions: ['adulto', 'idoso', 'crianca'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
    ],
  },
  {
    level: 3,
    title: 'Duas pessoas, duas opiniões',
    objective: 'Duas pessoas pensam diferente. No fim, dê a sua opinião.',
    phases: [
      {
        id: 'l3f1',
        kind: 'narrativa',
        instruction: 'Trabalho em casa: dois jeitos de ver.',
        theme: 'trabalhoRemoto',
        slots: [
          { moment: 'antes', label: 'Como era antes', speaker: 'A' },
          { moment: 'depois', label: 'O que mudou', speaker: 'A' },
          { moment: 'depois', label: 'Outra opinião', speaker: 'B' },
        ],
        characterOptions: ['adulto', 'idoso', 'crianca', 'robo'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
      {
        id: 'l3f2',
        kind: 'narrativa',
        instruction: 'Robô no trabalho: dois jeitos de ver.',
        theme: 'roboFabrica',
        slots: [
          { moment: 'antes', label: 'Antes do robô', speaker: 'A' },
          { moment: 'depois', label: 'O que melhorou', speaker: 'A' },
          { moment: 'consequencia', label: 'Um cuidado', speaker: 'B' },
        ],
        characterOptions: ['adulto', 'idoso', 'robo', 'crianca'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
    ],
  },
]

export const MAX_SCORE = 6

// o valor de cada selo é 0, 1 ou 2 — e é assim que ele tem que ser lido
export const SCORE_LABEL = (v: number) => (v >= 2 ? 'FORTE' : v === 1 ? 'QUASE LÁ' : 'FALTOU')