export type LevelNumber = 1 | 2 | 3

export type Medium = 'air' | 'land' | 'water' | 'rail'

export type VehicleId =
    | 'plane'
    | 'car'
    | 'boat'
    | 'bike'
    | 'helicopter'
    | 'bus'
    | 'speedboat'
    | 'rocket'
    | 'sailboat'
    | 'scooter'
    | 'train'
    | 'seaplane'

export interface VehicleModel {
    id: VehicleId
    name: string
    frame: number
    media: Medium[]
    hasMotor: boolean
    hasWheels: boolean
}

export type TestZone =
    | { kind: 'medium'; medium: Medium }
    | { kind: 'motor'; hasMotor: boolean }
    | { kind: 'wheels'; hasWheels: boolean }

export type Attribute = 'air' | 'land' | 'water' | 'rail' | 'motor' | 'wheels'

export interface PhaseDef {
    zones: TestZone[]
    vehicles: VehicleId[]
}

export interface LevelDef {
    level: LevelNumber
    phases: PhaseDef[]
}

export interface Point {
    x: number
    y: number
}
