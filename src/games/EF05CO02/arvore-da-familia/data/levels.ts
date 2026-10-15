import type { Animal, FamilyDef, HomeDef, LevelDef, PhaseDef, Role, SlotDef, Species } from '../types'
import { ROWS, YARD } from './layout'
import { PEOPLE, speciesOf } from './people'

export const POINTS = 10

export const MAX_GROUND = 6

export const guideKey = (level: number) => `ef05co02-arvore-l${level}`

const GRANDS: Role[] = ['grandpa', 'grandma']
const GRANDS_M: Role[] = ['grandpaM', 'grandmaM']
const PARENTS: Role[] = ['dad', 'mom']
const UNCLES: Role[] = ['uncle', 'aunt']
const SIBLINGS: Role[] = ['sister', 'brother']
const COUSINS: Role[] = ['cousinBoy', 'cousinGirl']

const slot = (id: string, x: number, y: number, accepts: Role[]): SlotDef => ({ id, x, y, accepts })
const at = (id: string, x: number, row: number, accepts: Role[]) => slot(id, x, ROWS[row], accepts)

const N1: LevelDef = {
    level: 1,
    stage: 'park',
    title: 'Ventania',
    goal: 'Arrume a árvore da família!',
    message: 'A árvore da família é um GRAFO: cada pessoa é um ponto, e as linhas ligam pais, filhos e casais.',
    card: { w: 104, h: 133 },
    rows: [...ROWS],
    phases: [
        {
            id: 'avos',
            slots: [
                at('g1', 560, 0, GRANDS),
                at('g2', 720, 0, GRANDS),
                at('p1', 560, 1, PARENTS),
                at('p2', 720, 1, PARENTS),
                at('me', 640, 2, ['me']),
            ],
            families: [
                { parents: ['g1', 'g2'], children: ['p1'] },
                { parents: ['p1', 'p2'], children: ['me'] },
            ],
            people: [
                { role: 'grandpa', slot: 'g1' },
                { role: 'grandma', slot: 'g2' },
                { role: 'dad', slot: 'p1' },
                { role: 'mom', slot: 'p2' },
                { role: 'me', slot: 'me' },
            ],
            fixed: ['me'],
        },
        {
            id: 'tio',
            news: 'Chegaram o Tio e a Irmã!',
            slots: [
                at('g1', 560, 0, GRANDS),
                at('g2', 720, 0, GRANDS),
                at('m', 330, 1, PARENTS),
                at('d', 490, 1, PARENTS),
                at('u', 790, 1, ['uncle']),
                at('s', 330, 2, SIBLINGS),
                at('me', 490, 2, ['me']),
            ],
            families: [
                { parents: ['g1', 'g2'], children: ['d', 'u'] },
                { parents: ['m', 'd'], children: ['s', 'me'] },
            ],
            people: [
                { role: 'grandpa', slot: 'g1' },
                { role: 'grandma', slot: 'g2' },
                { role: 'mom', slot: 'm' },
                { role: 'dad', slot: 'd' },
                { role: 'uncle', slot: 'u' },
                { role: 'sister', slot: 's' },
                { role: 'me', slot: 'me' },
            ],
            fixed: ['me', 'grandpa'],
        },
        {
            id: 'primos',
            news: 'Chegaram a Tia e o Primo!',
            slots: [
                at('g1', 560, 0, GRANDS),
                at('g2', 720, 0, GRANDS),
                at('m', 300, 1, PARENTS),
                at('d', 460, 1, PARENTS),
                at('u', 820, 1, UNCLES),
                at('a', 980, 1, UNCLES),
                at('me', 300, 2, ['me']),
                at('s', 460, 2, SIBLINGS),
                at('c', 900, 2, COUSINS),
            ],
            families: [
                { parents: ['g1', 'g2'], children: ['d', 'u'] },
                { parents: ['m', 'd'], children: ['me', 's'] },
                { parents: ['u', 'a'], children: ['c'] },
            ],
            people: [
                { role: 'grandpa', slot: 'g1' },
                { role: 'grandma', slot: 'g2' },
                { role: 'mom', slot: 'm' },
                { role: 'dad', slot: 'd' },
                { role: 'uncle', slot: 'u' },
                { role: 'aunt', slot: 'a' },
                { role: 'me', slot: 'me' },
                { role: 'sister', slot: 's' },
                { role: 'cousinBoy', slot: 'c' },
            ],
            fixed: ['me', 'grandma', 'dad'],
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    stage: 'beach',
    title: 'Maré',
    goal: 'Arrume a família na areia!',
    message: 'O João tem dois lados na família: os pais do Pai e os pais da Mãe. Cada cartão dizia a sua ligação, e a ligação mostra o lugar no grafo.',
    card: { w: 124, h: 133 },
    rows: [...ROWS],
    links: true,
    phases: [
        {
            id: 'dois-lados',
            slots: [
                at('gp1', 330, 0, GRANDS),
                at('gp2', 480, 0, GRANDS),
                at('gm1', 800, 0, GRANDS_M),
                at('gm2', 950, 0, GRANDS_M),
                at('d', 560, 1, ['dad']),
                at('m', 720, 1, ['mom']),
                at('me', 640, 2, ['me']),
            ],
            families: [
                { parents: ['gp1', 'gp2'], children: ['d'] },
                { parents: ['gm1', 'gm2'], children: ['m'] },
                { parents: ['d', 'm'], children: ['me'] },
            ],
            people: [
                { role: 'grandpa', slot: 'gp1' },
                { role: 'grandma', slot: 'gp2' },
                { role: 'grandpaM', slot: 'gm1' },
                { role: 'grandmaM', slot: 'gm2' },
                { role: 'dad', slot: 'd' },
                { role: 'mom', slot: 'm' },
                { role: 'me', slot: 'me' },
            ],
            fixed: ['me', 'dad', 'mom'],
            rounds: [['grandpa', 'grandma', 'grandpaM', 'grandmaM']],
        },
        {
            id: 'tios',
            news: 'Chegaram os tios e a Irmã!',
            slots: [
                at('gp1', 365, 0, GRANDS),
                at('gp2', 515, 0, GRANDS),
                at('gm1', 765, 0, GRANDS_M),
                at('gm2', 915, 0, GRANDS_M),
                at('u', 320, 1, ['uncle']),
                at('d', 560, 1, ['dad']),
                at('m', 720, 1, ['mom']),
                at('t', 960, 1, ['auntM']),
                at('me', 560, 2, ['me']),
                at('s', 720, 2, SIBLINGS),
            ],
            families: [
                { parents: ['gp1', 'gp2'], children: ['u', 'd'] },
                { parents: ['gm1', 'gm2'], children: ['m', 't'] },
                { parents: ['d', 'm'], children: ['me', 's'] },
            ],
            people: [
                { role: 'grandpa', slot: 'gp1' },
                { role: 'grandma', slot: 'gp2' },
                { role: 'grandpaM', slot: 'gm1' },
                { role: 'grandmaM', slot: 'gm2' },
                { role: 'uncle', slot: 'u' },
                { role: 'dad', slot: 'd' },
                { role: 'mom', slot: 'm' },
                { role: 'auntM', slot: 't' },
                { role: 'me', slot: 'me' },
                { role: 'sister', slot: 's' },
            ],
            fixed: ['me'],
            rounds: [
                ['grandpa', 'grandma', 'uncle', 'dad'],
                ['grandpaM', 'grandmaM', 'auntM', 'mom', 'sister'],
            ],
        },
        {
            id: 'primo',
            news: 'Chegaram o Irmão e o Primo!',
            slots: [
                at('gp1', 365, 0, GRANDS),
                at('gp2', 515, 0, GRANDS),
                at('gm1', 765, 0, GRANDS_M),
                at('gm2', 915, 0, GRANDS_M),
                at('u', 320, 1, ['uncle']),
                at('d', 560, 1, ['dad']),
                at('m', 720, 1, ['mom']),
                at('t', 960, 1, ['auntM']),
                at('me', 480, 2, ['me']),
                at('s', 640, 2, SIBLINGS),
                at('b', 800, 2, SIBLINGS),
                at('c', 960, 2, ['baby']),
            ],
            families: [
                { parents: ['gp1', 'gp2'], children: ['u', 'd'] },
                { parents: ['gm1', 'gm2'], children: ['m', 't'] },
                { parents: ['d', 'm'], children: ['me', 's', 'b'] },
                { parents: ['t'], children: ['c'] },
            ],
            people: [
                { role: 'grandpa', slot: 'gp1' },
                { role: 'grandma', slot: 'gp2' },
                { role: 'grandpaM', slot: 'gm1' },
                { role: 'grandmaM', slot: 'gm2' },
                { role: 'uncle', slot: 'u' },
                { role: 'dad', slot: 'd' },
                { role: 'mom', slot: 'm' },
                { role: 'auntM', slot: 't' },
                { role: 'me', slot: 'me' },
                { role: 'sister', slot: 's' },
                { role: 'brother', slot: 'b' },
                { role: 'baby', slot: 'c' },
            ],
            fixed: ['me', 'sister'],
            rounds: [
                ['grandpaM', 'grandmaM', 'auntM', 'mom', 'baby'],
                ['grandpa', 'grandma', 'uncle', 'dad', 'brother'],
            ],
        },
    ],
}

const SPECIES_ORDER: Species[] = ['cat', 'dog', 'rabbit']

type YardShape = 'parents' | 'siblings' | 'grandparents'

function yardPhase(id: string, shape: YardShape, news?: string): PhaseDef {
    const slots: SlotDef[] = []
    const families: FamilyDef[] = []
    const people: HomeDef[] = []
    const fixed: Role[] = []
    SPECIES_ORDER.forEach((sp, i) => {
        const X = YARD.trees[i]
        const P = YARD.pair
        const r = (kin: string) => `${sp}.${kin}` as Animal
        const rows = shape === 'grandparents' ? YARD.rows3 : YARD.rows2
        const top = shape === 'grandparents' ? 1 : 0
        const parents: Role[] = [r('dad'), r('mom')]
        slots.push(slot(`${sp}-p1`, X - P, rows[top], parents), slot(`${sp}-p2`, X + P, rows[top], parents))
        people.push({ role: r('dad'), slot: `${sp}-p1` }, { role: r('mom'), slot: `${sp}-p2` })
        if (shape === 'siblings') {
            slots.push(slot(`${sp}-k`, X - P, rows[1], [r('kid')]), slot(`${sp}-b`, X + P, rows[1], [r('brother')]))
            people.push({ role: r('kid'), slot: `${sp}-k` }, { role: r('brother'), slot: `${sp}-b` })
            families.push({ parents: [`${sp}-p1`, `${sp}-p2`], children: [`${sp}-k`, `${sp}-b`] })
        } else {
            slots.push(slot(`${sp}-k`, X, rows[top + 1], [r('kid')]))
            people.push({ role: r('kid'), slot: `${sp}-k` })
            families.push({ parents: [`${sp}-p1`, `${sp}-p2`], children: [`${sp}-k`] })
        }
        if (shape === 'grandparents') {
            const grands: Role[] = [r('grandpa'), r('grandma')]
            slots.push(slot(`${sp}-g1`, X - P * 2, rows[0], grands), slot(`${sp}-g2`, X, rows[0], grands))
            people.push({ role: r('grandpa'), slot: `${sp}-g1` }, { role: r('grandma'), slot: `${sp}-g2` })
            families.push({ parents: [`${sp}-g1`, `${sp}-g2`], children: [`${sp}-p1`] })
        }
        fixed.push(r('kid'))
    })
    return { id, news, slots, families, people, fixed }
}

const N3: LevelDef = {
    level: 3,
    stage: 'yard',
    title: 'Três famílias',
    goal: 'Monte as três famílias!',
    message: 'Três famílias, três grafos separados: cada ponto pertence a um só. As linhas de um não se misturam com as do outro.',
    card: { w: 84, h: 107 },
    rows: [...YARD.rows3, ...YARD.rows2],
    phases: [
        yardPhase('pais', 'parents'),
        yardPhase('irmaos', 'siblings', 'Chegaram os irmãos!'),
        yardPhase('avos', 'grandparents', 'Chegaram os avós!'),
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export const fallers = (phase: PhaseDef) => phase.people.filter(p => !phase.fixed.includes(p.role)).map(p => p.role)

export const roundsOf = (phase: PhaseDef): Role[][] => phase.rounds ?? [fallers(phase)]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        if (level.phases.length > 5) problems.push(`N${level.level}: mais de 5 fases`)
        const gap = level.card.w + 24
        level.phases.forEach(phase => {
            const tag = `N${level.level} ${phase.id}`
            const ids = new Set(phase.slots.map(s => s.id))
            if (ids.size !== phase.slots.length) problems.push(`${tag}: lugar repetido`)
            const down = fallers(phase)
            if (down.length === 0) problems.push(`${tag}: nenhum cartão sai do lugar`)
            if (level.stage !== 'yard') {
                if (!phase.fixed.includes('me')) problems.push(`${tag}: o João tem de ficar preso`)
                const rounds = roundsOf(phase)
                const seen = rounds.flat()
                rounds.forEach((r, i) => {
                    if (r.length > MAX_GROUND) problems.push(`${tag}: rodada ${i + 1} com ${r.length} cartões no chão (máx. ${MAX_GROUND})`)
                })
                if (seen.length !== new Set(seen).size) problems.push(`${tag}: cartão em duas rodadas`)
                if (seen.length !== down.length || down.some(r => !seen.includes(r))) problems.push(`${tag}: as rodadas não cobrem os cartões soltos`)
            } else {
                phase.people.forEach(p => {
                    const sp = speciesOf(p.role)
                    if (!sp) problems.push(`${tag}: ${p.role} não é bicho`)
                    else if (!p.slot.startsWith(`${sp}-`)) problems.push(`${tag}: ${p.role} na árvore de outro bicho`)
                })
                if (phase.fixed.some(r => !r.endsWith('.kid'))) problems.push(`${tag}: só o filhote fica preso`)
            }
            if (level.links) phase.people.forEach(p => {
                if (!PEOPLE[p.role].link || !PEOPLE[p.role].whyLink && !phase.fixed.includes(p.role)) problems.push(`${tag}: ${p.role} sem a ligação escrita`)
            })
            const roles = new Set<Role>()
            phase.people.forEach(p => {
                if (roles.has(p.role)) problems.push(`${tag}: ${p.role} repetido`)
                roles.add(p.role)
                const s = phase.slots.find(x => x.id === p.slot)
                if (!s) problems.push(`${tag}: ${p.role} mora num lugar que não existe`)
                else if (!s.accepts.includes(p.role)) problems.push(`${tag}: o lugar ${s.id} não aceita ${p.role}`)
            })
            phase.fixed.forEach(r => {
                if (!roles.has(r)) problems.push(`${tag}: ${r} preso mas fora da família`)
            })
            phase.slots.forEach(s => {
                if (!phase.people.some(p => p.slot === s.id)) problems.push(`${tag}: lugar ${s.id} vazio na família completa`)
                if (!level.rows.includes(s.y)) problems.push(`${tag}: lugar ${s.id} fora das fileiras`)
                if (level.stage !== 'yard' && (s.x < 150 || s.x > 1130)) problems.push(`${tag}: lugar ${s.id} fora da copa`)
                phase.slots.forEach(o => {
                    if (o.id > s.id && o.y === s.y && Math.abs(o.x - s.x) < gap) problems.push(`${tag}: ${s.id} e ${o.id} colados`)
                })
                const parent = phase.families.some(f => f.parents.includes(s.id))
                const child = phase.families.filter(f => f.children.includes(s.id)).length
                if (child > 1) problems.push(`${tag}: ${s.id} é filho de dois casais`)
                if (!parent && !child) problems.push(`${tag}: ${s.id} sem ligação`)
            })
            phase.families.forEach((f, i) => {
                ;[...f.parents, ...f.children].forEach(id => {
                    if (!ids.has(id)) problems.push(`${tag}: família ${i} cita ${id}, que não existe`)
                })
                if (f.parents.length < 1 || f.parents.length > 2) problems.push(`${tag}: família ${i} com ${f.parents.length} pais`)
                const py = phase.slots.find(s => s.id === f.parents[0])?.y ?? 0
                f.children.forEach(c => {
                    const cy = phase.slots.find(s => s.id === c)?.y ?? 0
                    if (cy <= py) problems.push(`${tag}: ${c} não está abaixo dos pais`)
                })
            })
            down.forEach(r => {
                const free = phase.slots.filter(s => s.accepts.includes(r) && !phase.people.some(p => p.slot === s.id && phase.fixed.includes(p.role)))
                if (!free.length) problems.push(`${tag}: ${r} sai e não tem lugar livre`)
            })
        })
    })
    if (problems.length) throw new Error(`Árvore da Família — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
