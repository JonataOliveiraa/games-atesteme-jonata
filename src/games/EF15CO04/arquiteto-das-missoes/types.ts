export type IconId = string

export type LevelNumber = 1 | 2 | 3

export interface StepDef {
    id: string
    icon: IconId
    label: string
}

export interface PartDef {
    id: string
    label: string
    task: string
    done: string
    icon: IconId
    steps: StepDef[]
}

export interface DecoyDef {
    id: string
    label: string
    icon: IconId
}

export interface MissionDef {
    id: string
    goalLabel: string
    goalIcon: IconId
    before: string
    after: string
    sheet?: string
    parts: PartDef[]
    decoys: DecoyDef[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    missions: MissionDef[]
}

export type Phase = 'intro' | 'tutorial' | 'split' | 'solve' | 'combine' | 'running' | 'done'
