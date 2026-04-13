import type { GameItem } from '../types'

/**
 * Dataset completo de itens do jogo Base dos Classificadores.
 * Todos os itens são desenhados programaticamente via Graphics no BootScene
 * (sem depender de atlas externo). O campo `frame` ficará vazio até
 * que assets reais sejam adicionados em public/assets/images/.
 *
 * Cada item tem cor, forma e tamanho — os 3 atributos classificáveis.
 */
export const ALL_ITEMS: GameItem[] = [
  // --- vermelhos ---
  { id: 'r-cir-p', color: 'vermelho', shape: 'circulo',    size: 'pequeno', frame: '' },
  { id: 'r-cir-m', color: 'vermelho', shape: 'circulo',    size: 'medio',   frame: '' },
  { id: 'r-cir-g', color: 'vermelho', shape: 'circulo',    size: 'grande',  frame: '' },
  { id: 'r-qua-p', color: 'vermelho', shape: 'quadrado',   size: 'pequeno', frame: '' },
  { id: 'r-qua-m', color: 'vermelho', shape: 'quadrado',   size: 'medio',   frame: '' },
  { id: 'r-qua-g', color: 'vermelho', shape: 'quadrado',   size: 'grande',  frame: '' },
  { id: 'r-tri-p', color: 'vermelho', shape: 'triangulo',  size: 'pequeno', frame: '' },
  { id: 'r-tri-m', color: 'vermelho', shape: 'triangulo',  size: 'medio',   frame: '' },
  { id: 'r-ret-m', color: 'vermelho', shape: 'retangulo',  size: 'medio',   frame: '' },

  // --- azuis ---
  { id: 'a-cir-p', color: 'azul', shape: 'circulo',    size: 'pequeno', frame: '' },
  { id: 'a-cir-m', color: 'azul', shape: 'circulo',    size: 'medio',   frame: '' },
  { id: 'a-cir-g', color: 'azul', shape: 'circulo',    size: 'grande',  frame: '' },
  { id: 'a-qua-p', color: 'azul', shape: 'quadrado',   size: 'pequeno', frame: '' },
  { id: 'a-qua-m', color: 'azul', shape: 'quadrado',   size: 'medio',   frame: '' },
  { id: 'a-qua-g', color: 'azul', shape: 'quadrado',   size: 'grande',  frame: '' },
  { id: 'a-tri-p', color: 'azul', shape: 'triangulo',  size: 'pequeno', frame: '' },
  { id: 'a-tri-g', color: 'azul', shape: 'triangulo',  size: 'grande',  frame: '' },
  { id: 'a-ret-p', color: 'azul', shape: 'retangulo',  size: 'pequeno', frame: '' },

  // --- verdes ---
  { id: 'v-cir-m', color: 'verde', shape: 'circulo',    size: 'medio',   frame: '' },
  { id: 'v-cir-g', color: 'verde', shape: 'circulo',    size: 'grande',  frame: '' },
  { id: 'v-qua-p', color: 'verde', shape: 'quadrado',   size: 'pequeno', frame: '' },
  { id: 'v-qua-g', color: 'verde', shape: 'quadrado',   size: 'grande',  frame: '' },
  { id: 'v-tri-m', color: 'verde', shape: 'triangulo',  size: 'medio',   frame: '' },
  { id: 'v-tri-g', color: 'verde', shape: 'triangulo',  size: 'grande',  frame: '' },
  { id: 'v-ret-m', color: 'verde', shape: 'retangulo',  size: 'medio',   frame: '' },

  // --- amarelos ---
  { id: 'am-cir-p', color: 'amarelo', shape: 'circulo',    size: 'pequeno', frame: '' },
  { id: 'am-cir-g', color: 'amarelo', shape: 'circulo',    size: 'grande',  frame: '' },
  { id: 'am-qua-m', color: 'amarelo', shape: 'quadrado',   size: 'medio',   frame: '' },
  { id: 'am-qua-g', color: 'amarelo', shape: 'quadrado',   size: 'grande',  frame: '' },
  { id: 'am-tri-p', color: 'amarelo', shape: 'triangulo',  size: 'pequeno', frame: '' },
  { id: 'am-tri-m', color: 'amarelo', shape: 'triangulo',  size: 'medio',   frame: '' },
  { id: 'am-ret-g', color: 'amarelo', shape: 'retangulo',  size: 'grande',  frame: '' },
]

/** Filtra itens pelo valor de um atributo */
export function itemsByAttribute(attr: 'cor' | 'forma' | 'tamanho', value: string): GameItem[] {
  if (attr === 'cor')     return ALL_ITEMS.filter(i => i.color === value)
  if (attr === 'forma')   return ALL_ITEMS.filter(i => i.shape === value)
  if (attr === 'tamanho') return ALL_ITEMS.filter(i => i.size  === value)
  return []
}

/** Retorna N itens aleatórios do dataset */
export function randomItems(n: number): GameItem[] {
  const shuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}
