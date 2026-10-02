import Phaser from 'phaser'
import type { Attribute, Collection, Hue, LevelDef, PhaseDef, Rule, Size, Toy } from '../types'

const robot = (color: Hue, size: Size, antenna = false): Toy => ({ collection: 'robot', color, size, antenna, stripes: false })
const ball = (color: Hue, size: Size, stripes = false): Toy => ({ collection: 'ball', color, size, antenna: false, stripes })

export const guideKey = (level: number) => `__fabricaDeCarimbosGuide-l${level}`
export const POINTS = 10

const ATTRIBUTES_OF: Record<Collection, Attribute[]> = {
    robot: ['color', 'size', 'antenna'],
    ball: ['color', 'size', 'stripes'],
}

const color = (value: Hue): Rule => ({ attribute: 'color', value })
const size = (value: Size): Rule => ({ attribute: 'size', value })
const ANTENNA: Rule = { attribute: 'antenna', value: true }
const STRIPES: Rule = { attribute: 'stripes', value: true }

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Confira com o carimbo',
        message: 'O carimbo confere janelinha por janelinha!',
        lineSize: 6,
        target: 3,
        speed: 90,
        spacing: 300,
        zone: 270,
        build: false,
        phases: [
            {
                id: 'n1-azul-pequeno',
                collection: 'robot',
                stamp: [
                    { attribute: 'color', value: 'blue' },
                    { attribute: 'size', value: 'small' },
                ],
                line: [
                    robot('blue', 'small', true),
                    robot('blue', 'big'),
                    robot('blue', 'small'),
                    robot('yellow', 'small', true),
                    robot('red', 'big', true),
                    robot('blue', 'small', true),
                ],
            },
            {
                id: 'n1-listras-grande',
                collection: 'ball',
                stamp: [
                    { attribute: 'stripes', value: true },
                    { attribute: 'size', value: 'big' },
                ],
                line: [
                    ball('red', 'big', true),
                    ball('yellow', 'small', true),
                    ball('blue', 'big', true),
                    ball('blue', 'big'),
                    ball('red', 'small'),
                    ball('yellow', 'big', true),
                ],
            },
            {
                id: 'n1-vermelho-antena',
                collection: 'robot',
                stamp: [
                    { attribute: 'color', value: 'red' },
                    { attribute: 'antenna', value: true },
                ],
                line: [
                    robot('red', 'big', true),
                    robot('red', 'small'),
                    robot('blue', 'small', true),
                    robot('red', 'small', true),
                    robot('yellow', 'big'),
                    robot('red', 'big', true),
                ],
            },
        ],
    },
    {
        level: 2,
        title: 'Monte o carimbo',
        message: 'Você criou o modelo: só o que importa entrou!',
        lineSize: 8,
        target: 3,
        speed: 90,
        spacing: 300,
        zone: 270,
        build: true,
        phases: [
            {
                id: 'n2-pequeno-azul',
                collection: 'robot',
                note: { text: 'Quero robôs PEQUENOS e AZUIS.', drawing: robot('blue', 'small', true) },
                stamp: [size('small'), color('blue')],
                options: [
                    [size('small'), size('big'), ANTENNA],
                    [color('blue'), color('red'), color('yellow')],
                ],
                line: [
                    robot('blue', 'small', true),
                    robot('blue', 'big', true),
                    robot('red', 'small'),
                    robot('blue', 'small'),
                    robot('yellow', 'small', true),
                    robot('red', 'big'),
                    robot('blue', 'big'),
                    robot('blue', 'small', true),
                ],
            },
            {
                id: 'n2-listras-grande',
                collection: 'ball',
                note: { text: 'Quero bolas com LISTRAS e GRANDES.', drawing: ball('red', 'big', true) },
                stamp: [STRIPES, size('big')],
                options: [
                    [STRIPES, color('red'), size('small')],
                    [size('big'), size('small'), color('yellow')],
                ],
                line: [
                    ball('red', 'big', true),
                    ball('red', 'small', true),
                    ball('blue', 'big'),
                    ball('blue', 'big', true),
                    ball('yellow', 'small'),
                    ball('red', 'big'),
                    ball('blue', 'small', true),
                    ball('yellow', 'big', true),
                ],
            },
            {
                id: 'n2-vermelho-antena',
                collection: 'robot',
                note: { text: 'Quero robôs VERMELHOS com ANTENA.', drawing: robot('red', 'big', true) },
                stamp: [color('red'), ANTENNA],
                options: [
                    [color('red'), color('blue'), size('big')],
                    [ANTENNA, size('small'), color('yellow')],
                ],
                line: [
                    robot('red', 'big', true),
                    robot('red', 'small'),
                    robot('blue', 'big', true),
                    robot('red', 'small', true),
                    robot('yellow', 'small', true),
                    robot('red', 'big'),
                    robot('blue', 'small'),
                    robot('red', 'big', true),
                ],
            },
        ],
    },
    {
        level: 3,
        title: 'Conferência fina',
        message: 'Modelo é o retrato do que importa: com ele dá para conferir qualquer um!',
        lineSize: 10,
        target: 3,
        speed: 90,
        spacing: 300,
        zone: 270,
        build: true,
        phases: [
            {
                id: 'n3-azul-pequeno-antena',
                collection: 'robot',
                note: { text: 'Quero robôs AZUIS, PEQUENOS e com ANTENA.', drawing: robot('blue', 'small', true) },
                stamp: [color('blue'), size('small'), ANTENNA],
                options: [
                    [color('blue'), color('red'), color('yellow')],
                    [size('small'), size('big'), color('yellow')],
                    [ANTENNA, size('big'), color('red')],
                ],
                line: [
                    robot('blue', 'small', true),
                    robot('blue', 'small'),
                    robot('red', 'big'),
                    robot('blue', 'big', true),
                    robot('blue', 'small', true),
                    robot('red', 'small', true),
                    robot('yellow', 'big'),
                    robot('yellow', 'small', true),
                    robot('blue', 'big'),
                    robot('blue', 'small', true),
                ],
            },
            {
                id: 'n3-amarela-grande-listras',
                collection: 'ball',
                note: { text: 'Quero bolas AMARELAS, GRANDES e com LISTRAS.', drawing: ball('yellow', 'big', true) },
                stamp: [color('yellow'), size('big'), STRIPES],
                options: [
                    [color('yellow'), color('blue'), color('red')],
                    [size('big'), size('small'), color('blue')],
                    [STRIPES, size('small'), color('red')],
                ],
                line: [
                    ball('yellow', 'big', true),
                    ball('yellow', 'big'),
                    ball('red', 'small'),
                    ball('yellow', 'small', true),
                    ball('yellow', 'big', true),
                    ball('red', 'big', true),
                    ball('blue', 'small', true),
                    ball('blue', 'big', true),
                    ball('red', 'big'),
                    ball('yellow', 'big', true),
                ],
            },
            {
                id: 'n3-vermelho-grande-antena',
                collection: 'robot',
                note: { text: 'Quero robôs VERMELHOS, GRANDES e com ANTENA.', drawing: robot('red', 'big', true) },
                stamp: [color('red'), size('big'), ANTENNA],
                options: [
                    [color('red'), color('yellow'), color('blue')],
                    [size('big'), size('small'), color('yellow')],
                    [ANTENNA, size('small'), color('blue')],
                ],
                line: [
                    robot('red', 'big', true),
                    robot('red', 'big'),
                    robot('blue', 'small'),
                    robot('red', 'small', true),
                    robot('red', 'big', true),
                    robot('blue', 'big', true),
                    robot('yellow', 'small', true),
                    robot('yellow', 'big', true),
                    robot('red', 'small'),
                    robot('red', 'big', true),
                ],
            },
        ],
    },
]

export const sameRule = (a: Rule, b: Rule) => a.attribute === b.attribute && a.value === b.value

export const TRAINING: Toy[] = [robot('blue', 'big'), robot('blue', 'small')]

export function matches(rule: Rule, toy: Toy): boolean {
    return toy[rule.attribute] === rule.value
}

export function check(stamp: Rule[], toy: Toy): boolean[] {
    return stamp.map(rule => matches(rule, toy))
}

export function approves(stamp: Rule[], toy: Toy): boolean {
    return check(stamp, toy).every(Boolean)
}

const sameStamp = (a: Rule[], b: Rule[]) => a.length === b.length && a.every((rule, i) => sameRule(rule, b[i]))

const WINDOWS_BY_LEVEL: Record<number, number> = { 1: 2, 2: 2, 3: 3 }

const STEM: Record<string, string> = {
    'color:blue': 'AZU',
    'color:red': 'VERMELH',
    'color:yellow': 'AMAREL',
    'size:small': 'PEQUEN',
    'size:big': 'GRANDE',
    'antenna:true': 'ANTENA',
    'stripes:true': 'LISTRA',
}

const ruleWordStem = (rule: Rule) => STEM[`${rule.attribute}:${String(rule.value)}`]

function adjacentApproved(phase: PhaseDef, line: Toy[]) {
    return line.filter((toy, i) => approves(phase.stamp, toy) && approves(phase.stamp, line[(i + 1) % line.length])).length
}

export function order(phase: PhaseDef): Toy[] {
    let best = [...phase.line]
    for (let tries = 0; tries < 60; tries++) {
        const line = Phaser.Utils.Array.Shuffle([...phase.line])
        if (approves(phase.stamp, line[0])) continue
        best = line
        if (adjacentApproved(phase, line) <= 1) return line
    }
    return best
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.phases.length < 1 || level.phases.length > 5) problems.push(`${tag}: ${level.phases.length} fases`)
        if (level.spacing < level.zone + 30) problems.push(`${tag}: dois brinquedos cabem na zona`)
        const inZone = level.zone / level.speed
        if (inZone < 2.5 || inZone > 3.5) problems.push(`${tag}: ${inZone.toFixed(1)} s na zona`)

        level.phases.forEach((phase, i) => {
            const where = `${tag}/${phase.id}`
            const allowed = ATTRIBUTES_OF[phase.collection]
            const windows = WINDOWS_BY_LEVEL[level.level]
            if (windows && phase.stamp.length !== windows) problems.push(`${where}: o N${level.level} tem ${windows} janelinhas`)
            if (new Set(phase.stamp.map(rule => rule.attribute)).size !== phase.stamp.length) {
                problems.push(`${where}: atributo repetido no carimbo`)
            }
            phase.stamp.forEach(rule => {
                if (!allowed.includes(rule.attribute)) problems.push(`${where}: ${rule.attribute} não é de ${phase.collection}`)
            })
            if (phase.line.some(toy => toy.collection !== phase.collection)) problems.push(`${where}: coleção misturada`)
            if (phase.line.length !== level.lineSize) problems.push(`${where}: ${phase.line.length} brinquedos`)

            if (level.build) {
                const note = phase.note
                const options = phase.options
                if (!note || !options) problems.push(`${where}: falta bilhete ou opções para montar`)
                else {
                    if (note.drawing.collection !== phase.collection) problems.push(`${where}: desenho de outra coleção`)
                    if (!approves(phase.stamp, note.drawing)) problems.push(`${where}: o desenho do bilhete não passa no carimbo`)
                    if (options.length !== phase.stamp.length) problems.push(`${where}: opções para ${options.length} janelinhas`)
                    options.forEach((list, k) => {
                        if (list.length !== 3) problems.push(`${where}: janelinha ${k + 1} com ${list.length} opções`)
                        if (list.filter(rule => sameRule(rule, phase.stamp[k])).length !== 1) {
                            problems.push(`${where}: janelinha ${k + 1} sem exatamente uma certa`)
                        }
                        if (list.some(rule => !sameRule(rule, phase.stamp[k]) && phase.stamp.some(s => sameRule(s, rule)))) {
                            problems.push(`${where}: janelinha ${k + 1} oferece a resposta de outra janelinha`)
                        }
                        if (new Set(list.map(rule => `${rule.attribute}:${String(rule.value)}`)).size !== list.length) {
                            problems.push(`${where}: janelinha ${k + 1} com opção repetida`)
                        }
                        list.forEach(rule => {
                            if (!allowed.includes(rule.attribute)) problems.push(`${where}: opção ${rule.attribute} não é de ${phase.collection}`)
                        })
                    })
                    const spare = allowed.filter(attribute => !phase.stamp.some(rule => rule.attribute === attribute))
                    const decoy = options.flat().some(rule => spare.includes(rule.attribute) && matches(rule, note.drawing))
                    if (spare.length && !decoy) problems.push(`${where}: nenhuma opção traz o que o desenho tem e não importa`)
                    phase.stamp.forEach(rule => {
                        if (!note.text.toUpperCase().includes(ruleWordStem(rule))) {
                            problems.push(`${where}: o bilhete não diz ${rule.attribute}`)
                        }
                    })
                }
            }

            const approved = phase.line.filter(toy => approves(phase.stamp, toy))
            if (approved.length !== level.target) problems.push(`${where}: ${approved.length} aprovados`)

            phase.stamp.forEach((_, k) => {
                const onlyThisFails = phase.line.some(toy => {
                    const result = check(phase.stamp, toy)
                    return !result[k] && result.every((ok, j) => j === k || ok)
                })
                if (!onlyThisFails) problems.push(`${where}: falta distrator que só erra a janelinha ${k + 1}`)
            })

            if (level.level === 3) {
                const nearMisses = phase.line.filter(toy => check(phase.stamp, toy).filter(ok => !ok).length === 1)
                if (nearMisses.length < 2) problems.push(`${where}: menos de 2 quase iguais`)
            }

            allowed
                .filter(attribute => !phase.stamp.some(rule => rule.attribute === attribute))
                .forEach(attribute => {
                    if (new Set(approved.map(toy => toy[attribute])).size < 2) {
                        problems.push(`${where}: ${attribute} não varia nos aprovados (vira pista)`)
                    }
                })

            if (i === level.phases.length - 1 && level.level === 1) {
                const earlier = level.phases.slice(0, i).find(other => other.collection === phase.collection)
                if (!earlier) problems.push(`${where}: a última fase deveria repetir uma coleção`)
                else if (sameStamp(earlier.stamp, phase.stamp)) problems.push(`${where}: carimbo igual ao da ${earlier.id}`)
            }
        })
    })
    const first = levels[0]?.phases[0]
    if (first) {
        if (TRAINING.some(toy => toy.collection !== first.collection)) problems.push('treino: coleção diferente da fase 1')
        if (approves(first.stamp, TRAINING[0])) problems.push('treino: o 1º brinquedo deveria ser recusado')
        if (!approves(first.stamp, TRAINING[1])) problems.push('treino: o 2º brinquedo deveria ser aprovado')
    }
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[fabrica-de-carimbos]', PROBLEMS)
