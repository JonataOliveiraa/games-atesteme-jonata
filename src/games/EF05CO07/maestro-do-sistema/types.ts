export type Piece = 'cpu' | 'speaker' | 'screen' | 'memory'

export type Shape = 'square' | 'circle' | 'wide' | 'tall'

export type Layer = 'beat' | 'melody' | 'bass' | 'pad'

/** `asking` é o balão no ar; `canPlayNow` decide se ele está aceso ou cinza. */
export type ProgramState = 'resting' | 'asking' | 'playing' | 'frozen' | 'done'

export type Verdict = 'served' | 'busy' | 'skip-queue' | 'wave' | 'none'

export type Phase = 'intro' | 'demo' | 'running' | 'hold' | 'locked' | 'encore' | 'done'

export interface Ask {
    piece: Piece
    /** Quantos compassos ele toca com a peça na mão. */
    notes: number
    /** Compassos de descanso antes de levantar este balão. */
    rest: number
}

export interface ProgramDef {
    id: string
    asks: Ask[]
}

export interface FaseDef {
    id: string
    /** Quais peças estão no atril desta fase. */
    pieces: Piece[]
    programs: ProgramDef[]
    /** A fase de aula: o cutucão vem mais cedo e o erro não custa vida. */
    guided?: boolean
}

export interface LevelDef {
    level: number
    fases: FaseDef[]
}

/** O estado vivo de um programa no palco. */
export interface Slot {
    id: string
    asks: Ask[]
    next: number
    state: ProgramState
    holds?: Piece
    /** Notas já tocadas do pedido de agora. */
    inAsk: number
    /** Notas já tocadas na fase inteira — é a partitura. */
    played: number
    /** O compasso em que levantou o balão. É a ORDEM da fila. */
    askedAt?: number
    /** Compassos que faltam para levantar o próximo balão. */
    restLeft: number
}

export interface World {
    beat: number
    slots: Slot[]
    pieces: Piece[]
    busy: Map<Piece, string>
}
