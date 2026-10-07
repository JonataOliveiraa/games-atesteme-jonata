import type { Critter, HotWord, LevelDef, PhaseDef, Sentence } from '../types'
import { hotWord, sentenceText } from './words'

export const POINTS = 10
export const MAX_PHASES = 5
export const MAX_TEXT = 44
export const READY = 1

export const CRITTERS: Critter[] = ['sapo', 'coelho', 'pato']

export const guideKey = (level: number) => `ef03co01-ponte-l${level}`

const start = (marks: string) => [...marks].map(m => m === 'x')

const phase = (sentence: Sentence, marks: string): PhaseDef => ({ sentence, start: start(marks) })

export const ALL_LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'A placa diz como está',
        message: 'A ponte só desceu quando a frase era verdade.',
        fresh: [],
        phases: [
            phase({ form: 'one', subject: 'sapo', item: 'chapeu' }, '.x.'),
            phase({ form: 'one', subject: 'pato', item: 'guardachuva' }, 'x..'),
            phase({ form: 'one', subject: 'sapo', item: 'balao' }, 'x.x'),
            phase({ form: 'one', subject: 'coelho', item: 'chapeu' }, '..x'),
        ],
    },
    {
        level: 2,
        title: 'O NÃO vira a frase',
        message: 'Com o NÃO, a mesma cena pede o contrário.',
        fresh: ['NÃO'],
        phases: [
            phase({ form: 'one', subject: 'sapo', item: 'chapeu', not: true }, 'x.x'),
            phase({ form: 'one', subject: 'pato', item: 'balao', not: true }, '.xx'),
            phase({ form: 'one', subject: 'coelho', item: 'guardachuva' }, 'x..'),
            phase({ form: 'one', subject: 'pato', item: 'chapeu', not: true }, 'xx.'),
        ],
    },
    {
        level: 3,
        title: 'TODOS e NENHUM',
        message: 'TODOS é cada um dos três. NENHUM é nem um só.',
        fresh: ['TODOS', 'NENHUM'],
        phases: [
            phase({ form: 'all', item: 'chapeu' }, '.x.'),
            phase({ form: 'none', item: 'guardachuva' }, 'x.x'),
            phase({ form: 'one', subject: 'sapo', item: 'balao', not: true }, 'xx.'),
            phase({ form: 'all', item: 'guardachuva' }, 'xxx'),
        ],
    },
]

export const LEVELS: LevelDef[] = ALL_LEVELS.slice(0, READY)

const at = (c: Critter) => CRITTERS.indexOf(c)

export function wanted(s: Sentence): (boolean | null)[] {
    if (s.form === 'all') return CRITTERS.map(() => true)
    if (s.form === 'none') return CRITTERS.map(() => false)
    const i = at(s.subject ?? 'sapo')
    return CRITTERS.map((_, k) => (k === i ? !s.not : null))
}

export function wrongOnes(s: Sentence, state: boolean[]): number[] {
    return wanted(s).flatMap((want, k) => (want !== null && state[k] !== want ? [k] : []))
}

export const isTrue = (s: Sentence, state: boolean[]) => wrongOnes(s, state).length === 0

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const known = new Set<HotWord>()
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.phases.length > MAX_PHASES) problems.push(`${tag}: ${level.phases.length} fases`)
        level.fresh.forEach(word => known.add(word))
        let alreadyTrue = 0
        level.phases.forEach((p, i) => {
            const at = `${tag}/fase ${i + 1}`
            const s = p.sentence
            const word = hotWord(s)
            if (p.start.length !== CRITTERS.length) problems.push(`${at}: começo com ${p.start.length} bichinhos`)
            if (word && !known.has(word)) problems.push(`${at}: ${word} antes de estrear`)
            if (sentenceText(s).length > MAX_TEXT) problems.push(`${at}: frase longa demais para a placa`)
            if (i > 0 && level.phases[i - 1].sentence.item === s.item) problems.push(`${at}: mesma coisa da fase anterior`)
            if (s.form === 'one' && (p.start.every(Boolean) || p.start.every(v => !v))) problems.push(`${at}: a cena não mostra os dois jeitos`)
            if (isTrue(s, p.start)) {
                alreadyTrue += 1
                if (i === 0) problems.push(`${at}: a 1ª fase não pode começar verdadeira`)
            }
        })
        if (alreadyTrue !== 1) problems.push(`${tag}: ${alreadyTrue} fases começam verdadeiras (tem de ser 1)`)
        if (level.fresh.length) {
            const first = hotWord(level.phases[0].sentence)
            if (!first || !level.fresh.includes(first)) problems.push(`${tag}: a 1ª fase não estreia a palavra nova`)
            level.fresh.forEach(word => {
                if (!level.phases.some(p => hotWord(p.sentence) === word)) problems.push(`${tag}: ${word} não aparece`)
            })
            if (!level.phases.some(p => !level.fresh.includes(hotWord(p.sentence) as HotWord))) {
                problems.push(`${tag}: toda fase usa a palavra nova (falta mistura)`)
            }
        } else if (level.phases.some(p => hotWord(p.sentence))) problems.push(`${tag}: negação num nível sem estreia`)
    })
    const [one, two] = levels
    if (one && two) {
        const a = one.phases[0].sentence
        const b = two.phases[0].sentence
        if (a.subject !== b.subject || a.item !== b.item) problems.push('N2/fase 1: não é o par da N1/fase 1')
    }
    return problems
}

const PROBLEMS = validateLevels(ALL_LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[ponte-do-verdadeiro]', PROBLEMS)
