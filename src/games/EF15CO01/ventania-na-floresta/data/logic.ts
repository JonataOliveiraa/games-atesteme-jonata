import type { Bird, Bug, Cell, Edge, Field, Flower, GridPhase, Home, Piece } from '../types'

export const nextRank = (left: number[]) => Math.min(...left)

export const isNext = (rank: number, left: number[]) => left.length > 0 && rank === nextRank(left)

export const rowFits = (phase: GridPhase, cell: Cell, f: Flower) => phase.rows[cell.r] === f.kind

export const colFits = (phase: GridPhase, cell: Cell, f: Flower) => phase.cols[cell.c] === f.tone

export const fits = (phase: GridPhase, cell: Cell, f: Flower) => rowFits(phase, cell, f) && colFits(phase, cell, f)

export const homeOf = (phase: GridPhase, f: Flower): Cell => ({ r: phase.rows.indexOf(f.kind), c: phase.cols.indexOf(f.tone) })

export const sameCell = (a: Cell, b: Cell) => a.r === b.r && a.c === b.c

const FIELD_ORDER: Field[] = ['pena', 'bico', 'topete']

const fieldOf = (b: Bird, field: Field) => (field === 'topete' ? !!b.topete : b[field])

export const firstMismatch = (nest: Bird, bird: Bird, fields: Field[]): Field | undefined =>
    FIELD_ORDER.find(f => fields.includes(f) && fieldOf(nest, f) !== fieldOf(bird, f))

export const nestFits = (nest: Bird, bird: Bird, fields: Field[]) => firstMismatch(nest, bird, fields) === undefined

export const nestOf = (nests: Bird[], bird: Bird, fields: Field[]) => nests.findIndex(n => nestFits(n, bird, fields))

export const edgeFits = (edge: Edge, from: Bug, to: Bug) => (edge[0] === from && edge[1] === to) || (edge[0] === to && edge[1] === from)

const PIECE_HOME: Record<Piece, Home> = {
    pebbles: 'fila',
    list: 'fila',
    grid: 'grade',
    weather: 'grade',
    card: 'ficha',
    badge: 'ficha',
    pair: 'teia',
    map: 'teia',
    number: 'solto',
    word: 'solto',
    yes: 'solto',
}

export const homeOfPiece = (piece: Piece): Home => PIECE_HOME[piece]
