/**
 * EF15CO02: construir e simular algoritmos com sequência, repetição e seleção.
 * O algoritmo é o manual de montagem: a criança ordena as páginas, o Nico
 * executa uma por uma, e a bolinha descendo até o sino testa o circuito.
 */

export type PieceKind = 'block' | 'ramp'

export interface Piece {
    id: string
    kind: PieceKind
    c: number
    r: number
}

export interface PhaseDef {
    id: string
    pieces: Piece[]
    bell: number
    tray: string[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'play' | 'build' | 'roll' | 'error' | 'help' | 'done' | 'finale'

export interface BuildStep {
    piece: Piece
    ok: boolean
}

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
