export type AppId = 'fotos' | 'lanterna' | 'calculadora' | 'musica' | 'mapa' | 'joguinho' | 'videochamada'

export type PartId = 'camera' | 'contatos' | 'microfone' | 'altofalante' | 'localizacao'

export type PlaceId = AppId | PartId

export type Family = 'app' | 'peca'

export type Works = 'flash' | 'notes' | 'glow'

export type DecoKind = 'arvore' | 'pinheiro' | 'arbusto' | 'flores' | 'banco' | 'poste' | 'chafariz'

export type State = 'intro' | 'run' | 'ask' | 'fetch' | 'show' | 'error' | 'help' | 'done' | 'finale'

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

export interface PlaceDef {
    id: PlaceId
    name: string
    family: Family
    icon: number
    look: number
    calling?: string
    fetch?: string
    works?: Works
}

export interface HouseSpot {
    id: PlaceId
    at: Vec
}

export interface DecoSpot {
    kind: DecoKind
    at: Vec
}

export interface CallDef {
    id: string
    app: AppId
    wants: PartId
    ok: boolean
    says: string
    why: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    world: { w: number; h: number }
    start: Vec
    plaza: { x: number; y: number; r: number }
    roads: Vec[][]
    houses: HouseSpot[]
    decor: DecoSpot[]
    calls: CallDef[]
}

export type Solid = { kind: 'circle'; x: number; y: number; r: number } | { kind: 'box'; x: number; y: number; w: number; h: number }
