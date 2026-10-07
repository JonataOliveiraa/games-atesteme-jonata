export type SpotId = 'cup' | 'cable' | 'edge' | 'sun'

export type State = 'risk' | 'safe'

export interface PhaseDef {
    risk: SpotId[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    spots: SpotId[]
    fresh: SpotId[]
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'guide' | 'setup' | 'busy' | 'test' | 'panel' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }
