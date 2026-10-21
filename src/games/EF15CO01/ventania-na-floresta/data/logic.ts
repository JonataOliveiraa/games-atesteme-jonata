import type { Bird, Cell, Field, Fish, FishField, Flower, GridPhase, Group, Home, Shroom } from '../types'

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

export const edgeFits = <T>(edge: [T, T], from: T, to: T) => (edge[0] === from && edge[1] === to) || (edge[0] === to && edge[1] === from)

const GROUP_WAY: Record<Group, Home> = {
    patos: 'fila',
    cogumelos: 'grade',
    peixes: 'ficha',
    vagalumes: 'teia',
    caracol: 'solto',
}

export const wayOf = (group: Group): Home => GROUP_WAY[group]

export const shroomHome = (rows: Shroom['cap'][], cols: Shroom['hue'][], s: Shroom): Cell => ({ r: rows.indexOf(s.cap), c: cols.indexOf(s.hue) })

export const FISH_FIELDS: FishField[] = ['corpo', 'rabo']

export const fishMismatch = (home: Fish, fish: Fish): FishField | undefined => FISH_FIELDS.find(f => home[f] !== fish[f])

export const fishHome = (homes: Fish[], fish: Fish) => homes.findIndex(h => fishMismatch(h, fish) === undefined)
