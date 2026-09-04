import type { LevelDef, Move, RoutineDef, RoutineStep, TapResult } from '../types'

const jump = (count: number): RoutineStep => ({ move: 'jump', count })
const spin = (count: number): RoutineStep => ({ move: 'spin', count })

/**
 * O que cresce de nível para nível é a SÉRIE, não o número.
 *
 * A conta para em 4 nos três níveis: com 7 anos, quatro repetições já mostram
 * o que é "exato" sem virar exercício de resistência. O que aumenta é quantas
 * etapas a criança segura na ordem — e, do nível 2 em diante, ter de escolher
 * o movimento em vez de receber o botão certo aceso.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Aquecimento',
        soloButton: true,
        routines: [
            { id: '1.1', steps: [jump(2)] },
            { id: '1.2', steps: [spin(3)] },
            { id: '1.3', steps: [jump(4)] },
        ],
    },
    {
        level: 2,
        name: 'Treino',
        soloButton: false,
        routines: [
            { id: '2.1', steps: [jump(2), spin(2)] },
            { id: '2.2', steps: [spin(3), jump(2)] },
            { id: '2.3', steps: [jump(4), spin(1)] },
        ],
    },
    {
        level: 3,
        name: 'Apresentação',
        soloButton: false,
        routines: [
            { id: '3.1', steps: [jump(2), spin(3), jump(1)] },
            { id: '3.2', steps: [spin(3), jump(2), spin(2)] },
            { id: '3.3', steps: [jump(4), spin(2), jump(3)] },
        ],
    },
]

export function tapResult(
    step: RoutineStep,
    tapped: Move,
    currentCount: number,
): TapResult {
    if (tapped !== step.move) return 'wrong-move'
    if (currentCount + 1 > step.count) return 'too-many'
    if (currentCount + 1 === step.count) return 'step-complete'
    return 'keep-going'
}

export const stepsOf = (routine: RoutineDef) => routine.steps.length

export const stepsInLevel = (level: LevelDef) =>
    level.routines.reduce((total, routine) => total + routine.steps.length, 0)

export const repsOf = (routine: RoutineDef) =>
    routine.steps.reduce((total, step) => total + step.count, 0)
