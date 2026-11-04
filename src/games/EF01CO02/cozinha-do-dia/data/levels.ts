import type { LevelDef, ObjectId, OrderDef, StepAction, StepDef } from '../types'
import { DISH_FRAMES } from './files'

export const POINTS = 10
export const guideKey = (level: number) => `ef01co02-cozinha-l${level}`

export const LEAVES_BENCH: ObjectId[] = ['bowl', 'bun', 'lid', 'cup']

export const ACTION_OF: Record<ObjectId, StepAction> = {
    bowl: 'place',
    cereal: 'pour',
    milk: 'pour',
    bun: 'place',
    sausage: 'place',
    ketchup: 'pour',
    banana: 'place',
    lid: 'place',
    button: 'press',
    bread: 'place',
    cheese: 'place',
    cup: 'place',
    scoop: 'place',
    syrup: 'pour',
    cookie: 'place',
    cream: 'pour',
    berry: 'place',
}

const stack = (start: string, bench: ObjectId[], plan: [ObjectId, string][]): StepDef[] =>
    plan.map(([object, frame], i) => {
        const before = i === 0 ? start : plan[i - 1][1]
        const messes: StepDef['messes'] = {}
        bench
            .filter(id => id !== object)
            .forEach(id => {
                messes[id] = { kind: ACTION_OF[id] === 'pour' ? 'puddle' : 'slip', frame: before }
            })
        return { object, action: ACTION_OF[object], frame, messes }
    })

const cereal: OrderDef = {
    animal: 'cat',
    dish: 'cereal',
    start: 'mat',
    goal: 'bowl-full',
    bench: ['milk', 'bowl', 'cereal'],
    steps: [
        {
            object: 'bowl',
            action: 'place',
            frame: 'bowl',
            messes: {
                cereal: { kind: 'scatter', frame: 'mat-cereal' },
                milk: { kind: 'spill', frame: 'mat-milk' },
            },
        },
        {
            object: 'cereal',
            action: 'pour',
            frame: 'bowl-cereal',
            messes: { milk: { kind: 'splash', frame: 'bowl-milk', item: 'cereal' } },
        },
        {
            object: 'milk',
            action: 'pour',
            frame: 'bowl-full',
            messes: { cereal: { kind: 'overflow', frame: 'bowl-heap' } },
        },
    ],
}

const hotdog: OrderDef = {
    animal: 'dog',
    dish: 'hotdog',
    start: 'plate',
    goal: 'hotdog',
    bench: ['sausage', 'ketchup', 'bun'],
    steps: [
        {
            object: 'bun',
            action: 'place',
            frame: 'plate-bun',
            messes: {
                sausage: { kind: 'scatter', frame: 'plate' },
                ketchup: { kind: 'spill', frame: 'plate-ketchup' },
            },
        },
        {
            object: 'sausage',
            action: 'place',
            frame: 'plate-sausage',
            messes: { ketchup: { kind: 'spill', frame: 'bun-ketchup' } },
        },
        {
            object: 'ketchup',
            action: 'pour',
            frame: 'hotdog',
            messes: { sausage: { kind: 'overflow', frame: 'hotdog-double' } },
        },
    ],
}

const smoothie: OrderDef = {
    animal: 'monkey',
    dish: 'smoothie',
    start: 'jar',
    goal: 'glass',
    bench: ['lid', 'banana', 'milk', 'button'],
    steps: [
        {
            object: 'banana',
            action: 'place',
            frame: 'jar-banana',
            messes: {
                milk: { kind: 'splash', frame: 'jar-milk', item: 'banana' },
                lid: { kind: 'bounce', frame: 'jar-lid-empty', item: 'banana' },
                button: { kind: 'rattle', frame: 'jar' },
            },
        },
        {
            object: 'milk',
            action: 'pour',
            frame: 'jar-full',
            messes: {
                banana: { kind: 'overflow', frame: 'jar-banana' },
                lid: { kind: 'bounce', frame: 'jar-lid-banana', item: 'milk' },
                button: { kind: 'burst', frame: 'jar-splat' },
            },
        },
        {
            object: 'lid',
            action: 'place',
            frame: 'jar-lid',
            messes: {
                banana: { kind: 'overflow', frame: 'jar-full' },
                milk: { kind: 'overflow', frame: 'jar-over' },
                button: { kind: 'burst', frame: 'jar-splat' },
            },
        },
        {
            object: 'button',
            action: 'press',
            frame: 'glass',
            messes: {
                banana: { kind: 'bounce', frame: 'jar-lid', item: 'banana' },
                milk: { kind: 'bounce', frame: 'jar-lid', item: 'milk' },
            },
        },
    ],
}

const sandwichBench: ObjectId[] = ['cheese', 'ketchup', 'bread']
const sandwich: OrderDef = {
    animal: 'cat',
    dish: 'sandwich',
    start: 'board',
    goal: 'sand-4',
    bench: sandwichBench,
    steps: stack('board', sandwichBench, [
        ['bread', 'sand-1'],
        ['cheese', 'sand-2'],
        ['ketchup', 'sand-3'],
        ['bread', 'sand-4'],
    ]),
}

const sundaeBench: ObjectId[] = ['syrup', 'cup', 'scoop']
const sundae: OrderDef = {
    animal: 'dog',
    dish: 'sundae',
    start: 'tray',
    goal: 'cup-2s',
    bench: sundaeBench,
    steps: stack('tray', sundaeBench, [
        ['cup', 'cup-0'],
        ['scoop', 'cup-1'],
        ['syrup', 'cup-1s'],
        ['scoop', 'cup-2'],
        ['syrup', 'cup-2s'],
    ]),
}

const paveBench: ObjectId[] = ['berry', 'cookie', 'cream']
const pave: OrderDef = {
    animal: 'monkey',
    dish: 'pave',
    start: 'dish',
    goal: 'pave-3',
    bench: paveBench,
    steps: stack('dish', paveBench, [
        ['cookie', 'pave-1'],
        ['cream', 'pave-1c'],
        ['cookie', 'pave-2'],
        ['cream', 'pave-2c'],
        ['berry', 'pave-3'],
    ]),
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Seguiu a receita!',
        message: 'Você fez cada passo na sua vez, e os animais comeram.',
        lit: true,
        choose: false,
        orders: [cereal, hotdog, smoothie],
    },
    {
        level: 2,
        title: 'Não perdeu o passo!',
        message: 'Sem nada aceso, você acompanhou a receita até o fim.',
        lit: false,
        choose: false,
        orders: [sandwich, sundae, pave],
    },
    {
        level: 3,
        title: 'Achou a receita certa!',
        message: 'Você descobriu qual receita fazia o prato, e seguiu cada passo.',
        lit: true,
        choose: true,
        orders: [
            { ...cereal, decoy: ['cereal', 'bowl', 'milk'], decoyFirst: true },
            { ...hotdog, decoy: ['bun', 'ketchup', 'sausage'], decoyFirst: false },
            { ...smoothie, decoy: ['banana', 'milk', 'button', 'lid'], decoyFirst: true },
        ],
    },
]

export function benchAt(order: OrderDef, stepIndex: number): ObjectId[] {
    const gone = order.steps
        .slice(0, stepIndex)
        .map(step => step.object)
        .filter(id => LEAVES_BENCH.includes(id))
    return order.bench.filter(id => !gone.includes(id))
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        if (level.orders.length !== 3) problems.push(`N${level.level}: precisa de 3 pedidos`)
        if (level.level === 3 && !level.choose) problems.push('N3: precisa de duas receitas')
        if (new Set(level.orders.map(order => order.animal)).size !== level.orders.length) problems.push(`N${level.level}: animal repetido`)
        level.orders.forEach(order => {
            const name = `N${level.level}/${order.dish}`
            const frames = DISH_FRAMES[order.dish]
            const known = (frame: string) => frames[frame] !== undefined
            if (!known(order.start)) problems.push(`${name}: início ${order.start} não existe`)
            if (!known(order.goal)) problems.push(`${name}: meta ${order.goal} não existe`)
            if (order.steps[order.steps.length - 1].frame !== order.goal) problems.push(`${name}: o último passo não chega à meta`)
            if (order.bench.length > 4) problems.push(`${name}: mais de 4 alvos`)
            const plan = order.steps.map(step => step.object)
            const firstSeen = plan.filter((id, i) => plan.indexOf(id) === i && id !== 'button')
            const slots = order.bench.filter(id => id !== 'button')
            if (firstSeen.join() === slots.join()) problems.push(`${name}: a bancada entrega a ordem da receita`)
            if (!level.lit && new Set(plan).size === plan.length) problems.push(`${name}: sem cartão aceso, algum objeto precisa voltar`)
            if (level.choose) {
                const decoy = order.decoy ?? []
                if (decoy.length !== plan.length) problems.push(`${name}: a receita errada tem de ter o mesmo tamanho`)
                if ([...decoy].sort().join() !== [...plan].sort().join()) problems.push(`${name}: a receita errada tem de usar os mesmos objetos`)
                const at = decoy.findIndex((id, i) => id !== plan[i])
                if (at < 0) problems.push(`${name}: a receita errada é igual à certa`)
                else if (!order.steps[at].messes[decoy[at]]) problems.push(`${name}: a receita errada não tem estrago no passo ${at + 1}`)
            }
            order.steps.forEach((step, i) => {
                if (!order.bench.includes(step.object)) problems.push(`${name}: ${step.object} fora da bancada`)
                if (ACTION_OF[step.object] !== step.action) problems.push(`${name}: ação errada em ${step.object}`)
                if (!known(step.frame)) problems.push(`${name}: quadro ${step.frame} não existe`)
                const onBench = benchAt(order, i)
                if (!onBench.includes(step.object)) problems.push(`${name}: ${step.object} já saiu da bancada`)
                onBench
                    .filter(id => id !== step.object)
                    .forEach(id => {
                        const mess = step.messes[id]
                        if (!mess) problems.push(`${name}, passo ${i + 1}: falta o estrago de ${id}`)
                        else if (!known(mess.frame)) problems.push(`${name}, passo ${i + 1}: quadro ${mess.frame} não existe`)
                    })
            })
        })
        if (level.choose && new Set(level.orders.map(order => order.decoyFirst)).size < 2) problems.push(`N${level.level}: a receita certa não pode estar sempre no mesmo lugar`)
    })
    if (problems.length) console.error('[cozinha-do-dia]', problems)
    return problems
}

if (import.meta.env.DEV) validateLevels()
