export type ItemCategory = 'pecas' | 'programas'

export interface MuseumItem {
  id: string
  name: string
  category: ItemCategory
  textureKey: string
}

/** Missão: jogador toca nos itens que correspondem ao critério da rodada */
export interface MuseumMission {
  id: string
  question: string
  hint: string
  correctIds: string[]
  /** Pool de itens exclusivo desta missão — quando definido, o grid é reconstruído ao entrar na missão */
  itemIds?: string[]
}

export interface LevelConfig {
  level: 1 | 2 | 3
  itemIds: string[]
  timeLimit: number
  missions: MuseumMission[]
  title: string
  objective: string
  tip: string
}

export interface ItemCard {
  container: Phaser.GameObjects.Container
  item: MuseumItem
  homeX: number
  homeY: number
}
