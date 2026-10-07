export type Kind = 'leaves' | 'fire' | 'sheep'

export type Tool = 'blower' | 'water' | 'pull'

export type Place = 'earth' | 'space' | 'moon'

export type Slot = 0 | 1 | 2 | 3 | 4

export type Rule = 'free' | 'things' | 'tools'

export interface ThingDef {
    kind: Kind
    slot: Slot
    gap: number
    group?: number
    decoy?: boolean
}

export interface WaveDef {
    place: Place
    things: ThingDef[]
}

export interface LevelDef {
    level: number
    speed: number
    rule: Rule
    waves: WaveDef[]
}

export interface SignRow {
    kind?: Kind
    tool?: Tool
    count: number
}

export type Mode = 'intro' | 'guide' | 'fly' | 'panel' | 'wave' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }
