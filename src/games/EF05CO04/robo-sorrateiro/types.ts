export type Act = 'andar' | 'esconder'

export type Asks = 'acordada' | 'dormindo'

export type Outcome = 'chegou' | 'visto' | 'parado'

export type Branch = 'then' | 'else'

export type Phase = 'intro' | 'choosing' | 'running' | 'locked' | 'replay' | 'done'

export interface Card {
    id: string
    asks: Asks
    then: Act
    otherwise: Act
}

export interface Cycle {
    asleep: number
    awake: number
}

export interface OwlDef {
    id: string
    name: string
    column: number
    cycle: Cycle
}

export interface LegDef {
    owl: string
    steps: number
    cards: string[]
}

export interface RoomDef {
    id: string
    legs: LegDef[]
    /** A sala de aula: a mão aponta e o erro não custa vida. */
    guided?: boolean
    close: string
}

export interface LevelDef {
    level: number
    rooms: RoomDef[]
}
