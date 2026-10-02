export type Paint = 'blue' | 'pink' | 'teal' | 'yellow'

export interface Segment {
    count: number
    paint: Paint
}

export interface FenceDef {
    id: string
    segments: Segment[]
    cards: [number, number, number]
    preset?: number[]
}

export interface LevelDef {
    level: number
    fences: FenceDef[]
}

export type Mode = 'intro' | 'guide' | 'enter' | 'bug' | 'pickSlot' | 'choose' | 'run' | 'result' | 'done' | 'panel'

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}
