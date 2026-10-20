export type DeviceId = 'buzina' | 'farol' | 'mensagem' | 'limpador' | 'gps' | 'altofalante' | 'mapa' | 'radio'

export type Effect = 'luz' | 'limpar' | 'avisar' | 'caminho'

export type Reach = 'perto' | 'celular' | 'todos' | 'radio'

export type Audience = 'bicho' | 'pessoa'

export type Verdict = 'fit' | 'none' | 'over'

export type ProblemKind = 'escuro' | 'chuva' | 'cachorro' | 'entrega' | 'bifurcacao' | 'vaca' | 'vizinho' | 'ponte' | 'atoleiro'

export type Way = -1 | 1

export interface DeviceDef {
    id: DeviceId
    label: string
    effect: Effect
    reach?: Reach
    stays?: boolean
    online?: boolean
    paper?: boolean
}

export interface ProblemDef {
    id: string
    kind: ProblemKind
    need: Effect
    audience?: Audience
    crowd?: boolean
    far?: boolean
    quiet?: boolean
    radio?: boolean
    offline?: boolean
    newRoad?: boolean
    way?: Way
    ask: string
    good: string
    drive: number
}

export interface LevelDef {
    level: number
    title: string
    goal: string
    message: string
    zone: Zone
    headlights?: boolean
    signal?: boolean
    village?: boolean
    devices: DeviceId[]
    problems: ProblemDef[]
}

export type Zone = 'vila' | 'estrada' | 'rua' | 'serra' | 'terra'

export type State = 'intro' | 'drive' | 'ask' | 'resolve' | 'help' | 'error' | 'finale' | 'done'

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export interface Vec {
    x: number
    y: number
}
