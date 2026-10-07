export type Topic = 'tucano' | 'vulcão' | 'baleia'

export type Kind = 'foto' | 'vídeo' | 'texto' | 'desenho' | 'pelúcia' | 'chinelo' | 'maquete' | 'boia'

export type Detail = 'voando' | 'de perto' | 'erupção' | 'parado' | 'pulando' | 'filhote'

export interface FindDef {
    id: string
    topic: Topic
    kind: Kind
    detail?: Detail
    words: string[]
    caption: string
    frame: number
}

export interface Request {
    topic: Topic
    kind: Kind
    detail?: Detail
}

export interface Spot {
    find: string
    place: number
    x: number
    y: number
}

export interface PhaseDef {
    map: MapDef
    client: number
    ask: string
    requests: Request[]
    chips: string[]
    spots: Spot[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    world: { w: number; h: number }
    single: boolean
    drain: number
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'play' | 'card' | 'busy' | 'panel' | 'done'

export type Rect = { x: number; y: number; w: number; h: number }

export type Vec = { x: number; y: number }

export type Blob = { x: number; y: number; r: number }

export interface Deco {
    x: number
    y: number
    kind: 'weed' | 'coral' | 'gem' | 'star' | 'shell'
    size: number
    flip: boolean
}

export interface Tone {
    light: number
    dark: number
    weed: number
    coral: number
    gem: number
}

export interface MapDef {
    id: string
    w: number
    h: number
    floor: number
    tone: Tone
    rocks: { blobs: Blob[]; decor: Deco[] }[]
    solids: Blob[]
    slots: Vec[]
    pickups: Vec[]
}
