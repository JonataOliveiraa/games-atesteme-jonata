import type { Beats, ClueDef, CodeDef, CodeId, Hue, LevelDef, Mark } from '../types'
import { FISH, SCHOOL, W } from './layout'

export const POINTS = 10
export const GUIDE_KEY = 'ef01co05-l1'
export const MIN_LIT_S = 1.4

const beats = (n: Beats): Mark => ({ kind: 'beats', n })
const hue = (h: Hue): Mark => ({ kind: 'hue', hue: h })

export const CODES: Record<CodeId, CodeDef> = {
    'beats-hue': {
        id: 'beats-hue',
        pairs: [
            [beats(1), hue('red')],
            [beats(2), hue('blue')],
            [beats(3), hue('yellow')],
        ],
    },
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        code: 'beats-hue',
        clues: 5,
        schoolSize: 4,
        legend: 'always',
        speed: 120,
        spacing: 365,
        beam: 190,
    },
]

export const TRAINING: ClueDef = {
    clue: beats(1),
    school: [hue('blue'), hue('red'), hue('yellow'), hue('blue')],
}

export const markKey = (mark: Mark): string => (mark.kind === 'beats' ? `beats-${mark.n}` : `hue-${mark.hue}`)

export const sameMark = (a: Mark, b: Mark): boolean => markKey(a) === markKey(b)

export function translate(code: CodeId, clue: Mark): Mark {
    const pair = CODES[code].pairs.find(([from]) => sameMark(from, clue))
    if (!pair) throw new Error(`[pescaria-dos-codigos] pista ${markKey(clue)} fora do código ${code}`)
    return pair[1]
}

export const isRight = (code: CodeId, clue: Mark, mark: Mark): boolean => sameMark(translate(code, clue), mark)

export const pairIndex = (code: CodeId, clue: Mark): number =>
    CODES[code].pairs.findIndex(([from]) => sameMark(from, clue))

export const loopLength = (level: LevelDef): number => level.spacing * level.schoolSize

export const maxX = (level: LevelDef): number => SCHOOL.minX + loopLength(level)

export function fishInBeam(xs: (number | null)[], beamX: number, beam: number): number | null {
    let best: number | null = null
    let bestDistance = beam / 2
    xs.forEach((x, i) => {
        if (x === null) return
        const distance = Math.abs(x - beamX)
        if (distance <= bestDistance) {
            best = i
            bestDistance = distance
        }
    })
    return best
}

const pick = <T>(list: readonly T[], random: () => number): T => list[Math.floor(random() * list.length)]

export const shuffled = <T>(list: T[], random: () => number = Math.random): T[] => {
    const out = [...list]
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
}

function dealClues(level: LevelDef, random: () => number): Mark[] {
    const sources = CODES[level.code].pairs.map(([from]) => from)
    for (;;) {
        const out: Mark[] = []
        for (let i = 0; i < level.clues; i++) {
            const options = sources.filter(s => !out.length || !sameMark(s, out[out.length - 1]))
            out.push(pick(options, random))
        }
        if (sources.every(s => out.some(m => sameMark(m, s)))) return out
    }
}

function dealSchool(level: LevelDef, clue: Mark, rightAt: number, random: () => number): Mark[] {
    const right = translate(level.code, clue)
    const wrongs = CODES[level.code].pairs.map(([, to]) => to).filter(to => !sameMark(to, right))
    const fillers = shuffled([...wrongs, ...Array.from({ length: level.schoolSize - 1 - wrongs.length }, () => pick(wrongs, random))], random)
    fillers.splice(rightAt, 0, right)
    return fillers
}

export function deal(level: LevelDef, random: () => number = Math.random): ClueDef[] {
    const clues = dealClues(level, random)
    let previous = -1
    return clues.map((clue, i) => {
        const spots = Array.from({ length: level.schoolSize }, (_, k) => k).filter(k => k !== previous && (i > 0 || k !== 0))
        const rightAt = pick(spots, random)
        previous = rightAt
        return { clue, school: dealSchool(level, clue, rightAt, random) }
    })
}

export const rightIndex = (level: LevelDef, clue: ClueDef): number =>
    clue.school.findIndex(mark => isRight(level.code, clue.clue, mark))

function checkClue(level: LevelDef, clue: ClueDef, where: string, problems: string[]) {
    const code = CODES[level.code]
    const inCode = (mark: Mark, side: 0 | 1) => code.pairs.some(pair => sameMark(pair[side], mark))
    if (!inCode(clue.clue, 0)) problems.push(`${where}: pista fora do código`)
    if (clue.school.some(mark => mark.kind === clue.clue.kind)) problems.push(`${where}: pista e resposta no mesmo código`)
    if (clue.school.length !== level.schoolSize) problems.push(`${where}: ${clue.school.length} peixes`)
    if (clue.school.some(mark => !inCode(mark, 1))) problems.push(`${where}: peixe com marca fora do código`)
    const rights = clue.school.filter(mark => isRight(level.code, clue.clue, mark)).length
    if (rights !== 1) problems.push(`${where}: ${rights} peixes certos`)
    const wrongKinds = new Set(clue.school.filter(mark => !isRight(level.code, clue.clue, mark)).map(markKey))
    if (wrongKinds.size !== code.pairs.length - 1) problems.push(`${where}: os errados não usam as outras marcas do código`)
}

export function checkDeal(level: LevelDef, clues: ClueDef[], tag: string): string[] {
    const problems: string[] = []
    if (clues.length !== level.clues) problems.push(`${tag}: ${clues.length} pistas`)
    clues.forEach((clue, i) => {
        const where = `${tag}/pista ${i + 1}`
        checkClue(level, clue, where, problems)
        if (i > 0 && sameMark(clue.clue, clues[i - 1].clue)) problems.push(`${where}: pista repetida em seguida`)
        if (i > 0 && rightIndex(level, clue) === rightIndex(level, clues[i - 1])) problems.push(`${where}: certo no mesmo lugar da anterior`)
    })
    if (clues.length && rightIndex(level, clues[0]) === 0) problems.push(`${tag}: o certo é o primeiro a passar na 1ª pista`)
    const sources = CODES[level.code].pairs.map(([from]) => from)
    if (!sources.every(s => clues.some(c => sameMark(c.clue, s)))) problems.push(`${tag}: falta alguma pista do código`)
    return problems
}

const seeded = (seed: number) => {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.clues < 1 || level.clues > 5) problems.push(`${tag}: ${level.clues} pistas`)
        if (CODES[level.code].pairs.length > 3) problems.push(`${tag}: mais de 3 símbolos no código`)
        if (level.spacing < level.beam + FISH.w / 2) problems.push(`${tag}: dois peixes podem ficar acesos juntos`)
        if (level.beam / level.speed < MIN_LIT_S) problems.push(`${tag}: peixe aceso por menos de ${MIN_LIT_S} s`)
        if (loopLength(level) < W + FISH.w) problems.push(`${tag}: a volta da fila aparece na tela`)
        if (level.level === 1 && level.legend !== 'always') problems.push(`${tag}: legenda tem de ficar sempre à vista`)
        for (let seed = 1; seed <= 60; seed++) problems.push(...checkDeal(level, deal(level, seeded(seed)), `${tag}#${seed}`))
    })
    const training = LEVELS[0]
    if (training) {
        checkClue(training, TRAINING, 'treino', problems)
        if (rightIndex(training, TRAINING) === 0) problems.push('treino: o certo tem de passar depois de um errado')
    }
    return [...new Set(problems)]
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[pescaria-dos-codigos]', PROBLEMS)
