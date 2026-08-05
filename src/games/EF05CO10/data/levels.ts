import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: 'Uma cena, uma mudança',
    objective: 'Monte cenas curtas que mostrem uma tecnologia mudando algo do dia a dia.',
    phases: [
      {
        id: 'l1f1',
        kind: 'cena',
        instruction: 'Monte a sua primeira cena.',
        sub: 'Escolha quem aparece, onde acontece e uma fala que mostre a mudança.',
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
        instruction: 'Mostre uma mudança na escola.',
        sub: 'Compare a sala de aula com o jeito de aprender pela tela.',
        moment: 'depois',
        themeOptions: ['aulasOnline'],
        characterOptions: ['crianca', 'adulto', 'idoso'],
        sceneryOptions: ['escola', 'casa', 'rua'],
      },
      {
        id: 'l1f4',
        kind: 'cena',
        instruction: 'Escolha qual mudança contar.',
        sub: 'Agora você decide o tema e monta uma cena com mais intenção.',
        moment: 'depois',
        themeOptions: ['audio', 'gps', 'aulasOnline'],
        characterOptions: ['crianca', 'adulto', 'idoso', 'robo'],
        sceneryOptions: ['casa', 'escola', 'rua'],
      },
    ],
  },
  {
    level: 2,
    title: 'Antes, depois e consequência',
    objective: 'Monte sequências de três quadros mostrando como era antes, como ficou depois e que impacto apareceu.',
    phases: [
      {
        id: 'l2f1',
        kind: 'sequencia',
        instruction: 'Conte a história das compras em três quadros.',
        sub: 'Mostre a feira antes, o aplicativo depois e uma consequência para as pessoas.',
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
        instruction: 'Agora uma história sobre trabalho com robô.',
        sub: 'Mostre o serviço antes da máquina, depois dela e o cuidado necessário.',
        theme: 'roboFabrica',
        slots: [
          { moment: 'antes', label: 'Antes da máquina' },
          { moment: 'depois', label: 'Com o robô' },
          { moment: 'consequencia', label: 'Novo cuidado' },
        ],
        characterOptions: ['adulto', 'robo', 'idoso'],
        sceneryOptions: ['trabalho', 'rua', 'casa'],
      },
      {
        id: 'l2f3',
        kind: 'sequencia',
        instruction: 'Mostre o trabalho remoto em três quadros.',
        sub: 'A sequência precisa mostrar rotina, mudança e consequência social.',
        theme: 'trabalhoRemoto',
        slots: [
          { moment: 'antes', label: 'Antes do remoto' },
          { moment: 'depois', label: 'Trabalhando em casa' },
          { moment: 'consequencia', label: 'Impacto na rotina' },
        ],
        characterOptions: ['adulto', 'idoso', 'crianca'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
    ],
  },
  {
    level: 3,
    title: 'História com ponto de vista',
    objective: 'Monte histórias com duas vozes e uma mensagem final que mostre ganhos, limites e opinião crítica.',
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
      {
        id: 'l3f2',
        kind: 'narrativa',
        instruction: 'Robô no trabalho: eficiência e novos aprendizados.',
        sub: 'Mostre dois pontos de vista sobre automação e termine com uma mensagem crítica.',
        theme: 'roboFabrica',
        slots: [
          { moment: 'antes', label: 'Antes do robô', speaker: 'A' },
          { moment: 'depois', label: 'O que melhorou', speaker: 'A' },
          { moment: 'consequencia', label: 'Outro cuidado', speaker: 'B' },
        ],
        characterOptions: ['adulto', 'idoso', 'robo', 'crianca'],
        sceneryOptions: ['trabalho', 'casa', 'rua'],
      },
    ],
  },
]

export const MAX_SCORE = 6

export const SCORE_LABEL = (v: number) => (v >= 5 ? 'FORTE' : v >= 3 ? 'DÁ PARA MELHORAR' : 'FRACO')