export type Kind = 'leaves' | 'fire' | 'sheep'

export type Tool = 'blower' | 'water' | 'pull'

export type Place = 'earth' | 'space' | 'moon'

export type Slot = 0 | 1 | 2 | 3 | 4

export interface ThingDef {
    kind: Kind
    slot: Slot
    gap: number
}

export interface WaveDef {
    place: Place
    things: ThingDef[]
}

export interface LevelDef {
    level: number
    speed: number
    waves: WaveDef[]
}

export type Mode = 'intro' | 'guide' | 'fly' | 'act' | 'panel' | 'wave' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }
