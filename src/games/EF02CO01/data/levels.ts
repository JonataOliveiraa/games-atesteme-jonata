import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    vehicleIds: ['aviao', 'helicoptero', 'foguete', 'carro', 'onibus', 'bicicleta'],
    title: 'Separar por pistas',
    objective: 'Observe os veículos e toque nos que combinam com a pista da missão.',
    tip: 'Comece por pistas simples: voa, não voa, tem motor ou não tem motor.',
    missions: [
      {
        id: 'l1-m1',
        question: 'Quais veículos voam?',
        hint: 'Selecione avião, helicóptero e foguete.',
        attribute: 'voa',
        value: true,
      },
      {
        id: 'l1-m2',
        question: 'Quais veículos não voam?',
        hint: 'Procure os que ficam no chão.',
        attribute: 'voa',
        value: false,
      },
      {
        id: 'l1-m3',
        question: 'Quais veículos têm motor?',
        hint: 'Bicicleta não usa motor; compare com os outros.',
        attribute: 'temMotor',
        value: true,
      },
    ],
  },
  {
    level: 2,
    vehicleIds: ['aviao', 'carro', 'barco', 'foguete', 'bicicleta', 'lancha', 'trem', 'moto'],
    title: 'Onde eles circulam?',
    objective: 'Classifique os veículos pelo meio em que eles se deslocam.',
    tip: 'Alguns têm motor, outros não; agora a pergunta principal é onde eles se movem.',
    missions: [
      {
        id: 'l2-m1',
        question: 'Quais vão pelo ar?',
        hint: 'Procure veículos que se deslocam voando.',
        attribute: 'meio',
        value: 'ar',
      },
      {
        id: 'l2-m2',
        question: 'Quais vão pela água?',
        hint: 'Barco e lancha ficam nesse grupo.',
        attribute: 'meio',
        value: 'agua',
      },
      {
        id: 'l2-m3',
        question: 'Quais vão pela terra?',
        hint: 'Rodas e trilhos ajudam a encontrar esse grupo.',
        attribute: 'meio',
        value: 'terra',
      },
    ],
  },
  {
    level: 3,
    vehicleIds: ['aviao', 'helicoptero', 'foguete', 'moto', 'carro', 'onibus', 'bicicleta', 'trem', 'barco', 'lancha', 'patinete', 'navio'],
    title: 'Hangar completo',
    objective: 'Resolva missões com mais veículos e combine pistas diferentes.',
    tip: 'Leia a pista antes de tocar. Às vezes a pergunta é sobre meio; às vezes é sobre funcionamento.',
    missions: [
      {
        id: 'l3-m1',
        question: 'Quais vão pelo ar?',
        hint: 'São os veículos do grupo aéreo.',
        attribute: 'meio',
        value: 'ar',
      },
      {
        id: 'l3-m2',
        question: 'Quais têm rodas?',
        hint: 'Rodas podem aparecer em veículos de terra e também no avião.',
        attribute: 'temRodas',
        value: true,
      },
      {
        id: 'l3-m3',
        question: 'Quais vão pela água?',
        hint: 'Selecione todos os veículos aquáticos.',
        attribute: 'meio',
        value: 'agua',
      },
      {
        id: 'l3-m4',
        question: 'Quais não têm motor?',
        hint: 'Procure veículos movidos pela força das pessoas ou pelo vento.',
        attribute: 'temMotor',
        value: false,
      },
    ],
  },
]