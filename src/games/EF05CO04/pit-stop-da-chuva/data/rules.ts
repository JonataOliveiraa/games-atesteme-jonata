import type { RuleNode, RuleRow, Situation, Test, TireDef, TireId, Weather, WeatherDef } from '../types'
import { PIECE_CELL } from './files'
import { C } from './theme'

export const WEATHERS: Record<Weather, WeatherDef> = {
    sol: { id: 'sol', raining: false, sun: true, clouds: 'none', wet: 0 },
    nublado: { id: 'nublado', raining: false, sun: false, clouds: 'gray', wet: 0.14 },
    chuva: { id: 'chuva', raining: true, sun: false, clouds: 'rain', wet: 0.26 },
}

export const TIRES: Record<TireId, TireDef> = {
    liso: { id: 'liso', name: 'LISO', vehicle: 'carro', cell: PIECE_CELL.liso, cart: PIECE_CELL.cartLiso, stripe: C.slick },
    chuva: { id: 'chuva', name: 'CHUVA', vehicle: 'carro', cell: PIECE_CELL.chuva, cart: PIECE_CELL.cartChuva, stripe: C.wetTire },
    cravos: { id: 'cravos', name: 'CRAVOS', vehicle: 'carro', cell: PIECE_CELL.cravos, cart: PIECE_CELL.cartCravos, stripe: C.knobby },
    motoLiso: { id: 'motoLiso', name: 'LISO', vehicle: 'moto', cell: PIECE_CELL.motoLiso, cart: PIECE_CELL.cartMotoLiso, stripe: C.slick },
    motoChuva: { id: 'motoChuva', name: 'CHUVA', vehicle: 'moto', cell: PIECE_CELL.motoChuva, cart: PIECE_CELL.cartMotoChuva, stripe: C.wetTire },
}

/** A cor do nome de cada pneu: a mesma faixa da lateral. */
export const TIRE_INK: Record<TireId, 'slick' | 'wet' | 'knobby'> = {
    liso: 'slick',
    chuva: 'wet',
    cravos: 'knobby',
    motoLiso: 'slick',
    motoChuva: 'wet',
}

export const isLeaf = (node: RuleNode): node is { tire: TireId } => 'tire' in node

export function passes(test: Test, s: Situation): boolean {
    if (test === 'chovendo') return WEATHERS[s.weather].raining
    if (test === 'lama') return s.ground === 'lama'
    return s.vehicle === 'moto'
}

/** O veredito: percorre a regra como o computador faria. */
export function tireFor(rule: RuleNode, s: Situation): TireId {
    let node = rule
    while (!isLeaf(node)) node = passes(node.test, s) ? node.then : node.otherwise
    return node.tire
}

export function leaves(rule: RuleNode): TireId[] {
    if (isLeaf(rule)) return [rule.tire]
    return [...leaves(rule.then), ...leaves(rule.otherwise)]
}

/**
 * As linhas do painel. Um SENÃO que é só outro SE vira `SENÃO SE` na mesma
 * altura (a cadeia do N2); um SE dentro do ENTÃO vira linhas recuadas (o N3).
 */
export function rowsOf(rule: RuleNode): RuleRow[] {
    const rows: RuleRow[] = []
    const push = (row: Omit<RuleRow, 'id'>) => {
        const r = { ...row, id: rows.length }
        rows.push(r)
        return r
    }
    const walk = (node: RuleNode, indent: number, parent: number | null, word: RuleRow['word']) => {
        if (isLeaf(node)) {
            push({ indent, word, tire: node.tire, parent })
            return
        }
        const thenLeaf = isLeaf(node.then)
        const head = push({ indent, word, test: node.test, tire: thenLeaf ? (node.then as { tire: TireId }).tire : undefined, parent })
        if (!thenLeaf) walk(node.then, indent + 1, head.id, 'SE')
        if (isLeaf(node.otherwise)) push({ indent, word: 'SENÃO', tire: node.otherwise.tire, parent })
        else if (thenLeaf) walk(node.otherwise, indent, parent, 'SENÃO SE')
        else {
            const other = push({ indent, word: 'SENÃO', parent })
            walk(node.otherwise, indent + 1, other.id, 'SE')
        }
    }
    walk(rule, 0, null, 'SE')
    return rows
}

/** As linhas que acendem para um pneu: a dele e as de fora, que o contêm. */
export function pathOf(rows: RuleRow[], tire: TireId): number[] {
    const path: number[] = []
    let row = rows.find(r => r.tire === tire)
    while (row) {
        path.push(row.id)
        row = row.parent === null ? undefined : rows[row.parent]
    }
    return path
}
