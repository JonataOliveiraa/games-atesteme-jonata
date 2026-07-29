export type StorageId = 'disco' | 'pendrive' | 'nuvem'
export type StorageKind = 'local' | 'remoto'

export interface StorageDef {
    id: StorageId
    label: string
    kind: StorageKind
    icon: string
    /** Capacidade padrão em fichas. */
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
    /** Fichas que ocupa no destino. */
    size: number
    descricao: string
}

export type PhaseKind = 'classificar' | 'contexto' | 'backup' | 'recuperar'

export type AccidentId = 'pendrive-perdido' | 'disco-quebrado' | 'sem-internet'

export interface FileTask {
    file: FileId
    /** Cartão de situação; ausente no nível 1. */
    situacao?: string
    accepts: StorageId[]
    /** Cópias exigidas (backup usa 2). */
    copies?: number
    /** Ao menos uma cópia em destino remoto. */
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
    /** Nuvem indisponível nesta fase. */
    offline?: boolean
    /** Sobrescreve a capacidade padrão de um destino. */
    capacity?: Partial<Record<StorageId, number>>
}

export interface RescuePhase extends PhaseBase {
    kind: 'recuperar'
    accident: AccidentId
    accidentText: string
    file: FileId
    /** Onde o arquivo havia sido guardado. */
    savedIn: StorageId[]
    /** Destinos onde ele sobreviveu ao acidente. */
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