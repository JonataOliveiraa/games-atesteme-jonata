export type LevelNumber = 1 | 2 | 3

export type ResultType = 'image' | 'video' | 'text'

export interface ResultDef {
    id: string
    frame: number
    terms: string[]
    type: ResultType
}

export interface ChoiceDef {
    kind: 'add' | 'remove'
    term: string
    hint: string
}

export interface StepDef {
    choices: ChoiceDef[]
}

export interface MissionDef {
    id: string
    request: string
    visitor: number
    initialTerms: string[]
    pool: string[]
    targetId: string
    steps: StepDef[]
}

export interface LevelDef {
    level: LevelNumber
    title: string
    missions: MissionDef[]
}

export type Mode = 'reading' | 'choosing' | 'searching' | 'delivering' | 'done'
