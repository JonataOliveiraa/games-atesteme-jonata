export type CriterionId = 'fonte' | 'autoria' | 'data' | 'provas'

export type TrustLevel = 'confiavel' | 'cuidado' | 'duvidoso'

export type PhaseKind = 'comparar' | 'inspecionar' | 'caso'

export interface Signal {
  chip: string
  detail: string
  good: boolean
}

export interface NewsItem {
  id: string
  thumb: string
  title: string
  source: string
  signals: Record<CriterionId, Signal>
}

interface BasePhase {
  id: string
  kind: PhaseKind
  instruction: string
  sub: string
  explanation: string
}

export interface ComparePhase extends BasePhase {
  kind: 'comparar'
  assunto: string
  options: [NewsItem, NewsItem]
  correctId: string
}

export interface InspectPhase extends BasePhase {
  kind: 'inspecionar'
  item: NewsItem
  answer: TrustLevel
  options: TrustLevel[]
}

export interface CasePhase extends BasePhase {
  kind: 'caso'
  item: NewsItem
  answer: TrustLevel
  options: TrustLevel[]
  justify: CriterionId
}

export type PhaseConfig = ComparePhase | InspectPhase | CasePhase

export interface LevelConfig {
  level: 1 | 2 | 3
  title: string
  objective: string
  timeLimit?: number
  phases: PhaseConfig[]
}