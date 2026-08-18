export type LevelNumber = 1 | 2 | 3

export type MissionMode = 'split-only' | 'split-and-order' | 'split-and-combine'

export type PlayState = 'intro' | 'split' | 'order-subtask' | 'combine' | 'simulate' | 'complete'

export type ChefFrame = 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'

export type CombineSlotId = 'first' | 'while-waiting' | 'after'

/** Objeto que a criança classifica na etapa de DIVIDIR. */
export interface ActionIcon {
  id: string
  label: string
  iconKey: string
  subtaskId: string
  hint?: string
}

/** Quadro de estado usado na etapa de ORDENAR. */
export interface SequenceStep {
  id: string
  label: string
  iconKey: string
  hint?: string
}

export interface SubtaskPlate {
  id: string
  label: string
  iconKey: string

  /**
   * Objetos que caem neste prato na etapa de dividir. São coisas concretas
   * (pão, queijo, talher) que a criança CLASSIFICA.
   */
  actionIds: string[]

  /**
   * História em três quadros para a etapa de ordenar, quando esta parte
   * tiver uma. É um conjunto SEPARADO de `actionIds` de propósito:
   *
   *   dividir  = classificar objetos    → "queijo é do sanduíche"
   *   ordenar  = sequenciar momentos    → "pão → queijo → sanduíche pronto"
   *
   * Quando os dois compartilhavam a mesma lista, os quadros de estado
   * apareciam na prateleira da divisão e "cesta fechada" virava um
   * ingrediente a classificar, o que não quer dizer nada.
   *
   * Parte sem ordem natural (duas bebidas prontas) simplesmente não declara
   * `sequence` e fica só na divisão.
   */
  sequence?: SequenceStep[]

  hasWait?: boolean
}

export interface CombineSlot {
  id: CombineSlotId
  label: string
  helper: string
}

export interface ChefMission {
  id: string
  level: LevelNumber
  mode: MissionMode
  title: string
  goalIconKey: string
  chefLine: string
  splitInstruction: string
  orderInstruction?: string
  combineInstruction?: string
  subtasks: SubtaskPlate[]
  actions: ActionIcon[]
  combineSlots?: CombineSlot[]
  expectedCombineOrder?: string[]
  successMessage: string
}

export interface LevelConfig {
  level: LevelNumber
  title: string
  missions: ChefMission[]
}
