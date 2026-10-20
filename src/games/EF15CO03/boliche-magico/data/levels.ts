import type { Attr, Color, LevelDef, Pin, PhaseDef, Rack, Sentence, Size, Term } from '../types'
import { fits, literals, sameTerm } from './logic'

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

const N1: LevelDef = {
    level: 1,
    title: 'O NÃO troca quem cai',
    message: 'A frase da bola derruba quem ela vale. E o NÃO troca a resposta: quem caía fica de pé, e quem ficava de pé cai.',
    phases: [
        {
            id: 'estrela',
            teach: 'build',
            rack: {
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

export const LEVELS: LevelDef[] = [N1]

const ATTRS: Attr[] = ['color', 'star', 'glasses', 'size']

const pinKey = (p: Pin) => ATTRS.map(a => String(p[a])).join('|')

export function sentences(rack: Rack): Sentence[] {
    return rack.cards.flatMap(term => {
        const plain: Sentence = { left: { not: false, term } }
        return rack.not ? [plain, { left: { not: true, term } }] : [plain]
    })
}

export const solutions = (rack: Rack) => sentences(rack).filter(s => fits(s, rack.pins))

const sleepyPattern = (rack: Rack) =>
    rack.pins
        .map((p, i) => (p.sleepy ? i : -1))
        .filter(i => i >= 0)
        .join()

function checkRack(tag: string, rack: Rack, size: number, problems: string[]) {
    if (rack.pins.length !== size) problems.push(`${tag}: tem ${rack.pins.length} pinos, e não ${size}`)
    if (new Set(rack.pins.map(pinKey)).size !== rack.pins.length) problems.push(`${tag}: pino repetido`)
    const sleepy = rack.pins.filter(p => p.sleepy).length
    if (sleepy < 1 || sleepy > rack.pins.length - 1) problems.push(`${tag}: ${sleepy} pinos com sono`)
    const varying = ATTRS.filter(a => new Set(rack.pins.map(p => String(p[a]))).size > 1)
    if (varying.length !== 2) problems.push(`${tag}: mudam ${varying.length} atributos, e não 2`)
    rack.cards.forEach(t => {
        if (!varying.includes(t.attr)) problems.push(`${tag}: a carta de ${t.attr} não muda nos pinos`)
    })
    rack.cards.forEach((t, i) => {
        if (rack.cards.some((u, j) => j < i && sameTerm(t, u))) problems.push(`${tag}: carta repetida`)
    })
    const found = solutions(rack)
    if (found.length !== 1) problems.push(`${tag}: ${found.length} frases resolvem, e não 1`)
    return found[0]
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const notAnswers: boolean[] = []
        const answerSide: number[] = []
        let prevPattern = ''
        level.phases.forEach((phase: PhaseDef, pi) => {
            const tag = `N${level.level} ${phase.id}`
            const rack = phase.rack
            const answer = checkRack(tag, rack, 4, problems)
            if (level.level === 1) {
                if (rack.cards.length < 1 || rack.cards.length > 2) problems.push(`${tag}: o N1 tem 1 ou 2 cartas`)
                if (rack.pins.some(p => p.size !== 'grande')) problems.push(`${tag}: no N1 todo pino é grande`)
                if (pi === 0 && rack.not) problems.push(`${tag}: a 1ª fase do N1 não tem NÃO`)
                if (pi > 0 && !rack.not) problems.push(`${tag}: as fases 2 a 5 do N1 têm NÃO`)
            }
            if (answer) {
                if (pi > 0) notAnswers.push(answer.left.not)
                if (rack.cards.length > 1) answerSide.push(rack.cards.findIndex(t => sameTerm(t, answer.left.term)))
            }
            const pattern = sleepyPattern(rack)
            if (pattern === prevPattern) problems.push(`${tag}: os com sono estão no mesmo lugar da fase anterior`)
            prevPattern = pattern
            if (phase.teach && !phase.demo) problems.push(`${tag}: ensina sem demonstração`)
            if (phase.demo) {
                const dtag = `${tag} (demonstração)`
                const demoAnswer = checkRack(dtag, phase.demo.rack, 4, problems)
                if (!fits(phase.demo.script, phase.demo.rack.pins)) problems.push(`${dtag}: o roteiro não resolve`)
                if (demoAnswer && literals(phase.demo.script).length !== 1) problems.push(`${dtag}: o roteiro do N1 tem um termo`)
                if (sleepyPattern(phase.demo.rack) === pattern) problems.push(`${dtag}: os com sono estão no mesmo lugar da fase`)
                if (phase.teach === 'not' && !phase.demo.script.left.not) problems.push(`${dtag}: ensina o NÃO sem NÃO no roteiro`)
                if (phase.teach === 'not' && !phase.demo.rack.not) problems.push(`${dtag}: ensina o NÃO sem o botão NÃO`)
            }
        })
        if (level.level === 1) {
            if (!notAnswers.includes(true) || !notAnswers.includes(false))
                problems.push(`N1: precisa de fase com NÃO na resposta e de fase sem NÃO`)
            if (answerSide.length > 1 && new Set(answerSide).size < 2) problems.push(`N1: a carta certa está sempre do mesmo lado`)
        }
    })
    if (problems.length) throw new Error(`Boliche Mágico — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
