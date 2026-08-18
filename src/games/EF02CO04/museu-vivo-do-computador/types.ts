export type ItemCategory = 'pecas' | 'programas'
export type ZoneKind = 'pecas' | 'programas' | 'maquina'

export interface MuseumItem {
  id: string
  name: string
  category: ItemCategory
  textureKey: string
  fact: string
}

export type ConfirmMode = 'imediato' | 'porItem' | 'montagem'

export interface DropZoneDef {
  id: string
  label: string
  kind: ZoneKind
  acceptIds: string[]
}

export interface MuseumMission {
  id: string
  question: string
  hint: string
  itemIds: string[]
  zones: DropZoneDef[]
}

export interface LevelConfig {
  level: 1 | 2 | 3
  confirmMode?: ConfirmMode
  timeLimit: number
  missions: MuseumMission[]
  title: string
  objective: string
  tip: string
}

export interface ItemCard {
  staged?: boolean
  container: Phaser.GameObjects.Container
  item: MuseumItem
  homeX: number
  homeY: number
  placed: boolean
}