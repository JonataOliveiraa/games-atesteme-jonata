import type { LevelConfig } from '../types'
import { ALL_ITEMS } from './items'

/**
 * Configuração dos 3 níveis do jogo Base dos Classificadores.
 *
 * Nível 1 — Critério único (cor), 4 itens, 2 bases, sem timer
 *   Scaffolding máximo: cada base aceita apenas uma cor, regra bem visível.
 *
 * Nível 2 — Dois critérios alternados (cor e forma), 8 itens, 4 bases, sem timer
 *   Itens visualmente parecidos para aumentar o desafio da discriminação.
 *
 * Nível 3 — Critério forma com exceção por tamanho, 10 itens, 3 bases, timer 60s
 *   A regra de classificação é forma, mas há bases com restrição de tamanho.
 */

const itemById = (id: string) => {
  const found = ALL_ITEMS.find(i => i.id === id)
  if (!found) throw new Error(`Item não encontrado: ${id}`)
  return found
}

export const LEVELS: LevelConfig[] = [
  // NÍVEL 1
  {
    level: 1,
    criterion: 'cor',
    items: [
      itemById('r-cir-m'),
      itemById('r-qua-m'),
      itemById('a-cir-m'),
      itemById('a-qua-m'),
    ],
    bases: [
      {
        id: 'base-vermelho',
        rule: { attribute: 'cor', value: 'vermelho' },
        labelKey: 'Vermelho',
        audioKey: 'narr-cor-vermelho',
        x: 320,
        y: 560,
      },
      {
        id: 'base-azul',
        rule: { attribute: 'cor', value: 'azul' },
        labelKey: 'Azul',
        audioKey: 'narr-cor-azul',
        x: 960,
        y: 560,
      },
    ],
  },

  // NÍVEL 2
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
        x: 200,
        y: 560,
      },
      {
        id: 'base-azul',
        rule: { attribute: 'cor', value: 'azul' },
        labelKey: 'Azul',
        audioKey: 'narr-cor-azul',
        x: 520,
        y: 560,
      },
      {
        id: 'base-verde',
        rule: { attribute: 'cor', value: 'verde' },
        labelKey: 'Verde',
        audioKey: 'narr-cor-verde',
        x: 760,
        y: 560,
      },
      {
        id: 'base-amarelo',
        rule: { attribute: 'cor', value: 'amarelo' },
        labelKey: 'Amarelo',
        audioKey: 'narr-cor-amarelo',
        x: 1080,
        y: 560,
      },
    ],
  },

  // NÍVEL 3
  {
    level: 3,
    criterion: 'forma',
    timeLimit: 60,
    items: [
      itemById('r-cir-m'),
      itemById('a-cir-g'),
      itemById('v-cir-g'),
      itemById('r-qua-p'),
      itemById('a-qua-g'),
      itemById('v-qua-g'),
      itemById('r-tri-p'),
      itemById('a-tri-g'),
      itemById('r-ret-m'),
      itemById('a-ret-p'),
    ],
    bases: [
      {
        id: 'base-circulo',
        rule: { attribute: 'forma', value: 'circulo' },
        labelKey: 'Círculo',
        audioKey: 'narr-forma-circulo',
        x: 280,
        y: 560,
      },
      {
        id: 'base-quadrado',
        rule: { attribute: 'forma', value: 'quadrado' },
        labelKey: 'Quadrado',
        audioKey: 'narr-forma-quadrado',
        x: 640,
        y: 560,
      },
      {
        id: 'base-triangulo',
        rule: { attribute: 'forma', value: 'triangulo' },
        labelKey: 'Triângulo',
        audioKey: 'narr-forma-triangulo',
        x: 1000,
        y: 560,
      },
    ],
  },
]
