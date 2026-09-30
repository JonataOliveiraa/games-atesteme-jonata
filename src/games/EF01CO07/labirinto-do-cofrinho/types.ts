export type Cell = '#' | '.' | 'S' | 'E' | 'M' | 'T'

export type PersonId = 'mom' | 'dad' | 'teacher' | 'neighbor' | 'mascot'

export interface Person {
    id: PersonId
    trusted: boolean
    line: string
}

export interface MazeDef {
    id: string
    rows: string[]
    trusted: PersonId
    stranger: PersonId
    trap: PersonId | null
}

export interface LevelDef {
    level: number
    mazes: MazeDef[]
    magnets: number
    shortcut: boolean
    edgeHoldMs: number
    reach: number
    speed: number
    message: string
}

export interface Spot {
    c: number
    r: number
}

export type Dir = 'up' | 'down' | 'left' | 'right'

export type Mode = 'intro' | 'guide' | 'walk' | 'edge' | 'offer' | 'arrive' | 'choose' | 'vault' | 'done' | 'panel'

export type BiaPose = 'idle' | 'walk' | 'happy' | 'oops' | 'show'

export type PersonPose = 'wait' | 'cheer' | 'hold' | 'worry'

export type MagnetPose = 'awake' | 'pull' | 'sleep'

export type Slot = 'top' | 'bottom'

export type Datum = 'photo' | 'name' | 'home' | 'school'

export type Loss = 'magnet' | 'stranger'

export interface Point {
    x: number
    y: number
}
