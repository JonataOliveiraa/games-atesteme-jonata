import type { Cell, Entry, Kind, LevelDef, PhaseDef } from '../types'
import { C } from './theme'

export const POINTS = 10

export const guideKey = (level: number) => `pixels-fujoes-guide-${level}`

/** N1: 1 número por pixel, como numa tela de LED (a mesma matriz de 0 e 1 do PBM) */
const BIT: Record<string, Entry> = {
    '0': { id: '0', code: '0', name: 'apagado', color: C.off },
    '1': { id: '1', code: '1', name: 'aceso', color: C.lit },
}

/** N2: a cor do pixel são 3 luzes, vermelha, verde e azul; cada uma acesa (1) ou apagada (0) */
const RGB: Record<string, Entry> = {
    K: { id: 'K', code: '000', name: 'apagado', color: C.off },
    R: { id: 'R', code: '100', name: 'vermelho', color: C.red },
    G: { id: 'G', code: '010', name: 'verde', color: C.green },
    B: { id: 'B', code: '001', name: 'azul', color: C.blue },
    Y: { id: 'Y', code: '110', name: 'amarelo', color: C.lit },
    C: { id: 'C', code: '011', name: 'ciano', color: C.aqua },
    M: { id: 'M', code: '101', name: 'rosa', color: C.magenta },
    W: { id: 'W', code: '111', name: 'branco', color: C.text },
}
const RGB_ORDER = 'KRGBYCMW'

/**
 * N3: a letra pelo código ASCII de verdade, 8 números. As palavras só usam letras de A a O, que começam
 * todas com 0100: essa metade vem pronta, e a criança manda a outra metade (4 números).
 */
export const ascii = (ch: string) => ch.charCodeAt(0).toString(2).padStart(8, '0')
const letter = (ch: string): Entry => ({ id: ch, code: ascii(ch), name: ch, color: C.paper, glyph: ch })
const isLetter = (ch: string) => /^[A-Z]$/.test(ch)

const HEART = ['00000000', '01100110', '11111111', '11111111', '11111111', '01111110', '00111100', '00011000']
const CAT = ['10000001', '11000011', '11111111', '10111101', '11111111', '11100111', '11111111', '01111110']
const GHOST = ['00111100', '01111110', '11111111', '10011001', '10011001', '11111111', '11111111', '11011011']

const FLOWER = [
    'KKKKKRRKKKKK',
    'KKKRRRRRRKKK',
    'KKRRRYYRRRKK',
    'KKRRYYYYRRKK',
    'KKRRYYYYRRKK',
    'KKKRRYYRRKKK',
    'KKKKRRRRKKKK',
    'KKKKKGGKKKKK',
    'KGGKKGGKKGGK',
    'KKGGKGGKGGKK',
    'KKKGGGGGGKKK',
    'KKKKKGGKKKKK',
]
const PLANET = [
    'KKKKBBBBKKKK',
    'KKBBBBBBBBKK',
    'KBBGGBBBWBBK',
    'KBGGGGBBBBBK',
    'BBGGGBBBBGGB',
    'BBBGBBBBGGGB',
    'BBBBBBWWBGGB',
    'BWBBBBBBBBBB',
    'KBBBGGBBBBBK',
    'KBBGGGGBBBBK',
    'KKBBBBBBBBKK',
    'KKKKBBBBKKKK',
]
const ICE_CREAM = [
    'KKKKKKRKKKKK',
    'KKKKKRRKKKKK',
    'KKKKMMMMKKKK',
    'KKKMMMMMMKKK',
    'KKMMWMMMMMKK',
    'KKMMMMMMWMKK',
    'KKMWMMMWMMKK',
    'KKKYYYYYYKKK',
    'KKKYKYYKYKKK',
    'KKKKYYYYKKKK',
    'KKKKKYYKKKKK',
    'KKKKKYYKKKKK',
]

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        kind: 'bit',
        title: 'Aceso e apagado',
        message: 'Cada pixel virou 0 ou 1: é assim que o tablet guarda a figura.',
        view: { zoom: 6, near: 0.52, far: 0.85 },
        given: 0,
        phases: [
            { id: 'coracao', rows: HEART, escaped: [[2, 1], [1, 3], [4, 5]], dodge: 0, speed: 45, dash: false },
            { id: 'gatinho', rows: CAT, escaped: [[3, 1], [0, 0], [5, 4], [6, 2]], dodge: 0, speed: 65, dash: false },
            { id: 'fantasminha', rows: GHOST, escaped: [[3, 1], [1, 3], [4, 6], [7, 7]], dodge: 0, speed: 85, dash: true },
        ],
    },
    {
        level: 2,
        kind: 'rgb',
        title: 'Pixel colorido',
        message: 'A cor do pixel são 3 luzes, e cada luz é 0 ou 1: 3 números por pixel.',
        view: { zoom: 4, near: 0.36, far: 0.62 },
        given: 0,
        phases: [
            { id: 'flor', rows: FLOWER, escaped: [[1, 4], [3, 5], [9, 2], [0, 0]], dodge: 0, speed: 50, dash: false },
            { id: 'planeta', rows: PLANET, escaped: [[1, 5], [3, 3], [6, 6], [0, 0]], dodge: 0, speed: 62, dash: false },
            { id: 'sorvete', rows: ICE_CREAM, escaped: [[1, 5], [3, 4], [6, 3], [8, 5]], dodge: 0, speed: 75, dash: true },
        ],
    },
    {
        level: 3,
        kind: 'ascii',
        title: 'Letra em código',
        message: 'Até as letras viram 0 e 1: é o código ASCII, que todo computador usa.',
        view: { zoom: 8, near: 0.64, far: 0.92 },
        given: 4,
        phases: [
            { id: 'oi', rows: ['OI!'], escaped: [[0, 0], [0, 1]], dodge: 1.1, speed: 55, dash: false },
            { id: 'galo', rows: ['GALO'], escaped: [[0, 0], [0, 2], [0, 3]], dodge: 0.9, speed: 65, dash: false },
            { id: 'fada', rows: ['FADA'], escaped: [[0, 0], [0, 2], [0, 3]], dodge: 0.75, speed: 75, dash: true },
        ],
    },
]

/** o que a casa guarda, pelo símbolo escrito na figura (null = casa sem código, como o "!" da mensagem) */
export function entryOf(kind: Kind, id: string): Entry | null {
    if (kind === 'bit') return BIT[id] ?? null
    if (kind === 'rgb') return RGB[id] ?? null
    return isLetter(id) ? letter(id) : null
}

/** o tablet lê um código: no RGB toda combinação é uma cor; no ASCII pode sair um sinal que não é letra */
export function decode(kind: Kind, code: string): Entry {
    if (kind === 'bit') return BIT[code]
    if (kind === 'rgb') return Object.values(RGB).find(e => e.code === code) ?? RGB.K
    const ch = String.fromCharCode(parseInt(code, 2))
    return isLetter(ch) ? letter(ch) : { id: ch, code, name: 'um sinal estranho', color: C.paper, glyph: '?' }
}

export const symbolAt = (rows: string[], [r, c]: Cell) => rows[r][c]

/** o combinado da fase: só o que aparece na figura (no ASCII, as letras da palavra, na ordem) */
export function phaseTable(level: LevelDef, phase: PhaseDef): Entry[] {
    const seen = [...new Set(phase.rows.join(''))]
    if (level.kind === 'bit') return ['0', '1'].map(id => BIT[id])
    if (level.kind === 'rgb') return [...RGB_ORDER].filter(id => seen.includes(id)).map(id => RGB[id])
    return seen.filter(isLetter).map(letter)
}

export const totalPixels = (level: LevelDef) => level.phases.reduce((n, p) => n + p.escaped.length, 0)

/**
 * O tempo da fase sai dos dados: um pouco para começar, mais um tanto por fujão (mirar) e por número
 * que a criança manda. N1 fica entre 35 e 44 s, N2 em 64 s e N3 entre 42 e 58 s.
 */
const TIME = { base: 10_000, perFujao: 6_000, perDigit: 2_500 } as const

export const phaseTime = (level: LevelDef, phase: PhaseDef) =>
    TIME.base +
    phase.escaped.reduce((ms, cell) => {
        const digits = (entryOf(level.kind, symbolAt(phase.rows, cell))?.code.length ?? 1) - level.given
        return ms + TIME.perFujao + TIME.perDigit * digits
    }, 0)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        const pictures = new Set<string>()
        level.phases.forEach((phase, f) => {
            const where = `${tag} fase ${f + 1}`
            const cols = phase.rows[0]?.length ?? 0
            phase.rows.forEach((row, r) => {
                if (row.length !== cols) problems.push(`${where}: a linha ${r} tem tamanho diferente`)
                if (level.kind !== 'ascii' && [...row].some(ch => !entryOf(level.kind, ch))) problems.push(`${where}: a linha ${r} tem símbolo fora do combinado`)
            })
            const key = phase.rows.join('|')
            if (pictures.has(key)) problems.push(`${where}: figura repetida`)
            pictures.add(key)
            if (phase.escaped.length < 2 || phase.escaped.length > 4) problems.push(`${where}: são de 2 a 4 fujões`)
            const cells = new Set(phase.escaped.map(([r, c]) => `${r},${c}`))
            if (cells.size !== phase.escaped.length) problems.push(`${where}: fujão repetido`)
            phase.escaped.forEach(cell => {
                const [r, c] = cell
                if (r < 0 || c < 0 || r >= phase.rows.length || c >= cols) problems.push(`${where}: fujão fora da figura`)
                else if (!entryOf(level.kind, symbolAt(phase.rows, cell))) problems.push(`${where}: fujão numa casa sem código`)
            })
            const table = phaseTable(level, phase)
            if (table.length > 6) problems.push(`${where}: combinado grande demais (${table.length})`)
            /** com 5 cartões de letra o código encolhe, e é ele que a criança copia */
            if (level.kind === 'ascii' && table.length > 4) problems.push(`${where}: palavra com letras demais para o combinado (${table.length})`)
            if (level.kind === 'bit') {
                const got = new Set(phase.escaped.map(cell => symbolAt(phase.rows, cell)))
                if (got.size < 2) problems.push(`${where}: falta fujão aceso ou apagado`)
            }
            if (level.given > 0) {
                const start = table[0]?.code.slice(0, level.given)
                table.forEach(e => {
                    if (e.code.slice(0, level.given) !== start) problems.push(`${where}: ${e.id} não começa com ${start}, e o começo dado tem de ser igual em todas`)
                })
            }
        })
        const first = level.phases[0]
        if (level.level === 1 && symbolAt(first.rows, first.escaped[0]) !== '1') problems.push(`${tag}: o primeiro fujão é o da demonstração e tem de ser aceso`)
        if (level.kind === 'ascii' && first.dodge <= 0) problems.push(`${tag}: a demonstração precisa de um fujão que foge`)
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length) console.warn('[pixels-fujoes] níveis com problema:', PROBLEMS)
