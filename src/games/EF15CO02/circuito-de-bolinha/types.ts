/**
 * EF15CO02: construir e simular algoritmos com sequência, repetição e seleção.
 * O algoritmo é o manual de montagem: a criança ordena as páginas, o Nico
 * executa uma por uma, e a bolinha descendo até o sino testa o circuito.
 */

export type PieceKind = 'block' | 'ramp'

export type Side = 'left' | 'right'

export type Pocket = 'yes' | 'no'

export interface Piece {
    id: string
    kind: PieceKind
    c: number
    r: number
    left?: boolean
}

export interface PiecePage {
    id: string
    kind: 'piece'
    piece: Piece
}

export interface RepeatPage {
    id: string
    kind: 'repeat'
    c: number
    n: number
}

export type Page = PiecePage | RepeatPage

export interface Cell {
    c: number
    r: number
}

export interface PhaseDef {
    id: string
    model: Piece[]
    bells: number[]
    tray: Page[]
    slots: number
    ifSlot?: number
    cond?: Side
    choice?: Cell
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export interface Tape {
    slots: Array<Page | undefined>
    yes?: Page
    no?: Page
}

export type Why = 'under' | 'extra' | 'blocked' | 'missing' | 'cat'

export interface Act {
    slot: number
    pocket?: Pocket
    piece: Piece
    count: number
    total: number
    ok: boolean
    land: number
}

export interface Fail {
    why: Why
    piece: Piece
    slot?: number
    pocket?: Pocket
}

export interface Path {
    ramps: Piece[]
    bell: number
}

export interface Outcome {
    acts: Act[]
    built: Map<string, Piece>
    fail?: Fail
    path?: Path
}

export type State = 'intro' | 'play' | 'build' | 'roll' | 'error' | 'help' | 'done' | 'finale'

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
