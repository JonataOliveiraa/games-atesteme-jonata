import type { LevelDef, PhaseDef } from '../types'
import { hasFrame } from './problems'
import { stepById } from './steps'

export const POINTS = 10
export const GUIDE_KEY = 'ef01co02-l1'

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
        else if (def.problem !== phase.problem) problems.push(`${where}: ${id} não é de ${phase.problem}`)
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
    })

    const done = phase.rungs.slice(0, -1).map(rung => rung.right)
    const last = phase.rungs[phase.rungs.length - 1]
    if (last && !done.includes(last.wrong)) problems.push(`${where}: o errado do último degrau não é um passo já feito`)
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`nível ${level.level} fora de ordem`)
        if (level.phases.length < 1 || level.phases.length > 5) problems.push(`${tag}: ${level.phases.length} problemas`)
        if (level.level === 1 && level.phases.length !== 3) problems.push(`${tag}: o N1 tem 3 problemas`)
        if (new Set(level.phases.map(phase => phase.problem)).size !== level.phases.length) {
            problems.push(`${tag}: problema repetido`)
        }
        level.phases.forEach((phase, i) => checkPhase(phase, level, `${tag}/${i + 1}`, problems))
    })

    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[subida-do-dia]', PROBLEMS)
