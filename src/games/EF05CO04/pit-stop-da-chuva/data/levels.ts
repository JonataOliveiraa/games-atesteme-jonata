import type { Ground, LevelDef, Sector, Situation, TireId, Vehicle, Weather } from '../types'
import { PIT } from './physics'
import { TIRES, WEATHERS, leaves, motoTireOf, tests, tireFor } from './rules'

export const POINTS = 5

export const guideKey = (level: number) => `ef05co04-pitstop-v3-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'SE chover, SENÃO...',
    message: 'A regra olha o céu de agora: chovendo, pneu de chuva; senão, pneu liso. O nublado cai no SENÃO.',
    help: 'Olhe o céu: cada botão do box diz quando usar.',
    rule: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    carts: ['chuva', 'liso'],
    lap: 12000,
    laps: 3,
    boxes: [2000, 6000, 10000],
    mud: [],
    narrow: [],
    start: 'sol',
    events: [
        { at: 2400, weather: 'nublado' },
        { at: 6800, weather: 'chuva' },
        { at: 17000, weather: 'nublado' },
        { at: 26600, weather: 'chuva' },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'SE, SENÃO SE, SENÃO',
    message: 'A regra é lida de cima para baixo: a primeira condição verdadeira manda. Na lama, mesmo chovendo, é pneu de cravos.',
    help: 'Lama, chuva ou sol? Leia os botões na ordem.',
    rule: {
        test: 'lama',
        then: { tire: 'cravos' },
        otherwise: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    },
    carts: ['cravos', 'chuva', 'liso'],
    lap: 18000,
    laps: 2,
    boxes: [5000, 11000, 17000],
    mud: [{ from: 4000, to: 10000 }],
    narrow: [{ from: 23000, to: 36000 }],
    start: 'sol',
    events: [
        { at: 1200, weather: 'nublado' },
        { at: 8000, weather: 'chuva' },
        { at: 14500, weather: 'sol' },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'SE dentro de SE',
    message: 'Primeiro a regra pergunta se a pista é estreita; só depois olha o céu. Na pista estreita, só a moto passa.',
    help: 'Pista estreita? Depois, olhe o céu.',
    rule: {
        test: 'estreita',
        then: { test: 'chovendo', then: { tire: 'motoChuva' }, otherwise: { tire: 'motoLiso' } },
        otherwise: { test: 'chovendo', then: { tire: 'chuva' }, otherwise: { tire: 'liso' } },
    },
    carts: ['motoChuva', 'motoLiso', 'chuva', 'liso'],
    lap: 12000,
    laps: 2,
    boxes: [1200, 6000, 9000],
    mud: [],
    narrow: [{ from: 0, to: 18000 }],
    start: 'sol',
    events: [
        { at: 2500, weather: 'chuva' },
        { at: 10600, weather: 'sol' },
        { at: 21500, weather: 'nublado' },
    ],
    pitZone: 240,
    parkV: 270,
    nudgeMs: 1200,
    calm: 4500,
    /** Pedido do usuário: "no n3 os bots estão mt apelões". De moto e com duas etapas no box, a Kika perde tempo. */
    rivalPace: 0.78,
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

/**
 * O respiro entre as mudanças (pedido do usuário: *"eu mal troco de pneu e o jogo
 * já troca"*). A tenda usada fica pelo menos `react` depois da mudança, e a
 * mudança seguinte vem pelo menos `calm` depois da tenda (uns 6 s de pista).
 */
export const GAP = { react: 800, calm: 3500, finish: 1500 } as const

export const pitOf = (level: LevelDef) => ({
    zone: level.pitZone ?? PIT.zone,
    parkV: level.parkV ?? PIT.parkV,
    nudge: level.nudgeMs ?? PIT.nudge,
})

export const totalOf = (level: LevelDef) => level.lap * level.laps

export const lapPos = (level: LevelDef, d: number) => ((d % level.lap) + level.lap) % level.lap

const inside = (sectors: Sector[], d: number) => sectors.some(s => d >= s.from && d < s.to)

export function weatherAt(level: LevelDef, d: number): Weather {
    let w = level.start
    level.events.forEach(e => {
        if (e.at <= d) w = e.weather
    })
    return w
}

export function groundAt(level: LevelDef, d: number): Ground {
    return inside(level.mud, d) ? 'lama' : 'asfalto'
}

export const narrowAt = (level: LevelDef, d: number) => inside(level.narrow, d)

/** Na pista estreita, só a moto passa. As bordas dos trechos são tendas: a troca de veículo é no box. */
export const vehicleAt = (level: LevelDef, d: number): Vehicle => (narrowAt(level, Math.min(d, totalOf(level) - 1)) ? 'moto' : 'carro')

/** A regra fala do veículo (N3)? Se não fala (N2), a equipe põe sozinha o pneu de moto. */
export const asksVehicle = (level: LevelDef) => tests(level.rule, 'estreita')

export function lapOf(level: LevelDef, d: number) {
    return Math.max(0, Math.min(level.laps - 1, Math.floor(d / level.lap)))
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

export function situationAt(level: LevelDef, d: number, weather: Weather): Situation {
    return { weather, ground: groundAt(level, d), narrow: narrowAt(level, d) }
}

/** O pneu que serve: o da regra, e na moto do N2 a versão de moto dele. */
export function needOf(level: LevelDef, s: Situation, vehicle: Vehicle): TireId {
    const tire = tireFor(level.rule, s)
    if (vehicle === 'moto' && !asksVehicle(level)) return motoTireOf(tire) ?? tire
    return tire
}

export const startTire = (level: LevelDef): TireId => needOf(level, situationAt(level, 0, level.start), vehicleAt(level, 0))

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
    ;[...level.mud, ...level.narrow].forEach(s => {
        points.add(s.from)
        points.add(s.to)
    })
    const sorted = [...points].filter(p => p > 0 && p < total).sort((a, b) => a - b)
    const at = (d: number) => situationAt(level, d, weatherAt(level, d))
    let prev = startTire(level)
    let prevWeather = level.start
    return sorted.map(p => {
        const s = at(p)
        const relay = vehicleAt(level, p) !== vehicleAt(level, p - 1)
        const tire = needOf(level, s, vehicleAt(level, p))
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
        const total = totalOf(level)
        const changes = changesOf(level)
        changes.forEach((c, i) => {
            if (!c.needed) return
            const later = changes.slice(i + 1).find(n => n.needed)
            const box = c.relay ? c.at : nextBox(level, c.at, GAP.react)
            const room = later ? later.at - box : total - box
            if (room < (later ? (level.calm ?? GAP.calm) : GAP.finish))
                problems.push(`${tag}: depois da tenda de ${c.at} (em ${box}) só há ${room} até ${later ? `a mudança em ${later.at}` : 'a chegada'}`)
        })
        if (!changes.some(c => c.trap)) problems.push(`${tag}: falta a armadilha (o tempo muda e o pneu não)`)
        level.events.forEach((e, i) => {
            if (i && e.at <= level.events[i - 1].at) problems.push(`${tag}: eventos fora de ordem`)
            if (!WEATHERS[e.weather]) problems.push(`${tag}: céu ${e.weather} não existe`)
        })
        if (level.rule && 'test' in level.rule && level.rule.test === 'lama' && !changes.some(c => c.mudRain))
            problems.push(`${tag}: falta lama com chuva`)
        level.narrow.forEach(s => {
            ;[s.from, s.to].forEach(edge => {
                if (edge <= 0 || edge >= total) return
                if (!level.boxes.includes(lapPos(level, edge))) problems.push(`${tag}: a borda ${edge} da pista estreita não é uma tenda`)
                const early = level.boxes
                    .flatMap(q => Array.from({ length: level.laps }, (_, k) => k * level.lap + q))
                    .find(p => p < edge && p >= edge - PIT.relayCall)
                if (early !== undefined) problems.push(`${tag}: a tenda ${early} fica colada na borda ${edge}`)
            })
            if (level.mud.some(m => m.from < s.to && m.to > s.from)) problems.push(`${tag}: lama dentro da pista estreita`)
            if (!asksVehicle(level)) {
                if (level.events.some(e => e.at > s.from && e.at < s.to)) problems.push(`${tag}: o céu muda dentro da pista estreita`)
                const tire = tireFor(level.rule, situationAt(level, s.from, weatherAt(level, s.from)))
                if (!motoTireOf(tire)) problems.push(`${tag}: não há pneu de moto para ${tire}`)
            }
        })
        if (asksVehicle(level)) {
            const seen = new Set([0, ...changes.map(c => c.at)].map(p => vehicleAt(level, p)))
            if (seen.size < 2) problems.push(`${tag}: faltam os dois veículos`)
        }
    })
    if (problems.length) throw new Error(`Pit Stop da Chuva — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
