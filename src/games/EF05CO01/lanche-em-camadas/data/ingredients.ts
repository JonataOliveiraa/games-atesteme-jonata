import type { IngredientDef, IngredientId } from '../types'

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
    paoBaixo: { id: 'paoBaixo', name: 'pão de baixo', of: 'do pão de baixo', cell: 0 },
    paoCima: { id: 'paoCima', name: 'pão de cima', of: 'do pão de cima', cell: 1 },
    carne: { id: 'carne', name: 'carne', of: 'da carne', cell: 2 },
    queijo: { id: 'queijo', name: 'queijo', of: 'do queijo', cell: 3 },
    alface: { id: 'alface', name: 'alface', of: 'da alface', cell: 4 },
    tomate: { id: 'tomate', name: 'tomate', of: 'do tomate', cell: 5 },
    ovo: { id: 'ovo', name: 'ovo', of: 'do ovo', cell: 6 },
    picles: { id: 'picles', name: 'picles', of: 'do picles', cell: 7 },
}
