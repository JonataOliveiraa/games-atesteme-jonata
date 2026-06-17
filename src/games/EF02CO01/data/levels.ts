import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    timeLimit: 30,
    vehicleIds: ['aviao', 'helicoptero', 'foguete', 'carro', 'onibus', 'bicicleta'],
    title: 'Voar ou não voar?',
    objective: 'Toque nos veículos que pertencem a cada grupo.',
    tip: 'Observe as imagens com atenção antes de tocar.',
    missions: [
      {
        id: 'l1-m1',
        question: 'Quais veículos VOAM? ✈️',
        hint: 'Toque nos veículos que voam',
        attribute: 'voa',
        value: true,
      },
      {
        id: 'l1-m2',
        question: 'Quais NÃO voam? 🚗',
        hint: 'Toque nos veículos que não voam',
        attribute: 'voa',
        value: false,
      },
      {
        id: 'l1-m3',
        question: 'Quais têm MOTOR? ⚙️',
        hint: 'Toque nos veículos que usam motor',
        attribute: 'temMotor',
        value: true,
      },
    ],
  },
  {
    level: 2,
    timeLimit: 30,
    vehicleIds: ['aviao', 'carro', 'barco', 'foguete', 'bicicleta', 'lancha', 'trem', 'moto'],
    title: 'Onde vão e como funcionam?',
    objective: 'Identifique os veículos pelo meio e pelo funcionamento.',
    tip: 'Alguns veículos podem ter mais de uma característica!',
    missions: [
      {
        id: 'l2-m1',
        question: 'Quais vão pelo AR? ✈️',
        hint: 'Toque nos veículos que se movem pelo ar',
        attribute: 'meio',
        value: 'ar',
      },
      {
        id: 'l2-m2',
        question: 'Quais vão pela ÁGUA? 🌊',
        hint: 'Toque nos veículos que se movem pela água',
        attribute: 'meio',
        value: 'agua',
      },
      {
        id: 'l2-m3',
        question: 'Quais vão pela TERRA? 🛣️',
        hint: 'Toque nos veículos que se movem pela terra',
        attribute: 'meio',
        value: 'terra',
      },
    ],
  },
  {
    level: 3,
    timeLimit: 35,
    vehicleIds: [
      'aviao', 'helicoptero', 'foguete', 'moto',
      'carro', 'onibus', 'bicicleta', 'trem',
      'barco', 'lancha', 'patinete', 'navio',
    ],
    title: 'Ar, terra ou água?',
    objective: 'Classifique todos os veículos pelo meio de transporte.',
    tip: 'Existem 3 grupos: ar, terra e água. Encontre todos!',
    missions: [
      {
        id: 'l3-m1',
        question: 'Quais vão pelo AR? ✈️',
        hint: 'Toque nos veículos que se movem pelo ar',
        attribute: 'meio',
        value: 'ar',
      },
      {
        id: 'l3-m2',
        question: 'Quais vão pela TERRA? 🛣️',
        hint: 'Toque nos veículos que se movem pela terra',
        attribute: 'meio',
        value: 'terra',
      },
      {
        id: 'l3-m3',
        question: 'Quais vão pela ÁGUA? 🌊',
        hint: 'Toque nos veículos que se movem pela água',
        attribute: 'meio',
        value: 'agua',
      },
    ],
  },
]
