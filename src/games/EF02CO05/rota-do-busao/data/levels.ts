import type { LevelDef, StopDef } from '../types'
import { RIDERS } from './riders'
import { SITUATIONS, SOLVES } from './situations'

export const guideKey = (level: number) => `__rotaDoBusaoGuide-l${level}`
export const POINTS = 10
export const STOPS = 6
export const TEXT_MAX = 24
export const NAME_MAX = 15

export const TRAINING: StopDef = { situation: 'photo', riders: ['camera', 'fridge'] }

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Quem resolve?',
        message: 'Cada tecnologia da casa ajudou com um problema.',
        ridersPerStop: 2,
        scenery: ['houseA', 'tree', 'houseB', 'lamp', 'houseC', 'tree', 'houseA', 'lamp'],
        stops: [
            { situation: 'time', riders: ['clock', 'fridge'] },
            { situation: 'music', riders: ['microwave', 'speaker'] },
            { situation: 'grandma', riders: ['clock', 'phone'] },
            { situation: 'cartoon', riders: ['tv', 'speaker'] },
            { situation: 'soup', riders: ['tv', 'microwave'] },
            { situation: 'iceCream', riders: ['fridge', 'phone'] },
        ],
    },
    {
        level: 2,
        title: 'Em casa e na escola',
        message: 'Na escola também tem tecnologia: o computador faz a chamada e o projetor mostra a história.',
        ridersPerStop: 3,
        scenery: ['school', 'tree', 'houseA', 'lamp', 'school', 'houseC', 'tree', 'houseB'],
        stops: [
            { situation: 'rollCall', riders: ['tv', 'computer', 'speaker'] },
            { situation: 'soup', riders: ['microwave', 'fridge', 'tv'] },
            { situation: 'story', riders: ['tv', 'camera', 'projector'] },
            { situation: 'iceCream', riders: ['speaker', 'fridge', 'microwave'] },
            { situation: 'photo', riders: ['projector', 'clock', 'camera'] },
            { situation: 'time', riders: ['clock', 'speaker', 'fridge'] },
        ],
    },
    {
        level: 3,
        title: 'A rota completa',
        message: 'Tem tecnologia em todo lugar, mas nem tudo precisa dela: o lápis e o regador ajudam sem tomada.',
        ridersPerStop: 3,
        scenery: ['houseA', 'school', 'tree', 'square', 'lamp', 'market', 'tree', 'square', 'market'],
        stops: [
            { situation: 'music', riders: ['pencil', 'speaker', 'fridge'] },
            { situation: 'notebook', riders: ['computer', 'projector', 'pencil'] },
            { situation: 'cross', riders: ['camera', 'wateringCan', 'trafficLight'] },
            { situation: 'garden', riders: ['wateringCan', 'phone', 'trafficLight'] },
            { situation: 'fare', riders: ['cardMachine', 'pencil', 'clock'] },
            { situation: 'fruit', riders: ['wateringCan', 'scale', 'cardMachine'] },
        ],
    },
]

const ownerSide = (stop: StopDef) => stop.riders.indexOf(SITUATIONS[stop.situation].owner)

function checkStop(stop: StopDef, where: string, problems: string[]) {
    const solvers = stop.riders.filter(id => SOLVES[stop.situation].includes(id))
    if (solvers.length !== 1) problems.push(`${where}: ${solvers.length} passageiros resolvem ${stop.situation}`)
    if (ownerSide(stop) < 0) problems.push(`${where}: o dono de ${stop.situation} não está no banco`)
    if (new Set(stop.riders).size !== stop.riders.length) problems.push(`${where}: passageiro repetido`)
    if (SITUATIONS[stop.situation].text.length > TEXT_MAX) problems.push(`${where}: a frase não cabe no letreiro`)
    stop.riders.forEach(id => {
        if (RIDERS[id].name.length > NAME_MAX) problems.push(`${where}: o nome de ${id} não cabe`)
    })
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.stops.length !== STOPS) problems.push(`${tag}: ${level.stops.length} paradas`)
        const seen = level.stops.map(stop => stop.situation)
        if (new Set(seen).size !== seen.length) problems.push(`${tag}: situação repetida`)

        level.stops.forEach((stop, i) => {
            const where = `${tag}/parada ${i + 1}`
            if (stop.riders.length !== level.ridersPerStop) problems.push(`${where}: ${stop.riders.length} passageiros`)
            checkStop(stop, where, problems)
            const place = SITUATIONS[stop.situation].place
            if (level.level === 1) {
                if (stop.situation === TRAINING.situation) problems.push(`${where}: ${stop.situation} é do treino`)
                if (place !== 'home') problems.push(`${where}: o N1 é só de casa`)
                stop.riders.forEach(id => {
                    if (RIDERS[id].place !== 'home' || !RIDERS[id].tech) problems.push(`${where}: ${id} não é de casa`)
                })
            }
            if (level.level === 2 && place === 'town') problems.push(`${where}: o N2 é casa e escola`)
            if (level.level < 3 && stop.riders.some(id => !RIDERS[id].tech)) problems.push(`${where}: sem tecnologia só no N3`)
        })

        const sides = level.stops.map(ownerSide)
        if (level.ridersPerStop === 2) {
            const left = sides.filter(side => side === 0).length
            if (left !== level.stops.length / 2) problems.push(`${tag}: o certo fica à esquerda em ${left} paradas`)
        } else {
            ;[0, 1, 2].forEach(side => {
                if (!sides.includes(side)) problems.push(`${tag}: o certo nunca fica na posição ${side + 1}`)
            })
        }
        for (let i = 2; i < sides.length; i++) {
            if (sides[i] === sides[i - 1] && sides[i] === sides[i - 2]) problems.push(`${tag}: 3 seguidas no mesmo lugar`)
        }

        if (level.level === 2) {
            const school = level.stops.filter(stop => SITUATIONS[stop.situation].place === 'school').length
            if (school !== 3) problems.push(`${tag}: ${school} paradas de escola (são 3)`)
        }

        const noTech = level.stops.filter(stop => !RIDERS[SITUATIONS[stop.situation].owner].tech).length
        if (level.level === 3) {
            if (noTech !== 2) problems.push(`${tag}: ${noTech} paradas sem tecnologia (são 2)`)
            const wrongNoTech = level.stops.some(stop =>
                stop.riders.some(id => !RIDERS[id].tech && id !== SITUATIONS[stop.situation].owner),
            )
            if (!wrongNoTech) problems.push(`${tag}: o lápis ou o regador tem de aparecer como errado`)
            const places = new Set(level.stops.map(stop => SITUATIONS[stop.situation].place))
            if (places.size < 3) problems.push(`${tag}: a rota completa passa por casa, escola e cidade`)
        }
    })

    checkStop(TRAINING, 'treino', problems)
    if (levels[0]?.stops.some(stop => stop.riders.includes(SITUATIONS[TRAINING.situation].owner))) {
        problems.push('treino: o dono do treino aparece no N1')
    }
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[rota-do-busao]', PROBLEMS)
