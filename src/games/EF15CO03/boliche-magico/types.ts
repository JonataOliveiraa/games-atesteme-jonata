/**
 * EF15CO03: negação, conjunção e disjunção sobre sentenças e os valores
 * verdadeiro e falso. A criança monta a frase da bola; a bola a confere em
 * cada pino e derruba só aqueles para quem ela é verdadeira.
 */

export type Color = 'azul' | 'verde' | 'vermelho'
export type Size = 'grande' | 'pequeno'

export interface Pin {
    color: Color
    star: boolean
    glasses: boolean
    size: Size
    sleepy: boolean
}

export type Attr = 'color' | 'star' | 'glasses' | 'size'

export type Term =
    | { attr: 'color'; value: Color }
    | { attr: 'star' }
    | { attr: 'glasses' }
    | { attr: 'size'; value: Size }

export interface Literal {
    not: boolean
    term: Term
}

export type Op = 'e' | 'ou'

export interface Sentence {
    left: Literal
    op?: Op
    right?: Literal
}

export interface Rack {
    pins: Pin[]
    cards: Term[]
    not: boolean
}

export interface Demo {
    rack: Rack
    script: Sentence
}

export type Teach = 'build' | 'not'

export interface PhaseDef {
    id: string
    teach?: Teach
    rack: Rack
    demo?: Demo
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'demo' | 'build' | 'roll' | 'error' | 'help' | 'done' | 'finale'

export type Face = 'awake' | 'sleepy' | 'asleep' | 'dizzy'

export type BallFace = 'normal' | 'rolling' | 'happy' | 'oops'

export type Miss = 'knocked' | 'stayed'

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
