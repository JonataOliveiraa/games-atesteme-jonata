import type { DeviceId, LevelDef, Person, RoundDef, Side } from '../types'

export const POINTS = 10
export const GUIDE_KEY = 'ef01co06-l1'
export const MAX_ROUNDS = 5

export const HELPS: Record<DeviceId, Person[]> = {
    clock: ['sleeper'],
    lullaby: ['baby'],
    phone: ['missing-grandma'],
    tablet: ['bored'],
    dance: ['party'],
    'tablet-call': ['bored', 'missing-grandma'],
}

export const NEVER_BESIDE: Partial<Record<DeviceId, Person[]>> = {
    tablet: ['missing-grandma'],
    lullaby: ['bored'],
    dance: ['bored', 'baby', 'sleeper'],
    'tablet-call': ['baby'],
}

export const helps = (device: DeviceId, person: Person): boolean => HELPS[device].includes(person)

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        rounds: [
            { id: 'r1', device: 'clock', rooms: ['sleeper', 'baby'] },
            { id: 'r2', device: 'lullaby', rooms: ['baby', 'sleeper'] },
            { id: 'r3', device: 'phone', rooms: ['missing-grandma', 'baby'] },
            { id: 'r4', device: 'tablet', rooms: ['bored', 'sleeper'] },
        ],
    },
    {
        level: 2,
        rounds: [
            { id: 'n2-r1', device: 'dance', rooms: ['party', 'missing-grandma'] },
            { id: 'n2-r2', device: 'lullaby', rooms: ['baby', 'party'] },
            { id: 'n2-r3', device: 'clock', rooms: ['sleeper', 'party'] },
            { id: 'n2-r4', device: 'phone', rooms: ['missing-grandma', 'party'] },
        ],
    },
    {
        level: 3,
        rounds: [
            { id: 'n3-r1', device: 'tablet-call', rooms: ['bored', 'missing-grandma'] },
            { id: 'n3-r2', device: 'tablet-call', rooms: ['missing-grandma', 'sleeper'] },
            { id: 'n3-r3', device: 'tablet-call', rooms: ['bored', 'sleeper'] },
            { id: 'n3-r4', device: 'phone', rooms: ['missing-grandma', 'bored'] },
        ],
    },
]

export const TRAINING: RoundDef = { id: 'training', device: 'dance', rooms: ['party', 'sleeper'] }

export const helpedSides = (round: RoundDef): Side[] =>
    ([0, 1] as Side[]).filter(side => helps(round.device, round.rooms[side]))

export const isDouble = (round: RoundDef): boolean => helpedSides(round).length === 2

export const rightSide = (round: RoundDef): Side => helpedSides(round)[0] ?? 0

const MAX_SAME_SIDE = 2

export function deal(level: LevelDef, random: () => number = Math.random): RoundDef[] {
    const sides: (Side | null)[] = []
    return level.rounds.map(round => {
        if (isDouble(round)) {
            sides.push(null)
            const rooms: [Person, Person] = random() < 0.5 ? [round.rooms[0], round.rooms[1]] : [round.rooms[1], round.rooms[0]]
            return { ...round, rooms }
        }
        const right = rightSide(round)
        const other = round.rooms[1 - right]
        const tail = sides.slice(-MAX_SAME_SIDE)
        const repeated = tail.length === MAX_SAME_SIDE && tail[0] !== null && tail[0] === tail[1]
        const side: Side = repeated ? ((1 - (tail[0] as Side)) as Side) : random() < 0.5 ? 0 : 1
        sides.push(side)
        const helped = round.rooms[right]
        const rooms: [Person, Person] = side === 0 ? [helped, other] : [other, helped]
        return { ...round, rooms }
    })
}

function checkRound(round: RoundDef, where: string, problems: string[]) {
    const [a, b] = round.rooms
    if (a === b) problems.push(`${where}: os dois quartos com a mesma pessoa`)
    if (helpedSides(round).length === 0) problems.push(`${where}: ninguém é ajudado`)
    const never = NEVER_BESIDE[round.device] ?? []
    round.rooms
        .filter(person => !helps(round.device, person) && never.includes(person))
        .forEach(person => problems.push(`${where}: ${person} não pode dividir a tela com ${round.device}`))
}

export function checkDeal(level: LevelDef, rounds: RoundDef[], tag: string): string[] {
    const problems: string[] = []
    if (rounds.length !== level.rounds.length) problems.push(`${tag}: ${rounds.length} rodadas`)
    rounds.forEach((round, i) => {
        const where = `${tag}/rodada ${i + 1}`
        checkRound(round, where, problems)
        const source = level.rounds[i]
        if (!source || source.device !== round.device || !source.rooms.every(p => round.rooms.includes(p)))
            problems.push(`${where}: não é a rodada ${i + 1} do nível`)
        if (i >= MAX_SAME_SIDE) {
            const window = rounds.slice(i - MAX_SAME_SIDE, i + 1)
            if (!window.some(isDouble) && window.every(r => rightSide(r) === rightSide(round)))
                problems.push(`${where}: o certo ${MAX_SAME_SIDE + 1} vezes seguidas do mesmo lado`)
        }
    })
    return problems
}

const seeded = (seed: number) => {
    let s = seed
    return () => {
        s = (s * 1664525 + 1013904223) % 4294967296
        return s / 4294967296
    }
}

function checkLevelOne(level: LevelDef, tag: string, problems: string[]) {
    const devices = level.rounds.map(r => r.device)
    const helped = level.rounds.map(r => r.rooms[rightSide(r)])
    if (new Set(devices).size !== devices.length) problems.push(`${tag}: aparelho repetido`)
    if (new Set(helped).size !== helped.length) problems.push(`${tag}: pessoa ajudada repetida`)
    const everyone: DeviceId[] = ['clock', 'lullaby', 'phone', 'tablet']
    if (!everyone.every(d => devices.includes(d))) problems.push(`${tag}: falta algum aparelho`)
    if (devices.some(d => d === 'dance' || d === 'tablet-call') || level.rounds.some(r => r.rooms.includes('party')))
        problems.push(`${tag}: festa, música animada e tablet de chamada ficam fora do N1`)
}

function checkLevelTwo(level: LevelDef, tag: string, problems: string[]) {
    if (!level.rounds.every(r => r.rooms.includes('party'))) problems.push(`${tag}: a festa tem de estar em todas as rodadas`)
    const partyWins = level.rounds.filter(r => helps(r.device, 'party')).length
    if (partyWins !== 1) problems.push(`${tag}: a festa é o certo ${partyWins} vezes`)
    const devices = level.rounds.map(r => r.device)
    if (!devices.includes('dance') || !devices.includes('lullaby')) problems.push(`${tag}: a caixinha precisa das duas músicas`)
}

function checkLevelThree(level: LevelDef, tag: string, problems: string[]) {
    const calls = level.rounds.filter(r => r.device === 'tablet-call')
    if (calls.length < 3) problems.push(`${tag}: tablet de chamada em só ${calls.length} rodadas`)
    const singles = calls.filter(r => !isDouble(r)).map(r => r.rooms[rightSide(r)])
    ;(['bored', 'missing-grandma'] as Person[]).forEach(person => {
        if (!singles.includes(person)) problems.push(`${tag}: o tablet nunca ajuda só ${person}`)
    })
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        if (level.rounds.length < 1 || level.rounds.length > MAX_ROUNDS) problems.push(`${tag}: ${level.rounds.length} rodadas`)
        if (new Set(level.rounds.map(r => r.id)).size !== level.rounds.length) problems.push(`${tag}: id de rodada repetido`)
        level.rounds.forEach((round, i) => {
            const where = `${tag}/rodada ${i + 1}`
            checkRound(round, where, problems)
            if (isDouble(round) && !(level.level === 3 && i === 0)) problems.push(`${where}: dois ajudados só na 1ª rodada do N3`)
        })
        if (level.level === 1) checkLevelOne(level, tag, problems)
        if (level.level === 2) checkLevelTwo(level, tag, problems)
        if (level.level === 3) {
            checkLevelThree(level, tag, problems)
            if (!level.rounds[0] || !isDouble(level.rounds[0])) problems.push(`${tag}: a 1ª rodada tem de valer para os dois`)
        }
        for (let seed = 1; seed <= 60; seed++) problems.push(...checkDeal(level, deal(level, seeded(seed)), `${tag}#${seed}`))
    })
    if (helpedSides(TRAINING).length !== 1) problems.push('treino: tem de ter exatamente 1 ajudado')
    if (TRAINING.rooms[0] === TRAINING.rooms[1]) problems.push('treino: os dois quartos com a mesma pessoa')
    if (rightSide(TRAINING) !== 0) problems.push('treino: a festa tem de ficar no quarto da esquerda')
    return [...new Set(problems)]
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env?.DEV) console.error('[maquina-dos-ajudantes]', PROBLEMS)
