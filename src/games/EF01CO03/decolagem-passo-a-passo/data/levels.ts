import type { CardDef, FailDef, IconRef, LevelDef, MissionDef, StepDef } from '../types'
import { CARD2_CELL, CARD_CELL, CARDS, CARDS2 } from './files'

export const POINTS = 10
export const MAX_LABEL = 18
export const MAX_CARDS = 4

export const CHEER = {
    mine: 'SEU ALGORITMO!',
    other: 'TAMBÉM FUNCIONA!',
} as const

const card = (cell: number): IconRef => ({ sheet: CARDS, cell })
const card2 = (cell: number): IconRef => ({ sheet: CARDS2, cell })

const FUEL: StepDef = { id: 'fuel', label: 'abastecer', icon: card(CARD_CELL.fuel), needs: [] }
const FILL: StepDef = { id: 'fill', label: 'encher o balão', icon: card(CARD_CELL.fill), needs: [] }
const KNOT: StepDef = { id: 'knot', label: 'amarrar a linha', icon: card(CARD_CELL.knot), needs: [] }

const BALLOON_STEPS: StepDef[] = [
    FILL,
    { id: 'basket', label: 'prender a cesta', icon: card(CARD_CELL.basket), needs: ['fill'] },
    { id: 'ropes', label: 'soltar as cordas', icon: card(CARD_CELL.ropes), needs: ['fill', 'basket'] },
]

const BALLOON_FAILS: FailDef[] = [
    { step: 'basket', missing: 'fill', scene: 'flat-cover' },
    { step: 'ropes', missing: 'fill', scene: 'flat-nothing' },
    { step: 'ropes', missing: 'basket', scene: 'fly-alone' },
]

const KITE_STEPS: StepDef[] = [
    KNOT,
    { id: 'run', label: 'correr', icon: card(CARD_CELL.run), needs: ['knot'] },
    { id: 'release', label: 'soltar a pipa', icon: card(CARD_CELL.release), needs: ['knot', 'run'] },
]

const KITE_FAILS: FailDef[] = [
    { step: 'run', missing: 'knot', scene: 'run-alone' },
    { step: 'release', missing: 'knot', scene: 'kite-away' },
    { step: 'release', missing: 'run', scene: 'kite-drop' },
]

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        missions: [
            {
                id: 'rocket-1',
                scene: 'rocket',
                guide: 'ef01co03-l1',
                steps: [
                    FUEL,
                    { id: 'door', label: 'fechar a porta', icon: card(CARD_CELL.door), needs: ['fuel'] },
                    { id: 'button', label: 'apertar o botão', icon: card(CARD_CELL.button), needs: ['fuel', 'door'] },
                ],
                fails: [
                    { step: 'door', missing: 'fuel', scene: 'door-hose' },
                    { step: 'button', missing: 'fuel', scene: 'cough-empty' },
                    { step: 'button', missing: 'door', scene: 'smoke-door' },
                ],
            },
            { id: 'balloon-1', scene: 'balloon', steps: BALLOON_STEPS, fails: BALLOON_FAILS },
            { id: 'kite-1', scene: 'kite', steps: KITE_STEPS, fails: KITE_FAILS },
        ],
    },
    {
        level: 2,
        missions: [
            {
                id: 'rocket-2',
                scene: 'rocket',
                steps: [
                    FUEL,
                    { id: 'door', label: 'fechar a porta', icon: card(CARD_CELL.door), needs: ['fuel'] },
                    { id: 'count', label: 'contagem 3-2-1', icon: card2(CARD2_CELL.count), needs: ['fuel', 'door'] },
                ],
                fails: [
                    { step: 'door', missing: 'fuel', scene: 'door-hose' },
                    { step: 'count', missing: 'fuel', scene: 'cough-empty' },
                    { step: 'count', missing: 'door', scene: 'smoke-door' },
                ],
                extra: { id: 'umbrella', label: 'abrir guarda-chuva', icon: card2(CARD2_CELL.umbrella), scene: 'umbrella' },
            },
            {
                id: 'balloon-2',
                scene: 'balloon',
                steps: BALLOON_STEPS,
                fails: BALLOON_FAILS,
                extra: { id: 'toothbrush', label: 'escovar os dentes', icon: card2(CARD2_CELL.toothbrush), scene: 'toothbrush' },
            },
            {
                id: 'kite-2',
                scene: 'kite',
                steps: KITE_STEPS,
                fails: KITE_FAILS,
                extra: { id: 'icecream', label: 'tomar sorvete', icon: card2(CARD2_CELL.icecream), scene: 'icecream' },
            },
        ],
    },
    {
        level: 3,
        missions: [
            {
                id: 'rocket-3',
                scene: 'rocket',
                steps: [
                    { id: 'helmet', label: 'pôr o capacete', icon: card2(CARD2_CELL.helmet), needs: [] },
                    FUEL,
                    { id: 'door', label: 'fechar a porta', icon: card(CARD_CELL.door), needs: ['fuel', 'helmet'] },
                    { id: 'button', label: 'apertar o botão', icon: card(CARD_CELL.button), needs: ['fuel', 'door'] },
                ],
                fails: [
                    { step: 'door', missing: 'fuel', scene: 'door-hose' },
                    { step: 'door', missing: 'helmet', scene: 'bonk' },
                    { step: 'button', missing: 'fuel', scene: 'cough-empty' },
                    { step: 'button', missing: 'door', scene: 'smoke-door' },
                ],
            },
            {
                id: 'balloon-3',
                scene: 'balloon',
                steps: [
                    { id: 'helmet', label: 'pôr o capacete', icon: card2(CARD2_CELL.helmet), needs: [] },
                    FILL,
                    { id: 'basket', label: 'prender a cesta', icon: card(CARD_CELL.basket), needs: ['fill', 'helmet'] },
                    { id: 'ropes', label: 'soltar as cordas', icon: card(CARD_CELL.ropes), needs: ['fill', 'basket'] },
                ],
                fails: [
                    { step: 'basket', missing: 'fill', scene: 'flat-cover' },
                    { step: 'basket', missing: 'helmet', scene: 'bonk' },
                    { step: 'ropes', missing: 'fill', scene: 'flat-nothing' },
                    { step: 'ropes', missing: 'basket', scene: 'fly-alone' },
                ],
            },
            {
                id: 'kite-3',
                scene: 'kite',
                steps: [
                    { id: 'tail', label: 'pôr a rabiola', icon: card2(CARD2_CELL.tail), needs: [] },
                    KNOT,
                    { id: 'run', label: 'correr', icon: card(CARD_CELL.run), needs: ['knot', 'tail'] },
                    { id: 'release', label: 'soltar a pipa', icon: card(CARD_CELL.release), needs: ['knot', 'run'] },
                ],
                fails: [
                    { step: 'run', missing: 'knot', scene: 'run-alone' },
                    { step: 'run', missing: 'tail', scene: 'kite-spin' },
                    { step: 'release', missing: 'knot', scene: 'kite-away' },
                    { step: 'release', missing: 'run', scene: 'kite-drop' },
                ],
            },
        ],
    },
]

export const canDo = (step: StepDef, done: string[]): boolean => step.needs.every(need => done.includes(need))

export const missingOf = (step: StepDef, done: string[]): string | undefined =>
    step.needs.find(need => !done.includes(need))

export const failOf = (mission: MissionDef, step: StepDef, done: string[]): FailDef | undefined => {
    const missing = missingOf(step, done)
    return mission.fails.find(fail => fail.step === step.id && fail.missing === missing)
}

export const stepOf = (mission: MissionDef, id: string): StepDef | undefined =>
    mission.steps.find(step => step.id === id)

export const available = (mission: MissionDef, done: string[]): StepDef[] =>
    mission.steps.filter(step => !done.includes(step.id) && canDo(step, done))

export const cardsOf = (mission: MissionDef): CardDef[] => [...mission.steps, ...(mission.extra ? [mission.extra] : [])]

export const shuffled = <T>(list: T[], random: () => number = Math.random): T[] => {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

export function validOrders(mission: MissionDef): string[][] {
    const orders: string[][] = []
    const walk = (done: string[]) => {
        if (done.length === mission.steps.length) {
            orders.push(done)
            return
        }
        available(mission, done).forEach(step => walk([...done, step.id]))
    }
    walk([])
    return orders
}

export function pairOf(mission: MissionDef): [number, number] | undefined {
    const [a, b] = validOrders(mission)
    if (!a || !b) return undefined
    const diff = a.flatMap((id, i) => (id === b[i] ? [] : [i]))
    return diff.length === 2 && diff[1] === diff[0] + 1 ? [diff[0], diff[1]] : undefined
}

export function dealOrder(mission: MissionDef, random: () => number = Math.random): CardDef[] {
    const orders = new Set(validOrders(mission).map(order => order.join('|')))
    const stepIds = new Set(mission.steps.map(step => step.id))
    const inOrder = (deck: CardDef[]) =>
        orders.has(
            deck
                .filter(c => stepIds.has(c.id))
                .map(c => c.id)
                .join('|'),
        )
    const cards = cardsOf(mission)
    for (let i = 0; i < 20; i++) {
        const deck = shuffled(cards, random)
        if (!inOrder(deck)) return deck
    }
    return [...cards].reverse()
}

function reachable(mission: MissionDef): Map<string, string> {
    const combos = new Map<string, string>()
    const walk = (done: string[]) => {
        mission.steps
            .filter(step => !done.includes(step.id) && !canDo(step, done))
            .forEach(step => combos.set(`${step.id}<${missingOf(step, done)}`, step.id))
        available(mission, done).forEach(step => walk([...done, step.id]))
    }
    walk([])
    return combos
}

function checkMission(mission: MissionDef, where: string, problems: string[]) {
    const ids = new Set(mission.steps.map(step => step.id))
    if (ids.size !== mission.steps.length) problems.push(`${where}: passo repetido`)

    const cards = cardsOf(mission)
    if (cards.length > MAX_CARDS) problems.push(`${where}: ${cards.length} cartões, o teto é ${MAX_CARDS}`)
    const icons = cards.map(c => `${c.icon.sheet}:${c.icon.cell}`)
    if (new Set(icons).size !== icons.length) problems.push(`${where}: ícone repetido`)
    cards.forEach(c => {
        if (c.label.length > MAX_LABEL) problems.push(`${where}/${c.id}: "${c.label}" longo demais`)
    })
    if (mission.extra && ids.has(mission.extra.id)) problems.push(`${where}: o intruso tem id de passo`)

    mission.steps.forEach(step =>
        step.needs.forEach(need => {
            if (need === step.id) problems.push(`${where}/${step.id}: precisa de si mesmo`)
            else if (!ids.has(need)) problems.push(`${where}/${step.id}: precisa de ${need}, que não existe`)
        }),
    )

    const combos = reachable(mission)
    combos.forEach((_, key) => {
        const [step, missing] = key.split('<')
        if (!mission.fails.some(f => f.step === step && f.missing === missing)) {
            problems.push(`${where}: falta a mini-cena de ${key}`)
        }
    })
    mission.fails.forEach(fail => {
        if (!combos.has(`${fail.step}<${fail.missing}`)) problems.push(`${where}: mini-cena ${fail.scene} nunca acontece`)
    })
}

function checkLevel(level: LevelDef, problems: string[]) {
    const tag = `N${level.level}`
    const rule = {
        1: { steps: 3, orders: 1, extra: false },
        2: { steps: 3, orders: 1, extra: true },
        3: { steps: 4, orders: 2, extra: false },
    }[level.level]
    if (!rule) {
        problems.push(`${tag}: nível sem regra`)
        return
    }

    const guides = level.missions.filter(m => m.guide)
    const guideOk = level.level === 1 ? guides.length === 1 && !!level.missions[0].guide : guides.length === 0
    if (!guideOk) problems.push(`${tag}: guia só na 1ª missão do N1`)

    level.missions.forEach(mission => {
        const where = `${tag}/${mission.id}`
        if (mission.steps.length !== rule.steps) problems.push(`${where}: ${mission.steps.length} passos, esperado ${rule.steps}`)
        if (!!mission.extra !== rule.extra) problems.push(`${where}: intruso ${rule.extra ? 'faltando' : 'sobrando'}`)
        const orders = validOrders(mission).length
        if (orders !== rule.orders) problems.push(`${where}: ${orders} ordens válidas, esperado ${rule.orders}`)
        if (rule.orders === 2 && !pairOf(mission)) problems.push(`${where}: as 2 ordens não diferem por um par vizinho`)
    })
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`nível ${level.level} fora de ordem`)
        if (level.missions.length !== 3) problems.push(`${tag}: ${level.missions.length} missões`)
        if (new Set(level.missions.map(m => m.id)).size !== level.missions.length) problems.push(`${tag}: missão repetida`)
        level.missions.forEach(mission => checkMission(mission, `${tag}/${mission.id}`, problems))
        checkLevel(level, problems)
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[decolagem-passo-a-passo]', PROBLEMS)
