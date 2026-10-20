export type EraId = 'bisavo' | 'vovo' | 'hoje' | 'amanha'

export type Tool = 'lanca' | 'vara' | 'sonar'

export type Gadget = 'buzio' | 'telefone' | 'audio' | 'voz'

export type FishKind = 'small' | 'big' | 'school'

export type Target = 'vila' | 'mercado'

export type InventionId = 'robo' | 'bercario' | 'drone'

export type Mode = 'pesca' | 'recado' | 'amanha'

export type Outcome = 'ok' | 'reach' | 'dark' | 'gone'

export type Sent = 'ok' | 'far' | 'busy' | 'nophone'

export type State = 'intro' | 'play' | 'busy' | 'done'

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

export interface Poses {
    key: string
    idle: number
    throw: number
    cheer: number
    cast: number
}

export interface EraDef {
    id: EraId
    who: string
    uses: string
    tool: Tool
    gadget: Gadget
    small: number
    big: boolean
    school: boolean
    trash: boolean
    background: string
    portrait: number
    poses: Poses
    arrive: string
}

export interface Want {
    goal: string
    icon: number
    fish?: FishKind
    to?: Target
}

export interface Question {
    title: string
    right: string
    wrong: [string, string]
    free?: boolean
}

export interface InventionDef {
    id: InventionId
    name: string
    frame: number
    question: Question
}

export interface PhaseDef {
    id: string
    start: number
    night: boolean
    want: Want
    twist?: Want
    busy?: boolean
    invent?: Want
    toolbox?: boolean
    after: string
    question?: Question
}

export interface LevelDef {
    level: number
    mode: Mode
    title: string
    message: string
    uses?: string[]
    phases: PhaseDef[]
}
