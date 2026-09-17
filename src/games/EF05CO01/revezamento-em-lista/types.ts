export type Trait = 'listrada' | 'oculos' | 'alta' | 'ruiva' | 'chama' | 'bolinhas'

export type Phase = 'briefing' | 'editing' | 'carrying' | 'swimming' | 'locked'

export type Verb = 'remove' | 'insert' | 'move'

export interface Swimmer {
    id: string
    name: string
    trait: Trait
    frame: number
    color: number
    height: number
}

export interface Hint {
    kind: 'chip' | 'pin' | 'bench'
    index: number
}

export interface Request {
    verb: Verb
    line: string
    why: string
    solves(list: Swimmer[], start: Swimmer[]): boolean
    hint(list: Swimmer[], start: Swimmer[]): Hint
}

export interface Heat {
    id: string
    list: string[]
    bench: string[]
    requests: Request[]
    /** A prova guiada: a treinadora aponta, e o erro não custa vida. */
    guided?: boolean
    close: string
}

export interface LevelDef {
    level: number
    heats: Heat[]
}
