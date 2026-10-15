import type { DeviceId, LevelDef, Mission } from '../types'
import { DEVICES, INFO, WISH } from './devices'

export const POINTS = 10

export const guideKey = (level: number) => `__portasDoComputadorGuide-l${level}`

const ALL: DeviceId[] = ['mic', 'camera', 'keyboard', 'speaker', 'screen', 'printer']

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        kind: 'in',
        title: 'A entrada',
        message: 'A informação ENTRA no computador por um aparelho de entrada.',
        goal: 'Leve as informações para dentro do computador!',
        doors: ['mic', 'camera'],
        missions: [
            { info: 'note', guided: true },
            { info: 'photo', guided: true },
            { info: 'note' },
            { info: 'letter', guided: true, debut: 'keyboard' },
            { info: 'photo' },
            { info: 'letter' },
        ],
    },
    {
        level: 2,
        kind: 'out',
        title: 'A saída',
        message: 'A informação SAI do computador por um aparelho de saída.',
        goal: 'Agora leve as informações até quem pediu!',
        doors: ['speaker', 'screen'],
        dim: ['mic', 'camera', 'keyboard'],
        missions: [
            { info: 'note', person: 'grandma', wish: 'hear', guided: true },
            { info: 'photo', person: 'theo', wish: 'see', guided: true },
            { info: 'note', person: 'teacher', wish: 'hear' },
            { info: 'photo', person: 'grandma', wish: 'paper', guided: true, debut: 'printer' },
            { info: 'letter', person: 'teacher', wish: 'see' },
            { info: 'letter', person: 'theo', wish: 'paper' },
        ],
    },
    {
        level: 3,
        kind: 'both',
        title: 'O caminho todo',
        message: 'A informação ENTRA por um aparelho e SAI por outro.',
        goal: 'Agora a informação ENTRA e SAI!',
        doors: ALL,
        missions: [
            { info: 'note', person: 'theo', wish: 'hear' },
            { info: 'photo', person: 'teacher', wish: 'paper' },
            { info: 'letter', person: 'grandma', wish: 'see' },
            { info: 'photo', person: 'theo', wish: 'see' },
        ],
    },
]

export const MISSIONS: Record<LevelDef['kind'], number> = { in: 6, out: 6, both: 4 }

export const answerIn = (m: Mission): DeviceId => INFO[m.info].door
export const answerOut = (m: Mission): DeviceId => (m.wish ? WISH[m.wish].door : 'screen')

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        const goesIn = level.kind !== 'out'
        const goesOut = level.kind !== 'in'
        if (level.missions.length !== MISSIONS[level.kind]) problems.push(`N${level.level}: precisa de ${MISSIONS[level.kind]} missões`)
        if (level.kind !== 'both' && level.doors.length !== 2) problems.push(`N${level.level}: começa com 2 aparelhos`)
        const doors = new Set<DeviceId>(level.doors)
        const seen = new Set<string>()
        const pairs = new Set<string>()
        level.missions.forEach((m, i) => {
            const fail = (msg: string) => problems.push(`${tag(i)}: ${msg}`)
            if (m.debut) {
                if (doors.has(m.debut)) fail(`o aparelho ${m.debut} já estava`)
                doors.add(m.debut)
            }
            if (goesIn && !doors.has(answerIn(m))) fail(`o aparelho ${DEVICES[answerIn(m)].name} ainda não existe`)
            if (goesOut) {
                if (!m.person || !m.wish) fail('falta a pessoa ou o pedido')
                else if (!doors.has(answerOut(m))) fail(`o aparelho ${DEVICES[answerOut(m)].name} ainda não existe`)
            }
            if (level.kind !== 'both') {
                const sideCount = [...doors].filter(d => DEVICES[d].side === (goesIn ? 'input' : 'output')).length
                if (sideCount > 3) fail('mais de 3 aparelhos')
                const key = goesIn ? m.info : (m.wish ?? '')
                const first = !seen.has(key)
                if (first && !m.guided) fail(`primeira vez de ${key} sem guia`)
                if (!first && m.guided) fail(`${key} guiado de novo`)
                seen.add(key)
            } else if (m.guided) fail('o N3 não tem guia')
            const answer = (x: Mission) => (goesIn ? answerIn(x) : '') + (goesOut ? answerOut(x) : '')
            if (i >= 2 && answer(m) === answer(level.missions[i - 1]) && answer(m) === answer(level.missions[i - 2]))
                fail('a mesma resposta 3 vezes seguidas')
            pairs.add(answer(m))
        })
        if (level.kind === 'both' && pairs.size !== level.missions.length) problems.push(`N${level.level}: pares repetidos`)
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[portas-do-computador] níveis inválidos', PROBLEMS)
