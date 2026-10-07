import type { LevelDef, SpotId } from '../types'

export const POINTS = 10
export const MAX_SPOTS = 4
export const TEST_ORDER: SpotId[] = ['cup', 'cable', 'edge', 'sun']

export const guideKey = (level: number) => `ef02co06-cantinho-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Água e beirada',
        message: 'Suco longe do tablet e tablet no meio da mesa.',
        spots: ['cup', 'edge'],
        fresh: ['cup', 'edge'],
        phases: [{ risk: ['cup', 'edge'] }, { risk: ['edge'] }, { risk: ['cup'] }],
    },
    {
        level: 2,
        title: 'O fio no caminho',
        message: 'Fio do carregador preso na parede, longe de quem passa.',
        spots: ['cup', 'cable', 'edge'],
        fresh: ['cable'],
        phases: [{ risk: ['cable', 'cup'] }, { risk: ['cable', 'edge'] }, { risk: ['cup', 'edge'] }],
    },
    {
        level: 3,
        title: 'O cantinho seguro',
        message: 'Suco longe, tablet no meio da mesa, fio fora do caminho e nada de sol forte.',
        spots: ['cup', 'cable', 'edge', 'sun'],
        fresh: ['sun'],
        phases: [{ risk: ['sun', 'cup', 'cable'] }, { risk: ['sun', 'edge'] }, { risk: ['cup', 'cable', 'edge'] }],
    },
]

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const known = new Set<SpotId>()
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.spots.length > MAX_SPOTS) problems.push(`${tag}: ${level.spots.length} coisas tocáveis`)
        level.fresh.forEach(id => {
            if (!level.spots.includes(id)) problems.push(`${tag}: ${id} estreia fora do nível`)
            if (known.has(id)) problems.push(`${tag}: ${id} já estreou antes`)
            if (!level.phases[0]?.risk.includes(id)) problems.push(`${tag}: ${id} estreia sem começar perigoso na fase 1`)
        })
        level.spots.forEach(id => {
            if (!known.has(id) && !level.fresh.includes(id)) problems.push(`${tag}: ${id} aparece sem estrear`)
        })
        level.fresh.forEach(id => known.add(id))
        const key = (risk: SpotId[]) => [...risk].sort().join()
        level.phases.forEach((phase, p) => {
            const at = `${tag}/fase ${p + 1}`
            const risky = phase.risk.filter(id => level.spots.includes(id))
            if (risky.length !== phase.risk.length) problems.push(`${at}: coisa fora do nível`)
            if (risky.length < 1) problems.push(`${at}: nenhum perigo`)
            if (p > 0 && level.spots.length - risky.length < 1) problems.push(`${at}: nenhuma coisa começa segura`)
            if (p > 0 && key(phase.risk) === key(level.phases[p - 1].risk)) problems.push(`${at}: igual à fase anterior`)
        })
        level.spots.forEach(id => {
            const risky = level.phases.filter(phase => phase.risk.includes(id)).length
            if (risky === 0) problems.push(`${tag}: ${id} nunca começa perigoso`)
            if (risky === level.phases.length) problems.push(`${tag}: ${id} nunca começa seguro`)
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[cantinho-do-tablet]', PROBLEMS)
