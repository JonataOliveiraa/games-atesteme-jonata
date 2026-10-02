import type { FenceDef, LevelDef } from '../types'

export const POINTS = 10
export const MAX_FENCES = 5
export const MAX_OVER = 2

export const guideKey = (level: number) => `ef02co02-l${level}`

const one = (id: string, count: number, paint: FenceDef['segments'][number]['paint'], cards: [number, number, number]): FenceDef => ({
    id,
    segments: [{ count, paint }],
    cards,
})

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        fences: [one('f1', 3, 'blue', [2, 3, 4]), one('f2', 5, 'pink', [3, 4, 5]), one('f3', 4, 'teal', [4, 5, 6])],
    },
    {
        level: 2,
        fences: [
            { id: 'n2-f1', segments: [{ count: 1, paint: 'blue' }, { count: 3, paint: 'yellow' }], cards: [1, 2, 3] },
            { id: 'n2-f2', segments: [{ count: 3, paint: 'pink' }, { count: 1, paint: 'teal' }], cards: [1, 2, 3] },
            { id: 'n2-f3', segments: [{ count: 2, paint: 'yellow' }, { count: 2, paint: 'blue' }], cards: [1, 2, 3] },
        ],
    },
    {
        level: 3,
        fences: [
            { id: 'n3-f1', segments: [{ count: 2, paint: 'teal' }, { count: 2, paint: 'pink' }], cards: [1, 2, 3], preset: [3, 2] },
            { id: 'n3-f2', segments: [{ count: 3, paint: 'blue' }, { count: 1, paint: 'yellow' }], cards: [1, 2, 3], preset: [3, 3] },
            { id: 'n3-f3', segments: [{ count: 1, paint: 'pink' }, { count: 3, paint: 'teal' }], cards: [2, 3, 4], preset: [1, 2] },
        ],
    },
]

export const TRAINING: Record<number, FenceDef> = {
    1: one('training', 2, 'yellow', [1, 2, 3]),
    2: { id: 'training-2', segments: [{ count: 1, paint: 'yellow' }, { count: 2, paint: 'blue' }], cards: [1, 2, 3] },
    3: { id: 'training-3', segments: [{ count: 1, paint: 'yellow' }, { count: 2, paint: 'blue' }], cards: [1, 2, 3], preset: [2, 2] },
}

export const boardsOf = (fence: FenceDef): number => fence.segments.reduce((sum, s) => sum + s.count, 0)

export const isExact = (fence: FenceDef, values: number[]): boolean => fence.segments.every((s, r) => values[r] === s.count)

export const wrongRow = (fence: FenceDef): number => (fence.preset ? fence.segments.findIndex((s, r) => fence.preset?.[r] !== s.count) : -1)

export const paintAt = (fence: FenceDef, values: number[]): FenceDef['segments'][number]['paint'][] =>
    fence.segments.flatMap((s, r) => Array.from({ length: values[r] ?? 0 }, () => s.paint))

export const planned = (fence: FenceDef): FenceDef['segments'][number]['paint'][] => fence.segments.flatMap(s => Array.from({ length: s.count }, () => s.paint))

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.fences.length < 1 || level.fences.length > MAX_FENCES) problems.push(`${tag}: ${level.fences.length} cercas`)
        const loops = level.level === 1 ? 1 : 2

        let previousSlot = -1
        level.fences.forEach(fence => {
            const where = `${tag}/${fence.id}`
            const boards = boardsOf(fence)
            const [a, b, c] = fence.cards
            if (fence.segments.length !== loops) problems.push(`${where}: ${fence.segments.length} laços (o ${tag} pede ${loops})`)
            if (boards < 3 || boards > 5) problems.push(`${where}: ${boards} tábuas`)
            if (!(a < b && b < c)) problems.push(`${where}: cartões fora de ordem crescente`)
            if (fence.cards.some(n => n < 1 || n > 6)) problems.push(`${where}: cartão fora de 1–6`)
            if (new Set(fence.segments.map(s => s.paint)).size !== fence.segments.length) problems.push(`${where}: tinta repetida na cerca`)

            const needed = level.level === 3 ? [fence.segments[wrongRow(fence)]?.count ?? -1] : fence.segments.map(s => s.count)
            needed.forEach(n => {
                if (!fence.cards.includes(n)) problems.push(`${where}: falta o cartão ${n}`)
                if (!fence.cards.some(k => Math.abs(k - n) === 1)) problems.push(`${where}: sem vizinho de ±1 para ${n}`)
            })

            if (level.level === 1) {
                const slot = fence.cards.indexOf(boards)
                if (slot === previousSlot) problems.push(`${where}: o certo repetiu o lugar`)
                if (fence.cards.some(n => n > boards + MAX_OVER)) problems.push(`${where}: cartão passa de +${MAX_OVER}`)
                previousSlot = slot
            }
            if (level.level === 2) {
                if (Math.max(...fence.cards) * 2 > boards + MAX_OVER) problems.push(`${where}: dois cartões grandes passam de +${MAX_OVER}`)
                if (fence.preset) problems.push(`${where}: o N2 não tem programa pronto`)
            }
            if (level.level === 3) {
                const preset = fence.preset ?? []
                if (preset.length !== fence.segments.length) problems.push(`${where}: programa pronto incompleto`)
                const wrong = fence.segments.filter((s, r) => preset[r] !== s.count).length
                if (wrong !== 1) problems.push(`${where}: o programa pronto precisa de exatamente 1 número errado (tem ${wrong})`)
                if (preset.reduce((sum, n) => sum + n, 0) > boards + MAX_OVER) problems.push(`${where}: o programa pronto passa de +${MAX_OVER}`)
                fence.segments.forEach((_, r) => {
                    const others = preset.reduce((sum, n, k) => (k === r ? sum : sum + n), 0)
                    if (others + Math.max(...fence.cards) > boards + MAX_OVER) problems.push(`${where}: trocar o laço ${r + 1} pode passar de +${MAX_OVER}`)
                })
            }
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[robo-pintor]', PROBLEMS)
