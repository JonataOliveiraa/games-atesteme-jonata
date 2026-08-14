export type Direction = 0 | 1 | 2 | 3

export type ActionId =
    | 'andar'
    | 'virar-esq'
    | 'virar-dir'
    | 'esperar'
    | 'pegar'
    | 'abrir'

export type ConditionId =
    | 'semaforo_verde'
    | 'porta_aberta'
    | 'chovendo'
    | 'tem_chave'
    | 'caminho_livre'

export type ItemId = 'guarda-chuva' | 'livro' | 'pao' | 'carta' | 'moeda'

export type TileKind = 'asfalto' | 'calcada' | 'grama'

export type PropKind =
    | 'porta'
    | 'semaforo'
    | 'pedra'
    | 'item'

export interface Coord { c: number; r: number }

export interface PropDef {
    kind: PropKind
    at: Coord
    item?: ItemId
}

/** Sorteado antes de cada execução. É o que impede decorar a sequência. */
export interface WorldState {
    semaforoVerde: boolean
    portaAberta: boolean
    chovendo: boolean
    temChave: boolean
    caminhoLivre: boolean
}

export interface PlayerState {
    c: number
    r: number
    dir: Direction
    mochila: ItemId[]
    passos: number
}

// ── Programa ──────────────────────────────────────────────────────────────

export interface AcaoStmt { kind: 'acao'; action: ActionId }

export interface SeStmt {
    kind: 'se'
    condition: ConditionId | null
    entao: ActionId[]
    senao: ActionId[]
}

export interface RepitaStmt { kind: 'repita'; times: number; corpo: ActionId[] }

export type Stmt = AcaoStmt | SeStmt | RepitaStmt

export type Program = Stmt[]

// ── Desafio ───────────────────────────────────────────────────────────────

export type ChallengeMode =
    /** N1: programa pronto; a criança prevê qual ramo o `se` vai executar. */
    | 'prever-decisao'
    /** N2: estrutura pronta; a criança escolhe a condição entre três. */
    | 'escolher-condicao'
    /** N3: a criança monta a sequência inteira. */
    | 'montar-programa'

export interface CityChallenge {
    id: string
    mode: ChallengeMode
    width: number
    height: number
    tiles: TileKind[]
    props: PropDef[]

    start: Coord
    startDir: Direction
    goal: Coord
    
    scenarios: WorldState[]

    given?: Program
    conditionOptions?: ConditionId[]
    allowedActions?: ActionId[]
    allowedConditions?: ConditionId[]
    maxStatements?: number
    allowRepeat?: boolean

    solution: Program
    explanation: string
}

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    challenges: CityChallenge[]
}

// ── Simulação ─────────────────────────────────────────────────────────────

export type Outcome = 'chegou' | 'parou' | 'bateu' | 'atropelado' | 'molhado'

export type TraceKind =
    | 'verificar'
    | 'andar'
    | 'virar'
    | 'esperar'
    | 'pegar'
    | 'abrir'
    | 'bater'
    | 'atropelar'

export interface TraceStep {
    kind: TraceKind
    before: PlayerState
    after: PlayerState
    /** Só em 'verificar'. */
    condition?: ConditionId
    conditionValue?: boolean
    /** Só em 'verificar': qual ramo foi seguido. */
    branch?: 'entao' | 'senao'
    action?: ActionId
    target?: Coord
    item?: ItemId
}

export interface DecisionLog {
    condition: ConditionId
    value: boolean
    branch: 'entao' | 'senao'
}

export interface SimulationResult {
    trace: TraceStep[]
    outcome: Outcome
    final: PlayerState
    decisions: DecisionLog[]
}