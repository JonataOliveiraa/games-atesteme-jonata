export type ItemKind = 'jornal' | 'alerta' | 'imagem'

export type ClueId = 'quem' | 'quando' | 'onde'

export type PhotoId = 'alienigenas' | 'enchente' | 'capivaras' | 'piscina' | 'lua' | 'dinossauro'

export interface Clue {
    text: string
    ok: boolean
}

export interface ItemDef {
    id: string
    kind: ItemKind
    from: string
    title: string
    forwarded?: boolean
    photo?: PhotoId
    clues: Record<ClueId, Clue>
    why: string
}

export interface Range {
    min: number
    max: number
}

export interface MoveDef {
    range: number
    period: number
}

export interface CourseDef {
    seed: number
    sections: number[]
    finish: number
    step: Range
    width: Range
    shift: number
    move?: MoveDef & { every: number }
}

export interface DemoDef {
    item: ItemDef
    text: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    altitude: number
    bad?: number
    course: CourseDef
    items: ItemDef[]
    demos: DemoDef[]
}

export type PlatformKind = 'aba' | 'parada' | 'chao' | 'topo'

export interface Platform {
    id: number
    kind: PlatformKind
    x: number
    y: number
    w: number
    alt: number
    item?: number
    move?: MoveDef & { phase: number }
}

export interface Course {
    platforms: Platform[]
    links: [number, number][]
    knots: { y: number; a: number }[]
    summit: Platform
}

export type State = 'intro' | 'play' | 'help' | 'card' | 'error' | 'done' | 'finale'

export interface Vec {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}
