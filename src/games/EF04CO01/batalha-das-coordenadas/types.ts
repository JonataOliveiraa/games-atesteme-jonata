/**
 * Modelo de dados da Batalha das Coordenadas.
 */

/** Posição na matriz, 0-based. A criança vê `col` como letra e `row` como número. */
export interface Cell {
    col: number
    row: number
}

export type CaseKind =
    /** N1: a coordenada vem pronta. Toque nela. */
    | 'coordenada'
    /** N2: duas pistas se cruzam. Toque no cruzamento. */
    | 'cruzar'
    /** N3: baús candidatos. Toque nos que as pistas eliminam. */
    | 'descartar'

export interface Caso {
    id: string
    kind: CaseKind
    cols: number
    rows: number
    /** A instrução curta do painel. */
    question: string
    hint: string

    /** `coordenada`: os alvos, um de cada vez. */
    targets?: Cell[]

    /** `cruzar`: as duas pistas escritas, e onde elas se cruzam. */
    clues?: string[]
    target?: Cell

    /** `descartar`: os baús na areia. */
    chests?: Cell[]
    /**
     * `descartar`: índices de `chests` que as pistas eliminam.
     *
     * O que sobra é o tesouro. Não existe campo de alvo aqui de propósito: se
     * o alvo fosse escrito à parte, daria para ele discordar das pistas e o
     * caso ficaria sem solução sem ninguém perceber.
     */
    discard?: number[]

    successLine: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

export type CellState =
    /** areia intocada */
    | 'idle'
    | 'hover'
    /** cavou e não tinha nada */
    | 'dug'
    /** baú fechado, candidato (N3) */
    | 'chest'
    /** baú descartado pelas pistas */
    | 'discarded'
    /** achou */
    | 'treasure'

export type CaseState = 'briefing' | 'jogando' | 'revelando' | 'solved'

export type Mood = 'sorridente' | 'duvida' | 'feliz'
