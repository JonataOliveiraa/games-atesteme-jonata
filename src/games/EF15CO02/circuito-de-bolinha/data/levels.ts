import type { LevelDef, Page, PhaseDef, Piece, PieceKind, RepeatPage, Side, Tape } from '../types'
import { again, descend, expected, other, positions, run, spot, tapeOf } from './logic'

export const POINTS = 10

export const guideKey = (level: number) => `ef15co02-circuito-l${level}`

const p = (id: string, kind: PieceKind, c: number, r: number, left?: boolean): Piece => ({ id, kind, c, r, ...(left ? { left } : {}) })

const page = (piece: Piece): Page => ({ id: piece.id, kind: 'piece', piece })

const times = (n: number, c: number): RepeatPage => ({ id: `x${n}c${c}`, kind: 'repeat', c, n })

const tower = (c: number, n: number) => Array.from({ length: n }, (_, r) => p(`b${c}${r}`, 'block', c, r))

function sequence(id: string, bell: number, model: Piece[], tray: string[]): PhaseDef {
    return { id, model, bells: [bell], slots: model.length, tray: tray.map(key => page(model.find(x => x.id === key) as Piece)) }
}

const N1: LevelDef = {
    level: 1,
    title: 'A ordem de montar',
    message: 'O manual é um algoritmo: uma lista de passos, um depois do outro. Se a ordem muda, a peça fica sem apoio e cai.',
    phases: [
        sequence('rampa-no-bloco', 2, [p('b0', 'block', 0, 0), p('r1', 'ramp', 0, 1), p('r2', 'ramp', 1, 0)], ['r1', 'r2', 'b0']),
        sequence(
            'torre',
            2,
            [p('b0', 'block', 0, 0), p('b1', 'block', 0, 1), p('r2', 'ramp', 0, 2), p('r3', 'ramp', 1, 0)],
            ['b1', 'r3', 'r2', 'b0'],
        ),
        sequence(
            'duas-torres',
            2,
            [p('b0', 'block', 0, 0), p('b1', 'block', 0, 1), p('r2', 'ramp', 0, 2), p('b3', 'block', 1, 0), p('r4', 'ramp', 1, 1)],
            ['r4', 'b1', 'b3', 'r2', 'b0'],
        ),
    ],
}

const r03 = p('r03', 'ramp', 0, 3)
const r10 = p('r10', 'ramp', 1, 0)
const r12 = p('r12', 'ramp', 1, 2)
const r20 = p('r20', 'ramp', 2, 0)

const N2: LevelDef = {
    level: 2,
    title: 'A página que repete',
    message: 'Repetir é fazer o mesmo passo várias vezes. Uma página ×3 vale por três páginas iguais, e o manual fica mais curto.',
    phases: [
        {
            id: 'torre-de-tres',
            bells: [2],
            model: [...tower(0, 3), r03, r10],
            slots: 3,
            tray: [times(2, 0), times(3, 0), times(4, 0), page(r03), page(r10)],
        },
        {
            id: 'duas-torres',
            bells: [2],
            model: [...tower(0, 3), r03, ...tower(1, 2), r12],
            slots: 4,
            tray: [times(2, 0), times(3, 0), times(4, 0), times(2, 1), page(r03), page(r12)],
        },
        {
            id: 'escada',
            bells: [3],
            model: [...tower(0, 3), r03, ...tower(1, 2), r12, r20],
            slots: 5,
            tray: [times(3, 0), times(2, 0), times(2, 1), page(r03), page(r12), page(r20)],
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'A página SE',
    message: 'O manual pode escolher: SE acontece uma coisa, o Nico faz um passo; SENÃO, faz outro. Assim o mesmo manual serve para os dois casos.',
    phases: [
        {
            id: 'pipoca-no-sino',
            bells: [0, 2],
            model: tower(1, 2),
            choice: { c: 1, r: 2 },
            cond: 'right',
            slots: 3,
            ifSlot: 2,
            tray: [page(p('sl', 'ramp', 1, 2, true)), page(p('b11', 'block', 1, 1)), page(p('sr', 'ramp', 1, 2)), page(p('b10', 'block', 1, 0))],
        },
        {
            id: 'rampas-do-lado',
            bells: [0, 4],
            model: [p('b20', 'block', 2, 0), p('l10', 'ramp', 1, 0, true), p('r30', 'ramp', 3, 0)],
            choice: { c: 2, r: 1 },
            cond: 'right',
            slots: 4,
            ifSlot: 1,
            tray: [
                page(p('sr', 'ramp', 2, 1)),
                page(p('b20', 'block', 2, 0)),
                page(p('l10', 'ramp', 1, 0, true)),
                page(p('sl', 'ramp', 2, 1, true)),
                page(p('r30', 'ramp', 3, 0)),
            ],
        },
        {
            id: 'torre-alta',
            bells: [0, 4],
            model: [...tower(2, 2), p('l10', 'ramp', 1, 0, true), p('r30', 'ramp', 3, 0)],
            choice: { c: 2, r: 2 },
            cond: 'left',
            slots: 5,
            ifSlot: 2,
            tray: [
                page(p('sl', 'ramp', 2, 2, true)),
                page(p('r30', 'ramp', 3, 0)),
                page(p('b21', 'block', 2, 1)),
                page(p('l10', 'ramp', 1, 0, true)),
                page(p('b20', 'block', 2, 0)),
                page(p('sr', 'ramp', 2, 2)),
            ],
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export const SIDES: Side[] = ['left', 'right']

export function wins(phase: PhaseDef, tape: Tape): boolean {
    if (phase.ifSlot === undefined) return !run(phase, tape).fail
    return SIDES.every(first => {
        const one = run(phase, tape, first)
        return !one.fail && !again(phase, one, tape, other(first)).fail
    })
}

function arrangements<T>(items: T[], k: number): T[][] {
    if (k === 0) return [[]]
    return items.flatMap((item, i) =>
        arrangements(
            items.filter((_, j) => j !== i),
            k - 1,
        ).map(rest => [item, ...rest]),
    )
}

function check(level: LevelDef, phase: PhaseDef) {
    const fail = (why: string): never => {
        throw new Error(`[circuito-de-bolinha] N${level.level} ${phase.id}: ${why}`)
    }
    const model = expected(phase)
    const cells = new Map<string, Piece>()
    model.forEach(piece => {
        const key = spot(piece.c, piece.r)
        if (cells.has(key)) fail(`duas peças em ${key}`)
        cells.set(key, piece)
    })
    model.forEach(piece => {
        if (phase.bells.includes(piece.c)) fail(`${piece.id} está na coluna de um sino`)
        if (piece.r > 0 && cells.get(spot(piece.c, piece.r - 1))?.kind !== 'block') fail(`${piece.id} sem bloco embaixo no modelo`)
        if (piece.kind === 'ramp' && cells.has(spot(piece.c, piece.r + 1))) fail(`peça em cima da rampa ${piece.id}`)
    })
    const ends = (left: boolean) => {
        const built = new Map(cells)
        if (phase.choice) {
            const key = spot(phase.choice.c, phase.choice.r)
            built.set(key, { ...(cells.get(key) as Piece), left })
        }
        return descend(built, phase.bells)?.bell
    }
    if (phase.choice) {
        const a = ends(true)
        const b = ends(false)
        if (a === undefined || b === undefined || a === b) fail('a rampa do SE não leva aos dois sinos')
    } else if (ends(false) === undefined) fail('a bolinha não chega ao sino')

    const ids = new Set(phase.tray.map(x => x.id))
    if (ids.size !== phase.tray.length) fail('página repetida na bandeja')
    if (phase.tray.length > 6) fail('mais de 6 páginas na bandeja')
    if (phase.slots > 5) fail('mais de 5 espaços no manual')
    const spots = positions(phase).length
    if (phase.tray.length < spots) fail('bandeja menor que o manual')
    if (wins(phase, tapeOf(phase, phase.tray.slice(0, spots)))) fail('a ordem da bandeja já monta')
    const solutions = arrangements(phase.tray, spots).filter(pages => wins(phase, tapeOf(phase, pages)))
    if (!solutions.length) fail('nenhum manual monta')

    if (level.level === 1) {
        if (phase.choice || phase.ifSlot !== undefined || phase.bells.length !== 1) fail('N1 tem um sino e nenhum SE')
        if (phase.tray.some(x => x.kind !== 'piece')) fail('N1 só tem páginas de uma peça')
        if (phase.tray.length !== phase.model.length || phase.slots !== phase.model.length) fail('N1 usa todas as páginas')
        if (!phase.model.some(x => x.r > 0)) fail('nenhuma peça depende de outra')
        if (phase.model.length < 3 || phase.model.length > 5) fail('o manual tem de 3 a 5 páginas')
    }
    if (level.level === 2) {
        if (phase.choice || phase.ifSlot !== undefined) fail('N2 não tem SE')
        if (phase.slots >= phase.model.length) fail('a fita não é menor que o total de peças')
        const sets = new Set(solutions.map(s => s.map(x => x.id).sort().join(' ')))
        if (sets.size !== 1) fail('mais de um jeito de contar dá certo')
        const used = new Set(solutions[0].map(x => x.id))
        const decoys = phase.tray.filter((x): x is RepeatPage => x.kind === 'repeat' && !used.has(x.id))
        if (!decoys.length) fail('nenhuma contagem errada na bandeja')
        solutions.forEach(pages =>
            decoys.forEach(decoy => {
                if (!pages.some(x => x.kind === 'repeat' && x.c === decoy.c)) return
                const swapped = pages.map(x => (x.kind === 'repeat' && x.c === decoy.c ? decoy : x))
                if (wins(phase, tapeOf(phase, swapped))) fail(`${decoy.id} também monta`)
            }),
        )
    }
    if (level.level === 3) {
        if (!phase.choice || phase.ifSlot === undefined || !phase.cond || phase.bells.length !== 2) fail('N3 precisa de SE, dois sinos e condição')
        if (phase.tray.length !== spots) fail('N3 usa todas as páginas')
        solutions.forEach(pages => {
            const tape = tapeOf(phase, pages)
            const swapped: Tape = { ...tape, yes: tape.no, no: tape.yes }
            if (SIDES.some(side => !run(phase, swapped, side).fail)) fail('trocar os bolsos ainda monta')
            if (wins(phase, { ...tape, no: tape.yes }) || wins(phase, { ...tape, yes: tape.no })) fail('a mesma rampa nos dois bolsos monta')
        })
    }
}

export function validateLevels() {
    LEVELS.forEach(level => level.phases.forEach(phase => check(level, phase)))
}

if (import.meta.env.DEV) validateLevels()
