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
  texture: string
  attributes: VehicleAttributes
}

export interface SelectionMission {
  id: string
  question: string
  hint: string
  attribute: FilterAttribute
  value: FilterValue
}

export interface LevelConfig {
  level: 1 | 2 | 3
  vehicleIds: string[]
  missions: SelectionMission[]
  title: string
  objective: string
  tip: string
}