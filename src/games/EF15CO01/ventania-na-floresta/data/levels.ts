import type { Bird, Cor, FichaPhase, Flower, GridPhase, Kind, LevelDef, LinePhase, RedemoinhoPhase, Structure, TeiaPhase, Tone } from '../types'
import { homeOf, homeOfPiece, nestFits, sameCell } from './logic'

export const POINTS = 10

export const guideKey = (topic: string) => `ef15co01-ventania-${topic}`
export const OPENING_KEY = 'ef15co01-ventania-opening'

const fl = (kind: Kind, tone: Tone): Flower => ({ kind, tone })
const bird = (pena: Cor, bico: Cor, topete?: boolean): Bird => (topete === undefined ? { pena, bico } : { pena, bico, topete })

const N1: LevelDef = {
    level: 1,
    title: 'A fila e a grade',
    message: 'Na fila, a ordem diz quem vem antes. Na grade, cada coisa mora no cruzamento de uma linha com uma coluna.',
    phases: [
        { id: 'fila-3', type: 'fila', teach: true, scattered: [1, 0, 2] },
        { id: 'fila-4', type: 'fila', scattered: [2, 0, 3, 1] },
        {
            id: 'grade-2x2',
            type: 'grade',
            teach: true,
            rows: ['margarida', 'tulipa'],
            cols: ['amarela', 'azul'],
            bring: [fl('tulipa', 'amarela'), fl('margarida', 'azul'), fl('tulipa', 'azul'), fl('margarida', 'amarela')],
        },
        {
            id: 'grade-2x3',
            type: 'grade',
            rows: ['margarida', 'tulipa'],
            cols: ['amarela', 'azul', 'rosa'],
            bring: [
                fl('margarida', 'rosa'),
                fl('tulipa', 'amarela'),
                fl('margarida', 'azul'),
                fl('tulipa', 'rosa'),
                fl('margarida', 'amarela'),
                fl('tulipa', 'azul'),
            ],
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'A ficha e a teia',
    message: 'Na ficha, cada valor tem um nome ao lado. Na teia, o que importa é quem se liga com quem.',
    phases: [
        {
            id: 'ficha-2',
            type: 'ficha',
            teach: true,
            fields: ['pena', 'bico'],
            nests: [bird('laranja', 'verde'), bird('verde', 'laranja'), bird('roxo', 'laranja')],
            bring: [bird('verde', 'laranja'), bird('roxo', 'laranja'), bird('laranja', 'verde')],
        },
        {
            id: 'ficha-3',
            type: 'ficha',
            fields: ['pena', 'bico', 'topete'],
            nests: [bird('roxo', 'verde', true), bird('verde', 'roxo', false), bird('laranja', 'roxo', true), bird('roxo', 'verde', false)],
            bring: [bird('laranja', 'roxo', true), bird('roxo', 'verde', true), bird('roxo', 'verde', false), bird('verde', 'roxo', false)],
        },
        {
            id: 'teia-3',
            type: 'teia',
            teach: true,
            bugs: ['joaninha', 'borboleta', 'grilo'],
            before: [0, 2, 4],
            after: [3, 5, 1],
            edges: [
                ['joaninha', 'grilo'],
                ['borboleta', 'joaninha'],
                ['grilo', 'borboleta'],
            ],
        },
        {
            id: 'teia-4',
            type: 'teia',
            bugs: ['joaninha', 'borboleta', 'grilo', 'caracol'],
            before: [0, 1, 3, 4],
            after: [2, 4, 5, 1],
            edges: [
                ['caracol', 'joaninha'],
                ['borboleta', 'grilo'],
                ['joaninha', 'borboleta'],
                ['grilo', 'caracol'],
            ],
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'O redemoinho',
    message: 'Fila, grade, ficha e teia organizam as coisas. O que fica sozinho, sem organização, é solto.',
    phases: [
        { id: 'redemoinho-1', type: 'redemoinho', teach: true, homes: ['grade', 'fila', 'solto'], pieces: ['pebbles', 'number', 'grid'] },
        { id: 'redemoinho-2', type: 'redemoinho', homes: ['ficha', 'teia', 'solto'], pieces: ['pair', 'card', 'word', 'map'] },
        { id: 'redemoinho-3', type: 'redemoinho', homes: ['grade', 'fila', 'ficha', 'teia'], pieces: ['list', 'badge', 'weather', 'pair'] },
        { id: 'redemoinho-4', type: 'redemoinho', homes: ['fila', 'ficha', 'teia', 'solto'], pieces: ['yes', 'map', 'card', 'pebbles'] },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

const LEVEL_TYPES: Record<number, Structure[]> = { 1: ['fila', 'grade'], 2: ['ficha', 'teia'], 3: ['redemoinho'] }

const sameBird = (a: Bird, b: Bird, phase: FichaPhase) => nestFits(a, b, phase.fields)

function checkFicha(tag: string, phase: FichaPhase, problems: string[]) {
    const { nests, bring, fields } = phase
    if (nests.length < 3 || nests.length > 4) problems.push(`${tag}: 3 ou 4 ninhos`)
    if (new Set(fields).size !== fields.length || !fields.includes('pena') || !fields.includes('bico')) problems.push(`${tag}: a ficha tem PENA e BICO, sem repetir`)
    nests.forEach((n, i) => {
        if (fields.includes('topete') !== (n.topete !== undefined)) problems.push(`${tag}: o ninho ${i + 1} tem os campos da ficha`)
        if (nests.findIndex(o => sameBird(o, n, phase)) !== i) problems.push(`${tag}: ninho ${i + 1} igual a outro`)
    })
    const swapped = nests.some((a, i) => nests.some((b, j) => j > i && a.pena === b.bico && a.bico === b.pena && a.pena !== a.bico))
    if (!swapped) problems.push(`${tag}: falta um par de ninhos com pena e bico trocados`)
    if (bring.length !== nests.length) problems.push(`${tag}: um filhote por ninho`)
    const homes = bring.map((b, i) => {
        const matches = nests.filter(n => sameBird(n, b, phase)).length
        if (matches !== 1) problems.push(`${tag}: o filhote ${i + 1} combina com ${matches} ninhos`)
        return nests.findIndex(n => sameBird(n, b, phase))
    })
    if (new Set(homes).size !== homes.length) problems.push(`${tag}: dois filhotes no mesmo ninho`)
    if (homes[0] === 0) problems.push(`${tag}: o 1º filhote não vai no ninho da ponta esquerda`)
    if (homes.every((h, i) => h === i)) problems.push(`${tag}: a ordem dos filhotes não pode ser a dos ninhos`)
}

function checkTeia(tag: string, phase: TeiaPhase, problems: string[]) {
    const { bugs, before, after, edges } = phase
    const n = bugs.length
    if (n < 3 || n > 4) problems.push(`${tag}: 3 ou 4 bichos`)
    if (edges.length !== n) problems.push(`${tag}: ${n} bichos pedem ${n} fios`)
    if (new Set(bugs).size !== n) problems.push(`${tag}: bicho repetido`)
    if (before.length !== n || after.length !== n) problems.push(`${tag}: um galhinho antes e um depois para cada bicho`)
    if (new Set(before).size !== before.length || new Set(after).size !== after.length) problems.push(`${tag}: dois bichos no mesmo galhinho`)
    bugs.forEach((b, i) => {
        if (before[i] === after[i]) problems.push(`${tag}: ${b} precisa mudar de galhinho`)
        if (!edges.some(e => e.includes(b))) problems.push(`${tag}: ${b} sem fio`)
    })
    const seen = new Set<string>()
    edges.forEach(([a, b], i) => {
        if (a === b) problems.push(`${tag}: fio ${i + 1} liga o bicho a ele mesmo`)
        if (!bugs.includes(a) || !bugs.includes(b)) problems.push(`${tag}: fio ${i + 1} com bicho fora da teia`)
        const key = [a, b].sort().join('-')
        if (seen.has(key)) problems.push(`${tag}: par repetido ${key}`)
        seen.add(key)
        if (i > 0 && edges[i - 1][0] === a) problems.push(`${tag}: a Tecê começa no mesmo bicho duas vezes seguidas`)
    })
}

function checkWhirl(tag: string, phase: RedemoinhoPhase, problems: string[]) {
    const { homes, pieces } = phase
    if (homes.length > 4) problems.push(`${tag}: no máximo 4 casas`)
    if (new Set(homes).size !== homes.length) problems.push(`${tag}: casa repetida`)
    if (new Set(pieces).size !== pieces.length) problems.push(`${tag}: pedaço repetido`)
    const targets = pieces.map(homeOfPiece)
    homes.forEach(h => {
        if (!targets.includes(h)) problems.push(`${tag}: a casa ${h} não recebe pedaço`)
    })
    targets.forEach((h, i) => {
        if (!homes.includes(h)) problems.push(`${tag}: o pedaço ${pieces[i]} não tem casa na fase`)
        if (i > 0 && targets[i - 1] === h) problems.push(`${tag}: a casa ${h} duas vezes seguidas`)
    })
    if (targets[0] === homes[0]) problems.push(`${tag}: o 1º pedaço não vai na casa da ponta esquerda`)
}

function checkLine(tag: string, phase: LinePhase, problems: string[]) {
    const n = phase.scattered.length
    if (n < 3 || n > 4) problems.push(`${tag}: a fila tem 3 ou 4 formigas`)
    const sorted = [...phase.scattered].sort((a, b) => a - b)
    if (sorted.some((rank, i) => rank !== i)) problems.push(`${tag}: os tamanhos são 0..${n - 1} sem repetir`)
    if (phase.scattered[0] === 0) problems.push(`${tag}: a maior não fica na ponta esquerda`)
    const asc = phase.scattered.every((rank, i) => rank === i)
    const desc = phase.scattered.every((rank, i) => rank === n - 1 - i)
    if (asc || desc) problems.push(`${tag}: a ordem espalhada não pode ser a certa nem a inversa`)
}

function checkGrid(tag: string, phase: GridPhase, problems: string[]) {
    const { rows, cols, bring } = phase
    if (new Set(rows).size !== rows.length) problems.push(`${tag}: linha repetida`)
    if (new Set(cols).size !== cols.length) problems.push(`${tag}: coluna repetida`)
    if (rows.length * cols.length > 6) problems.push(`${tag}: no máximo 6 casinhas`)
    if (bring.length !== rows.length * cols.length) problems.push(`${tag}: a abelha traz uma flor por casinha`)
    const homes = bring.map(f => homeOf(phase, f))
    homes.forEach((h, i) => {
        if (h.r < 0 || h.c < 0) problems.push(`${tag}: a flor ${i + 1} não tem casinha`)
        if (homes.findIndex(o => sameCell(o, h)) !== i) problems.push(`${tag}: duas flores na mesma casinha`)
        if (i > 0 && (h.r === homes[i - 1].r) && (h.c === homes[i - 1].c)) problems.push(`${tag}: flor repetida em seguida`)
    })
    if (homes[0] && homes[0].r === 0 && homes[0].c === 0) problems.push(`${tag}: a 1ª flor não vai no canto de cima à esquerda`)
    const reading = homes.every((h, i) => h.r * cols.length + h.c === i)
    if (reading) problems.push(`${tag}: a ordem não pode ser a de leitura`)
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const seen = new Set<string>()
        level.phases.forEach(phase => {
            const tag = `N${level.level} ${phase.id}`
            if (!(LEVEL_TYPES[level.level] ?? []).includes(phase.type)) problems.push(`${tag}: ${phase.type} não é deste nível`)
            const first = !seen.has(phase.type)
            if (first && !phase.teach) problems.push(`${tag}: a 1ª fase de cada estrutura ensina`)
            if (!first && phase.teach) problems.push(`${tag}: só a 1ª fase de cada estrutura ensina`)
            seen.add(phase.type)
            if (phase.type === 'fila') checkLine(tag, phase, problems)
            else if (phase.type === 'grade') checkGrid(tag, phase, problems)
            else if (phase.type === 'ficha') checkFicha(tag, phase, problems)
            else if (phase.type === 'teia') checkTeia(tag, phase, problems)
            else checkWhirl(tag, phase, problems)
        })
        if (level.phases.length > 5) problems.push(`N${level.level}: no máximo 5 fases`)
    })
    if (problems.length) throw new Error(`Ventania na Floresta — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
