export type TechId = 'celular' | 'computador' | 'gps' | 'videochamada' | 'ia'

export type ThemeId =
  | 'audio'
  | 'gps'
  | 'aulasOnline'
  | 'comprasApp'
  | 'roboFabrica'
  | 'trabalhoRemoto'

export type CharId = 'crianca' | 'adulto' | 'idoso' | 'robo'

export type SceneryId = 'casa' | 'escola' | 'trabalho' | 'rua'

export type Moment = 'antes' | 'depois' | 'consequencia'

export type CriterionId = 'clareza' | 'mudanca' | 'reflexao'

export type Speaker = 'A' | 'B'

export type Score = Record<CriterionId, number>

export interface LineOption {
  id: string
  chip: string
  text: string
  score: Score
  why: string
}

export interface MessageOption {
  id: string
  chip: string
  text: string
  score: Score
  why: string
}

export interface ThemeDef {
  id: ThemeId
  label: string
  tech: TechId
  techLabel: string
  headline: string
  lines: Partial<Record<Moment, LineOption[]>>
  messages?: MessageOption[]
}

export interface CharacterDef {
  id: CharId
  texture: string
  label: string
  voice: string
}

export interface SceneryDef {
  id: SceneryId
  texture: string
  label: string
}

export interface SlotConfig {
  moment: Moment
  label: string
  speaker?: Speaker
}

export interface Frame {
  moment: Moment
  themeId: ThemeId
  charId: CharId
  sceneryId: SceneryId
  line: LineOption
  speaker?: Speaker
}

interface BasePhase {
  id: string
  instruction: string
  sub: string
  characterOptions: CharId[]
  sceneryOptions: SceneryId[]
}

export interface CenaPhase extends BasePhase {
  kind: 'cena'
  themeOptions: ThemeId[]
  moment: Moment
}

export interface SequenciaPhase extends BasePhase {
  kind: 'sequencia'
  theme: ThemeId
  slots: SlotConfig[]
}

export interface NarrativaPhase extends BasePhase {
  kind: 'narrativa'
  theme: ThemeId
  slots: SlotConfig[]
}

export type PhaseConfig = CenaPhase | SequenciaPhase | NarrativaPhase

export interface LevelConfig {
  level: 1 | 2 | 3
  title: string
  objective: string
  phases: PhaseConfig[]
}