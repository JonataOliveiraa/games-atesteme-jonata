export type ChannelType = 'audio' | 'image' | 'text'

export interface GameItem {
  id: string
  nameKey: string
  textureKey: string
  /** Só existe quando o item tem um som característico natural (ex: latido). */
  soundKey?: string
  /** Canais nos quais essa informação pode ser transmitida sem perda. */
  validChannels: ChannelType[]
}

export interface DeliveryStation {
  id: string
  channel: ChannelType
  textureKey: string
  activeTextureKey: string
}

export type LevelMode = 'single' | 'dual' | 'mastery'

/**
 * Contextos usados no Nível 3 (mastery) pra restringir canais disponíveis
 * além da compatibilidade natural do item. Pendente dos assets visuais
 * (contexto_sem_som, contexto_sem_lapis) — a GameScene ainda não consome
 * esse campo até esses assets chegarem.
 */
export type ContextType = 'sem_som' | 'sem_lapis'

export interface MissionConfig {
  id: string
  item: GameItem
  /** 1 canal (N1/N3) ou 2 canais (N2) que a missão pede que o jogador use. */
  requiredChannels: ChannelType[]
  context?: ContextType
}

export interface LevelConfig {
  level: 1 | 2 | 3
  mode: LevelMode
  missions: MissionConfig[]
}