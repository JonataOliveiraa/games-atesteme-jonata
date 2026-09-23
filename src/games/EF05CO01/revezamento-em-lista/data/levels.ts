import { swimmers } from './cast'
import type { Hint, LevelDef, Request, Swimmer, Trait } from '../types'

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

/* ─────────────────── os pedidos de posição, do nível 2 ─────────────────── */

const swapped = (list: Swimmer[], a: number, b: number) => {
    const copy = list.slice()
    const keep = copy[a]
    copy[a] = copy[b]
    copy[b] = keep
    return copy
}

/**
 * TROQUE o 1º com o 3º.
 *
 * Não existe gesto de trocar, e é de propósito: a troca sai de DOIS
 * movimentos, e o estado do meio do caminho não precisa ser o pedido. Só o
 * apito julga — é o que separa "seguir um passo a passo" de "conseguir o
 * estado final".
 */
function swapPositions(a: number, b: number, line: string, why: string): Request {
    return {
        verb: 'move',
        line,
        why,
        solves: (list, start) => {
            if (a >= start.length || b >= start.length) return false
            return sameSequence(list, swapped(start, a, b))
        },
        hint: (list, start, carried): Hint => {
            const want = swapped(start, a, b)
            if (carried) {
                const at = want.findIndex(s => s.id === carried.id)
                return { kind: 'pin', index: Math.max(at, 0) }
            }
            const wrong = want.findIndex((s, i) => list[i]?.id !== s.id)
            return { kind: 'chip', index: Math.max(wrong, 0) }
        },
    }
}

/** O ÚLTIMO vira o PRIMEIRO. A posição sai da lista, e não de um número. */
function lastBecomesFirst(line: string, why: string): Request {
    return {
        verb: 'move',
        line,
        why,
        solves: (list, start) =>
            start.length > 1 && sameSequence(list, moved(start, start.length - 1, 0)),
        hint: (list, start, carried): Hint => {
            if (carried) return { kind: 'pin', index: 0 }
            const who = start[start.length - 1]
            const here = indexOfId(list, who.id)
            return here >= 0 ? { kind: 'chip', index: here } : { kind: 'bench', index: 0 }
        },
    }
}

/* ──────────────── os pedidos por característica, do nível 3 ─────────────── */

/** "O DE ÓCULOS se cansou": quem sai é achado pela marca, não pelo número. */
function removeTrait(trait: Trait, line: string, why: string): Request {
    return {
        verb: 'remove',
        line,
        why,
        solves: (list, start) => {
            const at = start.findIndex(s => s.trait === trait)
            return at >= 0 && sameSequence(list, without(start, at))
        },
        hint: (list, _start, carried): Hint => {
            if (carried) return { kind: 'bench', index: 0 }
            const here = list.findIndex(s => s.trait === trait)
            return here >= 0 ? { kind: 'chip', index: here } : { kind: 'bench', index: 0 }
        },
    }
}

/**
 * "A MAIS ALTA entra ANTES da RUIVA."
 *
 * Os dois lados do pedido são marcas: quem entra e onde. Nenhum número, e
 * nenhum id escrito no pedido — a posição é procurada na lista de agora, que
 * é justamente o que a habilidade chama de manipulação sobre a representação.
 */
function insertBeforeTrait(
    whoTrait: Trait,
    beforeTrait: Trait,
    line: string,
    why: string,
): Request {
    const spotIn = (start: Swimmer[]) => start.findIndex(s => s.trait === beforeTrait)
    return {
        verb: 'insert',
        line,
        why,
        solves: (list, start) => {
            if (start.some(s => s.trait === whoTrait)) return false
            const who = list.find(s => s.trait === whoTrait)
            const at = spotIn(start)
            if (!who || at < 0) return false
            return sameSequence(list, spliceIn(start, at, who))
        },
        hint: (list, start, carried): Hint => {
            if (carried) return { kind: 'pin', index: Math.max(spotIn(start), 0) }
            const here = list.findIndex(s => s.trait === whoTrait)
            return here >= 0 ? { kind: 'chip', index: here } : { kind: 'bench', index: 0 }
        },
    }
}

/**
 * O PEDIDO ABERTO: quem tem a chama fecha a prova.
 *
 * Ele não descreve um movimento, descreve o ESTADO em que a lista tem de
 * terminar — e há mais de um caminho até lá. É o único pedido do jogo que não
 * olha para `start`: o que ele confere é a lista que ficou.
 */
function endsWithTrait(trait: Trait, line: string, why: string): Request {
    return {
        verb: 'move',
        line,
        why,
        solves: list => list.length > 0 && list[list.length - 1].trait === trait,
        hint: (list, _start, carried): Hint => {
            if (carried) return { kind: 'pin', index: list.length }
            const here = list.findIndex(s => s.trait === trait)
            return here >= 0 ? { kind: 'chip', index: here } : { kind: 'bench', index: 0 }
        },
    }
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS NÍVEIS: COMO O PEDIDO ACHA O NADADOR
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   N1  pela POSIÇÃO, literal   — "REMOVA o 2º", "entra no FIM"
 *   N2  pela POSIÇÃO, operando  — "TROQUE o 1º com o 3º", "o ÚLTIMO vira o
 *                                  PRIMEIRO", "INSIRA na posição 2"
 *   N3  pela CARACTERÍSTICA     — "o DE ÓCULOS", "a MAIS ALTA antes da RUIVA"
 *                                  e, na última volta, o estado final
 *
 * É um assunto por nível: a lista é a mesma, o gesto é o mesmo, e o que muda
 * é COMO o pedido se refere a um item dela. Por isso o nível 2 não estreia
 * característica nenhuma e o nível 3 não pede nada por número.
 *
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

    /*
     * NÍVEL 2 — a posição vira operação.
     *
     * A criança já sabe achar o 2º. Aqui ela faz DUAS posições conversarem
     * entre si: trocar, inserir no meio, mandar o fim para o começo. Todo par
     * é encadeado — a volta seguinte pede sobre a lista que a anterior deixou,
     * e é por isso que a renumeração precisa ser vista.
     */
    {
        level: 2,
        heats: [
            {
                id: 'n2-p1',
                list: ['nina', 'teo', 'bia', 'lila'],
                bench: ['rafa'],
                requests: [
                    swapPositions(
                        0, 2,
                        'TROQUE o 1º com o 3º.',
                        'O 1º e o 3º ainda estão onde estavam.',
                    ),
                    insertFromBench(
                        'rafa',
                        1,
                        'O Rafa entra na POSIÇÃO 2.',
                        'O Rafa ainda não está na posição 2.',
                    ),
                ],
                close: 'Duas posições conversaram, e a prova mudou de cara.',
            },
            {
                id: 'n2-p2',
                list: ['duda', 'lila', 'rafa', 'teo'],
                bench: ['bia'],
                requests: [
                    lastBecomesFirst(
                        'O ÚLTIMO vira o PRIMEIRO.',
                        'Quem fechava a fila ainda não abriu.',
                    ),
                    swapPositions(
                        1, 3,
                        'TROQUE o 2º com o 4º.',
                        'O 2º e o 4º ainda estão onde estavam.',
                    ),
                    insertFromBench(
                        'bia',
                        2,
                        'A Bia entra na POSIÇÃO 3.',
                        'A Bia ainda não está na posição 3.',
                    ),
                ],
                close: 'A fila virou do avesso e continuou numerada.',
            },
            {
                id: 'n2-p3',
                list: ['bia', 'nina', 'teo', 'duda', 'rafa'],
                bench: ['lila'],
                requests: [
                    swapPositions(
                        0, 4,
                        'TROQUE o 1º com o 5º.',
                        'As pontas da fila ainda estão nas pontas.',
                    ),
                    insertFromBench(
                        'lila',
                        1,
                        'A Lila entra na POSIÇÃO 2.',
                        'A Lila ainda não está na posição 2.',
                    ),
                    lastBecomesFirst(
                        'O ÚLTIMO vira o PRIMEIRO.',
                        'Quem fechava a fila ainda não abriu.',
                    ),
                ],
                close: 'Seis na água, e a ordem é a que você montou.',
            },
        ],
    },

    /*
     * NÍVEL 3 — o pedido para de contar e passa a olhar.
     *
     * Nenhum número aqui. "O DE ÓCULOS" e "a MAIS ALTA" obrigam a PROCURAR na
     * lista de agora, que é a manipulação que a habilidade descreve — e a
     * última volta de cada prova é um pedido aberto: quem tem a chama fecha a
     * prova, por qualquer caminho que leve até lá.
     */
    {
        level: 3,
        heats: [
            {
                id: 'n3-p1',
                list: ['nina', 'teo', 'rafa', 'lila', 'duda'],
                bench: ['bia'],
                requests: [
                    removeTrait(
                        'oculos',
                        'O DE ÓCULOS se cansou: TIRE ele da fila.',
                        'Quem usa óculos continua na água.',
                    ),
                    endsWithTrait(
                        'chama',
                        'Quem tem a CHAMA na touca FECHA a prova.',
                        'A chama ainda não é a última da fila.',
                    ),
                ],
                close: 'Você achou pela marca, e não pelo número.',
            },
            {
                id: 'n3-p2',
                list: ['bia', 'teo', 'duda', 'rafa', 'nina'],
                bench: ['lila'],
                requests: [
                    removeTrait(
                        'bolinhas',
                        'A de BOLINHAS se cansou: TIRE ela da fila.',
                        'Quem tem bolinhas continua na água.',
                    ),
                    insertBeforeTrait(
                        'ruiva',
                        'oculos',
                        'A RUIVA entra ANTES do de ÓCULOS.',
                        'A ruiva ainda não está logo antes do de óculos.',
                    ),
                    endsWithTrait(
                        'chama',
                        'Quem tem a CHAMA na touca FECHA a prova.',
                        'A chama ainda não é a última da fila.',
                    ),
                ],
                close: 'A marca diz quem, e a marca diz onde.',
            },
            {
                id: 'n3-p3',
                list: ['lila', 'nina', 'rafa', 'teo', 'duda'],
                bench: ['bia'],
                requests: [
                    removeTrait(
                        'listrada',
                        'A de touca LISTRADA se cansou: TIRE ela da fila.',
                        'Quem tem a touca listrada continua na água.',
                    ),
                    insertBeforeTrait(
                        'alta',
                        'ruiva',
                        'A MAIS ALTA entra ANTES da RUIVA.',
                        'A mais alta ainda não está logo antes da ruiva.',
                    ),
                    endsWithTrait(
                        'chama',
                        'Quem tem a CHAMA na touca FECHA a prova.',
                        'A chama ainda não é a última da fila.',
                    ),
                ],
                close: 'A escalação é uma LISTA: tem ordem, tem posição, e dá pra mexer nela.',
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
