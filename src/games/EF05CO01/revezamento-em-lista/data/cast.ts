import type { Swimmer } from '../types'

/**
 * Os seis do elenco. `frame` é a coluna nas duas folhas — o busto de
 * `nadadores-foto.png` e as três poses de `nadadores.png` usam a mesma ordem.
 *
 * `height` não é desenho: é o dado que faz "a mais alta" ser uma função da
 * lista, e não um gabarito guardado no pedido.
 */
export const CAST: Swimmer[] = [
    { id: 'nina', name: 'Nina', trait: 'listrada', frame: 0, color: 0xef5b4c, height: 2 },
    { id: 'teo', name: 'Téo', trait: 'oculos', frame: 1, color: 0x3f7fd6, height: 3 },
    { id: 'bia', name: 'Bia', trait: 'alta', frame: 2, color: 0x2fbfa8, height: 5 },
    { id: 'lila', name: 'Lila', trait: 'ruiva', frame: 3, color: 0x8a63d2, height: 1 },
    { id: 'rafa', name: 'Rafa', trait: 'chama', frame: 4, color: 0xf2922e, height: 4 },
    { id: 'duda', name: 'Duda', trait: 'bolinhas', frame: 5, color: 0xef5fa0, height: 2 },
]

const INDEX = new Map(CAST.map(s => [s.id, s]))

export function swimmer(id: string): Swimmer {
    const found = INDEX.get(id)
    if (!found) throw new Error(`nadador desconhecido: ${id}`)
    return found
}

export function swimmers(ids: string[]): Swimmer[] {
    return ids.map(swimmer)
}
