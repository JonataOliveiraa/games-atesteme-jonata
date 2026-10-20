import type { Ground, LevelDef, Situation, TireId, Vehicle, Weather } from '../types'
import { TIRES, WEATHERS, leaves, tireFor } from './rules'

export const POINTS = 5

export const guideKey = (level: number) => `ef05co04-pitstop-v2-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'SE chover, SENÃO...',
    message: 'A regra olha o céu de agora: chovendo, pneu de chuva; senão, pneu liso. O nublado cai no SENÃO.',
    help: 'Olhe o céu e siga a regra.',
    rule: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    carts: ['chuva', 'liso'],
    lap: 12000,
    laps: 3,
    boxes: [2000, 6000, 10000],
    mud: [],
    start: 'sol',
    events: [
        { at: 2400, weather: 'nublado' },
        { at: 6800, weather: 'chuva' },
        { at: 17000, weather: 'nublado' },
        { at: 26600, weather: 'chuva' },
    ],
    vehicles: ['carro', 'carro', 'carro'],
}

const N2: LevelDef = {
    level: 2,
    title: 'SE, SENÃO SE, SENÃO',
    message: 'A regra é lida de cima para baixo: a primeira condição verdadeira manda. Lama com chuva ainda é pneu de cravos.',
    help: 'Leia a regra de cima para baixo.',
    rule: {
        test: 'lama',
        then: { tire: 'cravos' },
        otherwise: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    },
    carts: ['cravos', 'chuva', 'liso'],
    lap: 18000,
    laps: 2,
    boxes: [2500, 8500, 15000],
    mud: [{ from: 7000, to: 13000 }],
    start: 'sol',
    events: [
        { at: 1200, weather: 'nublado' },
        { at: 19500, weather: 'chuva' },
    ],
    vehicles: ['carro', 'carro'],
}

const N3: LevelDef = {
    level: 3,
    title: 'SE dentro de SE',
    message: 'Primeiro a regra pergunta qual é o veículo; só depois olha o céu. Pneu de moto não serve no carro.',
    help: 'Moto ou carro? Depois, olhe o céu.',
    rule: {
        test: 'moto',
        then: { test: 'chovendo', then: { tire: 'motoChuva' }, otherwise: { tire: 'motoLiso' } },
        otherwise: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    },
    carts: ['motoChuva', 'motoLiso', 'chuva', 'liso'],
    lap: 16000,
    laps: 2,
    boxes: [1200, 6000, 11000],
    mud: [],
    start: 'sol',
    events: [
        { at: 3500, weather: 'chuva' },
        { at: 22000, weather: 'sol' },
        { at: 29500, weather: 'nublado' },
    ],
    vehicles: ['carro', 'moto'],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

/**
 * O respiro entre as mudanças (pedido do usuário: *"eu mal troco de pneu e o jogo
 * já troca"*). A tenda usada fica pelo menos `react` depois da mudança, e a
 * mudança seguinte vem pelo menos `calm` depois da tenda (uns 6 s de pista).
 */
export const GAP = { react: 800, calm: 3500, finish: 1500 } as const

export const totalOf = (level: LevelDef) => level.lap * level.laps

export const lapPos = (level: LevelDef, d: number) => ((d % level.lap) + level.lap) % level.lap

export function weatherAt(level: LevelDef, d: number): Weather {
    let w = level.start
    level.events.forEach(e => {
        if (e.at <= d) w = e.weather
    })
    return w
}

export function groundAt(level: LevelDef, d: number): Ground {
    const p = lapPos(level, d)
    return level.mud.some(s => p >= s.from && p < s.to) ? 'lama' : 'asfalto'
}

export function lapOf(level: LevelDef, d: number) {
    return Math.max(0, Math.min(level.laps - 1, Math.floor(d / level.lap)))
}

export function vehicleAt(level: LevelDef, d: number): Vehicle {
    return level.vehicles[lapOf(level, d)]
}

/** A próxima tenda (distância absoluta) pelo menos `ahead` à frente de `d`. */
export function nextBox(level: LevelDef, d: number, ahead: number): number {
    const from = d + ahead
    const lapStart = Math.floor(from / level.lap) * level.lap
    for (let k = 0; k < 3; k++)
        for (const q of level.boxes) {
            const p = lapStart + k * level.lap + q
            if (p >= from) return p
        }
    return from
}

export function situationAt(level: LevelDef, d: number, weather: Weather, vehicle: Vehicle): Situation {
    return { weather, ground: groundAt(level, d), vehicle }
}

export const startTire = (level: LevelDef): TireId => tireFor(level.rule, situationAt(level, 0, level.start, level.vehicles[0]))

interface Change {
    at: number
    tire: TireId
    needed: boolean
    trap: boolean
    mudRain: boolean
    relay: boolean
}

/** Cada ponto em que algo muda, e o pneu que a regra pede dali em diante. */
export function changesOf(level: LevelDef): Change[] {
    const total = totalOf(level)
    const points = new Set<number>()
    level.events.forEach(e => points.add(e.at))
    for (let k = 0; k < level.laps; k++) {
        level.mud.forEach(s => {
            points.add(k * level.lap + s.from)
            points.add(k * level.lap + s.to)
        })
        if (k > 0 && level.vehicles[k] !== level.vehicles[k - 1]) points.add(k * level.lap)
    }
    const sorted = [...points].filter(p => p > 0 && p < total).sort((a, b) => a - b)
    const at = (d: number) => situationAt(level, d, weatherAt(level, d), vehicleAt(level, d))
    let prev = startTire(level)
    let prevWeather = level.start
    return sorted.map(p => {
        const s = at(p)
        const tire = tireFor(level.rule, s)
        const relay = vehicleAt(level, p) !== vehicleAt(level, p - 1)
        const change: Change = {
            at: p,
            tire,
            needed: relay || tire !== prev,
            trap: tire === prev && s.weather !== prevWeather && !relay,
            mudRain: s.ground === 'lama' && WEATHERS[s.weather].raining,
            relay,
        }
        prev = tire
        prevWeather = s.weather
        return change
    })
}

/** As trocas que a corrida pede: é o que dá ponto. */
export const neededOf = (level: LevelDef) => changesOf(level).filter(c => c.needed).length

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        const tires = leaves(level.rule)
        if (new Set(tires).size !== tires.length) problems.push(`${tag}: um pneu aparece em dois ramos`)
        tires.forEach(t => {
            if (!level.carts.includes(t)) problems.push(`${tag}: falta o carrinho de ${t}`)
        })
        level.carts.forEach(t => {
            if (!TIRES[t]) problems.push(`${tag}: pneu ${t} não existe`)
        })
        if (level.vehicles.length !== level.laps) problems.push(`${tag}: um veículo por volta`)
        const total = totalOf(level)
        const changes = changesOf(level)
        changes.forEach((c, i) => {
            if (!c.needed) return
            const later = changes.slice(i + 1).find(n => n.needed)
            const box = nextBox(level, c.at, GAP.react)
            const room = later ? later.at - box : total - box
            if (room < (later ? GAP.calm : GAP.finish))
                problems.push(`${tag}: depois da tenda de ${c.at} (em ${box}) só há ${room} até ${later ? `a mudança em ${later.at}` : 'a chegada'}`)
        })
        if (!changes.some(c => c.trap)) problems.push(`${tag}: falta a armadilha (o tempo muda e o pneu não)`)
        level.events.forEach((e, i) => {
            if (i && e.at <= level.events[i - 1].at) problems.push(`${tag}: eventos fora de ordem`)
            if (!WEATHERS[e.weather]) problems.push(`${tag}: céu ${e.weather} não existe`)
        })
        if (level.rule && 'test' in level.rule && level.rule.test === 'lama' && !changes.some(c => c.mudRain))
            problems.push(`${tag}: falta lama com chuva`)
        if (level.rule && 'test' in level.rule && level.rule.test === 'moto' && new Set(level.vehicles).size < 2)
            problems.push(`${tag}: faltam os dois veículos`)
    })
    if (problems.length) throw new Error(`Pit Stop da Chuva — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
