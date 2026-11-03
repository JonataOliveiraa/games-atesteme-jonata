export type ProblemId = 'wash' | 'bean' | 'grandma' | 'paint' | 'sandwich'

export type Routine = ProblemId | 'tangram' | 'hat' | 'shoes'

export interface Point {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Art {
    id: string
    key: string
    frame: number
}

export interface StepDef {
    id: string
    routine: Routine
    cell: number
}

export interface ProblemDef {
    id: ProblemId
    sheet: string
    frames: Record<string, number>
}

export interface RungDef {
    right: string
    state: string
    wrong: string
    fail: string
    stray?: string
}

export interface PhaseDef {
    problem: ProblemId
    start: string
    goal: string
    rungs: RungDef[]
}

export interface LevelDef {
    level: number
    options: 2 | 3
    rungs: 3 | 4
    phases: PhaseDef[]
}

export type Choice = 'right' | 'wrong' | 'stray'

export type Mode = 'intro' | 'guide' | 'choose' | 'busy' | 'replay' | 'panel' | 'done'
