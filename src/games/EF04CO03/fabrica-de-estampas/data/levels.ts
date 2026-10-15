import type { Fig, LevelDef, Loop, Order, Question, Step } from '../types'

export const POINTS = { stamp: 10, answer: 20 } as const
export const ORDERS = 3
export const MAX_SQUARES = 9

/** quantos níveis já estão prontos para jogar (o N2 e o N3 estão planejados abaixo) */
export const READY = 3

export const guideKey = (level: number) => `__estampasGuide-l${level}`

const ALL_LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Quantas vezes?',
        message: 'O número do pedido diz quantas vezes a estampa sai.',
        demo: { loop: { times: 2, body: ['flower'] }, question: { kind: 'count', fig: 'flower', options: [1, 2, 3] } },
        orders: [
            { loop: { times: 4, body: ['flower'] }, question: { kind: 'count', fig: 'flower', options: [1, 4, 5] } },
            { loop: { times: 3, body: ['star'] }, question: { kind: 'count', fig: 'star', options: [1, 2, 3] } },
            { loop: { times: 5, body: ['heart'] }, question: { kind: 'count', fig: 'heart', options: [1, 5, 6] } },
        ],
    },
    {
        level: 2,
        title: 'O bloco repete',
        message: 'O laço repete o bloco inteiro, sempre na mesma ordem.',
        orders: [
            {
                loop: { times: 2, body: ['flower', 'flower', 'star'] },
                question: { kind: 'count', fig: 'star', options: [1, 2, 6] },
            },
            { loop: { times: 3, body: ['flower', 'star'] }, question: { kind: 'count', fig: 'star', options: [1, 3, 6] } },
            {
                loop: { times: 3, body: ['star', 'heart', 'heart'] },
                question: { kind: 'count', fig: 'heart', options: [2, 3, 6] },
            },
        ],
    },
    {
        level: 3,
        title: 'Laço dentro de laço',
        message: 'O laço de dentro roda inteiro a cada volta do de fora.',
        orders: [
            {
                loop: { times: 2, body: [{ times: 2, body: ['flower'] }, 'star'] },
                question: { kind: 'count', fig: 'flower', options: [2, 4, 6] },
            },
            {
                loop: { times: 3, body: ['star', { times: 2, body: ['heart'] }] },
                question: { kind: 'compare', a: 'star', b: 'heart' },
            },
            {
                loop: { times: 2, body: [{ times: 2, body: ['flower'] }, { times: 2, body: ['star'] }] },
                question: { kind: 'compare', a: 'flower', b: 'star' },
            },
        ],
    },
]

export const LEVELS: LevelDef[] = ALL_LEVELS.slice(0, READY)

export const isLoop = (node: Fig | Loop): node is Loop => typeof node !== 'string'

export const childPath = (parent: string, index: number) => (parent === '' ? `${index}` : `${parent}.${index}`)

/** o pedido executado, posição por posição */
export function trace(root: Loop): Step[] {
    const steps: Step[] = []
    const walk = (loop: Loop, path: string) => {
        for (let turn = 0; turn < loop.times; turn++) {
            loop.body.forEach((node, i) => {
                const at = childPath(path, i)
                if (isLoop(node)) walk(node, at)
                else steps.push({ fig: node, at, closes: [], why: 'next' })
            })
            steps[steps.length - 1].closes.push(path)
        }
    }
    walk(root, '')
    steps.forEach((step, i) => {
        const prev = steps[i - 1]
        if (!prev) step.why = 'first'
        else if (prev.closes.includes('')) step.why = 'newTurn'
        else if (prev.closes.some(p => step.at.startsWith(`${p}.`))) step.why = 'innerAgain'
        else if (prev.closes.length) step.why = 'afterInner'
    })
    return steps
}

/** todos os laços do pedido, pelo caminho ("" é o de fora) */
export function loopsOf(root: Loop): Map<string, Loop> {
    const loops = new Map<string, Loop>()
    const walk = (loop: Loop, path: string) => {
        loops.set(path, loop)
        loop.body.forEach((node, i) => isLoop(node) && walk(node, childPath(path, i)))
    }
    walk(root, '')
    return loops
}

export const countOf = (steps: Step[], fig: Fig) => steps.filter(s => s.fig === fig).length

export const depthOf = (loop: Loop): number => 1 + Math.max(0, ...loop.body.filter(isLoop).map(depthOf))

/** a etiqueta certa: 0–2 (na comparativa: mais A, mais B, igual) */
export function answerOf(question: Question, steps: Step[]): number {
    if (question.kind === 'count') return question.options.indexOf(countOf(steps, question.fig))
    const a = countOf(steps, question.a)
    const b = countOf(steps, question.b)
    return a > b ? 0 : b > a ? 1 : 2
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const checkOrder = (order: Order, tag: string, level: number, min: number) => {
        const steps = trace(order.loop)
        const loops = [...loopsOf(order.loop).entries()]
        const figs = new Set(steps.map(s => s.fig))
        if (steps.length < min || steps.length > MAX_SQUARES) problems.push(`${tag}: tecido de ${steps.length} quadradinhos`)
        if (depthOf(order.loop) > 2) problems.push(`${tag}: mais de 2 molduras de profundidade`)
        loops.forEach(([path, loop]) => {
            const [lo, hi] = path === '' ? [2, 5] : [2, 3]
            if (loop.times < lo || loop.times > hi) problems.push(`${tag}: laço "${path}" com ${loop.times} voltas`)
        })
        const body = order.loop.body
        if (level === 1 && (body.length !== 1 || isLoop(body[0]))) problems.push(`${tag}: no N1 o bloco é 1 figura`)
        if (level === 2) {
            const plain = body.filter(n => !isLoop(n))
            if (plain.length !== body.length || body.length < 2 || body.length > 3)
                problems.push(`${tag}: no N2 o bloco tem 2–3 figuras, sem laço dentro`)
            if (new Set(plain).size < 2) problems.push(`${tag}: no N2 o bloco mistura figuras`)
        }
        if (level === 3 && !body.some(isLoop)) problems.push(`${tag}: no N3 tem laço dentro`)

        const q = order.question
        if (q.kind === 'count') {
            const [x, y, z] = q.options
            if (!figs.has(q.fig)) problems.push(`${tag}: a figura perguntada não está no pedido`)
            if (!(x < y && y < z)) problems.push(`${tag}: opções em ordem crescente e diferentes`)
            if (answerOf(q, steps) < 0) problems.push(`${tag}: a resposta certa não está nas opções`)
            const oneTurn = countOf(trace({ times: 1, body }), q.fig)
            if (level > 1 && oneTurn !== countOf(steps, q.fig) && !q.options.includes(oneTurn))
                problems.push(`${tag}: falta a isca de uma volta só (${oneTurn})`)
        } else if (q.a === q.b || !figs.has(q.a) || !figs.has(q.b)) problems.push(`${tag}: comparação inválida`)
        return answerOf(q, steps)
    }

    levels.forEach(level => {
        const tag = (i: number) => `N${level.level}-${i + 1}`
        if (level.orders.length !== ORDERS) problems.push(`N${level.level}: precisa de ${ORDERS} pedidos`)
        if (level.demo) checkOrder(level.demo, `N${level.level}-treino`, level.level, 2)
        const answers = level.orders.map((order, i) => checkOrder(order, tag(i), level.level, 3))
        if (new Set(answers).size === 1) problems.push(`N${level.level}: a etiqueta certa no mesmo lugar nos 3 pedidos`)
        if (level.level === 1) {
            const firsts = new Set(level.orders.map(o => o.loop.body[0]))
            if (firsts.size !== level.orders.length) problems.push('N1: cada pedido com uma figura diferente')
        }
        if (level.level === 3) {
            const compares = level.orders.filter(o => o.question.kind === 'compare')
            const kinds = new Set(compares.map(o => (answerOf(o.question, trace(o.loop)) === 2 ? 'same' : 'more')))
            if (kinds.size < 2) problems.push('N3: as comparativas precisam de um MAIS e de um IGUAL')
        }
    })
    return problems
}

const PROBLEMS = validateLevels(ALL_LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[fabrica-de-estampas] níveis inválidos', PROBLEMS)
