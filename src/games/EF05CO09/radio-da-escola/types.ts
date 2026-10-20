/**
 * EF05CO09: direitos autorais. Toda música tem dono, e é o dono quem decide se
 * ela vai ao ar. A criança é a DJ da rádio da escola: lê o bilhete de cada CD,
 * põe no ar só o que o dono deixou, e o letreiro diz de quem é a música.
 */

export type Lane = 0 | 1 | 2 | 3

export type State = 'intro' | 'choose' | 'air' | 'demo' | 'error' | 'help' | 'done' | 'finale'

export type Expr = 'listen' | 'happy' | 'upset'

export type Pose = 'talk' | 'sing' | 'startled' | 'cheer'

export type Grade = 'perfect' | 'good'

export type OwnerId =
    | 'bia'
    | 'teo'
    | 'malu'
    | 'caio'
    | 'iara'
    | 'juca'
    | 'rosa'
    | 'zeca'
    | 'lia'
    | 'davi'
    | 'nina'
    | 'beto'
    | 'gabi'
    | 'pedro'
    | 'kaua'
    | 'sofia'

export type Mode = 'play' | 'remix'

export type Layout = 'row' | 'grid'

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

export interface Owner {
    name: string
    cell: number
}

export interface Song {
    title: string
    bpm: number
    intro: number
    chart: string
    beats?: string
    scale: [number, number, number, number]
    root: number
}

export interface Cd {
    id: string
    owner: OwnerId | null
    cover: number
    note: string | null
    plays: boolean
    mixes: boolean
    credit: string
    thanks?: string
    complaint?: string
    refusal?: string
    song: Song
}

export interface PhaseDef {
    approach: number
    cds: Cd[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    ask: string
    mode: Mode
    layout: Layout
    phases: PhaseDef[]
}

export interface ChartNote {
    lane: Lane
    t: number
}
