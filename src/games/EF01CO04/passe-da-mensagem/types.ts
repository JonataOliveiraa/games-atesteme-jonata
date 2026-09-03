export type LevelNumber = 1 | 2 | 3

export type MediumId = 'voz' | 'carta' | 'celular'

export interface Point {
    x: number
    y: number
}

export interface SubjectDef {
    id: string
    word: string
    texture: string
}

export interface LevelDef {
    level: LevelNumber
    runs: number
    passes: number
    sameSubject: boolean
    movingGoal: boolean
}

export type TargetKind = 'mate' | 'goal'

export interface Target {
    kind: TargetKind
    index: number
    hook: Point
    at: Point
    mark: Point
}
