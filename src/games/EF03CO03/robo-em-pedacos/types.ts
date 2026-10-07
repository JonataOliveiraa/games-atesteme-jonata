export type ModuleId = 'legs' | 'body' | 'head' | 'arms' | 'shoes'

export type PointType = 'screw' | 'wire' | 'spring' | 'gear' | 'antenna' | 'bulb' | 'button' | 'eye'

export interface PointDef {
    type: PointType
    loose: boolean
}

export interface ModuleDef {
    id: ModuleId
    points: PointDef[]
}

export interface PhaseDef {
    modules: ModuleDef[]
    pallets: Partial<Record<ModuleId, number>>
}

export interface LevelDef {
    level: number
    title: string
    message: string
    needs: Partial<Record<ModuleId, ModuleId[]>>
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'split' | 'repair' | 'bench' | 'build' | 'plug' | 'walk' | 'busy' | 'panel' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }
