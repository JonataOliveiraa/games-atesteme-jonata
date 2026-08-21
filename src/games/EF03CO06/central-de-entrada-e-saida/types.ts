export type LevelNumber = 1 | 2 | 3

export type DeviceKind = 'input' | 'output'

export type DeviceId =
  | 'teclado'
  | 'mouse'
  | 'microfone'
  | 'camera'
  | 'monitor'
  | 'alto-falante'
  | 'impressora'

export type InfoId = 'voz' | 'som' | 'foto' | 'tela' | 'texto' | 'impresso'

export type OpFrame = 'op-01' | 'op-02' | 'op-03' | 'op-04' | 'op-05' | 'op-06'

export type PlayState = 'sort' | 'pick' | 'chain' | 'run' | 'complete'

export interface Device {
  id: DeviceId
  label: string
  kind: DeviceKind
  textureKey: string
  action: string
}

export interface InfoPiece {
  id: InfoId
  label: string
  textureKey: string
}

export interface SortRound {
  deviceId: DeviceId
  successLine: string
  wrongLine: string
}

export interface PickRound {
  taskId: string
  taskLabel: string
  taskInfoId: InfoId
  answerId: DeviceId
  options: DeviceId[]
  successLine: string
}

export interface ChainRound {
  id: string
  taskLabel: string
  inputId: DeviceId
  outputId: DeviceId
  inInfoId: InfoId
  outInfoId: InfoId
  options: DeviceId[]
  successLine: string
}

export interface LevelConfig {
  level: LevelNumber
  title: string
  helper: string
  opening: string[]
  sortRounds?: SortRound[]
  pickRounds?: PickRound[]
  chainRounds?: ChainRound[]
  successMessage: string
}