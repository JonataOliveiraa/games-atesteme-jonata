import { C } from './theme'
import type { Item, Veiculo, VeiculoId } from '../types'

export const VEICULOS: Record<VeiculoId, Veiculo> = {
    carroca: {
        id: 'carroca',
        via: 'estrada',
        levaPeso: true,
        chegaEm: 'amanha',
    },
    barco: {
        id: 'barco',
        via: 'agua',
        levaPeso: true,
        chegaEm: 'agora',
    },
    aviao: {
        id: 'aviao',
        via: 'ar',
        levaPeso: false,
        chegaEm: 'agora',
    },
}

/** A bancada do nível 2, na ordem em que sobe na tela. */
export const ITENS_N2: Item[] = [
    { id: 'carroca', nome: 'Carroça', sheet: 'veiculos', cols: 3, rows: 2, coluna: 0, cor: C.carroca, placa: C.carroca },
    { id: 'barco', nome: 'Barco', sheet: 'veiculos', cols: 3, rows: 2, coluna: 1, cor: C.barco, placa: C.barco },
    { id: 'aviao', nome: 'Avião', sheet: 'veiculos', cols: 3, rows: 2, coluna: 2, cor: C.aviao, placa: C.aviao },
]
