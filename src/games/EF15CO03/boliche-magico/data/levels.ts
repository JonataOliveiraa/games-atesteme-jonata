import type { Attr, Color, LevelDef, Literal, Op, Pin, PhaseDef, Rack, Sentence, Size, Teach, Term } from '../types'
import { fits, literals, literalHolds, sameTerm } from './logic'

export const POINTS = 10

export const guideKey = (level: number) => `ef15co03-boliche-l${level}`
export const OPENING_KEY = 'ef15co03-boliche-opening'

const pin = (color: Color, star: boolean, glasses: boolean, sleepy: boolean, size: Size = 'grande'): Pin => ({
    color,
    star,
    glasses,
    size,
    sleepy,
})

const COLOR = (value: Color): Term => ({ attr: 'color', value })
const STAR: Term = { attr: 'star' }
const GLASSES: Term = { attr: 'glasses' }
const SIZE = (value: Size): Term => ({ attr: 'size', value })

const yes = (term: Term): Literal => ({ not: false, term })
const no = (term: Term): Literal => ({ not: true, term })

const N1: LevelDef = {
    level: 1,
    title: 'O NÃO troca quem cai',
    message: 'A frase da bola derruba quem ela vale. E o NÃO troca a resposta: quem caía fica de pé, e quem ficava de pé cai.',
    phases: [
        {
            id: 'estrela',
            teach: 'build',
            rack: {
                kind: 'one',
                cards: [GLASSES, STAR],
                not: false,
                pins: [
                    pin('verde', false, true, false),
                    pin('verde', true, false, true),
                    pin('verde', false, false, false),
                    pin('verde', true, true, true),
                ],
            },
            demo: {
                rack: {
                    kind: 'one',
                    cards: [COLOR('azul'), GLASSES],
                    not: false,
                    pins: [
                        pin('azul', false, true, true),
                        pin('vermelho', false, true, false),
                        pin('azul', false, false, true),
                        pin('vermelho', false, false, false),
                    ],
                },
                script: { left: { not: false, term: COLOR('azul') } },
            },
        },
        {
            id: 'nao-oculos',
            teach: 'not',
            rack: {
                kind: 'one',
                cards: [GLASSES],
                not: true,
                pins: [
                    pin('azul', true, false, true),
                    pin('azul', true, true, false),
                    pin('azul', false, true, false),
                    pin('azul', false, false, true),
                ],
            },
            demo: {
                rack: {
                    kind: 'one',
                    cards: [COLOR('vermelho')],
                    not: true,
                    pins: [
                        pin('vermelho', true, false, false),
                        pin('verde', false, false, true),
                        pin('verde', true, false, true),
                        pin('vermelho', false, false, false),
                    ],
                },
                script: { left: { not: true, term: COLOR('vermelho') } },
            },
        },
        {
            id: 'nao-azul',
            rack: {
                kind: 'one',
                cards: [COLOR('azul'), STAR],
                not: true,
                pins: [
                    pin('azul', true, false, false),
                    pin('verde', false, false, true),
                    pin('azul', false, false, false),
                    pin('vermelho', true, false, true),
                ],
            },
        },
        {
            id: 'oculos',
            rack: {
                kind: 'one',
                cards: [COLOR('verde'), GLASSES],
                not: true,
                pins: [
                    pin('verde', false, true, true),
                    pin('vermelho', false, false, false),
                    pin('verde', false, false, false),
                    pin('azul', false, true, true),
                ],
            },
        },
        {
            id: 'nao-estrela',
            rack: {
                kind: 'one',
                cards: [COLOR('vermelho'), STAR],
                not: true,
                pins: [
                    pin('vermelho', true, true, false),
                    pin('azul', true, true, false),
                    pin('vermelho', false, true, true),
                    pin('verde', true, true, false),
                ],
            },
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'O E e o OU juntam duas partes',
    message: 'O E só derruba quem tem as duas partes. O OU derruba quem tem uma ou a outra.',
    phases: [
        {
            id: 'pequeno-e-oculos',
            teach: 'e',
            rack: {
                kind: 'join',
                left: SIZE('pequeno'),
                right: GLASSES,
                pins: [
                    pin('azul', false, true, true, 'pequeno'),
                    pin('verde', false, false, false, 'pequeno'),
                    pin('azul', false, true, false),
                    pin('vermelho', false, true, true, 'pequeno'),
                    pin('vermelho', false, false, false),
                ],
            },
            demo: {
                rack: {
                    kind: 'join',
                    left: COLOR('azul'),
                    right: STAR,
                    pins: [
                        pin('verde', true, false, false),
                        pin('azul', true, true, true),
                        pin('azul', false, true, false),
                        pin('vermelho', false, true, false),
                        pin('azul', true, false, true),
                    ],
                },
                script: { left: yes(COLOR('azul')), op: 'e', right: yes(STAR) },
            },
        },
        {
            id: 'verde-ou-estrela',
            teach: 'ou',
            rack: {
                kind: 'join',
                left: COLOR('verde'),
                right: STAR,
                pins: [
                    pin('verde', false, false, true),
                    pin('azul', true, false, true, 'pequeno'),
                    pin('vermelho', false, false, false),
                    pin('azul', false, false, false, 'pequeno'),
                    pin('vermelho', true, false, true),
                ],
            },
            demo: {
                rack: {
                    kind: 'join',
                    left: SIZE('grande'),
                    right: GLASSES,
                    pins: [
                        pin('azul', false, true, true, 'pequeno'),
                        pin('verde', false, false, false, 'pequeno'),
                        pin('azul', false, false, true),
                        pin('azul', false, false, false, 'pequeno'),
                        pin('vermelho', false, false, true),
                    ],
                },
                script: { left: yes(SIZE('grande')), op: 'ou', right: yes(GLASSES) },
            },
        },
        {
            id: 'azul-ou-pequeno',
            rack: {
                kind: 'join',
                left: COLOR('azul'),
                right: SIZE('pequeno'),
                pins: [
                    pin('vermelho', true, true, false),
                    pin('azul', false, true, true),
                    pin('verde', false, true, false),
                    pin('verde', true, true, true, 'pequeno'),
                    pin('azul', true, true, true, 'pequeno'),
                ],
            },
        },
        {
            id: 'estrela-e-oculos',
            rack: {
                kind: 'join',
                left: STAR,
                right: GLASSES,
                pins: [
                    pin('verde', false, true, false, 'pequeno'),
                    pin('azul', true, false, false, 'pequeno'),
                    pin('azul', true, true, true, 'pequeno'),
                    pin('vermelho', false, false, false, 'pequeno'),
                    pin('vermelho', true, true, true, 'pequeno'),
                ],
            },
        },
        {
            id: 'oculos-ou-vermelho',
            rack: {
                kind: 'join',
                left: GLASSES,
                right: COLOR('vermelho'),
                pins: [
                    pin('vermelho', true, false, true),
                    pin('azul', true, true, true, 'pequeno'),
                    pin('verde', true, false, false),
                    pin('azul', true, false, false),
                    pin('verde', true, true, true),
                ],
            },
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'O NÃO dentro do E e do OU',
    message: 'Cada NÃO vira só a sua parte. Depois o E ou o OU junta as duas, como antes.',
    phases: [
        {
            id: 'nao-verde-e-estrela',
            teach: 'nots',
            rack: {
                kind: 'nots',
                left: COLOR('verde'),
                right: STAR,
                op: 'e',
                pins: [
                    pin('azul', true, false, true),
                    pin('verde', true, true, false),
                    pin('vermelho', false, true, false),
                    pin('vermelho', true, true, true),
                    pin('verde', false, false, false),
                ],
            },
            demo: {
                rack: {
                    kind: 'nots',
                    left: GLASSES,
                    right: COLOR('vermelho'),
                    op: 'e',
                    pins: [
                        pin('azul', false, true, true),
                        pin('vermelho', false, true, false, 'pequeno'),
                        pin('verde', false, false, false),
                        pin('vermelho', false, false, false),
                        pin('verde', false, true, true, 'pequeno'),
                    ],
                },
                script: { left: yes(GLASSES), op: 'e', right: no(COLOR('vermelho')) },
            },
        },
        {
            id: 'grande-ou-nao-oculos',
            rack: {
                kind: 'nots',
                left: SIZE('grande'),
                right: GLASSES,
                op: 'ou',
                pins: [
                    pin('azul', true, true, false, 'pequeno'),
                    pin('verde', true, true, true),
                    pin('vermelho', true, false, true, 'pequeno'),
                    pin('verde', true, true, false, 'pequeno'),
                    pin('azul', true, false, true),
                ],
            },
        },
        {
            id: 'azul-e-nao-grande',
            rack: {
                kind: 'nots',
                left: COLOR('azul'),
                right: SIZE('grande'),
                op: 'e',
                pins: [
                    pin('azul', true, true, true, 'pequeno'),
                    pin('azul', false, true, false),
                    pin('verde', false, true, false, 'pequeno'),
                    pin('azul', false, true, true, 'pequeno'),
                    pin('vermelho', true, true, false),
                ],
            },
        },
        {
            id: 'nao-estrela-ou-pequeno',
            rack: {
                kind: 'nots',
                left: STAR,
                right: SIZE('pequeno'),
                op: 'ou',
                pins: [
                    pin('verde', true, false, false),
                    pin('azul', false, false, true),
                    pin('vermelho', true, false, true, 'pequeno'),
                    pin('azul', true, false, false),
                    pin('verde', false, false, true, 'pequeno'),
                ],
            },
        },
        {
            id: 'nao-vermelho-e-nao-oculos',
            rack: {
                kind: 'nots',
                left: COLOR('vermelho'),
                right: GLASSES,
                op: 'e',
                pins: [
                    pin('vermelho', true, false, false, 'pequeno'),
                    pin('verde', true, true, false),
                    pin('azul', true, false, true),
                    pin('verde', true, false, true, 'pequeno'),
                    pin('vermelho', true, true, false),
                ],
            },
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

const ATTRS: Attr[] = ['color', 'star', 'glasses', 'size']

const PIN_COUNT: Record<number, number> = { 1: 4, 2: 5, 3: 5 }
const VARYING: Record<number, number> = { 1: 2, 2: 3, 3: 3 }
const KIND: Record<number, Rack['kind']> = { 1: 'one', 2: 'join', 3: 'nots' }
const TEACH_OF: Record<number, Teach[]> = { 1: ['build', 'not'], 2: ['e', 'ou'], 3: ['nots'] }

const pinKey = (p: Pin) => ATTRS.map(a => String(p[a])).join('|')

const terms = (rack: Rack): Term[] => (rack.kind === 'one' ? rack.cards : [rack.left, rack.right])

const pair = (left: Literal, op: Op, right: Literal): Sentence => ({ left, op, right })

export function sentences(rack: Rack): Sentence[] {
    if (rack.kind === 'one')
        return rack.cards.flatMap(term => (rack.not ? [{ left: yes(term) }, { left: no(term) }] : [{ left: yes(term) }]))
    if (rack.kind === 'join') {
        const { left, right } = rack
        return (['e', 'ou'] as Op[]).map(op => pair(yes(left), op, yes(right)))
    }
    const { left, right, op } = rack
    return [false, true].flatMap(nl => [false, true].map(nr => pair({ not: nl, term: left }, op, { not: nr, term: right })))
}

export const solutions = (rack: Rack) => sentences(rack).filter(s => fits(s, rack.pins))

const sameLiteral = (a?: Literal, b?: Literal) => a === b || (!!a && !!b && a.not === b.not && sameTerm(a.term, b.term))

const sameSentence = (a: Sentence, b: Sentence) =>
    sameLiteral(a.left, b.left) && a.op === b.op && sameLiteral(a.right, b.right)

const sleepyPattern = (rack: Rack) =>
    rack.pins
        .map((p, i) => (p.sleepy ? i : -1))
        .filter(i => i >= 0)
        .join()

function checkTraps(tag: string, rack: Rack, answer: Sentence, problems: string[]) {
    const { left, right } = answer
    if (!right) return
    const sleepy = answer.op === 'ou'
    const onlyBy = (a: Literal, b: Literal) =>
        rack.pins.some(p => p.sleepy === sleepy && literalHolds(p, a) && !literalHolds(p, b))
    const word = sleepy ? 'com sono' : 'acordado'
    if (!onlyBy(left, right)) problems.push(`${tag}: falta pino ${word} só pela esquerda`)
    if (!onlyBy(right, left)) problems.push(`${tag}: falta pino ${word} só pela direita`)
}

function checkRack(tag: string, rack: Rack, level: number, problems: string[]) {
    const size = PIN_COUNT[level]
    if (rack.kind !== KIND[level]) problems.push(`${tag}: o N${level} usa '${KIND[level]}', e não '${rack.kind}'`)
    if (rack.pins.length !== size) problems.push(`${tag}: tem ${rack.pins.length} pinos, e não ${size}`)
    if (new Set(rack.pins.map(pinKey)).size !== rack.pins.length) problems.push(`${tag}: pino repetido`)
    const sleepy = rack.pins.filter(p => p.sleepy).length
    if (sleepy < 1 || sleepy > rack.pins.length - 1) problems.push(`${tag}: ${sleepy} pinos com sono`)
    const varying = ATTRS.filter(a => new Set(rack.pins.map(p => String(p[a]))).size > 1)
    if (varying.length !== VARYING[level]) problems.push(`${tag}: mudam ${varying.length} atributos, e não ${VARYING[level]}`)
    const list = terms(rack)
    list.forEach(t => {
        if (!varying.includes(t.attr)) problems.push(`${tag}: a peça de ${t.attr} não muda nos pinos`)
    })
    list.forEach((t, i) => {
        if (list.some((u, j) => j < i && sameTerm(t, u))) problems.push(`${tag}: peça repetida`)
    })
    if (rack.kind !== 'one' && rack.left.attr === rack.right.attr) problems.push(`${tag}: as duas partes falam do mesmo atributo`)
    const found = solutions(rack)
    if (found.length !== 1) {
        problems.push(`${tag}: ${found.length} frases resolvem, e não 1`)
        return undefined
    }
    const answer = found[0]
    if (rack.kind === 'nots' && !answer.left.not && !answer.right?.not) problems.push(`${tag}: a frase certa não tem NÃO`)
    if (rack.kind === 'join') checkTraps(tag, rack, answer, problems)
    return answer
}

function checkDemo(tag: string, phase: PhaseDef, level: number, pattern: string, problems: string[]) {
    const demo = phase.demo
    if (!demo) return
    const dtag = `${tag} (demonstração)`
    const answer = checkRack(dtag, demo.rack, level, problems)
    if (!fits(demo.script, demo.rack.pins)) problems.push(`${dtag}: o roteiro não resolve`)
    if (answer && !sameSentence(answer, demo.script)) problems.push(`${dtag}: o roteiro não é a frase que dá para montar`)
    if (sleepyPattern(demo.rack) === pattern) problems.push(`${dtag}: os com sono estão no mesmo lugar da fase`)
    const parts = literals(demo.script)
    if (parts.length !== (level === 1 ? 1 : 2)) problems.push(`${dtag}: o roteiro tem ${parts.length} partes`)
    if (phase.teach === 'not' && !demo.script.left.not) problems.push(`${dtag}: ensina o NÃO sem NÃO no roteiro`)
    if (phase.teach === 'not' && (demo.rack.kind !== 'one' || !demo.rack.not)) problems.push(`${dtag}: ensina o NÃO sem o botão NÃO`)
    if ((phase.teach === 'e' || phase.teach === 'ou') && demo.script.op !== phase.teach)
        problems.push(`${dtag}: ensina o ${phase.teach.toUpperCase()} com outro operador no roteiro`)
    if (phase.teach === 'nots' && parts.filter(l => l.not).length !== 1) problems.push(`${dtag}: o roteiro tem de ter NÃO numa parte só`)
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const lv = level.level
        const answers: (Sentence | undefined)[] = []
        let prevPattern = ''
        if (level.phases.length !== 5) problems.push(`N${lv}: tem ${level.phases.length} fases, e não 5`)
        level.phases.forEach((phase: PhaseDef, pi) => {
            const tag = `N${lv} ${phase.id}`
            const rack = phase.rack
            answers.push(checkRack(tag, rack, lv, problems))
            const expected = TEACH_OF[lv]?.[pi]
            if (phase.teach !== expected) problems.push(`${tag}: ensina '${phase.teach ?? '-'}', e não '${expected ?? '-'}'`)
            if (rack.kind === 'one') {
                if (rack.cards.length < 1 || rack.cards.length > 2) problems.push(`${tag}: o N1 tem 1 ou 2 cartas`)
                if (rack.pins.some(p => p.size !== 'grande')) problems.push(`${tag}: no N1 todo pino é grande`)
                if (pi === 0 && rack.not) problems.push(`${tag}: a 1ª fase do N1 não tem NÃO`)
                if (pi > 0 && !rack.not) problems.push(`${tag}: as fases 2 a 5 do N1 têm NÃO`)
            }
            const pattern = sleepyPattern(rack)
            if (pattern === prevPattern) problems.push(`${tag}: os com sono estão no mesmo lugar da fase anterior`)
            prevPattern = pattern
            if (phase.teach && !phase.demo) problems.push(`${tag}: ensina sem demonstração`)
            checkDemo(tag, phase, lv, pattern, problems)
        })
        const found = answers.filter((a): a is Sentence => !!a)
        if (lv === 1) {
            const notAnswers = answers.slice(1).flatMap(a => (a ? [a.left.not] : []))
            if (!notAnswers.includes(true) || !notAnswers.includes(false))
                problems.push(`N1: precisa de fase com NÃO na resposta e de fase sem NÃO`)
            const sides = level.phases.flatMap((p, i) => {
                const a = answers[i]
                return a && p.rack.kind === 'one' && p.rack.cards.length > 1
                    ? [p.rack.cards.findIndex(t => sameTerm(t, a.left.term))]
                    : []
            })
            if (sides.length > 1 && new Set(sides).size < 2) problems.push(`N1: a carta certa está sempre do mesmo lado`)
        }
        if (lv === 2) {
            const late = answers.slice(2).map(a => a?.op)
            if (!late.includes('e') || !late.includes('ou')) problems.push(`N2: as fases 3 a 5 precisam de E e de OU na resposta`)
        }
        if (lv === 3) {
            const leftOnly = found.filter(a => a.left.not && !a.right?.not).length
            const rightOnly = found.filter(a => !a.left.not && a.right?.not).length
            const both = found.filter(a => a.left.not && a.right?.not).length
            if (!leftOnly) problems.push(`N3: falta fase com o NÃO só na esquerda`)
            if (!rightOnly) problems.push(`N3: falta fase com o NÃO só na direita`)
            if (both > 1) problems.push(`N3: ${both} fases com NÃO nas duas partes`)
            const ops = found.map(a => a.op)
            if (!ops.includes('e') || !ops.includes('ou')) problems.push(`N3: o operador precisa aparecer E e OU`)
        }
    })
    if (problems.length) throw new Error(`Boliche Mágico — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
