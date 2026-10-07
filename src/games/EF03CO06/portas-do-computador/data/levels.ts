import type { DeviceId, LevelDef } from '../types'
import { DEVICES, INFO } from './devices'

export const POINTS = 10
export const MISSIONS = 6

export const guideKey = (level: number) => `__portasDoComputadorGuide-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'A entrada',
        message: 'A informação ENTRA no computador por um aparelho de entrada.',
        hello: 'Ajude as informações a ENTRAR no computador pela porta certa!',
        bye: 'Tudo entrou! O computador ouviu, viu e leu o mundo lá fora.',
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
]

export const answerOf = (info: LevelDef['missions'][number]['info']): DeviceId => INFO[info].door

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (level.missions.length !== MISSIONS) problems.push(`N${level.level}: precisa de ${MISSIONS} missões`)
        if (level.doors.length !== 2) problems.push(`N${level.level}: começa com 2 portas`)
        const doors = new Set<DeviceId>(level.doors)
        const seen = new Set<string>()
        level.missions.forEach((m, i) => {
            const fail = (msg: string) => problems.push(`${tag(i)}: ${msg}`)
            if (m.debut) {
                if (doors.has(m.debut)) fail(`a porta ${m.debut} já estava`)
                doors.add(m.debut)
            }
            const door = answerOf(m.info)
            if (!doors.has(door)) fail(`a porta ${DEVICES[door].name} ainda não existe`)
            if (doors.size > 3) fail('mais de 3 portas')
            const first = !seen.has(m.info)
            if (first && !m.guided) fail(`primeira ${INFO[m.info].name} sem guia`)
            if (!first && m.guided) fail(`${INFO[m.info].name} guiada de novo`)
            seen.add(m.info)
            if (i >= 2 && m.info === level.missions[i - 1].info && m.info === level.missions[i - 2].info)
                fail('a mesma porta 3 vezes seguidas')
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[portas-do-computador] níveis inválidos', PROBLEMS)
