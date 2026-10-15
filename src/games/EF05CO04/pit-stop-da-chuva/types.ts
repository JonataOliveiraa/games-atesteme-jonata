/**
 * EF05CO04: algoritmo com seleção condicional. A regra da equipe é um SE/SENÃO,
 * e a criança a executa a cada parada no box lendo o céu daquele momento.
 * O SENÃO pega todo céu em que não está chovendo.
 */

export type Weather = 'sol' | 'nublado' | 'chuva'

export type TireId = 'liso' | 'chuva' | 'inter'

export type Branch = 'then' | 'else'

export type State = 'intro' | 'demo' | 'pick' | 'swap' | 'lap' | 'error' | 'help' | 'done' | 'finale'

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

export interface WeatherDef {
    id: Weather
    raining: boolean
    sun: boolean
    clouds: 'none' | 'gray' | 'rain'
    wet: number
}

export interface TireDef {
    id: TireId
    name: string
    cell: number
    cart: number
    stripe: number
}

export interface RuleDef {
    when: Weather
    then: TireId
    otherwise: TireId
}

export interface RaceDef {
    id: string
    stops: Weather[]
    cheer: string
}

export interface LevelDef {
    level: number
    title: string
    message: string
    rule: RuleDef
    carts: TireId[]
    demo: Weather[]
    races: RaceDef[]
}
