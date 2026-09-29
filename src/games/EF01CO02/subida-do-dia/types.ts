export type ProblemId = 'wash' | 'bean' | 'grandma'

export interface Point {
    x: number
    y: number
}

export interface Art {
    id: string
    key: string
    frame: number
}

export interface StepDef {
    id: string
    problem: ProblemId
    cell: number
}

export interface ProblemDef {
    id: ProblemId
    sheet: string
    frames: Record<string, number>
}

export interface RungDef {
    right: string
    wrong: string
    state: string
    fail: string
}

export interface PhaseDef {
    problem: ProblemId
    start: string
    goal: string
    rungs: RungDef[]
}

export interface LevelDef {
    level: number
    options: 2
    rungs: 3
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'guide' | 'choose' | 'busy' | 'replay' | 'panel' | 'done'
