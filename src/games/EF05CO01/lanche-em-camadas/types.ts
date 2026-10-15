/**
 * EF05CO01: listas — itens em sequência, com posição, em número variável, e
 * manipulações simples sobre eles. A receita do lanche é a lista; cada
 * ingrediente pego entra no fim dela (o topo do lanche).
 */

export type IngredientId = 'paoBaixo' | 'paoCima' | 'carne' | 'queijo' | 'alface' | 'tomate' | 'ovo' | 'picles'

export type State = 'intro' | 'demo' | 'play' | 'serve' | 'error' | 'help' | 'done' | 'finale'

export interface Vec {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface IngredientDef {
    id: IngredientId
    name: string
    of: string
    cell: number
}

export interface OrderDef {
    id: string
    customer: number
    ask: string
    recipe: IngredientId[]
    fall: number
    yum: string
    yuck: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    spawnMs: number
    maxAir: number
    pool: IngredientId[]
    orders: OrderDef[]
}
