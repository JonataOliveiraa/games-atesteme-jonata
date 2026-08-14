export type PartId =
    | 'gabinete'
    | 'placa-mae'
    | 'fonte'
    | 'processador'
    | 'ram'
    | 'hd'
    | 'monitor'
    | 'teclado'
    | 'mouse'
    | 'som'

export type Category =
    | 'estrutura'
    | 'energia'
    | 'processamento'
    | 'memoria'
    | 'armazenamento'
    | 'entrada'
    | 'saida'

export type View = 'oficina' | 'mesa'

export interface PartDef {
    id: PartId
    label: string
    category: Category
    view: View
    layers: string[]
    icon: string
    funcao: string
    dica: string
    requires: PartId[]
    quiz: PartQuiz
}

/** Caixa da peça dentro do canvas, calculada por alpha no BootScene. */
export interface BBox {
    x: number
    y: number
    w: number
    h: number
}

export type ChallengeMode =
    | 'montar'
    | 'montar-quiz'
    | 'quiz-classificar'
    | 'quiz-multipla'
    | 'montar-livre'

export type MouldHint = 'silhueta' | 'dica' | 'nenhuma'

export interface PartQuiz {
    question: string
    options: string[]
    correctIndex: number
    explain: string
}

export interface ClassifyGroup {
    label: string
    accepts: Category[]
}

export interface BuildChallenge {
    id: string
    mode: ChallengeMode
    title: string
    required: PartId[]
    available: PartId[]
    preInstalled?: PartId[]
    startView: View
    hint?: MouldHint
    exactSet?: boolean
    timeLimit?: number
    bootAnimation?: boolean
    quizParts?: PartId[]
    classifyGroups?: ClassifyGroup[]
    classifyParts?: PartId[]
    explanation: string
}

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    challenges: BuildChallenge[]
}

// ── Boot ──────────────────────────────────────────────────────────────────

export type BootStage =
    | 'estrutura'
    | 'energia'
    | 'entrada'
    | 'processamento'
    | 'memoria'
    | 'armazenamento'
    | 'saida'
    | 'ok'

export interface BootStep {
    stage: BootStage
    view: View
    /** Camadas que acendem nesta etapa. */
    parts: PartId[]
    caption: string
    color: number
}

export interface BootResult {
    ok: boolean
    /** Etapas que chegaram a rodar, na ordem. */
    steps: BootStep[]
    /** Etapa onde parou; 'ok' se completou. */
    failedAt: BootStage
    missing: PartId | null
    /** Peça instalada sem necessidade, quando `exactSet`. */
    extra: PartId | null
    message: string
}