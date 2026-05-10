export type MeioTransporte = 'ar' | 'terra' | 'agua'
export type FilterAttribute = 'voa' | 'temRodas' | 'temMotor' | 'meio'
export type FilterValue = boolean | MeioTransporte

export interface VehicleAttributes {
  voa: boolean
  temRodas: boolean
  temMotor: boolean
  meio: MeioTransporte
}

export interface Vehicle {
  id: string
  name: string
  emoji: string
  bodyColor: number
  attributes: VehicleAttributes
}

/** Missão dos níveis 1 (filtro binário + MCQ de contagem) */
export interface FilterMission {
  id: string
  instruction: string
  question: string
  filterAttribute: FilterAttribute
  filterValue: FilterValue
  expectedCount: number
}

/** Par de veículos para o nível 2 (comparação) */
export interface ComparisonPair {
  vehicleAId: string
  vehicleBId: string
  attributes: FilterAttribute[]
}

/** Missão do nível 3: aluno descobre o atributo comum de um grupo */
export interface GroupingMission {
  id: string
  instruction: string
  question: string
  highlightAttribute: FilterAttribute
  highlightValue: FilterValue
  options: { label: string; attribute: FilterAttribute; value: FilterValue }[]
  correctOptionIndex: number
}

export interface LevelConfig {
  level: 1 | 2 | 3
  vehicleIds: string[]
  timeLimit: number           // segundos
  filterMissions?: FilterMission[]
  comparisonPairs?: ComparisonPair[]
  groupingMissions?: GroupingMission[]
}
