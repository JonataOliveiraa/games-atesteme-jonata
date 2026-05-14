import type { LevelConfig } from '../types'
import { ALL_ITEMS } from './items'

/**
 * Configuração dos 3 níveis do jogo Base dos Classificadores.
 *
 * Nível 1 — Critério: COR (3 cores: vermelho, azul, amarelo)
 *   9 itens com 3 formas diferentes (círculo, quadrado, triângulo) misturadas.
 *   Forma varia propositalmente para a criança aprender a ignorá-la e focar na cor.
 *   3 bases por cor. Timer 25 s.
 *
 * Nível 2 — Critério: COR (4 cores: azul, vermelho, amarelo, verde)
 *   12 itens = 4 cores × 3 formas (círculo, quadrado, triângulo).
 *   Mais itens e mais cores tornam a tarefa mais exigente.
 *   4 bases por cor. Timer 30 s.
 *
 * Nível 3 — Critério: FORMA (4 formas: círculo, quadrado, triângulo, retângulo)
 *   20 itens em 2 linhas = 4 formas × 5 cores (+ roxo).
 *   Cor varia em todas as formas — não serve como pista.
 *   4 bases por forma. Timer 40 s.
 *
 * Posições das bases (canvas 1280×720, y=570):
 *   3 bases → x: 280, 640, 1000
 *   4 bases → x: 190, 450, 830, 1090
 */

const itemById = (id: string) => {
  const found = ALL_ITEMS.find(i => i.id === id)
  if (!found) throw new Error(`Item não encontrado: ${id}`)
  return found
}

export const LEVELS: LevelConfig[] = [
  // ── NÍVEL 1 — Classificar por COR (3 cores, 3 formas misturadas) ─────────
  {
    level: 1,
    criterion: 'cor',
    timeLimit: 25,
    items: [
      // vermelho — uma forma de cada
      itemById('r-cir-m'),
      itemById('r-qua-p'),
      itemById('r-tri-m'),
      // azul — uma forma de cada
      itemById('a-cir-g'),
      itemById('a-qua-m'),
      itemById('a-tri-p'),
      // amarelo — uma forma de cada
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
        x: 280,
        y: 570,
      },
      {
        id: 'base-azul',
        rule: { attribute: 'cor', value: 'azul' },
        labelKey: 'Azul',
        audioKey: 'narr-cor-azul',
        x: 640,
        y: 570,
      },
      {
        id: 'base-amarelo',
        rule: { attribute: 'cor', value: 'amarelo' },
        labelKey: 'Amarelo',
        audioKey: 'narr-cor-amarelo',
        x: 1000,
        y: 570,
      },
    ],
  },

  // ── NÍVEL 2 — Classificar por COR (4 cores, 3 formas) ────────────────────
  {
    level: 2,
    criterion: 'cor',
    timeLimit: 30,
    items: [
      // vermelho
      itemById('r-cir-p'),
      itemById('r-qua-m'),
      itemById('r-tri-m'),
      // azul
      itemById('a-cir-g'),
      itemById('a-qua-p'),
      itemById('a-tri-g'),
      // verde
      itemById('v-cir-m'),
      itemById('v-qua-g'),
      itemById('v-tri-m'),
      // amarelo
      itemById('am-cir-g'),
      itemById('am-qua-g'),
      itemById('am-tri-m'),
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

  // ── NÍVEL 3 — Classificar por FORMA (4 formas, 5 cores, 2 linhas) ────────
  {
    level: 3,
    criterion: 'forma',
    timeLimit: 40,
    items: [
      // círculos — 5 cores diferentes
      itemById('r-cir-m'),
      itemById('a-cir-g'),
      itemById('v-cir-g'),
      itemById('am-cir-g'),
      itemById('rx-cir-m'),
      // quadrados — 5 cores diferentes
      itemById('r-qua-p'),
      itemById('a-qua-g'),
      itemById('v-qua-p'),
      itemById('am-qua-g'),
      itemById('rx-qua-p'),
      // triângulos — 5 cores diferentes
      itemById('r-tri-m'),
      itemById('a-tri-p'),
      itemById('v-tri-g'),
      itemById('am-tri-m'),
      itemById('rx-tri-g'),
      // retângulos — 5 cores diferentes
      itemById('r-ret-m'),
      itemById('a-ret-p'),
      itemById('v-ret-m'),
      itemById('am-ret-g'),
      itemById('rx-ret-m'),
    ],
    bases: [
      {
        id: 'base-circulo',
        rule: { attribute: 'forma', value: 'circulo' },
        labelKey: 'Círculo',
        audioKey: 'narr-forma-circulo',
        x: 190,
        y: 570,
      },
      {
        id: 'base-quadrado',
        rule: { attribute: 'forma', value: 'quadrado' },
        labelKey: 'Quadrado',
        audioKey: 'narr-forma-quadrado',
        x: 450,
        y: 570,
      },
      {
        id: 'base-triangulo',
        rule: { attribute: 'forma', value: 'triangulo' },
        labelKey: 'Triângulo',
        audioKey: 'narr-forma-triangulo',
        x: 830,
        y: 570,
      },
      {
        id: 'base-retangulo',
        rule: { attribute: 'forma', value: 'retangulo' },
        labelKey: 'Retângulo',
        audioKey: 'narr-forma-retangulo',
        x: 1090,
        y: 570,
      },
    ],
  },
]
