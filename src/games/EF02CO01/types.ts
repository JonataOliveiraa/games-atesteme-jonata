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

export interface VehicleCard {
  container: Phaser.GameObjects.Container
  vehicle: Vehicle
  homeX: number
  homeY: number
}

/** Missão: jogador toca nos veículos que correspondem ao atributo/valor */
export interface SelectionMission {
  id: string
  question: string      // "Quais veículos VOAM? ✈️"
  hint: string          // "Toque nos veículos que voam"
  attribute: FilterAttribute
  value: FilterValue
}

export interface LevelConfig {
  level: 1 | 2 | 3
  vehicleIds: string[]
  timeLimit: number
  missions: SelectionMission[]
  title: string         // "Voar ou não voar?"
  objective: string     // exibido no modal de instrução
  tip: string           // exibido no modal de instrução
}
