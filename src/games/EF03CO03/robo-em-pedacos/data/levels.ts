import type { LevelDef, ModuleDef, ModuleId, PointType } from '../types'

export const POINTS_SCORE = 10
export const MAX_MODULES = 4
export const MAX_POINTS = 4
export const PALLET_SLOTS = 4

export const guideKey = (level: number) => `ef03co03-robo-l${level}`

export const POINTS_OF: Record<ModuleId, PointType[]> = {
    head: ['antenna', 'eye', 'bulb', 'screw'],
    body: ['screw', 'wire', 'button', 'spring'],
    arms: ['screw', 'gear', 'wire', 'spring'],
    legs: ['spring', 'gear', 'screw', 'wire'],
    shoes: ['wire', 'bulb', 'screw', 'gear'],
}

const mod = (id: ModuleId, count: number, loose: number[]): ModuleDef => ({
    id,
    points: POINTS_OF[id].slice(0, count).map((type, k) => ({ type, loose: loose.includes(k) })),
})

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Por partes',
        message: 'Dividiu o robô, consertou cada parte e juntou de baixo para cima.',
        needs: { body: ['legs'], head: ['body'] },
        phases: [
            {
                modules: [mod('legs', 3, [0, 2]), mod('body', 3, [0, 1]), mod('head', 3, [0, 2])],
                pallets: { head: 0, legs: 1, body: 2 },
            },
            {
                modules: [mod('legs', 3, [1, 2]), mod('body', 3, [1, 2]), mod('head', 3, [0, 1])],
                pallets: { body: 0, head: 1, legs: 3 },
            },
            {
                modules: [mod('legs', 3, [0, 1]), mod('body', 3, [0, 2]), mod('head', 3, [1, 2])],
                pallets: { legs: 1, head: 2, body: 3 },
            },
        ],
    },
]

export function buildOrder(needs: LevelDef['needs'], ids: ModuleId[]): ModuleId[] | null {
    const done: ModuleId[] = []
    const left = [...ids]
    while (left.length) {
        const next = left.find(id => (needs[id] ?? []).every(n => done.includes(n)))
        if (!next) return null
        done.push(next)
        left.splice(left.indexOf(next), 1)
    }
    return done
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        level.phases.forEach((phase, p) => {
            const at = `${tag}/fase ${p + 1}`
            const ids = phase.modules.map(m => m.id)
            if (ids.length > MAX_MODULES) problems.push(`${at}: ${ids.length} módulos`)
            const order = buildOrder(level.needs, ids)
            if (!order) problems.push(`${at}: a ordem de montagem tem ciclo ou peça sem base`)
            Object.keys(level.needs).forEach(id => {
                if (!ids.includes(id as ModuleId)) problems.push(`${at}: dependência de ${id}, que não está na fase`)
            })
            phase.modules.forEach(m => {
                if (m.points.length > MAX_POINTS) problems.push(`${at}/${m.id}: ${m.points.length} pontos`)
                if (!m.points.some(pt => pt.loose)) problems.push(`${at}/${m.id}: nenhum ponto solto`)
                if (!m.points.some(pt => !pt.loose)) problems.push(`${at}/${m.id}: nenhum ponto firme`)
                const prev = level.phases[p - 1]?.modules.find(o => o.id === m.id)
                const sig = (x: ModuleDef) => x.points.map(pt => (pt.loose ? 1 : 0)).join('')
                if (prev && sig(prev) === sig(m)) problems.push(`${at}/${m.id}: mesmos soltos da fase anterior`)
            })
            const slots = ids.map(id => phase.pallets[id])
            if (slots.some(s => s === undefined || s < 0 || s >= PALLET_SLOTS)) problems.push(`${at}: estrado faltando`)
            if (new Set(slots).size !== slots.length) problems.push(`${at}: dois módulos no mesmo estrado`)
            const reading = [...ids].sort((a, b) => (phase.pallets[a] ?? 0) - (phase.pallets[b] ?? 0))
            if (order && reading.join() === order.join()) problems.push(`${at}: estrados na ordem de montagem`)
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[robo-em-pedacos]', PROBLEMS)
