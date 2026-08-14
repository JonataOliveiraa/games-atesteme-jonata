import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    timeLimit: 60,
    title: 'Peças ou Programas?',
    objective: 'Arraste cada item para o grupo certo.',
    tip: 'Peça é o que você pode tocar. Programa roda dentro do computador.',
    missions: [
      {
        id: 'l1-m1',
        question: 'Arraste cada item para o grupo certo',
        hint: 'Peças você toca com a mão. Programas você não toca.',
        itemIds: ['keyboard', 'game', 'monitor', 'browser'],
        zones: [
          { id: 'z-hw', label: 'PEÇAS', kind: 'pecas', acceptIds: ['keyboard', 'monitor'] },
          { id: 'z-sw', label: 'PROGRAMAS', kind: 'programas', acceptIds: ['game', 'browser'] },
        ],
      },
      {
        id: 'l1-m2',
        question: 'Agora com mais itens: separe peças e programas',
        hint: 'Pense: dá para pegar com a mão?',
        itemIds: ['mouse', 'music', 'speaker', 'text', 'hd', 'photo'],
        zones: [
          { id: 'z-hw', label: 'PEÇAS', kind: 'pecas', acceptIds: ['mouse', 'speaker', 'hd'] },
          { id: 'z-sw', label: 'PROGRAMAS', kind: 'programas', acceptIds: ['music', 'text', 'photo'] },
        ],
      },
    ],
  },
  {
    level: 2,
    timeLimit: 60,
    title: 'Cada peça com seu programa',
    objective: 'Arraste o programa que faz cada peça funcionar.',
    tip: 'Toda peça precisa de um programa para funcionar.',
    missions: [
      {
        id: 'l2-m1',
        question: 'Qual programa faz a IMPRESSORA funcionar?',
        hint: 'Arraste para dentro da impressora',
        itemIds: ['printerDriver', 'music', 'photo'],
        zones: [
          { id: 'z-printer', label: 'IMPRESSORA', kind: 'maquina', acceptIds: ['printerDriver'] },
        ],
      },
      {
        id: 'l2-m2',
        question: 'Qual programa faz a CAIXA DE SOM tocar?',
        hint: 'Arraste para dentro da caixa de som',
        itemIds: ['music', 'text', 'printerDriver'],
        zones: [
          { id: 'z-speaker', label: 'CAIXA DE SOM', kind: 'maquina', acceptIds: ['music'] },
        ],
      },
      {
        id: 'l2-m3',
        question: 'Qual programa mostra fotos no MONITOR?',
        hint: 'Arraste para dentro do monitor',
        itemIds: ['photo', 'game', 'music'],
        zones: [
          { id: 'z-monitor', label: 'MONITOR', kind: 'maquina', acceptIds: ['photo'] },
        ],
      },
    ],
  },
  {
    level: 3,
    timeLimit: 75,
    title: 'Monte a máquina completa',
    objective: 'Junte as peças e os programas para a tarefa funcionar.',
    tip: 'Cada tarefa precisa de peças E de programas.',
    missions: [
      {
        id: 'l3-m1',
        question: 'Monte o kit para ESCREVER UM TEXTO',
        hint: 'Precisa de teclado, monitor e editor de texto',
        itemIds: ['keyboard', 'monitor', 'text', 'game', 'speaker'],
        zones: [
          { id: 'z-machine', label: 'MÁQUINA DE ESCREVER TEXTO', kind: 'maquina',
            acceptIds: ['keyboard', 'monitor', 'text'] },
        ],
      },
      {
        id: 'l3-m2',
        question: 'Monte o kit para OUVIR MÚSICA',
        hint: 'Precisa da caixa de som e do tocador de música',
        itemIds: ['speaker', 'music', 'printer', 'text'],
        zones: [
          { id: 'z-machine', label: 'MÁQUINA DE OUVIR MÚSICA', kind: 'maquina',
            acceptIds: ['speaker', 'music'] },
        ],
      },
      {
        id: 'l3-m3',
        question: 'Monte o kit para IMPRIMIR UMA FOTO',
        hint: 'Precisa do monitor, da impressora e do driver',
        itemIds: ['monitor', 'printer', 'printerDriver', 'game', 'mouse'],
        zones: [
          { id: 'z-machine', label: 'MÁQUINA DE IMPRIMIR FOTO', kind: 'maquina',
            acceptIds: ['monitor', 'printer', 'printerDriver'] },
        ],
      },
    ],
  },
]