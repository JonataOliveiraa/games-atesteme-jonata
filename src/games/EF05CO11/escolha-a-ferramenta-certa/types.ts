export type CriterionId = 'levar' | 'rapido' | 'criar' | 'falar' | 'guardar' | 'custo'

export type TechId =
  | 'celular'
  | 'tablet'
  | 'notebook'
  | 'projetor'
  | 'impressora'
  | 'scanner'
  | 'nuvem'
  | 'hd-externo'
  | 'pendrive'
  | 'caixa-som'
  | 'camera'
  | 'microfone'
  | 'lousa-digital'
  | 'fone'

export interface CriterionDef {
  id: CriterionId
  label: string
  hint: string
}

export interface TechDef {
  id: TechId
  name: string
  texture: string
  precisaInternet: boolean
  scores: Record<CriterionId, number>
}

export interface Brief {
  caller: string
  role: string
  text: string
  scene: string
}

export interface Restriction {
  label: string
  detail: string
}

export interface BlockedTech {
  id: TechId
  reason: string
}

interface PhaseBase {
  id: string
  brief: Brief
  instruction: string
  sub: string
  chips: CriterionId[]
  answer: TechId
  decisive: CriterionId
  explainRight: string
  explainWrong: Partial<Record<TechId, string>>
}

export interface DuelPhase extends PhaseBase {
  kind: 'duelo'
  options: [TechId, TechId]
}

export interface TournamentPhase extends PhaseBase {
  kind: 'torneio'
  options: TechId[]
}

export interface ConstraintPhase extends PhaseBase {
  kind: 'restricao'
  options: TechId[]
  restrictions: Restriction[]
  blocked: BlockedTech[]
  keepReason: Partial<Record<TechId, string>>
}

export type PhaseConfig = DuelPhase | TournamentPhase | ConstraintPhase

export interface LevelConfig {
  level: number
  title: string
  objective: string
  timeLimit?: number
  phases: PhaseConfig[]
}