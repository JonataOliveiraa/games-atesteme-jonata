import type { Mission } from '../types'

export const MISSIONS_L1: Mission[] = [
  {
    id: 'm1-1',
    text: 'Ajuste o relógio do computador para 9:00',
    steps: [
      { appId: 'relogio', actionKey: 'set-time', hint: 'Abra o Relógio e use os botões + e -',
        clockStart: { h: 8, m: 45 }, clockTarget: { h: 9, m: 0 } },
    ],
  },
  {
    id: 'm1-2',
    text: 'Some os alunos da turma: 12 + 8',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Digite 12 + 8 e pressione =',
        expectedExpr: '12 + 8', expectedAnswer: 20 },
    ],
  },
]

export const MISSIONS_L2: Mission[] = [
  {
    id: 'm2-1',
    text: 'Ajuste o relógio para 10:30',
    steps: [
      { appId: 'relogio', actionKey: 'set-time', hint: 'Use os botões de hora e minuto',
        clockStart: { h: 9, m: 45 }, clockTarget: { h: 10, m: 30 } },
    ],
  },
  {
    id: 'm2-2',
    text: 'Some os presentes: 15 + 7',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Digite 15 + 7 e pressione =',
        expectedExpr: '15 + 7', expectedAnswer: 22 },
    ],
  },
  {
    id: 'm2-3',
    text: 'Guarde os arquivos na Pasta da Turma',
    steps: [
      { appId: 'pasta', actionKey: 'organize-files', hint: 'Arraste os 3 arquivos e confirme' },
    ],
  },
  {
    id: 'm2-4',
    text: 'Grave uma mensagem de boas-vindas',
    steps: [
      { appId: 'gravador', actionKey: 'save-recording', hint: 'Grave, pare e salve' },
    ],
  },
]

export const MISSIONS_L3: Mission[] = [
  {
    id: 'm3-1',
    text: 'Guarde os arquivos e ajuste o relógio para 8:00',
    steps: [
      { appId: 'pasta',   actionKey: 'organize-files', hint: 'Primeiro arraste os arquivos para a pasta' },
      { appId: 'relogio', actionKey: 'set-time', hint: 'Agora ajuste o relógio para 8:00',
        clockStart: { h: 7, m: 15 }, clockTarget: { h: 8, m: 0 } },
    ],
  },
  {
    id: 'm3-2',
    text: 'Grave a lição e desenhe a capa',
    steps: [
      { appId: 'gravador', actionKey: 'save-recording',  hint: 'Grave a lição no Gravador' },
      { appId: 'desenho',  actionKey: 'confirm-drawing', hint: 'Desenhe e toque em Pronto' },
    ],
  },
  {
    id: 'm3-3',
    text: 'Conte os materiais: 5 + 7 + 3',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Digite 5 + 7 + 3 e pressione =',
        expectedExpr: '5 + 7 + 3', expectedAnswer: 15 },
    ],
  },
  {
    id: 'm3-4',
    text: 'Toque a música do encerramento',
    steps: [
      { appId: 'player', actionKey: 'play-music', hint: 'Abra Músicas e toque em Tocar' },
    ],
  },
  {
    id: 'm3-5',
    text: 'Desligue o computador corretamente',
    steps: [
      { appId: 'power', actionKey: 'shutdown', hint: 'Use o botão Desligar na barra de tarefas' },
    ],
  },
]