import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Uma cena, uma mudança',
    objective: 'Monte uma cena que mostre uma tecnologia mudando alguma coisa no dia a dia.',
    phases: [
      {
        id: 'l1f1',
        kind: 'cena',
        instruction: 'Monte a sua primeira cena.',
        sub: 'Escolha o tema, quem aparece, onde acontece e o que a pessoa diz.',
        moment: 'depois',
        themeOptions: ['audio'],
        characterOptions: ['crianca', 'adulto', 'idoso'],
        sceneryOptions: ['casa', 'escola', 'rua'],
      },
      {
        id: 'l1f2',
        kind: 'cena',
        instruction: 'Agora uma cena sobre achar o caminho.',
        sub: 'A fala precisa deixar claro o que a tecnologia mudou.',
        moment: 'depois',
        themeOptions: ['gps'],
        characterOptions: ['adulto', 'idoso', 'crianca'],
        sceneryOptions: ['rua', 'casa', 'trabalho'],
      },
      {
        id: 'l1f3',
        kind: 'cena',
        instruction: 'Escolha o tema desta cena.',
        sub: 'Dois temas disponíveis. Você decide qual história contar.',
        moment: 'depois',
        themeOptions: ['aulasOnline', 'audio'],
        characterOptions: ['crianca', 'adulto', 'idoso', 'robo'],
        sceneryOptions: ['escola', 'casa', 'rua'],
      },
    ],
  },
  {
    level: 2,
    title: 'Antes e depois',
    objective: 'Monte uma sequência de quadros mostrando como era antes, como ficou depois e o que mudou.',
    phases: [
      {
        id: 'l2f1',
        kind: 'sequencia',
        instruction: 'Conte a história das compras em três quadros.',
        sub: 'Toque em um quadro vazio do storyboard para montá-lo.',
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
        instruction: 'Agora uma história sobre o trabalho.',
        sub: 'Mostre o serviço antes da máquina, depois dela e o que isso trouxe.',
        theme: 'roboFabrica',
        slots: [
          { moment: 'antes', label: 'Como era antes' },
          { moment: 'depois', label: 'Como ficou depois' },
          { moment: 'consequencia', label: 'O que isso mudou' },
        ],
        characterOptions: ['adulto', 'robo', 'idoso'],
        sceneryOptions: ['trabalho', 'rua', 'casa'],
      },
    ],
  },
  {
    level: 3,
    title: 'História com ponto de vista',
    objective: 'Monte uma história com duas pessoas que pensam diferente e termine com a sua mensagem.',
    phases: [
      {
        id: 'l3f1',
        kind: 'narrativa',
        instruction: 'Trabalho remoto: duas pessoas, dois pontos de vista.',
        sub: 'Monte os três quadros e escolha a mensagem final da história.',
        theme: 'trabalhoRemoto',
        slots: [
          { moment: 'antes', label: 'Como era antes', speaker: 'A' },
          { moment: 'depois', label: 'O que mudou', speaker: 'A' },
          { moment: 'depois', label: 'Outro ponto de vista', speaker: 'B' },
        ],
        characterOptions: ['adulto', 'idoso', 'crianca', 'robo'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
    ],
  },
]

export const MAX_SCORE = 6

export const SCORE_LABEL = (v: number) => (v >= 5 ? 'FORTE' : v >= 3 ? 'DÁ PARA MELHORAR' : 'FRACO')
