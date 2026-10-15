/**
 * EF05CO03: negação, conjunção e disjunção sobre sentenças e os valores
 * verdadeiro e falso. A placa é a sentença; cada doce a deixa verdadeira
 * (aguenta a Mel) ou falsa (afunda com ela).
 */

export type Color = 'rosa' | 'verde' | 'marrom'
export type Shape = 'redondo' | 'quadrado'
export type Top = 'granulado' | 'listrado' | 'liso'
export type Size = 'grande' | 'pequeno'

export interface Sweet {
    color: Color
    shape: Shape
    top: Top
    size: Size
}

export type Attr = keyof Sweet

export type Term =
    | { attr: 'color'; value: Color }
    | { attr: 'shape'; value: Shape }
    | { attr: 'top'; value: Top }
    | { attr: 'size'; value: Size }

export interface Literal {
    not: boolean
    term: Term
}

export type Op = 'e' | 'ou'

export interface Rule {
    left: Literal
    op?: Op
    right?: Literal
}

export type Teach = 'rule' | 'not'

export interface PhaseDef {
    id: string
    rule: Rule
    teach?: Teach
    columns: Sweet[][]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'demo' | 'play' | 'jump' | 'error' | 'help' | 'done' | 'finale'

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
