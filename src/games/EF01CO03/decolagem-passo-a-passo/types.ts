export type SceneId = 'rocket' | 'balloon' | 'kite'

export interface IconRef {
    sheet: string
    cell: number
}

export interface CardDef {
    id: string
    label: string
    icon: IconRef
}

export interface StepDef extends CardDef {
    needs: string[]
}

export interface ExtraDef extends CardDef {
    scene: string
}

export interface FailDef {
    step: string
    missing: string
    scene: string
}

export interface MissionDef {
    id: string
    scene: SceneId
    steps: StepDef[]
    fails: FailDef[]
    extra?: ExtraDef
    guide?: string
}

export interface LevelDef {
    level: number
    missions: MissionDef[]
}

export type Mode = 'intro' | 'guide' | 'pick' | 'busy' | 'launch' | 'done'
