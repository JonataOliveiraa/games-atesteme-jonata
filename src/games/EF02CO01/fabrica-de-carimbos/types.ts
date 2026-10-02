export type Hue = 'blue' | 'red' | 'yellow'
export type Size = 'small' | 'big'
export type Collection = 'robot' | 'ball'
export type Attribute = 'color' | 'size' | 'antenna' | 'stripes'

export interface Toy {
    collection: Collection
    color: Hue
    size: Size
    antenna: boolean
    stripes: boolean
}

export type Rule =
    | { attribute: 'color'; value: Hue }
    | { attribute: 'size'; value: Size }
    | { attribute: 'antenna'; value: true }
    | { attribute: 'stripes'; value: true }

export interface Note {
    text: string
    drawing: Toy
}

export interface PhaseDef {
    id: string
    collection: Collection
    stamp: Rule[]
    line: Toy[]
    note?: Note
    options?: Rule[][]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
    lineSize: number
    target: number
    speed: number
    spacing: number
    zone: number
    build: boolean
}

export type Mode = 'intro' | 'guide' | 'build' | 'run' | 'check' | 'swap' | 'done' | 'panel'
