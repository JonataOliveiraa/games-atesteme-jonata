import { C } from './theme'
import type { Invencao, InvencaoId, Item } from '../types'

export const INVENCOES: Record<InvencaoId, Invencao> = {
    megafone: {
        id: 'megafone',
        canal: 'som',
        alcance: 30,
        chegaEm: 'agora',
        precisaAparelho: false,
    },
    telefone: {
        id: 'telefone',
        canal: 'som',
        alcance: 9999,
        chegaEm: 'agora',
        precisaAparelho: true,
    },
    carta: {
        id: 'carta',
        canal: 'escrito',
        alcance: 9999,
        chegaEm: 'amanha',
        precisaAparelho: false,
    },
}

/** A bancada do nível 1, na ordem em que sobe na tela. */
export const ITENS_N1: Item[] = [
    { id: 'megafone', nome: 'Megafone', sheet: 'invencoes', cols: 3, rows: 2, coluna: 0, cor: C.megafone, placa: C.megafone },
    { id: 'telefone', nome: 'Telefone', sheet: 'invencoes', cols: 3, rows: 2, coluna: 1, cor: C.telefone, placa: C.telefone },
    { id: 'carta', nome: 'Carta', sheet: 'invencoes', cols: 3, rows: 2, coluna: 2, cor: C.carta, placa: C.warnDark },
]
