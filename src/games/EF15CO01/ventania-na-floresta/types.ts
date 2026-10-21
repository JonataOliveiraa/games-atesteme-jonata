/**
 * EF15CO01: identificar as formas de organizar e representar a informação.
 * Cada fase é uma organização da floresta que o vento desmontou; a criança a
 * conserta seguindo a regra dela (na fila, a ordem; na grade, o cruzamento).
 */

export type Kind = 'margarida' | 'tulipa' | 'estrela'
export type Tone = 'amarela' | 'azul' | 'rosa'

export interface Flower {
    kind: Kind
    tone: Tone
}

export interface Cell {
    r: number
    c: number
}

export interface LinePhase {
    id: string
    type: 'fila'
    scattered: number[]
    teach?: boolean
}

export interface GridPhase {
    id: string
    type: 'grade'
    rows: Kind[]
    cols: Tone[]
    bring: Flower[]
    teach?: boolean
}

export type Cor = 'laranja' | 'verde' | 'roxo'
export type Field = 'pena' | 'bico' | 'topete'

export interface Bird {
    pena: Cor
    bico: Cor
    topete?: boolean
}

export interface FichaPhase {
    id: string
    type: 'ficha'
    fields: Field[]
    nests: Bird[]
    bring: Bird[]
    teach?: boolean
}

export type Bug = 'joaninha' | 'borboleta' | 'grilo' | 'caracol'
export type Edge = [Bug, Bug]

export interface TeiaPhase {
    id: string
    type: 'teia'
    bugs: Bug[]
    before: number[]
    after: number[]
    edges: Edge[]
    teach?: boolean
}

export type Home = 'fila' | 'grade' | 'ficha' | 'teia' | 'solto'
export type Group = 'patos' | 'cogumelos' | 'peixes' | 'vagalumes' | 'caracol'
export type Cap = 'redondo' | 'pontudo'
export type Hue = 'vermelho' | 'azul'
export type Glow = 'amarelo' | 'verde' | 'azul' | 'rosa'

export interface Shroom {
    cap: Cap
    hue: Hue
}

export interface Fish {
    corpo: Cor
    rabo: Cor
}

export type FishField = keyof Fish
export type GlowEdge = [Glow, Glow]

interface JeitoBase {
    id: string
    type: 'jeito'
    options: Home[]
    teach?: boolean
}

export type JeitoPhase = JeitoBase &
    (
        | { group: 'patos'; scattered: number[] }
        | { group: 'cogumelos'; rows: Cap[]; cols: Hue[]; bring: Shroom[] }
        | { group: 'peixes'; homes: Fish[]; bring: Fish[] }
        | { group: 'vagalumes'; glows: Glow[]; before: number[]; after: number[]; edges: GlowEdge[] }
        | { group: 'caracol' }
    )

export type PhaseDef = LinePhase | GridPhase | FichaPhase | TeiaPhase | JeitoPhase
export type Structure = PhaseDef['type']

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'demo' | 'play' | 'busy' | 'help' | 'done' | 'finale'

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
