import type { LevelDef, Move, RoutineDef, RoutineStep, TapResult } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Aquecimento',
        soloButton: true,
        routines: [
            { id: '1.1', steps: [{ move: 'jump', count: 2 }] },
            { id: '1.2', steps: [{ move: 'spin', count: 3 }] },
            { id: '1.3', steps: [{ move: 'jump', count: 4 }] },
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
