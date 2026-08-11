import type {
    ActionId,
    ConditionId,
    Coord,
    Direction,
    MazeChallenge,
    Program,
    RobotState,
    SimulationResult,
    TraceStep,
} from '../types'

/** Trava contra laço infinito. A criança pode montar um em 'montar-programa'. */
export const MAX_ITERATIONS = 40

export const CONDITION_LABELS: Record<ConditionId, string> = {
    caminho_livre: 'a casa da frente estiver livre',
    nao_no_objetivo: 'não chegou na estrela',
    passos_menos_de_2: 'andou menos de 2 passos',
    passos_menos_de_3: 'andou menos de 3 passos',
    passos_menos_de_4: 'andou menos de 4 passos',
    passos_menos_de_5: 'andou menos de 5 passos',
    passos_menos_de_6: 'andou menos de 6 passos',
}

export const CONDITION_HELP: Record<ConditionId, string> = {
    caminho_livre: 'Olhe a casa destacada na frente do robô.',
    nao_no_objetivo: 'Veja se o robô ainda não está na estrela.',
    passos_menos_de_2: 'Conte só os passos que ele já andou.',
    passos_menos_de_3: 'Conte só os passos que ele já andou.',
    passos_menos_de_4: 'Conte só os passos que ele já andou.',
    passos_menos_de_5: 'Conte só os passos que ele já andou.',
    passos_menos_de_6: 'Conte só os passos que ele já andou.',
}

export const CONDITION_ICON: Record<ConditionId, string> = {
    caminho_livre: 'icon-cond-caminho',
    nao_no_objetivo: 'icon-cond-objetivo',
    passos_menos_de_2: 'icon-cond-passos',
    passos_menos_de_3: 'icon-cond-passos',
    passos_menos_de_4: 'icon-cond-passos',
    passos_menos_de_5: 'icon-cond-passos',
    passos_menos_de_6: 'icon-cond-passos',
}

export const ACTION_LABELS: Record<ActionId, string> = {
    avancar: 'Andar um passo',
    'virar-dir': 'Virar à direita',
    'virar-esq': 'Virar à esquerda',
}

export const ACTION_ICON: Record<ActionId, string> = {
    avancar: 'icon-avancar',
    'virar-dir': 'icon-virar-dir',
    'virar-esq': 'icon-virar-esq',
}

/** Deslocamento de cada direção. Índice = Direction. */
const DELTA: ReadonlyArray<Coord> = [
    { c: 0, r: -1 },
    { c: 1, r: 0 },
    { c: 0, r: 1 },
    { c: -1, r: 0 },
]

export function ahead(state: RobotState): Coord {
    const d = DELTA[state.dir]
    return { c: state.c + d.c, r: state.r + d.r }
}

export function turn(dir: Direction, action: ActionId): Direction {
    if (action === 'virar-dir') return ((dir + 1) % 4) as Direction
    if (action === 'virar-esq') return ((dir + 3) % 4) as Direction
    return dir
}

export function isWall(ch: MazeChallenge, cell: Coord): boolean {
    return ch.walls.some(w => w.c === cell.c && w.r === cell.r)
}

export function inside(ch: MazeChallenge, cell: Coord): boolean {
    return cell.c >= 0 && cell.c < ch.width && cell.r >= 0 && cell.r < ch.height
}

/** Uma célula é transitável se está no tabuleiro e não é parede. */
export function walkable(ch: MazeChallenge, cell: Coord): boolean {
    return inside(ch, cell) && !isWall(ch, cell)
}

export function conditionHolds(
    conditionId: ConditionId,
    ch: MazeChallenge,
    state: RobotState,
): boolean {
    if (conditionId === 'caminho_livre') {
        return walkable(ch, ahead(state))
    }
    if (conditionId === 'nao_no_objetivo') {
        return !(state.c === ch.goal.c && state.r === ch.goal.r)
    }
    const n = Number(conditionId.replace('passos_menos_de_', ''))
    return state.steps < n
}

const clone = (s: RobotState): RobotState => ({ ...s })

/**
 * Roda o programa e devolve o trace completo. O trace é o que a cena anima:
 * cada 'verificar' é o momento em que a condição é testada antes da volta.
 */
export function simulate(ch: MazeChallenge, program: Program): SimulationResult {
    const trace: TraceStep[] = []
    let state: RobotState = {
        c: ch.start.c,
        r: ch.start.r,
        dir: ch.startDir,
        steps: 0,
    }

    const runAction = (action: ActionId, iteration: number): boolean => {
        const before = clone(state)

        if (action === 'avancar') {
            const target = ahead(state)
            if (!walkable(ch, target)) {
                trace.push({ kind: 'bater', iteration, before, after: clone(state), action, target })
                return false
            }
            state = { ...state, c: target.c, r: target.r, steps: state.steps + 1 }
            trace.push({ kind: 'avancar', iteration, before, after: clone(state), action, target })
            return true
        }

        state = { ...state, dir: turn(state.dir, action) }
        trace.push({ kind: 'virar', iteration, before, after: clone(state), action })
        return true
    }

    for (const action of program.setup) {
        if (!runAction(action, -1)) {
            return { trace, outcome: 'bateu', final: state, iterations: 0 }
        }
    }

    let iterations = 0
    for (;;) {
        const before = clone(state)
        const value = conditionHolds(program.condition, ch, state)
        trace.push({ kind: 'verificar', iteration: iterations, before, after: before, conditionValue: value })

        if (!value) break

        if (iterations >= MAX_ITERATIONS) {
            return { trace, outcome: 'infinito', final: state, iterations }
        }

        for (const action of program.body) {
            if (!runAction(action, iterations)) {
                return { trace, outcome: 'bateu', final: state, iterations }
            }
        }
        iterations++
    }

    const atGoal = state.c === ch.goal.c && state.r === ch.goal.r
    return {
        trace,
        outcome: atGoal ? 'objetivo' : 'parou',
        final: state,
        iterations,
    }
}

export function conditionSentence(id: ConditionId): string {
    return `Enquanto ${CONDITION_LABELS[id]}`
}
