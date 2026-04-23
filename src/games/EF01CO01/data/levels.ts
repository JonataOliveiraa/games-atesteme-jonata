import type { LevelConfig } from '../types'
import { ALL_ITEMS } from './items'

/**
 * Configuração dos 3 níveis do jogo Base dos Classificadores.
 *
 * Nível 1 — Critério cor, 6 itens (3 formas × 2 cores), 2 bases, timer 30 s.
 *   Formas variadas dificultam classificação visual por forma acidental.
 *
 * Nível 2 — Critério cor, 8 itens, 4 bases (todas as cores), sem timer.
 *   Maior volume e mais opções de cor.
 *
 * Nível 3 — Critério forma, 10 itens, 3 bases, timer 90 s.
 *   Critério muda de cor para forma; temporizador visível.
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
      itemById('r-cir-m'),
      itemById('r-qua-p'),
      itemById('r-tri-p'),
      itemById('a-cir-g'),
      itemById('a-qua-m'),
      itemById('a-tri-g'),
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
    items: [
      itemById('r-cir-p'),
      itemById('r-tri-p'),
      itemById('a-cir-p'),
      itemById('a-tri-p'),
      itemById('v-cir-m'),
      itemById('v-tri-m'),
      itemById('am-cir-p'),
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
    timeLimit: 90,
    items: [
      itemById('r-cir-m'),
      itemById('a-cir-g'),
      itemById('v-cir-g'),
      itemById('r-qua-p'),
      itemById('a-qua-g'),
      itemById('v-qua-g'),
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
