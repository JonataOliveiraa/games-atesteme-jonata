export type StructureId = 'lista' | 'matriz' | 'registro' | 'grafo' | 'solto'

export type ShapeKind = 'circulo' | 'quadrado' | 'triangulo' | 'estrela' | 'losango'

export type SwatchId = 'lilas' | 'creme' | 'rosa' | 'uva' | 'areia'

export type SizeStep = 1 | 2 | 3 | 4 | 5

export type TokenKind = 'numero' | 'palavra' | 'simnao'

export type RobotPose = 'normal' | 'apontando' | 'duvida' | 'feliz'

export interface StructureDef {
  id: StructureId
  kidName: string
  techName: string
  texture: string
  icon: StructureId
  tagline: string
  tinoLine: string
}

export interface ItemDef {
  id: string
  label: string
  shape: ShapeKind
  swatch: SwatchId
  size: SizeStep
}

export interface RecordField {
  key: string
  label: string
  value: string
}

export interface GraphNodeDef {
  id: string
  label: string
  x: number
  y: number
}

export interface SoltoToken {
  id: string
  text: string
  kind: TokenKind
}

interface TaskBase {
  id: string
  prompt: string
  hint: string
  explain: string
}

export interface ListaTask extends TaskBase {
  structure: 'lista'
  variant: 'ordenar' | 'inserir'
  items: string[]
  answer: string[]
  incoming?: string
  insertAt?: number
}

export interface MatrizTask extends TaskBase {
  structure: 'matriz'
  rows: number
  cols: number
  rowKeys: ShapeKind[]
  colKeys: SwatchId[]
  cells: (string | null)[]
  target: { row: number; col: number }
}

export interface RegistroTask extends TaskBase {
  structure: 'registro'
  variant: 'achar-campo' | 'achar-valor'
  title: string
  fields: RecordField[]
  answerKey: string
  options?: string[]
}

export interface GrafoTask extends TaskBase {
  structure: 'grafo'
  nodes: GraphNodeDef[]
  statements: string[]
  answer: [string, string][]
}

export interface SoltoTask extends TaskBase {
  structure: 'solto'
  bins: TokenKind[]
  tokens: SoltoToken[]
}

export type TaskConfig = ListaTask | MatrizTask | RegistroTask | GrafoTask | SoltoTask

export interface GuidedPhase {
  id: string
  kind: 'guiada'
  room: StructureId
  intro: string
  task: TaskConfig
}

export interface VitrinePhase {
  id: string
  kind: 'vitrine'
  question: string
  intro: string
  offered: [StructureId, StructureId]
  best: StructureId
  whyBest: string
  whyOther: string
  tasks: Record<string, TaskConfig>
}

export interface FreePhase {
  id: string
  kind: 'livre'
  question: string
  intro: string
  steps: { need: string; room: StructureId; task: TaskConfig }[]
}

export type PhaseConfig = GuidedPhase | VitrinePhase | FreePhase

export interface LevelConfig {
  level: number
  title: string
  objective: string
  timeLimit?: number
  openRooms: StructureId[]
  phases: PhaseConfig[]
}

export interface ScoreEntry {
  hits: number
  tries: number
  picks: number
  goodPicks: number
}

export type ReportCard = Record<StructureId, ScoreEntry>