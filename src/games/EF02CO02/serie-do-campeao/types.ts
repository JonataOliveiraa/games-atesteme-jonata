export type Move = 'jump' | 'spin'

export type LevelNumber = 1 | 2 | 3

export interface RoutineStep {
    move: Move
    count: number
}

export interface RoutineDef {
    id: string
    steps: RoutineStep[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    soloButton: boolean
    routines: RoutineDef[]
}

export type TapResult = 'wrong-move' | 'too-many' | 'step-complete' | 'keep-going'

export type Phase = 'intro' | 'tutorial' | 'playing' | 'replay' | 'done'
