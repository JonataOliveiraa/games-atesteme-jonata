import type { Branch, RuleDef, TireDef, TireId, Weather, WeatherDef } from '../types'
import { C } from './theme'

export const WEATHERS: Record<Weather, WeatherDef> = {
    sol: { id: 'sol', raining: false, sun: true, clouds: 'none', wet: 0 },
    nublado: { id: 'nublado', raining: false, sun: false, clouds: 'gray', wet: 0.14 },
    chuva: { id: 'chuva', raining: true, sun: false, clouds: 'rain', wet: 0.26 },
}

export const TIRES: Record<TireId, TireDef> = {
    liso: { id: 'liso', name: 'LISO', cell: 0, cart: 4, stripe: C.slick },
    chuva: { id: 'chuva', name: 'CHUVA', cell: 1, cart: 5, stripe: C.wetTire },
    inter: { id: 'inter', name: 'INTERMEDIÁRIO', cell: 2, cart: 6, stripe: C.inter },
}

export const branchFor = (rule: RuleDef, weather: Weather): Branch => (weather === rule.when ? 'then' : 'else')

export const tireFor = (rule: RuleDef, weather: Weather): TireId => (branchFor(rule, weather) === 'then' ? rule.then : rule.otherwise)

export const branchOfTire = (rule: RuleDef, tire: TireId): Branch => (tire === rule.then ? 'then' : 'else')
