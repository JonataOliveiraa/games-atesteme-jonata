export type ItemKind = 'jornal' | 'alerta' | 'imagem'

export type ClueId = 'quem' | 'quando' | 'onde'

export interface Clue {
    text: string
    ok: boolean
}

export interface ItemDef {
    id: string
    kind: ItemKind
    from: string
    title: string
    photo?: number
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
    step: Range
    width: Range
    shift: number
    move?: MoveDef & { every: number }
}

export interface LevelDef {
    level: number
    title: string
    message: string
    bad?: number
    course: CourseDef
    items: ItemDef[]
}

export type PlatformKind = 'aba' | 'parada' | 'chao' | 'topo'

export interface Platform {
    id: number
    kind: PlatformKind
    x: number
    y: number
    w: number
    item?: number
    move?: MoveDef & { phase: number }
}

export interface Cloud {
    item: number
    bottom: number
    top: number
}

export interface Course {
    platforms: Platform[]
    clouds: Cloud[]
    summit: Platform
}

export type State = 'intro' | 'play' | 'help' | 'card' | 'error' | 'done' | 'finale'

export interface Vec {
    x: number
    y: number
}
