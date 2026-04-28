import type { LevelConfig } from '../types'
import { ALL_ITEMS } from './items'

/**
 * Configuração dos 3 níveis do jogo Base dos Classificadores.
 *
 * Nível 1 — Critério cor, 6 itens (círculos em 3 tamanhos × 2 cores), 2 bases, timer 30 s.
 *   Forma idêntica em todos os itens — única variável é a cor (scaffolding máximo).
 *
 * Nível 2 — Critério cor, 12 itens (3 formas × 4 cores), 4 bases, timer 45 s.
 *   3 formas por cor (círculo, quadrado, triângulo) dificultam classificação visual por forma.
 *
 * Nível 3 — Critério forma, 12 itens (4 itens × 3 formas, todas as 4 cores por forma), 3 bases, timer 60 s.
 *   Todas as 4 cores distribuídas igualmente em cada forma — cor não serve como pista secundária.
 *
 * Posições das bases (canvas 1280×720, y=570 fixo):
 *   2 bases → x: 380, 900
 *   4 bases → x: 190, 450, 830, 1090
 *   3 bases → x: 280, 640, 1000
 */

const itemById = (id: string) => {
  const found = ALL_ITEMS.find(i => i.id === id)
  if (!found) throw new Error(`Item não encontrado: ${id}`)
  return found
}

export const LEVELS: LevelConfig[] = [
  // ── NÍVEL 1 ──────────────────────────────────────────────────────────
  {
    level: 1,
    criterion: 'cor',
    timeLimit: 30,
    items: [
      itemById('r-cir-p'),
      itemById('r-cir-m'),
      itemById('r-cir-g'),
      itemById('a-cir-p'),
      itemById('a-cir-m'),
      itemById('a-cir-g'),
    ],
    bases: [
      {
        id: 'base-vermelho',
        rule: { attribute: 'cor', value: 'vermelho' },
        labelKey: 'Vermelho',
        audioKey: 'narr-cor-vermelho',
        x: 380,
        y: 570,
      },
      {
        id: 'base-azul',
        rule: { attribute: 'cor', value: 'azul' },
        labelKey: 'Azul',
        audioKey: 'narr-cor-azul',
        x: 900,
        y: 570,
      },
    ],
  },

  // ── NÍVEL 2 ──────────────────────────────────────────────────────────
  {
    level: 2,
    criterion: 'cor',
    timeLimit: 45,
    items: [
      itemById('r-cir-p'),
      itemById('r-qua-m'),
      itemById('r-tri-p'),
      itemById('a-cir-g'),
      itemById('a-qua-p'),
      itemById('a-tri-g'),
      itemById('v-cir-m'),
      itemById('v-qua-g'),
      itemById('v-tri-m'),
      itemById('am-cir-g'),
      itemById('am-qua-m'),
      itemById('am-tri-p'),
    ],
    bases: [
      {
        id: 'base-vermelho',
        rule: { attribute: 'cor', value: 'vermelho' },
        labelKey: 'Vermelho',
        audioKey: 'narr-cor-vermelho',
        x: 190,
        y: 570,
      },
      {
        id: 'base-azul',
        rule: { attribute: 'cor', value: 'azul' },
        labelKey: 'Azul',
        audioKey: 'narr-cor-azul',
        x: 450,
        y: 570,
      },
      {
        id: 'base-verde',
        rule: { attribute: 'cor', value: 'verde' },
        labelKey: 'Verde',
        audioKey: 'narr-cor-verde',
        x: 830,
        y: 570,
      },
      {
        id: 'base-amarelo',
        rule: { attribute: 'cor', value: 'amarelo' },
        labelKey: 'Amarelo',
        audioKey: 'narr-cor-amarelo',
        x: 1090,
        y: 570,
      },
    ],
  },

  // ── NÍVEL 3 ──────────────────────────────────────────────────────────
  {
    level: 3,
    criterion: 'forma',
    timeLimit: 60,
    items: [
      // círculos — 4 cores
      itemById('r-cir-m'),
      itemById('a-cir-g'),
      itemById('v-cir-g'),
      itemById('am-cir-g'),
      // quadrados — 4 cores
      itemById('r-qua-p'),
      itemById('a-qua-g'),
      itemById('v-qua-g'),
      itemById('am-qua-m'),
      // triângulos — 4 cores
      itemById('r-tri-p'),
      itemById('a-tri-g'),
      itemById('v-tri-m'),
      itemById('am-tri-p'),
    ],
    bases: [
      {
        id: 'base-circulo',
        rule: { attribute: 'forma', value: 'circulo' },
        labelKey: 'Círculo',
        audioKey: 'narr-forma-circulo',
        x: 280,
        y: 570,
      },
      {
        id: 'base-quadrado',
        rule: { attribute: 'forma', value: 'quadrado' },
        labelKey: 'Quadrado',
        audioKey: 'narr-forma-quadrado',
        x: 640,
        y: 570,
      },
      {
        id: 'base-triangulo',
        rule: { attribute: 'forma', value: 'triangulo' },
        labelKey: 'Triângulo',
        audioKey: 'narr-forma-triangulo',
        x: 1000,
        y: 570,
      },
    ],
  },
]
