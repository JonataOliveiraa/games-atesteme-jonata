export interface SecurityItem {
  id: string
  label: string
  iconKey: string
  shouldBeOn: boolean
}

export interface RoundItemState {
  itemId: string
  initialOn: boolean
}

export interface SecurityItem {
  id: string
  label: string
  iconKey: string
  shouldBeOn: boolean
  why: string
}

/** Item que aparece com atraso durante a rodada (cenário de risco emergente — Nível 3) */
export interface DelayedRiskItem extends RoundItemState {
  appearAfterMs: number
  alertText: string
}

export interface ChecklistRound {
  id: string
  question: string
  hint: string
  items: RoundItemState[]
  delayedItem?: DelayedRiskItem
}

export interface LevelConfig {
  level: 1 | 2 | 3
  timeLimit: number
  rounds: ChecklistRound[]
  title: string
  objective: string
  tip: string
}

export interface ToggleCard {
  container: Phaser.GameObjects.Container
  itemId: string
  isOn: boolean
  homeX: number
  homeY: number
}
