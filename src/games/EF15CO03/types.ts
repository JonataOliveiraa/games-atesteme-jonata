export type OperatorKind = 'nao' | 'e' | 'ou'

export type PhaseKind = 'valor' | 'negacao' | 'dupla' | 'caminho'

export type SignalState = 'off' | 'true' | 'false' | 'preview'

export type AttractionId = 'poste' | 'carrossel' | 'roda' | 'queda' | 'montanha'

export interface Statement {
    id: string
    text: string
    value: boolean
    why: string
}

interface BasePhase {
    id: string
    attraction: AttractionId
    ask: string
    explain: string
    hint: string
    hintDeep: string
}

export interface ValuePhase extends BasePhase {
    kind: 'valor'
    statement: Statement
}

export interface NotPhase extends BasePhase {
    kind: 'negacao'
    statement: Statement
    askAfter: string
}

export interface PairPhase extends BasePhase {
    kind: 'dupla'
    left: Statement
    right: Statement
    operator: 'e' | 'ou'
    askAfter: string
}

export interface PathStep {
    id: string
    kind: 'valor' | 'nao' | 'combina'
    inputs: string[]
    operator?: 'e' | 'ou'
    question: string
    tip: string
}

export interface PathPhase extends BasePhase {
    kind: 'caminho'
    statements: Statement[]
    steps: PathStep[]
}

export type PhaseConfig = ValuePhase | NotPhase | PairPhase | PathPhase

export interface TraceEntry {
    id: string
    label: string
    value: boolean
    operator?: OperatorKind
    missed: boolean
}

export interface PhaseResult {
    phaseId: string
    clean: boolean
    tries: number
    trace: TraceEntry[]
}

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    attraction: AttractionId
    streakBonus: boolean
    showMap: boolean
    phases: PhaseConfig[]
}

export interface AttractionDef {
    id: AttractionId
    name: string
    off: string
    on: string
    portrait: boolean
    spin: boolean
    bob: boolean
    scale: number
}

export interface Port {
    x: number
    y: number
}

export interface Beat {
    id: string
    kind: 'valor' | 'nao' | 'combina'
    question: string
    tip: string
    operator?: OperatorKind
    refs: string[]
    expected: boolean
    label: string
    sourceText: string
    why: string
}

export interface PhaseTrace {
    beats: Beat[]
    trace: TraceEntry[]
    final: boolean
    statements: Statement[]
}