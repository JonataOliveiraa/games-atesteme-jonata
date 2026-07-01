import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    timeLimit: 30,
    itemIds: ['keyboard', 'mouse', 'monitor', 'game', 'browser', 'music'],
    title: 'Peças ou Programas?',
    objective: 'Toque nos itens que pertencem a cada grupo.',
    tip: 'Peças você pode tocar. Programas são os sistemas que rodam dentro delas.',
    missions: [
      {
        id: 'l1-m1',
        question: 'Quais são PEÇAS? 🔧',
        hint: 'Toque nas peças físicas do computador',
        correctIds: ['keyboard', 'mouse', 'monitor'],
      },
      {
        id: 'l1-m2',
        question: 'Quais são PROGRAMAS? 💻',
        hint: 'Toque nos programas que rodam no computador',
        correctIds: ['game', 'browser', 'music'],
      },
    ],
  },
  {
    level: 2,
    timeLimit: 35,
    itemIds: ['printer', 'printerDriver', 'speaker', 'music', 'monitor', 'photo'],
    title: 'Peças e seus Programas',
    objective: 'Encontre a peça e o programa que funcionam juntos.',
    tip: 'Cada peça física precisa de um programa para funcionar.',
    missions: [
      {
        id: 'l2-m1',
        question: 'Qual PROGRAMA funciona com a IMPRESSORA? 🖨️',
        hint: 'Toque na impressora e no programa que a controla',
        correctIds: ['printer', 'printerDriver'],
        itemIds: ['printer', 'printerDriver', 'speaker', 'monitor'],
      },
      {
        id: 'l2-m2',
        question: 'Qual PROGRAMA toca música na CAIXA DE SOM? 🔊',
        hint: 'Toque na caixa de som e no programa de música',
        correctIds: ['speaker', 'music'],
        itemIds: ['speaker', 'music', 'printerDriver', 'photo'],
      },
      {
        id: 'l2-m3',
        question: 'Qual PROGRAMA mostra fotos no MONITOR? 🖼️',
        hint: 'Toque no monitor e no álbum de fotos',
        correctIds: ['monitor', 'photo'],
        itemIds: ['monitor', 'photo', 'printer', 'music'],
      },
    ],
  },
  {
    level: 3,
    timeLimit: 35,
    itemIds: ['keyboard', 'mouse', 'monitor', 'text', 'game', 'browser', 'hd', 'printer', 'printerDriver', 'music', 'speaker', 'photo'],
    title: 'Monte o kit completo',
    objective: 'Escolha a peça e o programa certos para cada tarefa.',
    tip: 'Toda tarefa precisa de pelo menos uma peça física e um programa.',
    missions: [
      {
        id: 'l3-m1',
        question: 'Monte o KIT PARA ESCREVER TEXTOS 📝',
        hint: 'Você precisa do teclado, do monitor e do editor de texto',
        correctIds: ['keyboard', 'monitor', 'text'],
      },
      {
        id: 'l3-m2',
        question: 'Monte o KIT PARA JOGAR 🎮',
        hint: 'Você precisa do mouse, do monitor e do jogo',
        correctIds: ['mouse', 'monitor', 'game'],
      },
      {
        id: 'l3-m3',
        question: 'Monte o KIT PARA IMPRIMIR FOTOS 🖨️',
        hint: 'Você precisa do monitor, da impressora e do driver',
        correctIds: ['monitor', 'printer', 'printerDriver'],
      },
    ],
  },
]
