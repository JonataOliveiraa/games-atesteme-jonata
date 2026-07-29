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
    /** Camadas desenhadas ao instalar. Quase sempre uma; o som usa duas. */
    layers: string[]
    icon: string
    /** Frase mostrada no cartão após o encaixe. */
    funcao: string
    /** Pista exibida no molde nos desafios por função. */
    dica: string
    /** Precisa estar instalado antes desta. */
    requires: PartId[]
}

/** Caixa da peça dentro do canvas, calculada por alpha no BootScene. */
export interface BBox {
    x: number
    y: number
    w: number
    h: number
}

// ── Desafio ───────────────────────────────────────────────────────────────

export type ChallengeMode =
    /** N1: o molde mostra a silhueta da peça certa. */
    | 'identificar'
    /** N2: o molde mostra só a descrição da função. */
    | 'funcao'
    /** N3: parte já montada; achar o que falta ou o que sobra. */
    | 'diagnostico'

export interface BuildChallenge {
    id: string
    mode: ChallengeMode
    title: string
    /** Peças obrigatórias para o boot passar. */
    required: PartId[]
    /** O que aparece na gaveta. */
    available: PartId[]
    /** Já instaladas ao abrir a fase. */
    preInstalled?: PartId[]
    /** Vista aberta ao iniciar. */
    startView: View
    /** Instalar peça fora de `required` conta como erro. */
    exactSet?: boolean
    timeLimit?: number
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