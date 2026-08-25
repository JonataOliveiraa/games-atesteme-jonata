export type PhaseKind = 'valor' | 'operador' | 'cadeia' | 'incognita'

export type OperatorKind = 'nao' | 'e' | 'ou'

/**
 * Uma sentença simples, com valor verdade fixo.
 * `unknown: true` marca o bloco "?" das fases de incógnita: o valor
 * continua aqui (é a resposta certa), mas a cena esconde o texto e o selo.
 */
export interface LeafNode {
    kind: 'folha'
    id: string
    text: string
    value: boolean
    unknown?: boolean
}

export interface NotNode {
    kind: 'nao'
    child: ExprNode
}

export interface AndNode {
    kind: 'e'
    left: ExprNode
    right: ExprNode
}

export interface OrNode {
    kind: 'ou'
    left: ExprNode
    right: ExprNode
}

export type ExprNode = LeafNode | NotNode | AndNode | OrNode

export type OperatorNode = NotNode | AndNode | OrNode

/** Justificativa curta pedida a partir do nível 3. */
export interface Justification {
    options: string[]
    correctIndex: number
}

interface BasePhase {
    id: string
    kind: PhaseKind
    name: string
    /** Vai para a linha principal da HUD. */
    instruction: string
    expr: ExprNode
    /** Mostrado no feedback, tanto no acerto quanto no erro. */
    explanation: string
    /** Desenha a moldura em volta do subgrupo que resolve primeiro. */
    showGrouping?: boolean
    justify?: Justification
}

/** Uma única sentença: a criança só decide se é verdadeira ou falsa. */
export interface ValuePhase extends BasePhase {
    kind: 'valor'
    expr: LeafNode
}

/** Exatamente um operador sobre sentenças simples. */
export interface OperatorPhase extends BasePhase {
    kind: 'operador'
    expr: OperatorNode
}

export interface ChainPhase extends BasePhase {
    kind: 'cadeia'
    expr: OperatorNode
}

export interface UnknownPhase extends BasePhase {
    kind: 'incognita'
    expr: OperatorNode
    targetValue: boolean
    question: string
}

export type PhaseConfig =
    | ValuePhase
    | OperatorPhase
    | ChainPhase
    | UnknownPhase

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    timeLimit?: number
    phases: PhaseConfig[]
}