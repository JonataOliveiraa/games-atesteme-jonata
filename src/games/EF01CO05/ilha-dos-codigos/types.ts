export type Word = 'SOL' | 'PEIXE' | 'LUA'

export type Code = 'batidas' | 'cor' | 'figura' | 'som'

export type Instrument = 'chocalho' | 'splash' | 'tambor'

export type LegendMode = 'always' | 'peek' | 'first'

export type LevelNumber = 1 | 2 | 3

export interface ChestDef {
    message: Word[]
    decoys: [Word[], Word[]]
    correctAt: number
}

export interface LevelDef {
    level: LevelNumber
    name: string
    from: Code
    to: Code
    legend: LegendMode
    playsOnTap: boolean
    chests: ChestDef[]
}

export type PlayState =
    | 'intro'
    | 'tutorial'
    | 'walking'
    | 'telling'
    | 'choosing'
    | 'opening'
    | 'ending'
