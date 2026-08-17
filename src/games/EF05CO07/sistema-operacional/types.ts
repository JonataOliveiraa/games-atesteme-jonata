export type LevelNumber = 1 | 2 | 3

export type ResourceId =
    | 'memoria'
    | 'arquivos'
    | 'teclado'
    | 'mouse'
    | 'monitor'
    | 'impressora'

export type ResourceState = 'livre' | 'ocupado' | 'desligado'

export interface ResourceDef {
    id: ResourceId
    name: string
    texture: string
    description: string
}

export interface ResourceAvailability {
    id: ResourceId
    state: ResourceState
}

export type ProgramId =
    | 'navegador'
    | 'editor'
    | 'jogo'
    | 'player'
    | 'fotos'
    | 'impressao'

export interface ProgramDef {
    id: ProgramId
    name: string
    texture: string
    memoryBlocks: number
}

export type ProgramActivityState = 'ativo' | 'ocioso'

export interface RunningProgramDef {
    programId: ProgramId
    state: ProgramActivityState
}

export type DenyCause =
    | 'ocupado'
    | 'desligado'
    | 'inexistente'
    | 'sem-memoria'
    | 'duplicado'

interface RequestBase {
    id: string
    programId: ProgramId
    text: string
    reason: string
}

export interface GrantedRequestDef extends RequestBase {
    answer: ResourceId
    denyCause?: never
}

export interface DeniedRequestDef extends RequestBase {
    answer: 'negar'
    denyCause: DenyCause
}

export type RequestDef = GrantedRequestDef | DeniedRequestDef

export type MemoryRequestDef =
    | (RequestBase & {
        answer: 'memoria'
        denyCause?: never
    })
    | DeniedRequestDef

export interface ConflictRequestDef extends RequestBase {
    arrivalOrder: number
    estimatedTime: number
}

interface PhaseBase {
    id: string
    name: string
    instruction: string
    sub: string
}

export interface AttendPhase extends PhaseBase {
    kind: 'atender'
    available: ResourceAvailability[]
    requests: RequestDef[]
}

export interface MemoryPhase extends PhaseBase {
    kind: 'memoria'
    totalBlocks: number
    running: RunningProgramDef[]
    requests: MemoryRequestDef[]
}

export type ConflictRule = 'chegou-primeiro' | 'mais-rapido'

export interface ConflictPhase extends PhaseBase {
    kind: 'conflito'
    resource: ResourceId
    requests: ConflictRequestDef[]
    rule: ConflictRule
}

export type SystemOptionId = 'sistema-1' | 'sistema-2' | 'sistema-3'

export type SystemLayout = 'menu-janelas' | 'barra-lateral' | 'dock-inferior'

export interface SystemOptionDef {
    id: SystemOptionId
    label: string
    layout: SystemLayout
}

export interface SystemsPhase extends PhaseBase {
    kind: 'sistemas'
    question: string
    options: SystemOptionDef[]
    answer: SystemOptionId
    reason: string
}

export type PhaseConfig =
    | AttendPhase
    | MemoryPhase
    | ConflictPhase
    | SystemsPhase

export interface LevelConfig {
    level: LevelNumber
    title: string
    objective: string
    tip: string
    timeLimit?: number
    stability: number
    phases: PhaseConfig[]
}

export interface GameSceneData {
    level?: LevelNumber
    phase?: number
    score?: number
    stability?: number
    hits?: number
    errors?: number
    resetTimer?: boolean
    skipIntro?: boolean
    skipTutorial?: boolean
}

export interface MissionUpdatePayload {
    level: LevelNumber
    phase: number
    totalPhases: number
    instruction: string
    stability: number
    maxStability: number
    score: number
    timeLimit?: number
}
