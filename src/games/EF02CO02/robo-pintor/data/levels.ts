import type { FenceDef, LevelDef, Outcome } from '../types'

export const POINTS = 10
export const GUIDE_KEY = 'ef02co02-l1'
export const MAX_FENCES = 5
export const MAX_OVER = 2

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        steps: 1,
        debug: false,
        fences: [
            { id: 'f1', boards: 3, cards: [2, 3, 4], paint: 'blue' },
            { id: 'f2', boards: 5, cards: [3, 4, 5], paint: 'pink' },
            { id: 'f3', boards: 4, cards: [4, 5, 6], paint: 'teal' },
        ],
    },
]

export const TRAINING: FenceDef = { id: 'training', boards: 2, cards: [1, 2, 3], paint: 'yellow' }

export const outcome = (boards: number, n: number): Outcome => (n === boards ? 'exact' : n > boards ? 'over' : 'under')

export const rightCard = (fence: FenceDef): number => fence.cards.indexOf(fence.boards)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.fences.length < 1 || level.fences.length > MAX_FENCES) problems.push(`${tag}: ${level.fences.length} cercas`)
        if (level.level === 1 && (level.steps !== 1 || level.debug)) problems.push(`${tag}: o N1 é um laço só, sem depurar`)

        let previousSlot = -1
        const paints = new Set<string>()
        level.fences.forEach(fence => {
            const where = `${tag}/${fence.id}`
            const [a, b, c] = fence.cards
            if (level.level === 1 && (fence.boards < 3 || fence.boards > 5)) problems.push(`${where}: ${fence.boards} tábuas`)
            if (!(a < b && b < c)) problems.push(`${where}: cartões fora de ordem crescente`)
            if (fence.cards.some(n => n < 1 || n > 6)) problems.push(`${where}: cartão fora de 1–6`)
            const slot = rightCard(fence)
            if (slot < 0 || fence.cards.filter(n => n === fence.boards).length !== 1) problems.push(`${where}: precisa de exatamente 1 cartão certo`)
            if (!fence.cards.some(n => Math.abs(n - fence.boards) === 1)) problems.push(`${where}: sem vizinho de ±1`)
            if (fence.cards.some(n => n > fence.boards + MAX_OVER)) problems.push(`${where}: cartão passa de +${MAX_OVER}`)
            if (slot === previousSlot) problems.push(`${where}: o certo repetiu o lugar`)
            if (paints.has(fence.paint)) problems.push(`${where}: tinta repetida`)
            paints.add(fence.paint)
            previousSlot = slot
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[robo-pintor]', PROBLEMS)
