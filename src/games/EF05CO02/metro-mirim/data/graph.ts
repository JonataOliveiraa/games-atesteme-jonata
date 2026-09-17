import type { Edge } from '../types'

/**
 * O grafo, sem Phaser nenhum: só isto decide quem chega.
 *
 * Tudo aqui é busca em largura sobre as arestas que EXISTEM no momento da
 * pergunta. Nenhuma função guarda estado, e nenhuma delas sabe o que a fase
 * esperava — é por isso que a mesma fase aceita redes diferentes.
 */

export const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

export const hasEdge = (edges: Edge[], a: string, b: string) =>
    edges.some(e => key(e.a, e.b) === key(a, b))

function adjacency(edges: Edge[]) {
    const map = new Map<string, string[]>()
    const push = (a: string, b: string) => {
        const list = map.get(a)
        if (list) list.push(b)
        else map.set(a, [b])
    }
    edges.forEach(e => {
        push(e.a, e.b)
        push(e.b, e.a)
    })
    return map
}

/** Distância em trilhos a partir de `from`, junto com o caminho de volta. */
function search(edges: Edge[], from: string) {
    const near = adjacency(edges)
    const dist = new Map<string, number>([[from, 0]])
    const prev = new Map<string, string>()
    const queue = [from]

    for (let i = 0; i < queue.length; i++) {
        const at = queue[i]
        const step = dist.get(at)! + 1
        for (const next of near.get(at) ?? []) {
            if (dist.has(next)) continue
            dist.set(next, step)
            prev.set(next, at)
            queue.push(next)
        }
    }
    return { dist, prev, order: queue }
}

/** Quantos trilhos separam as duas estações, ou `null` se não há caminho. */
export function hops(edges: Edge[], from: string, to: string): number | null {
    if (from === to) return 0
    return search(edges, from).dist.get(to) ?? null
}

/** O caminho em estações, começando em `from`. `null` quando não existe. */
export function pathOf(edges: Edge[], from: string, to: string): string[] | null {
    if (from === to) return [from]
    const { dist, prev } = search(edges, from)
    if (!dist.has(to)) return null

    const path = [to]
    let at = to
    while (at !== from) {
        at = prev.get(at)!
        path.unshift(at)
    }
    return path
}

/**
 * Até onde dá para ir quando o destino não tem caminho.
 *
 * O trem de quem ficou sem rede não pode simplesmente não sair: a criança
 * precisa VER que ele andou o que dava e parou. Aqui devolvemos o caminho até
 * a estação mais distante que ele alcança.
 */
export function strandedPath(edges: Edge[], from: string): string[] {
    const { dist, order } = search(edges, from)
    let far = from
    for (const id of order) if ((dist.get(id) ?? 0) > (dist.get(far) ?? 0)) far = id
    return pathOf(edges, from, far) ?? [from]
}

/** Quantas estações a rede alcança a partir de `from`, contando ela mesma. */
export const reach = (edges: Edge[], from: string) => search(edges, from).dist.size
