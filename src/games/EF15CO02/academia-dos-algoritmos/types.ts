export type LevelNumber = 1 | 2 | 3

export type TrackId =
  | 'sequencia'
  | 'repeticao'
  | 'condicao'
  | 'depuracao'
  | 'final'

export type MissionKind =
  | 'ordenar'
  | 'montar'
  | 'caminho'
  | 'repetir'
  | 'condicional'
  | 'comparar'
  | 'livre'

export type BlockKind = 'acao' | 'repetir' | 'condicao' | 'comentario'

export type ActionId =
  | 'pegar'
  | 'guardar'
  | 'andar'
  | 'virar-esquerda'
  | 'virar-direita'
  | 'desviar'
  | 'dobrar'
  | 'encaixar'
  | 'misturar'
  | 'regar'
  | 'observar'
  | 'esperar'
  | 'avisar'
  | 'finalizar'

export type ConditionId =
  | 'caminho-livre'
  | 'tem-obstaculo'
  | 'esta-sujo'
  | 'esta-pronto'
  | 'cor-correta'
  | 'faltam-itens'
  | 'todos-terminaram'

export type CharacterId = 'tino' | 'lia' | 'caio' | 'nina' | 'jogador'

export type TextureKey =
  | 'bg-academia-hub'
  | 'bg-sala-treino'
  | 'treinador-normal'
  | 'treinador-feliz'
  | 'treinador-pensando'
  | 'avatar-crianca'
  | 'item-escova'
  | 'item-pasta-dente'
  | 'item-mochila'
  | 'item-caderno'
  | 'item-lanche'
  | 'item-planta'
  | 'item-regador'
  | 'item-bloco-montar'
  | 'item-brinquedo'
  | 'item-poca'
  | 'personagem-lia'
  | 'personagem-caio'
  | 'personagem-nina'

export interface CharacterDef {
  id: CharacterId
  name: string
  texture: TextureKey
  role: string
  voice: string
}

export interface TrackDef {
  id: TrackId
  label: string
  technicalLabel: string
  color: number
  icon: 'setas' | 'loop' | 'bifurcacao' | 'ferramenta' | 'trofeu'
  tinoLine: string
}

interface BaseBlock {
  id: string
  kind: BlockKind
  label: string
  icon?: string
  hint?: string
}

export interface ActionBlock extends BaseBlock {
  kind: 'acao'
  action: ActionId
}

export interface RepeatBlock extends BaseBlock {
  kind: 'repetir'
  times: number
  blocks: AlgorithmBlock[]
}

export interface ConditionBranch {
  label: string
  blocks: AlgorithmBlock[]
}

export interface ConditionBlock extends BaseBlock {
  kind: 'condicao'
  condition: ConditionId
  ifTrue: ConditionBranch
  ifFalse?: ConditionBranch
}

export interface CommentBlock extends BaseBlock {
  kind: 'comentario'
  speaker: CharacterId
  text: string
}

export type AlgorithmBlock =
  | ActionBlock
  | RepeatBlock
  | ConditionBlock
  | CommentBlock

export interface ActionOption {
  id: string
  block: AlgorithmBlock
}

export interface SimulationStep {
  id: string
  label: string
  texture?: TextureKey
  expectedAction?: ActionId
  expectedCondition?: ConditionId
  successLine: string
  failLine: string
}

export interface VersionRecord {
  id: string
  label: string
  blocks: AlgorithmBlock[]
  blockCount: number
  success: boolean
  failedAtStep?: number
  concepts: TrackId[]
  feedback: string
}

export interface CollaboratorSolution {
  character: Exclude<CharacterId, 'jogador' | 'tino'>
  title: string
  blocks: AlgorithmBlock[]
  explanation: string
}

interface MissionBase {
  id: string
  level: LevelNumber
  track: TrackId
  kind: MissionKind
  title: string
  problem: string
  instruction: string
  tinoLine: string
  availableBlocks: ActionOption[]
  expected: AlgorithmBlock[]
  simulation: SimulationStep[]
  successMessage: string
  debugHint: string
}

export interface GuidedMission extends MissionBase {
  kind: 'ordenar' | 'montar' | 'caminho' | 'repetir' | 'condicional'
  support: 'alto' | 'medio'
  maxBlocks?: number
}

export interface CompareMission extends MissionBase {
  kind: 'comparar'
  collaborator: CollaboratorSolution
  questions: CompareQuestion[]
}

export interface FreeMission extends MissionBase {
  kind: 'livre'
  requiredConcepts: TrackId[]
  collaborator?: CollaboratorSolution
  target?: {
    maxBlocks?: number
    minSuccessfulVersions?: number
  }
}

export interface CompareQuestion {
  id: string
  prompt: string
  options: string[]
  answer: string
  feedback: string
}

export type MissionConfig = GuidedMission | CompareMission | FreeMission

export interface PhaseConfig {
  id: string
  title: string
  missionId: string
  unlockedTracks: TrackId[]
  timeLimit?: number
}

export interface LevelConfig {
  level: LevelNumber
  title: string
  objective: string
  description: string
  phases: PhaseConfig[]
}

export interface RuntimeState {
  level: LevelNumber
  phaseIndex: number
  points: number
  selectedTrack?: TrackId
  currentMission?: MissionConfig
  currentBlocks: AlgorithmBlock[]
  versions: VersionRecord[]
  running: boolean
  paused: boolean
  completed: boolean
}
