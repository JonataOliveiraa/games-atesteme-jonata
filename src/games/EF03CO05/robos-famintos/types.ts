export type Format = 'music' | 'photo' | 'text' | 'video'

export type Payload =
    | { samples: number[] }
    | { pixels: string[] }
    | { chars: string[] }
    | { frames: string[][] }

export interface FileDef {
    name: string
    payload: Payload
    disguise?: boolean
}

export type PieceType = 'block' | 'pillar' | 'plank' | 'stage' | 'barrel' | 'pipe' | 'brick' | 'crate'

export interface PieceDef {
    type: PieceType
    x: number
    y: number
}

export interface PhaseDef {
    pieces: PieceDef[]
    robots: Partial<Record<Format, Vec>>
    files: FileDef[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    robots: Format[]
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'load' | 'aim' | 'pull' | 'fly' | 'busy' | 'panel' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }
