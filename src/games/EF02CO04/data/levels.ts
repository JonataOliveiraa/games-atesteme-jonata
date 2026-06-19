import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    timeLimit: 30,
    itemIds: ['keyboard', 'mouse', 'monitor', 'game', 'browser', 'music'],
    title: 'Hardware ou Software?',
    objective: 'Toque nos itens que pertencem a cada grupo.',
    tip: 'Hardware você pode tocar. Software é o programa que roda dentro dele.',
    missions: [
      {
        id: 'l1-m1',
        question: 'Quais são HARDWARE? 🔧',
        hint: 'Toque nas peças físicas do computador',
        correctIds: ['keyboard', 'mouse', 'monitor'],
      },
      {
        id: 'l1-m2',
        question: 'Quais são SOFTWARE? 💻',
        hint: 'Toque nos programas que rodam dentro do computador',
        correctIds: ['game', 'browser', 'music'],
      },
    ],
  },
  {
    level: 2,
    timeLimit: 30,
    itemIds: ['printer', 'printerDriver', 'speaker', 'music', 'monitor', 'photo', 'keyboard', 'text', 'mouse', 'browser'],
    title: 'Pares que dão vida à máquina',
    objective: 'Encontre o hardware e o software que funcionam juntos.',
    tip: 'Cada peça física precisa de um programa para funcionar de verdade.',
    missions: [
      {
        id: 'l2-m1',
        question: 'Qual SOFTWARE funciona com a IMPRESSORA? 🖨️',
        hint: 'Toque na impressora e no software que a controla',
        correctIds: ['printer', 'printerDriver'],
      },
      {
        id: 'l2-m2',
        question: 'Qual SOFTWARE toca música na CAIXA DE SOM? 🔊',
        hint: 'Toque na caixa de som e no software de música',
        correctIds: ['speaker', 'music'],
      },
      {
        id: 'l2-m3',
        question: 'Qual SOFTWARE mostra fotos no MONITOR? 🖼️',
        hint: 'Toque no monitor e no álbum de fotos',
        correctIds: ['monitor', 'photo'],
      },
    ],
  },
  {
    level: 3,
    timeLimit: 35,
    itemIds: ['keyboard', 'mouse', 'monitor', 'text', 'game', 'browser', 'hd', 'printer', 'printerDriver', 'music', 'speaker', 'photo'],
    title: 'Monte o kit completo',
    objective: 'Escolha o hardware e o software certos para cada tarefa.',
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
        hint: 'Você precisa do monitor, da impressora e do driver da impressora',
        correctIds: ['monitor', 'printer', 'printerDriver'],
      },
    ],
  },
]
