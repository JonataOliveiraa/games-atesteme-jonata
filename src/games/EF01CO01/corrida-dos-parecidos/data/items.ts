import type { ItemDef, ItemSheet } from '../types'

/**
 * As duas folhas são 300x1500: cinco quadros de 300x300, de cima para baixo.
 * `color` e `shape` descrevem o DESENHO — errar aqui faz a placa pedir uma
 * coisa e a criança ver outra, que é o pior defeito possível neste jogo.
 */
export const FRUIT_ITEMS: ItemDef[] = [
    { id: 'banana', label: 'banana', sheet: 'item-frutas', frame: 0, color: 'amarelo', shape: 'comprido' },
    { id: 'maca', label: 'maçã', sheet: 'item-frutas', frame: 1, color: 'vermelho', shape: 'redondo' },
    { id: 'uva', label: 'uva', sheet: 'item-frutas', frame: 2, color: 'roxo', shape: 'redondo' },
    { id: 'limao', label: 'limão', sheet: 'item-frutas', frame: 3, color: 'verde', shape: 'redondo' },
    { id: 'laranja', label: 'laranja', sheet: 'item-frutas', frame: 4, color: 'laranja', shape: 'redondo' },
]

export const SHAPE_ITEMS: ItemDef[] = [
    { id: 'circulo', label: 'círculo', sheet: 'item-formas', frame: 0, color: 'vermelho', shape: 'redondo' },
    { id: 'quadrado', label: 'quadrado', sheet: 'item-formas', frame: 1, color: 'azul', shape: 'quadrado' },
    { id: 'triangulo', label: 'triângulo', sheet: 'item-formas', frame: 2, color: 'amarelo', shape: 'triangulo' },
    { id: 'estrela', label: 'estrela', sheet: 'item-formas', frame: 3, color: 'roxo', shape: 'estrela' },
    { id: 'retangulo', label: 'retângulo', sheet: 'item-formas', frame: 4, color: 'verde', shape: 'retangulo' },
]

export const ITEMS_BY_SHEET: Record<ItemSheet, ItemDef[]> = {
    'item-frutas': FRUIT_ITEMS,
    'item-formas': SHAPE_ITEMS,
}

export const poolOf = (sheets: ItemSheet[]): ItemDef[] =>
    sheets.flatMap(sheet => ITEMS_BY_SHEET[sheet])
