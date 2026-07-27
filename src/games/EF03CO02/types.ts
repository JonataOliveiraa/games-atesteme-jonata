/** 0 = cima, 1 = direita, 2 = baixo, 3 = esquerda. O sprite do robô aponta
 *  para cima no arquivo, então o ângulo na tela é simplesmente dir * 90. */
export type Direction = 0 | 1 | 2 | 3

export type ActionId = 'avancar' | 'virar-dir' | 'virar-esq'

export type ConditionId =
    | 'caminho_livre'
    | 'nao_no_objetivo'
    | 'passos_menos_de_2'
    | 'passos_menos_de_3'
    | 'passos_menos_de_4'
    | 'passos_menos_de_5'
    | 'passos_menos_de_6'

export interface Coord {
    c: number
    r: number
}

export interface RobotState {
    c: number
    r: number
    dir: Direction
    /** Quantas vezes a ação 'avancar' foi executada com sucesso. */
    steps: number
}

/**
 * O programa tem duas partes: `setup` roda uma vez, antes do laço, e é onde
 * entram as curvas que apontam o robô para o corredor certo. `body` é o corpo
 * do ENQUANTO, repetido enquanto a condição for verdadeira.
 */
export interface Program {
    condition: ConditionId
    setup: ActionId[]
    body: ActionId[]
}

export type CellKind = 'piso' | 'parede' | 'objetivo' | 'partida' | 'oculto'

/** Como o desafio é jogado. */
export type ChallengeMode =
    /** N1: programa pronto; a criança responde V/F antes de cada volta. */
    | 'prever-condicao'
    /** N2: corpo pronto; a criança escolhe a condição entre três. */
    | 'escolher-condicao'
    /** N3: a criança monta setup, condição e corpo. */
    | 'montar-programa'

export interface MazeChallenge {
    id: string
    mode: ChallengeMode
    width: number
    height: number
    start: Coord
    startDir: Direction
    goal: Coord
    /** Células intransponíveis. */
    walls: Coord[]
    /** Desenhadas com névoa até o robô chegar ao lado. Podem ou não ser parede. */
    hidden?: Coord[]

    /** Programa já montado (modos 'prever-condicao' e 'escolher-condicao'). */
    given?: Program
    /** As três opções do modo 'escolher-condicao'. */
    conditionOptions?: ConditionId[]
    /** Peças liberadas no modo 'montar-programa'. */
    allowedActions?: ActionId[]
    allowedConditions?: ConditionId[]
    /** Pede a bandeirinha de palpite antes de executar. */
    predictStop?: boolean

    /** Solução de referência — usada na validação e na dica após 3 erros. */
    solution: Program
    /** Frase curta mostrada no acerto. */
    explanation: string
}

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    challenges: MazeChallenge[]
}

// ── Resultado da simulação ────────────────────────────────────────────────

export type Outcome = 'objetivo' | 'parou' | 'bateu' | 'infinito'

export type TraceKind = 'verificar' | 'avancar' | 'virar' | 'bater'

export interface TraceStep {
    kind: TraceKind
    iteration: number
    before: RobotState
    after: RobotState
    /** Só em 'verificar'. */
    conditionValue?: boolean
    /** Só em 'avancar' e 'virar'. */
    action?: ActionId
    /** Em 'avancar' e 'bater': a célula que o robô tentou ocupar. */
    target?: Coord
}

export interface SimulationResult {
    trace: TraceStep[]
    outcome: Outcome
    final: RobotState
    iterations: number
}