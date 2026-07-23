export type ChannelType = 'audio' | 'image' | 'text'

export interface GameItem {
  id: string
  nameKey: string
  textureKey: string
  phrase: string
  soundKey?: string
  validChannels: ChannelType[]
}

export interface DeliveryStation {
  id: string
  channel: ChannelType
  textureKey: string
  activeTextureKey: string
}

export type LevelMode = 'single' | 'dual' | 'mastery'

export type ContextType = 'sem_som' | 'sem_lapis'

export interface MissionConfig {
  id: string
  item: GameItem
  requiredChannels: ChannelType[]
  context?: ContextType
}

export interface LevelConfig {
  level: 1 | 2 | 3
  mode: LevelMode
  missions: MissionConfig[]
}