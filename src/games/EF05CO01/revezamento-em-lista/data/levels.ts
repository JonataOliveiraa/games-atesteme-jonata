import { swimmers } from './cast'
import type { Hint, LevelDef, Request, Swimmer } from '../types'

export const MIN_IN_WATER = 2
export const MAX_IN_WATER = 6

export const sameSequence = (a: Swimmer[], b: Swimmer[]) =>
    a.length === b.length && a.every((s, i) => s.id === b[i].id)

const without = (list: Swimmer[], index: number) => list.filter((_, i) => i !== index)

const spliceIn = (list: Swimmer[], index: number, who: Swimmer) => {
    const copy = list.slice()
    copy.splice(index, 0, who)
    return copy
}

const moved = (list: Swimmer[], from: number, to: number) => {
    const rest = without(list, from)
    return spliceIn(rest, Math.min(to, rest.length), list[from])
}

const indexOfId = (list: Swimmer[], id: string) => list.findIndex(s => s.id === id)

/** Tirar alguém da água: a ficha vai para o banco. */
function removeAt(position: number, line: string, why: string): Request {
    return {
        verb: 'remove',
        line,
        why,
        solves: (list, start) => sameSequence(list, without(start, position)),
        hint: (list, start): Hint => {
            const who = start[position]
            const here = indexOfId(list, who.id)
            return here >= 0 ? { kind: 'chip', index: here } : { kind: 'bench', index: 0 }
        },
    }
}

/** Trazer quem está no banco para uma posição. `position` negativo conta do fim. */
function insertFromBench(id: string, position: number, line: string, why: string): Request {
    const at = (list: Swimmer[]) => (position < 0 ? list.length : Math.min(position, list.length))
    return {
        verb: 'insert',
        line,
        why,
        solves: (list, start) => {
            const who = list.find(s => s.id === id)
            if (!who) return false
            return sameSequence(list, spliceIn(start, at(start), who))
        },
        hint: (list, start): Hint => {
            const here = indexOfId(list, id)
            if (here < 0) return { kind: 'bench', index: 0 }
            return { kind: 'pin', index: at(start) }
        },
    }
}

/** Mudar alguém de lugar dentro da água. `to` negativo é o fim da fila. */
function moveWithin(from: number, to: number, line: string, why: string): Request {
    const target = (list: Swimmer[]) => (to < 0 ? list.length - 1 : to)
    return {
        verb: 'move',
        line,
        why,
        solves: (list, start) => sameSequence(list, moved(start, from, target(start))),
        hint: (list, start): Hint => {
            const who = start[from]
            const here = indexOfId(list, who.id)
            if (here === from) return { kind: 'chip', index: here }
            return { kind: 'pin', index: target(start) + (here >= 0 && here < target(start) ? 0 : 1) }
        },
    }
}

/**
 * NÍVEL 1 — a posição diz quando cada um nada.
 *
 * Uma prova só, para avaliação. As três voltas são os três verbos, e a
 * terceira depende da renumeração da segunda.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        heats: [
            {
                id: 'n1-p1',
                guided: true,
                list: ['nina', 'teo', 'bia'],
                bench: ['duda'],
                requests: [
                    removeAt(
                        1,
                        'O 2º se cansou: TIRE ele da fila.',
                        'O 2º da fila continua na água.',
                    ),
                    insertFromBench(
                        'duda',
                        -1,
                        'Chegou reforço: ponha a DUDA no FIM da fila.',
                        'A Duda ainda não está no fim da fila.',
                    ),
                    moveWithin(
                        0,
                        -1,
                        'Agora o 1º fecha a prova: mande ele para o FIM.',
                        'Quem era o 1º não chegou ao fim.',
                    ),
                ],
                close: 'A fila mudou, e a prova nadou a fila nova.',
            },
        ],
    },
]

export const TOTAL_LAPS = LEVELS.reduce(
    (sum, level) => sum + level.heats.reduce((n, heat) => n + heat.requests.length, 0),
    0,
)

export const pointsFor = (afterLock: boolean) => (afterLock ? 5 : 10)

/* ─────────────────────────── as duas validações ─────────────────────────── */

interface Board {
    list: Swimmer[]
    bench: Swimmer[]
}

function nextBoards(board: Board): Board[] {
    const out: Board[] = []
    const { list, bench } = board

    list.forEach((_, from) => {
        for (let to = 0; to < list.length; to++) {
            if (to === from) continue
            out.push({ list: moved(list, from, to), bench })
        }
        if (list.length > MIN_IN_WATER) {
            out.push({ list: without(list, from), bench: bench.concat(list[from]) })
        }
    })

    bench.forEach((who, b) => {
        if (list.length >= MAX_IN_WATER) return
        for (let to = 0; to <= list.length; to++) {
            out.push({ list: spliceIn(list, to, who), bench: bench.filter((_, i) => i !== b) })
        }
    })

    return out
}

/** Dá para chegar ao pedido em até `depth` movimentos, a partir daqui? */
function reachable(board: Board, request: Request, start: Swimmer[], depth = 2): boolean {
    let frontier = [board]
    for (let step = 0; step < depth; step++) {
        const next: Board[] = []
        for (const state of frontier) {
            for (const candidate of nextBoards(state)) {
                if (request.solves(candidate.list, start)) return true
                next.push(candidate)
            }
        }
        frontier = next
    }
    return false
}

/**
 * Prova impossível no meio de um nível é o pior defeito que este jogo pode
 * ter: a criança fica tentando para sempre. Estas checagens falham alto no
 * desenvolvimento, e não custam nada em produção porque rodam uma vez.
 */
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.heats.length > 5) problems.push(`nível ${level.level}: mais de 5 provas`)

        level.heats.forEach(heat => {
            let list = swimmers(heat.list)
            let bench = swimmers(heat.bench)

            if (list.length < MIN_IN_WATER) problems.push(`${heat.id}: a prova começa com menos de ${MIN_IN_WATER}`)
            if (list.length > MAX_IN_WATER) problems.push(`${heat.id}: a prova começa com mais de ${MAX_IN_WATER}`)

            heat.requests.forEach((request, lap) => {
                const start = list
                const where = `${heat.id} volta ${lap + 1}`

                if (request.solves(start, start)) {
                    problems.push(`${where}: o pedido já está cumprido antes de a criança mexer`)
                }
                if (!reachable({ list, bench }, request, start)) {
                    problems.push(`${where}: não há solução em até dois movimentos`)
                }

                const solved = solveOnce({ list, bench }, request, start)
                if (!solved) return
                list = solved.list
                bench = solved.bench
                if (list.length > MAX_IN_WATER) problems.push(`${where}: a lista passa de ${MAX_IN_WATER}`)
            })
        })
    })

    return problems
}

/** O estado em que a prova chega na volta seguinte é o do pedido resolvido. */
function solveOnce(board: Board, request: Request, start: Swimmer[]): Board | undefined {
    let frontier = [board]
    for (let step = 0; step < 2; step++) {
        const next: Board[] = []
        for (const state of frontier) {
            for (const candidate of nextBoards(state)) {
                if (request.solves(candidate.list, start)) return candidate
                next.push(candidate)
            }
        }
        frontier = next
    }
    return undefined
}
