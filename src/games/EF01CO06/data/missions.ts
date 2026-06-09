import type { Mission } from '../types'

// ── Nível 1: Introdução ──────────────────────────────────────────────────────
// Apps disponíveis: Relógio + Calculadora
// Tarefas básicas: ajustar horário, fazer uma conta simples

export const MISSIONS_L1: Mission[] = [
  {
    id: 'm1-1',
    text: 'Atualize o horário do computador para 9h00',
    steps: [
      { appId: 'relogio', actionKey: 'set-time', hint: 'Abra o Relógio e clique em Sincronizar' },
    ],
  },
  {
    id: 'm1-2',
    text: 'Calcule quantos alunos há na turma: 12 + 8 = ?',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Abra a Calculadora e pressione =' },
    ],
  },
]

// ── Nível 2: Desenvolvimento ─────────────────────────────────────────────────
// Apps disponíveis: Relógio + Calculadora + Pasta + Gravador
// Progressão: um app novo por missão, sem repetição

export const MISSIONS_L2: Mission[] = [
  {
    id: 'm2-1',
    text: 'Atualize o horário do computador para 9h00',
    steps: [
      { appId: 'relogio', actionKey: 'set-time', hint: 'Abra o Relógio e clique em Sincronizar' },
    ],
  },
  {
    id: 'm2-2',
    text: 'Calcule o número de alunos presentes: 15 + 7 = ?',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Abra a Calculadora e pressione =' },
    ],
  },
  {
    id: 'm2-3',
    text: 'Organize os arquivos de aula na Pasta da Turma',
    steps: [
      { appId: 'pasta', actionKey: 'organize-files', hint: 'Mova todos os arquivos para a pasta e confirme' },
    ],
  },
  {
    id: 'm2-4',
    text: 'Grave uma mensagem de boas-vindas para a turma',
    steps: [
      { appId: 'gravador', actionKey: 'save-recording', hint: 'Grave e salve sua mensagem no Gravador' },
    ],
  },
]

// ── Nível 3: Domínio ─────────────────────────────────────────────────────────
// Apps disponíveis: todos (+ botão Desligar no desktop)
// Tarefas: sequências com 3 passos, uso do botão desligar

export const MISSIONS_L3: Mission[] = [
  {
    id: 'm3-1',
    text: 'Organize os arquivos e atualize o relógio da sala',
    steps: [
      { appId: 'pasta',   actionKey: 'organize-files', hint: 'Mova os arquivos para a Pasta da Turma' },
      { appId: 'relogio', actionKey: 'set-time',       hint: 'Agora sincronize o horário no Relógio' },
    ],
  },
  {
    id: 'm3-2',
    text: 'Grave a lição do dia e faça um desenho para a capa',
    steps: [
      { appId: 'gravador', actionKey: 'save-recording',  hint: 'Grave a lição de hoje no Gravador' },
      { appId: 'desenho',  actionKey: 'confirm-drawing', hint: 'Desenhe a capa e pressione Pronto!' },
    ],
  },
  {
    id: 'm3-3',
    text: 'Calcule o total de materiais: 5 + 7 + 3 = ?',
    steps: [
      { appId: 'calculadora', actionKey: 'calculate', hint: 'Calcule na Calculadora e pressione =' },
    ],
  },
  {
    id: 'm3-4',
    text: 'Ouça a música do encerramento da aula',
    steps: [
      { appId: 'player', actionKey: 'play-music', hint: 'Abra Músicas e clique em Tocar' },
    ],
  },
  {
    id: 'm3-5',
    text: 'Encerre a sessão: desligue o computador corretamente',
    steps: [
      { appId: 'power', actionKey: 'shutdown', hint: 'Clique no botão Desligar no canto inferior direito' },
    ],
  },
]
