export type StorageId = 'disco' | 'pendrive' | 'nuvem'
export type StorageKind = 'local' | 'remoto'

export interface StorageDef {
    id: StorageId
    label: string
    kind: StorageKind
    icon: string
    slots: number
    needsInternet: boolean
    funcao: string
    vantagem: string
    limite: string
}

export type FileId =
    | 'dever-casa'
    | 'boletim'
    | 'foto-turma'
    | 'video-festa'
    | 'desenho'
    | 'musica'
    | 'apresentacao'
    | 'jogo'
    | 'diario'
    | 'trabalho-ciencias'

export interface FileDef {
    id: FileId
    label: string
    icon: string
    size: number
    descricao: string
}

export type PhaseKind = 'classificar' | 'contexto' | 'backup' | 'recuperar'

export type AccidentId = 'pendrive-perdido' | 'disco-quebrado' | 'sem-internet'

export interface FileTask {
    file: FileId
    situacao?: string
    contexto?: string
    accepts: StorageId[]
    copies?: number
    requireRemote?: boolean
    explain: string
}

interface PhaseBase {
    id: string
    name: string
    instruction: string
    sub: string
}

export interface DropPhase extends PhaseBase {
    kind: 'classificar' | 'contexto' | 'backup'
    tasks: FileTask[]
    visible?: StorageId[]
    offline?: boolean
    capacity?: Partial<Record<StorageId, number>>
}

export interface RescuePhase extends PhaseBase {
    kind: 'recuperar'
    accident: AccidentId
    accidentText: string
    file: FileId
    savedIn: StorageId[]
    answer: StorageId[]
    explain: string
}

export type PhaseConfig = DropPhase | RescuePhase

export interface LevelConfig {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    timeLimit?: number
    phases: PhaseConfig[]
}