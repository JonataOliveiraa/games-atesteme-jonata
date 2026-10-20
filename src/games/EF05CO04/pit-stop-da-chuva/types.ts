/**
 * EF05CO04: algoritmo com seleção condicional. A Kika corre e a criança pilota;
 * quando o tempo, o chão ou o veículo mudam, ela chama o box e executa a regra
 * da equipe. A regra é uma árvore: SE/SENÃO (N1), SENÃO SE (N2), SE aninhado (N3).
 */

export type Weather = 'sol' | 'nublado' | 'chuva'

export type Ground = 'asfalto' | 'lama'

export type Vehicle = 'carro' | 'moto'

export type TireId = 'liso' | 'chuva' | 'cravos' | 'motoLiso' | 'motoChuva'

export type Test = 'chovendo' | 'lama' | 'moto'

export type State = 'intro' | 'demo' | 'grid' | 'race' | 'pit' | 'swap' | 'error' | 'help' | 'finish' | 'done'

export type Lane = 'front' | 'back' | 'pit'

export type Failure = 'aquaplana' | 'esquenta' | 'atola' | 'naoServe'

export interface Situation {
    weather: Weather
    ground: Ground
    vehicle: Vehicle
}

export interface Vec {
    x: number
    y: number
}

export interface Rect {
    x: number
    y: number
    w: number
    h: number
}

export type RuleNode = { tire: TireId } | { test: Test; then: RuleNode; otherwise: RuleNode }

export interface RuleRow {
    id: number
    indent: number
    word: 'SE' | 'SENÃO SE' | 'SENÃO'
    test?: Test
    tire?: TireId
    parent: number | null
}

export interface TireDef {
    id: TireId
    name: string
    vehicle: Vehicle
    cell: number
    cart: number
    stripe: number
}

export interface WeatherDef {
    id: Weather
    raining: boolean
    sun: boolean
    clouds: 'none' | 'gray' | 'rain'
    wet: number
}

export interface WeatherEvent {
    at: number
    weather: Weather
}

export interface Sector {
    from: number
    to: number
}

export interface LevelDef {
    level: number
    title: string
    message: string
    help: string
    rule: RuleNode
    carts: TireId[]
    lap: number
    laps: number
    boxes: number[]
    mud: Sector[]
    start: Weather
    events: WeatherEvent[]
    vehicles: Vehicle[]
}
