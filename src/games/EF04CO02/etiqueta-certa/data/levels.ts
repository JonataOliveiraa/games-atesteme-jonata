import type { City, Field, LevelDef, Note, Phase, Rule, Train } from '../types'
import { MAPS, allStates, follow } from './maps'

export const POINTS = 10

export const guideKey = (level: number) => `etiqueta-certa-guide-${level}`

const t = (name: string, to: City, from: City, order: Field[], crate: number, color: number, weight?: number): Train => ({
    name,
    to,
    from,
    order,
    crate,
    color,
    ...(weight ? { weight } : {}),
})

/** os dois trens que o próprio jogo despacha no tutorial do N1; no 2º o PARA muda de linha */
export const DEMO: Phase = {
    stations: ['Natal', 'Recife'],
    start: [1],
    rule: 'to',
    trains: [t('Íris', 'Natal', 'Recife', ['name', 'to', 'from'], 0, 0), t('Noah', 'Recife', 'Natal', ['from', 'name', 'to'], 2, 1)],
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Separe pelo PARA',
        message: 'Você achou o PARA em qualquer linha da etiqueta!',
        phases: [
            {
                stations: ['Natal', 'Recife'],
                start: [1],
                rule: 'to',
                trains: [
                    t('Luna', 'Natal', 'Recife', ['to', 'from', 'name'], 1, 2),
                    t('Davi', 'Recife', 'Natal', ['from', 'name', 'to'], 3, 0),
                    t('Bia', 'Recife', 'Natal', ['name', 'to', 'from'], 0, 1),
                ],
            },
            {
                stations: ['Belém', 'Manaus'],
                start: [0],
                rule: 'to',
                trains: [
                    t('Nina', 'Manaus', 'Belém', ['name', 'from', 'to'], 2, 1),
                    t('Caio', 'Manaus', 'Belém', ['to', 'name', 'from'], 0, 2),
                    t('Lara', 'Belém', 'Manaus', ['from', 'to', 'name'], 3, 0),
                ],
            },
            {
                stations: ['Salvador', 'Maceió'],
                start: [1],
                rule: 'to',
                trains: [
                    t('Malu', 'Salvador', 'Maceió', ['from', 'name', 'to'], 1, 0),
                    t('Rafa', 'Maceió', 'Salvador', ['to', 'from', 'name'], 2, 2),
                    t('Zoe', 'Salvador', 'Maceió', ['name', 'from', 'to'], 0, 1),
                ],
            },
        ],
    },
    {
        level: 2,
        title: 'Quem manda muda',
        message: 'Você leu o campo que a placa pediu, PARA ou DE!',
        phases: [
            {
                stations: ['Palmas', 'Cuiabá', 'Vitória'],
                start: [1, 0],
                rule: 'to',
                trains: [
                    t('Gabi', 'Palmas', 'Vitória', ['weight', 'name', 'to', 'from'], 0, 0, 3),
                    t('Theo', 'Cuiabá', 'Palmas', ['to', 'from', 'weight', 'name'], 1, 1, 5),
                    t('Duda', 'Vitória', 'Cuiabá', ['name', 'from', 'to', 'weight'], 2, 2, 2),
                    t('Enzo', 'Vitória', 'Palmas', ['from', 'weight', 'name', 'to'], 3, 0, 7),
                ],
            },
            {
                stations: ['Aracaju', 'Macapá', 'Goiânia'],
                start: [0, 0],
                rule: 'from',
                trains: [
                    t('Léo', 'Aracaju', 'Goiânia', ['to', 'name', 'weight', 'from'], 1, 2, 4),
                    t('Ana', 'Goiânia', 'Macapá', ['name', 'weight', 'from', 'to'], 3, 1, 6),
                    t('Pedro', 'Macapá', 'Aracaju', ['from', 'to', 'name', 'weight'], 0, 0, 2),
                    t('Sofia', 'Aracaju', 'Macapá', ['weight', 'to', 'from', 'name'], 2, 2, 8),
                ],
            },
            {
                stations: ['Natal', 'Recife', 'Belém'],
                start: [0, 1],
                rule: 'to',
                flipAt: 2,
                trains: [
                    t('Lia', 'Belém', 'Natal', ['name', 'to', 'weight', 'from'], 3, 1, 3),
                    t('Joca', 'Natal', 'Recife', ['from', 'weight', 'to', 'name'], 1, 0, 5),
                    t('Bela', 'Natal', 'Recife', ['to', 'from', 'name', 'weight'], 0, 2, 9),
                    t('Rui', 'Recife', 'Belém', ['weight', 'name', 'from', 'to'], 2, 1, 4),
                ],
            },
        ],
    },
    {
        level: 3,
        title: 'Carimbe o recado',
        message: 'Você achou a etiqueta pelo NOME e mudou o campo certo!',
        phases: [
            {
                stations: ['Natal', 'Recife', 'Belém', 'Manaus'],
                start: [1, 0, 1],
                rule: 'to',
                note: { name: 'Caio', field: 'to', value: 'Recife' },
                trains: [
                    t('Nina', 'Belém', 'Natal', ['name', 'to', 'from', 'weight'], 2, 0, 2),
                    t('Caio', 'Natal', 'Manaus', ['weight', 'from', 'name', 'to'], 0, 1, 5),
                    t('Lara', 'Manaus', 'Recife', ['to', 'weight', 'from', 'name'], 3, 2, 7),
                    t('Tito', 'Natal', 'Belém', ['from', 'name', 'weight', 'to'], 1, 0, 3),
                ],
            },
            {
                stations: ['Palmas', 'Cuiabá', 'Vitória', 'Aracaju'],
                start: [0, 0, 0],
                rule: 'from',
                note: { name: 'Bia', field: 'from', value: 'Vitória' },
                trains: [
                    t('Malu', 'Palmas', 'Aracaju', ['to', 'name', 'weight', 'from'], 1, 2, 4),
                    t('Bia', 'Aracaju', 'Cuiabá', ['from', 'to', 'name', 'weight'], 3, 0, 6),
                    t('Zeca', 'Vitória', 'Palmas', ['name', 'weight', 'from', 'to'], 0, 1, 2),
                    t('Ravi', 'Palmas', 'Cuiabá', ['weight', 'from', 'to', 'name'], 2, 2, 8),
                ],
            },
            {
                stations: ['Salvador', 'Maceió', 'Macapá', 'Goiânia'],
                start: [1, 0, 0],
                rule: 'to',
                note: { name: 'Rafa', field: 'from', value: 'Goiânia' },
                trains: [
                    t('Lis', 'Salvador', 'Macapá', ['from', 'to', 'weight', 'name'], 0, 0, 3),
                    t('Gui', 'Goiânia', 'Maceió', ['name', 'weight', 'to', 'from'], 2, 1, 5),
                    t('Rafa', 'Maceió', 'Salvador', ['to', 'from', 'name', 'weight'], 1, 2, 7),
                    t('Mel', 'Macapá', 'Goiânia', ['weight', 'name', 'from', 'to'], 3, 0, 4),
                ],
            },
        ],
    },
]

/** o campo que a placa pede para o trem `i` da fase (no N2 a placa pode virar no meio) */
export const ruleAt = (phase: Phase, i: number): Rule =>
    phase.flipAt !== undefined && i >= phase.flipAt ? (phase.rule === 'to' ? 'from' : 'to') : phase.rule

/** a etiqueta depois do carimbo do recado */
export const stamped = (train: Train, note: Note): Train => ({ ...train, [note.field]: note.value })

/** a cidade que a regra manda olhar */
export const answer = (train: Train, rule: Rule): City => (rule === 'to' ? train.to : train.from)

/** a cidade certa do trem `i`, já com o recado aplicado quando ele é do trem */
export function target(phase: Phase, i: number): City {
    const train = phase.trains[i]
    const real = phase.note && phase.note.name === train.name ? stamped(train, phase.note) : train
    return answer(real, ruleAt(phase, i))
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const fail = (where: string, why: string) => problems.push(`${where}: ${why}`)
    levels.forEach(level => {
        const map = MAPS[level.level - 1]
        if (!map) return fail(`N${level.level}`, 'sem mapa')
        if (level.phases.length !== 3) fail(`N${level.level}`, '3 fases')
        const fields = level.level === 1 ? 3 : 4
        const names = new Set<string>()
        let kept = 0
        let canKeep = false
        const reach = new Set(allStates(map).map(s => follow(map, s).shed))
        map.sheds.forEach((_, i) => {
            if (!reach.has(i)) fail(`N${level.level}`, `o galpão ${i} não tem caminho`)
        })
        level.phases.forEach((phase, f) => {
            const where = `N${level.level} fase ${f + 1}`
            if (phase.stations.length !== map.sheds.length) fail(where, `${map.sheds.length} cidades, uma por galpão`)
            if (new Set(phase.stations).size !== phase.stations.length) fail(where, 'cidade repetida nos galpões')
            if (phase.start.length !== map.switches.length) fail(where, `${map.switches.length} alavancas no start`)
            if (phase.trains.length < 3) fail(where, 'pelo menos 3 trens')
            if (phase.trains.length > phase.stations.length) canKeep = true
            const hits = new Map<City, number>()
            const ruleRows = new Set<number>()
            let streak = 0
            let last: City | null = null
            let shed = follow(map, phase.start).shed
            phase.trains.forEach((train, i) => {
                const at = `${where} trem ${i + 1}`
                if (names.has(train.name)) fail(at, `NOME repetido (${train.name})`)
                names.add(train.name)
                if (train.to === train.from) fail(at, 'PARA = DE')
                if (!phase.stations.includes(train.to) || !phase.stations.includes(train.from)) fail(at, 'PARA e DE têm de ser cidades dos galpões')
                if (new Set(train.order).size !== train.order.length) fail(at, 'campo repetido na ordem')
                if (train.order.length !== fields) fail(at, `${fields} campos`)
                if (!train.order.includes('to') || !train.order.includes('from') || !train.order.includes('name')) fail(at, 'falta NOME, PARA ou DE')
                if (fields === 4 && (!train.order.includes('weight') || !train.weight)) fail(at, 'falta o PESO')
                const prev = phase.trains[i - 1]
                if (prev && prev.order.join() === train.order.join()) fail(at, 'mesma ordem do trem anterior')
                const city = target(phase, i)
                const want = phase.stations.indexOf(city)
                if (i === 0 && want === shed) fail(at, 'o 1º trem da fase tem de pedir virar alavanca')
                if (i > 0 && want === shed) kept += 1
                shed = want
                hits.set(city, (hits.get(city) ?? 0) + 1)
                streak = city === last ? streak + 1 : 1
                last = city
                if (streak >= 3) fail(at, '3 seguidos no mesmo galpão')
                ruleRows.add(train.order.indexOf(ruleAt(phase, i)))
            })
            phase.stations.forEach(city => {
                if (!hits.get(city)) fail(where, `o galpão de ${city} não recebe nada`)
            })
            if (ruleRows.size < 2) fail(where, 'o campo que manda tem de aparecer em 2 posições diferentes')
            if (phase.flipAt !== undefined && (phase.flipAt <= 0 || phase.flipAt >= phase.trains.length)) fail(where, 'flipAt fora dos trens')
            const note = phase.note
            if (note) {
                const owners = phase.trains.filter(tr => tr.name === note.name)
                if (owners.length !== 1) fail(where, `o recado tem de ser de 1 trem só (${note.name})`)
                const owner = owners[0]
                if (owner) {
                    if (phase.trains.indexOf(owner) === 0) fail(where, 'o trem do recado não pode ser o 1º')
                    if (owner[note.field] === note.value) fail(where, 'o recado não muda nada')
                    const other = note.field === 'to' ? owner.from : owner.to
                    if (other === note.value) fail(where, 'o recado deixaria PARA = DE')
                    if (!phase.stations.includes(note.value)) fail(where, 'o recado tem de ir para uma cidade dos galpões')
                }
            } else if (level.level === 3) fail(where, 'o N3 tem recado em toda fase')
        })
        if (canKeep && !kept) fail(`N${level.level}`, 'falta um trem em que as alavancas já estão certas')
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[etiqueta-certa] níveis inválidos', PROBLEMS)
