/**
 * EF15CO04: decomposição. A criança é a formiga: corta com o dedo a fruta que
 * não passa na fresta, leva um pedaço de cada vez e vê a fruta inteira de
 * novo no prato da rainha.
 */

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

/** Um vértice do polígono; `cut` marca a aresta que sai dele como borda de corte (polpa). */
export interface Vertex extends Vec {
    cut: boolean
}

export type Poly = Vertex[]

export type FruitKind = 'morango' | 'laranja' | 'maca'

export interface FruitDef {
    kind: FruitKind
    /** Semi-eixos e "ovo" da silhueta, em px de arte (célula de 512). */
    a: number
    b: number
    e: number
    /** Cor da polpa nas bordas cortadas e do contorno no prato. */
    pulp: number
    pulpDark: number
    skin: number
}

/** Um corte de roteiro, em px de arte da fruta (centro em 0, 0). */
export interface Swipe {
    from: Vec
    to: Vec
}

export type Teach = 'all' | 'cut' | 'wind'

export interface PhaseDef {
    id: string
    fruit: FruitKind
    wind: boolean
    teach?: Teach
    /** Os cortes da demonstração (só na fase que ensina tudo). */
    demo?: Swipe[]
}

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'demo' | 'walk' | 'cut' | 'stuck' | 'help' | 'error' | 'done' | 'finale'

export type AntPose = 'idle' | 'walkA' | 'walkB' | 'carry' | 'carryA' | 'carryB' | 'happy' | 'push'

export type QueenPose = 'calm' | 'ask' | 'happy'

/** De onde vem o modo de corte: a fruta sob o arbusto, ou o pedaço entalado na fresta. */
export type CutKind = 'tree' | 'stuck'
