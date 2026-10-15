import type { Entry, LevelDef, Look } from '../types'
import { COMPUTER, DESK, DEVICE_CELL, DIVE, LAPTOP, PLAY } from './layout'
import { deskCurve, playPath, tightestRadius, type Point } from './path'

export const POINTS = 10

export const guideKey = (level: number) => `corrida-no-cabo-guide-${level}`

export const FIGURE = { estrela: 4, coracao: 5, sol: 6, foguete: 7 } as const

const LETTERS = 'AILOSU'

/** o código ASCII da letra: os 8 números, ou só os últimos (N2) */
export const ascii = (ch: string, bits: number) => ch.charCodeAt(0).toString(2).padStart(8, '0').slice(8 - bits)

const letter = (ch: string, bits: number): Entry => ({ id: ch, code: ascii(ch, bits), glyph: ch })

/** o pé da mesa fica no chão; devolve onde um ponto da célula cai na mesa */
export function deskPoint(centerX: number, p: Point): Point {
    return { x: centerX + (p.x - DEVICE_CELL.w / 2) * DESK.scale, y: DESK.floor + (p.y - DEVICE_CELL.foot) * DESK.scale }
}

export const LAPTOP_PORT = deskPoint(DESK.laptopX, LAPTOP.port)
export const COMPUTER_PORT = deskPoint(DESK.computerX, COMPUTER.port)

/** o fio de cada fase, entre o notebook (399, 568) e o computador (871, 461); a mesa da esquerda acaba em x 456 e a da direita começa em x 822 */
export const SHAPES: Point[][] = [
    [
        { x: 430, y: 572 },
        { x: 464, y: 594 },
        { x: 560, y: 660 },
        { x: 660, y: 672 },
        { x: 760, y: 642 },
        { x: 810, y: 580 },
        { x: 834, y: 510 },
        { x: 852, y: 472 },
    ],
    [
        { x: 430, y: 572 },
        { x: 464, y: 594 },
        { x: 512, y: 604 },
        { x: 562, y: 568 },
        { x: 618, y: 612 },
        { x: 700, y: 670 },
        { x: 780, y: 632 },
        { x: 812, y: 562 },
        { x: 836, y: 500 },
        { x: 854, y: 470 },
    ],
    [
        { x: 430, y: 572 },
        { x: 464, y: 594 },
        { x: 506, y: 652 },
        { x: 556, y: 602 },
        { x: 606, y: 662 },
        { x: 656, y: 602 },
        { x: 706, y: 662 },
        { x: 760, y: 612 },
        { x: 810, y: 566 },
        { x: 836, y: 498 },
        { x: 854, y: 470 },
    ],
]

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'A figurinha vira código',
        message: 'Você transformou cada figurinha em 0 e 1, e o outro computador leu pelo combinado!',
        kind: 'figure',
        bits: 4,
        table: [
            { id: 'estrela', code: '1011', frame: FIGURE.estrela },
            { id: 'coracao', code: '0110', frame: FIGURE.coracao },
            { id: 'sol', code: '1111', frame: FIGURE.sol },
            { id: 'foguete', code: '0100', frame: FIGURE.foguete },
        ],
        phases: [
            ['estrela', 'coracao', 'sol'],
            ['foguete', 'estrela', 'coracao'],
            ['sol', 'foguete', 'estrela'],
        ],
        shapes: [0, 1, 2],
        gap: 500,
        cruise: 260,
    },
    {
        level: 2,
        title: 'O texto também vira código',
        message: 'Cada letra virou 0 e 1, e o outro computador montou a palavra!',
        kind: 'letter',
        bits: 5,
        table: [...LETTERS].map(ch => letter(ch, 5)),
        phases: [['O', 'I'], ['S', 'O', 'L'], ['L', 'U', 'A']],
        shapes: [1, 2, 0],
        gap: 480,
        cruise: 280,
    },
    {
        level: 3,
        title: 'O código de verdade',
        message: 'Esse é o código que os computadores usam para as letras: o ASCII. A é 01000001!',
        kind: 'letter',
        bits: 8,
        table: [...LETTERS].map(ch => letter(ch, 8)),
        phases: [['O', 'I'], ['A', 'S', 'A'], ['L', 'U', 'A']],
        shapes: [2, 0, 1],
        gap: 440,
        cruise: 300,
    },
]

/** a palavra da fase (N2/N3) */
export const wordOf = (level: LevelDef, phase: number) => (level.kind === 'letter' ? level.phases[phase].join('') : '')

/** o combinado da fase: as figurinhas todas, ou só as letras da palavra (em ordem alfabética) */
export function phaseTable(level: LevelDef, phase: number): Entry[] {
    if (level.kind === 'figure') return level.table
    const letters = [...new Set(level.phases[phase])].sort()
    return letters.map(id => entryOf(level, id))
}

export const lookOf = (entry: Entry): Look => (entry.glyph ? { glyph: entry.glyph } : { frame: entry.frame ?? 0 })

export const spanOf = (level: LevelDef) => PLAY.before + (level.bits - 1) * level.gap + PLAY.tail

export const buildDesk = (shape: number) => deskCurve(LAPTOP_PORT, SHAPES[shape], COMPUTER_PORT)

export const buildPlay = (level: LevelDef, shape: number) =>
    playPath(buildDesk(shape), { from: DIVE.from, span: spanOf(level), lead: PLAY.lead, top: PLAY.top, bottom: PLAY.bottom, step: 8 })

export const decode = (sent: string, table: Entry[]): Entry | null => table.find(e => e.code === sent) ?? null

export const entryOf = (level: LevelDef, id: string): Entry => {
    const found = level.table.find(e => e.id === id)
    if (!found) throw new Error(`[corrida-no-cabo] figura desconhecida: ${id}`)
    return found
}

export const distance = (a: string, b: string) => [...a].filter((c, i) => c !== b[i]).length

export const totalSends = (level: LevelDef) => level.phases.reduce((sum, p) => sum + p.length, 0)

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    const fail = (where: string, why: string) => problems.push(`${where}: ${why}`)
    levels.forEach(level => {
        const at = `N${level.level}`
        if (level.phases.length !== 3) fail(at, '3 fases')
        if (level.shapes.length !== level.phases.length) fail(at, 'um fio por fase')
        const codes = new Set<string>()
        level.table.forEach(e => {
            if (e.code.length !== level.bits || /[^01]/.test(e.code)) fail(at, `${e.id}: código precisa de ${level.bits} números 0/1`)
            if (codes.has(e.code)) fail(at, `${e.id}: código repetido`)
            codes.add(e.code)
        })
        const ids = level.phases.flat()
        ids.forEach((id, i) => {
            if (!level.table.some(e => e.id === id)) fail(at, `${id} não está no combinado`)
            if (level.kind === 'figure' && i > 0 && ids[i - 1] === id) fail(at, `${id} duas vezes seguidas`)
        })
        if (level.kind === 'figure') {
            const near = level.table.some((a, i) => level.table.some((b, j) => i < j && distance(a.code, b.code) === 1))
            if (!near) fail(at, 'pelo menos um par de códigos difere em 1 número')
            level.table.forEach(e => {
                if (ids.filter(id => id === e.id).length < 2) fail(at, `${e.id} aparece menos de 2 vezes`)
            })
            if (level.level === 1 && ids[0] !== 'estrela') fail(at, 'o 1º envio é a estrela da demonstração')
        } else {
            level.table.forEach(e => {
                if (e.code !== ascii(e.id, level.bits)) fail(at, `${e.id}: o código tem de ser o ASCII`)
                if (level.bits === 8 && !e.code.startsWith('010')) fail(at, `${e.id}: o ASCII das maiúsculas começa com 010`)
                if (!ids.includes(e.id)) fail(at, `${e.id} não aparece em nenhuma palavra`)
            })
            level.phases.forEach((p, f) => {
                if (p.length < 2 || p.length > 3) fail(`${at} fase ${f + 1}`, 'palavras de 2 ou 3 letras')
            })
        }
        level.shapes.forEach((shape, f) => {
            const where = `${at} fase ${f + 1}`
            const desk = buildDesk(shape)
            if (Math.max(...desk.ys) > DESK.floor - 6) fail(where, 'o fio encosta no chão')
            const play = buildPlay(level, shape)
            if (play.length < PLAY.lead + spanOf(level)) fail(where, 'o fio da corrida ficou curto')
            if (tightestRadius(play) < PLAY.tube / 2 + 15) fail(where, `curva fechada demais (${Math.round(tightestRadius(play))} px)`)
        })
    })
    return problems
}

const PROBLEMS = validateLevels(LEVELS)
if (PROBLEMS.length && import.meta.env.DEV) console.error('[corrida-no-cabo] níveis inválidos', PROBLEMS)
