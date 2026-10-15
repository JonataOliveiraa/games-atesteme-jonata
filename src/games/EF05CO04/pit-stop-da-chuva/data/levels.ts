import type { LevelDef, Weather } from '../types'
import { WEATHERS, branchFor } from './weather'

export const POINTS = 3

export const guideKey = (level: number) => `ef05co04-pitstop-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'SE chover, SENÃO...',
    message: 'A regra olha o céu de agora: se está chovendo, pneu de chuva; senão, pneu liso. Sol e nublado caem no SENÃO.',
    rule: { when: 'chuva', then: 'chuva', otherwise: 'liso' },
    carts: ['chuva', 'liso'],
    demo: ['sol', 'chuva'],
    races: [
        { id: 'corrida-1', stops: ['sol', 'chuva', 'chuva'], cheer: 'Primeiro lugar!' },
        { id: 'corrida-2', stops: ['nublado', 'chuva', 'sol'], cheer: 'Ganhamos de novo!' },
        { id: 'corrida-3', stops: ['chuva', 'nublado', 'chuva', 'sol'], cheer: 'Campeões!' },
    ],
}

export const LEVELS: LevelDef[] = [N1]

export const stopsOf = (level: LevelDef) => level.races.reduce((n, r) => n + r.stops.length, 0)

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        const { rule } = level
        if (!level.carts.includes(rule.then) || !level.carts.includes(rule.otherwise)) problems.push(`${tag}: falta carrinho de um dos ramos`)
        if (rule.then === rule.otherwise) problems.push(`${tag}: os dois ramos dão o mesmo pneu`)
        const seen = new Map<Weather, number>()
        level.races.forEach((race, i) => {
            const rtag = `${tag} ${race.id}`
            if (race.stops.length < 3 || race.stops.length > 5) problems.push(`${rtag}: precisa de 3 a 5 paradas`)
            const prev = level.races[i - 1]
            if (prev && race.stops.length < prev.stops.length) problems.push(`${rtag}: a corrida encolheu`)
            const branches = new Set(race.stops.map(w => branchFor(rule, w)))
            if (branches.size < 2) problems.push(`${rtag}: não tem os dois ramos`)
            race.stops.forEach((w, j) => {
                if (!WEATHERS[w]) problems.push(`${rtag}: céu ${w} não existe`)
                if (j >= 2 && race.stops[j - 1] === w && race.stops[j - 2] === w) problems.push(`${rtag}: 3 céus iguais seguidos`)
                seen.set(w, (seen.get(w) ?? 0) + 1)
            })
            if (i === 0 && race.stops.includes('nublado')) problems.push(`${rtag}: o nublado estreia depois da 1ª corrida`)
            if (!race.cheer) problems.push(`${rtag}: falta a fala do fim`)
        })
        ;(Object.keys(WEATHERS) as Weather[])
            .filter(w => branchFor(rule, w) === 'else')
            .forEach(w => {
                if ((seen.get(w) ?? 0) < 2) problems.push(`${tag}: o céu ${w} cai no SENÃO e aparece menos de 2 vezes`)
            })
        if (level.demo.length !== 2 || branchFor(rule, level.demo[0]) === branchFor(rule, level.demo[1]))
            problems.push(`${tag}: a demonstração mostra os dois ramos, uma parada de cada`)
    })
    if (problems.length) throw new Error(`Pit Stop da Chuva — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
