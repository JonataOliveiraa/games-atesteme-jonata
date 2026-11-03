import type { LevelDef, PhaseDef } from '../types'
import { hasFrame } from './problems'
import { stepById } from './steps'

export const POINTS = 10
export const guideKey = (level: number) => `ef01co02-l${level}`

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        options: 2,
        rungs: 3,
        phases: [
            {
                problem: 'wash',
                start: 'wash-tap',
                goal: 'wash-dry',
                rungs: [
                    { right: 'wash-soap', state: 'wash-soapy', wrong: 'wash-dry', fail: 'wash-fail-smear' },
                    { right: 'wash-rinse', state: 'wash-rinsed', wrong: 'wash-dry', fail: 'wash-fail-towel' },
                    { right: 'wash-dry', state: 'wash-dry', wrong: 'wash-soap', fail: 'wash-soapy' },
                ],
            },
            {
                problem: 'bean',
                start: 'bean-empty',
                goal: 'bean-sprout',
                rungs: [
                    { right: 'bean-soil', state: 'bean-soil', wrong: 'bean-water', fail: 'bean-fail-pool' },
                    { right: 'bean-seed', state: 'bean-seed', wrong: 'bean-water', fail: 'bean-fail-nothing' },
                    { right: 'bean-water', state: 'bean-watered', wrong: 'bean-soil', fail: 'bean-fail-buried' },
                ],
            },
            {
                problem: 'grandma',
                start: 'grandma-home',
                goal: 'grandma-door',
                rungs: [
                    { right: 'grandma-gate', state: 'grandma-gate', wrong: 'grandma-bridge', fail: 'grandma-fail-gate' },
                    { right: 'grandma-bridge', state: 'grandma-bridge', wrong: 'grandma-bakery', fail: 'grandma-fail-splash' },
                    { right: 'grandma-bakery', state: 'grandma-door', wrong: 'grandma-gate', fail: 'grandma-gate' },
                ],
            },
        ],
    },
    {
        level: 2,
        options: 2,
        rungs: 4,
        phases: [
            {
                problem: 'wash',
                start: 'wash-dirty',
                goal: 'wash-dry',
                rungs: [
                    { right: 'wash-tap', state: 'wash-tap', wrong: 'wash-soap', fail: 'wash-fail-nowater' },
                    { right: 'wash-soap', state: 'wash-soapy', wrong: 'wash-dry', fail: 'wash-fail-smear' },
                    { right: 'wash-rinse', state: 'wash-rinsed', wrong: 'wash-dry', fail: 'wash-fail-towel' },
                    { right: 'wash-dry', state: 'wash-dry', wrong: 'wash-soap', fail: 'wash-soapy' },
                ],
            },
            {
                problem: 'bean',
                start: 'bean-empty',
                goal: 'bean-sprout',
                rungs: [
                    { right: 'bean-soil', state: 'bean-soil', wrong: 'bean-water', fail: 'bean-fail-pool' },
                    { right: 'bean-hole', state: 'bean-hole', wrong: 'bean-water', fail: 'bean-fail-nothing' },
                    { right: 'bean-seed', state: 'bean-seed', wrong: 'bean-soil', fail: 'bean-fail-buried' },
                    { right: 'bean-water', state: 'bean-watered', wrong: 'bean-soil', fail: 'bean-fail-buried' },
                ],
            },
            {
                problem: 'sandwich',
                start: 'sandwich-plate',
                goal: 'sandwich-done',
                rungs: [
                    { right: 'sandwich-bread', state: 'sandwich-slice', wrong: 'sandwich-spread', fail: 'sandwich-fail-lid' },
                    { right: 'sandwich-open', state: 'sandwich-slice-open', wrong: 'sandwich-spread', fail: 'sandwich-fail-lid' },
                    { right: 'sandwich-spread', state: 'sandwich-spread', wrong: 'sandwich-close', fail: 'sandwich-fail-empty' },
                    { right: 'sandwich-close', state: 'sandwich-done', wrong: 'sandwich-spread', fail: 'sandwich-fail-toomuch' },
                ],
            },
        ],
    },
    {
        level: 3,
        options: 3,
        rungs: 4,
        phases: [
            {
                problem: 'paint',
                start: 'paint-table',
                goal: 'paint-done',
                rungs: [
                    { right: 'paint-paper', state: 'paint-paper', wrong: 'paint-dip', fail: 'paint-fail-lid', stray: 'shoes-sock' },
                    { right: 'paint-open', state: 'paint-open', wrong: 'paint-brush', fail: 'paint-fail-dry', stray: 'bean-seed' },
                    { right: 'paint-dip', state: 'paint-dipped', wrong: 'paint-brush', fail: 'paint-fail-dry', stray: 'tangram-roof' },
                    { right: 'paint-brush', state: 'paint-done', wrong: 'paint-dip', fail: 'paint-fail-blob', stray: 'shoes-lace' },
                ],
            },
            {
                problem: 'bean',
                start: 'bean-empty',
                goal: 'bean-sprout',
                rungs: [
                    { right: 'bean-soil', state: 'bean-soil', wrong: 'bean-water', fail: 'bean-fail-pool', stray: 'shoes-shoe' },
                    { right: 'bean-hole', state: 'bean-hole', wrong: 'bean-water', fail: 'bean-fail-nothing', stray: 'hat-corners' },
                    { right: 'bean-seed', state: 'bean-seed', wrong: 'bean-soil', fail: 'bean-fail-buried', stray: 'sandwich-close' },
                    { right: 'bean-water', state: 'bean-watered', wrong: 'bean-soil', fail: 'bean-fail-buried', stray: 'tangram-door' },
                ],
            },
            {
                problem: 'wash',
                start: 'wash-dirty',
                goal: 'wash-dry',
                rungs: [
                    { right: 'wash-tap', state: 'wash-tap', wrong: 'wash-soap', fail: 'wash-fail-nowater', stray: 'tangram-square' },
                    { right: 'wash-soap', state: 'wash-soapy', wrong: 'wash-dry', fail: 'wash-fail-smear', stray: 'shoes-sock' },
                    { right: 'wash-rinse', state: 'wash-rinsed', wrong: 'wash-dry', fail: 'wash-fail-towel', stray: 'sandwich-bread' },
                    { right: 'wash-dry', state: 'wash-dry', wrong: 'wash-soap', fail: 'wash-soapy', stray: 'hat-half' },
                ],
            },
        ],
    },
]

export const shuffled = <T>(list: T[], random: () => number = Math.random): T[] => {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

function checkPhase(phase: PhaseDef, level: LevelDef, where: string, problems: string[]) {
    const frame = (id: string, what: string) => {
        if (!hasFrame(phase.problem, id)) problems.push(`${where}: ${what} ${id} não existe`)
    }
    const step = (id: string, what: string) => {
        const def = stepById(id)
        if (!def) problems.push(`${where}: passo ${what} ${id} não existe`)
        else if (def.routine !== phase.problem) problems.push(`${where}: ${id} não é de ${phase.problem}`)
    }

    frame(phase.start, 'início')
    frame(phase.goal, 'objetivo')
    if (phase.rungs.length !== level.rungs) {
        problems.push(`${where}: ${phase.rungs.length} degraus, esperado ${level.rungs}`)
    }

    const rights = new Set<string>()
    phase.rungs.forEach((rung, i) => {
        const tag = `${where}/${i + 1}`
        step(rung.right, 'certo')
        step(rung.wrong, 'errado')
        frame(rung.state, 'estado')
        frame(rung.fail, 'estrago')
        if (rung.right === rung.wrong) problems.push(`${tag}: certo e errado iguais`)
        if (rung.fail === rung.state) problems.push(`${tag}: o estrago é o próprio estado`)
        if (rights.has(rung.right)) problems.push(`${tag}: passo certo repetido`)
        rights.add(rung.right)

        if (level.options === 2 && rung.stray) problems.push(`${tag}: intruso num nível de 2 figuras`)
        if (level.options === 3) {
            const stray = rung.stray ? stepById(rung.stray) : undefined
            if (!stray) problems.push(`${tag}: falta o intruso`)
            else if (stray.routine === phase.problem) problems.push(`${tag}: o intruso ${stray.id} é do próprio problema`)
        }
    })

    const done = phase.rungs.slice(0, -1).map(rung => rung.right)
    const last = phase.rungs[phase.rungs.length - 1]
    if (last && !done.includes(last.wrong)) problems.push(`${where}: o errado do último degrau não é um passo já feito`)
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    if (levels.length !== 3) problems.push(`${levels.length} níveis, esperado 3`)
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`nível ${level.level} fora de ordem`)
        if (level.phases.length !== 3) problems.push(`${tag}: ${level.phases.length} problemas, esperado 3`)
        if (new Set(level.phases.map(phase => phase.problem)).size !== level.phases.length) {
            problems.push(`${tag}: problema repetido`)
        }
        if (index > 0 && level.rungs < levels[index - 1].rungs) problems.push(`${tag}: menos degraus que o nível anterior`)
        level.phases.forEach((phase, i) => checkPhase(phase, level, `${tag}/${i + 1}`, problems))
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[subida-do-dia]', PROBLEMS)
