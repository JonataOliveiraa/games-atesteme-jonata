import type { LevelConfig } from '../types'

/**
 * Nível 1 — Atributo único: VOLA?
 *   6 veículos (3 voam, 3 não voam), filtro binário + MCQ de contagem.
 *
 * Nível 2 — Comparação lado a lado:
 *   8 veículos, 2 pares comparados por 4 atributos.
 *
 * Nível 3 — Descoberta do atributo:
 *   12 veículos, aluno identifica qual atributo une um grupo destacado.
 */
export const LEVELS: LevelConfig[] = [

  // ── NÍVEL 1 ──────────────────────────────────────────────────────────────
  {
    level: 1,
    timeLimit: 20,
    vehicleIds: ['aviao', 'helicoptero', 'foguete', 'carro', 'onibus', 'bicicleta'],
    filterMissions: [
      {
        id: 'l1-m1',
        instruction: 'Veja quais veículos VOAM! Clique em "SIM" no painel.',
        question: 'Quantos veículos VOAM?',
        filterAttribute: 'voa',
        filterValue: true,
        expectedCount: 3,   // aviao, helicoptero, foguete
      },
      {
        id: 'l1-m2',
        instruction: 'E quais NÃO voam? Clique em "NÃO" no painel.',
        question: 'Quantos veículos NÃO voam?',
        filterAttribute: 'voa',
        filterValue: false,
        expectedCount: 3,   // carro, onibus, bicicleta
      },
    ],
  },

  // ── NÍVEL 2 ──────────────────────────────────────────────────────────────
  {
    level: 2,
    timeLimit: 25,
    vehicleIds: ['aviao', 'carro', 'barco', 'foguete', 'bicicleta', 'lancha', 'trem', 'moto'],
    comparisonPairs: [
      {
        vehicleAId: 'aviao',
        vehicleBId: 'carro',
        attributes: ['voa', 'temRodas', 'temMotor', 'meio'],
      },
      {
        vehicleAId: 'barco',
        vehicleBId: 'foguete',
        attributes: ['voa', 'temRodas', 'temMotor', 'meio'],
      },
    ],
  },

  // ── NÍVEL 3 ──────────────────────────────────────────────────────────────
  {
    level: 3,
    timeLimit: 30,
    vehicleIds: [
      'aviao', 'helicoptero', 'foguete', 'moto',
      'carro', 'onibus', 'bicicleta', 'trem',
      'barco', 'lancha', 'patinete', 'navio',
    ],
    groupingMissions: [
      {
        id: 'l3-m1',
        instruction: 'Observe os veículos em destaque...',
        question: 'O que esses veículos têm em COMUM?',
        highlightAttribute: 'meio',
        highlightValue: 'agua',
        options: [
          { label: 'Voam ✈️',         attribute: 'voa',      value: true    },
          { label: 'Têm rodas 🔵',    attribute: 'temRodas', value: true    },
          { label: 'Vão pela água 🌊', attribute: 'meio',     value: 'agua'  },
          { label: 'Têm motor ⚙️',    attribute: 'temMotor', value: true    },
        ],
        correctOptionIndex: 2,
      },
      {
        id: 'l3-m2',
        instruction: 'Olha esses outros veículos agrupados...',
        question: 'O que esses veículos têm em COMUM?',
        highlightAttribute: 'temMotor',
        highlightValue: false,
        options: [
          { label: 'Voam ✈️',           attribute: 'voa',      value: true  },
          { label: 'Têm rodas 🔵',      attribute: 'temRodas', value: true  },
          { label: 'Não têm motor 🔇',  attribute: 'temMotor', value: false },
          { label: 'Vão pelo ar 💨',    attribute: 'meio',     value: 'ar'  },
        ],
        correctOptionIndex: 2,
      },
    ],
  },
]
