export type FieldId = 'autor' | 'fonte' | 'uso'

export type MediaKind = 'imagem' | 'audio' | 'video' | 'quadrinho'

export type LicenseId = 'livreComCredito' | 'usoEscolar' | 'reservado' | 'autoral'

export type SealId = 'verde' | 'amarelo' | 'vermelho'

export interface CreditOption {
  label: string
  chip: string
  seal: SealId
  why: string
}

export interface MediaItem {
  id: string
  thumb: string
  kind: MediaKind
  title: string
  license: LicenseId
  origin: string
  greenNote: string
  options: Record<FieldId, CreditOption[]>
}

interface BasePhase {
  id: string
  instruction: string
  sub: string
  fields: FieldId[]
}

export interface FichaPhase extends BasePhase {
  kind: 'ficha'
  item: MediaItem
}

export interface MuralPhase extends BasePhase {
  kind: 'mural'
  items: MediaItem[]
}

export type PhaseConfig = FichaPhase | MuralPhase

export interface LevelConfig {
  level: 1 | 2 | 3
  title: string
  objective: string
  timeLimit?: number
  phases: PhaseConfig[]
}