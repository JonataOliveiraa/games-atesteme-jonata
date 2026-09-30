export type Paint = 'blue' | 'pink' | 'teal' | 'yellow'

export type Outcome = 'exact' | 'over' | 'under'

export interface FenceDef {
    id: string
    boards: number
    cards: [number, number, number]
    paint: Paint
}

export interface LevelDef {
    level: number
    fences: FenceDef[]
    steps: 1 | 2
    debug: boolean
}

export type Mode = 'intro' | 'guide' | 'enter' | 'choose' | 'run' | 'result' | 'done' | 'panel'

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}
