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

export type LeafKind = 'folha' | 'folhaGrande'

/** O que a criança corta: as frutas do N1 e as folhas do N2. */
export type ItemKind = FruitKind | LeafKind

/** O que a rainha pede: um item cortável, ou a folha gigante do N3. */
export type OrderKind = ItemKind | 'gigante'

export interface ItemDef {
    kind: ItemKind
    /** `egg`: fruta com a parte larga em cima; `leaf`: folha deitada, cabinho à esquerda. */
    form: 'egg' | 'leaf'
    /** Semi-eixos e "ovo" da silhueta, em px de arte. */
    a: number
    b: number
    e: number
    /** Cor da polpa nas bordas cortadas e do contorno no prato. */
    pulp: number
    pulpDark: number
    skin: number
}

/** Um corte de roteiro, em px de arte do item (centro em 0, 0). */
export interface Swipe {
    from: Vec
    to: Vec
}

export type Teach = 'all' | 'cut' | 'wind' | 'leaf' | 'giant'

export interface CutPhase {
    id: string
    type: 'cut'
    item: ItemKind
    wind: boolean
    /** O peso: pedaço maior que `LIFT` não sai do chão (N2). */
    lift: boolean
    teach?: Teach
    /** Os cortes da demonstração. */
    demo?: Swipe[]
}

export type DirtKind = 'drop' | 'soil' | 'twig' | 'petal'

/** Uma sujeira na folha gigante, em px de arte da folha (centro em 0, 0). */
export interface Dirt {
    kind: DirtKind
    x: number
    y: number
    angle: number
}

export interface GiantPhase {
    id: string
    type: 'giant'
    dirt: Dirt[]
    /** Onde as amigas cochilam, no mundo. */
    friends: Vec[]
    teach?: Teach
}

export type PhaseDef = CutPhase | GiantPhase

export interface LevelDef {
    level: number
    title: string
    message: string
    phases: PhaseDef[]
}

export type State = 'intro' | 'demo' | 'walk' | 'cut' | 'scrub' | 'stuck' | 'help' | 'error' | 'done' | 'finale'

export type AntPose = 'idle' | 'walkA' | 'walkB' | 'carry' | 'carryA' | 'carryB' | 'happy' | 'push'

export type FriendPose = 'sleep' | 'wake' | 'walkA' | 'walkB' | 'carryA' | 'carryB' | 'happy' | 'push'

export type QueenPose = 'calm' | 'ask' | 'happy'

/** De onde vem o modo de corte: a fruta sob o arbusto, o pedaço entalado na fresta ou o pesado demais. */
export type CutKind = 'tree' | 'stuck' | 'heavy'
