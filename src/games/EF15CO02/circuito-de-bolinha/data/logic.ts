import type { Act, Fail, Outcome, Page, Path, PhaseDef, Piece, Pocket, Side, Tape } from '../types'

export const spot = (c: number, r: number) => `${c},${r}`

export const other = (side: Side): Side => (side === 'left' ? 'right' : 'left')

export const bellOf = (phase: PhaseDef, side: Side) => (side === 'left' ? Math.min(...phase.bells) : Math.max(...phase.bells))

export const pocketFor = (phase: PhaseDef, side: Side): Pocket => (side === phase.cond ? 'yes' : 'no')

export interface Position {
    slot: number
    pocket?: Pocket
}

export function positions(phase: PhaseDef): Position[] {
    const list: Position[] = []
    for (let slot = 0; slot < phase.slots; slot++) {
        if (slot === phase.ifSlot) list.push({ slot, pocket: 'yes' }, { slot, pocket: 'no' })
        else list.push({ slot })
    }
    return list
}

export function tapeOf(phase: PhaseDef, pages: Array<Page | undefined>): Tape {
    const tape: Tape = { slots: Array.from({ length: phase.slots }, () => undefined) }
    positions(phase).forEach((at, i) => {
        if (at.pocket) tape[at.pocket] = pages[i]
        else tape.slots[at.slot] = pages[i]
    })
    return tape
}

const topOf = (built: Map<string, Piece>, c: number) => {
    let r = -1
    built.forEach(p => {
        if (p.c === c && p.r > r) r = p.r
    })
    return r
}

export const modelTop = (phase: PhaseDef, c: number) =>
    Math.max(-1, ...phase.model.filter(p => p.c === c).map(p => p.r), phase.choice?.c === c ? phase.choice.r : -1)

export const expected = (phase: PhaseDef): Piece[] =>
    phase.choice ? [...phase.model, { id: 'choice', kind: 'ramp', ...phase.choice }] : phase.model

const fits = (phase: PhaseDef, piece: Piece) => {
    if (phase.choice && piece.c === phase.choice.c && piece.r === phase.choice.r) return piece.kind === 'ramp'
    const want = phase.model.find(p => p.c === piece.c && p.r === piece.r)
    return !!want && want.kind === piece.kind && !!want.left === !!piece.left
}

function apply(phase: PhaseDef, built: Map<string, Piece>, page: Page, slot: number, pocket: Pocket | undefined, acts: Act[]) {
    const total = page.kind === 'repeat' ? page.n : 1
    for (let k = 0; k < total; k++) {
        const piece: Piece =
            page.kind === 'repeat' ? { id: `${page.id}-${k}`, kind: 'block', c: page.c, r: topOf(built, page.c) + 1 } : page.piece
        const there = built.get(spot(piece.c, piece.r))
        const why =
            page.kind === 'repeat' && piece.r > modelTop(phase, piece.c)
                ? 'extra'
                : there
                  ? there.kind === 'block'
                      ? 'extra'
                      : 'blocked'
                  : piece.r > 0 && built.get(spot(piece.c, piece.r - 1))?.kind !== 'block'
                    ? 'under'
                    : undefined
        const land = why === 'extra' || why === 'blocked' ? topOf(built, piece.c) + 1 : piece.r
        acts.push({ slot, pocket, piece, count: k + 1, total, ok: !why, land })
        if (why) return { why, piece, slot, pocket } satisfies Fail
        built.set(spot(piece.c, piece.r), piece)
    }
    return undefined
}

export function descend(built: Map<string, Piece>, bells: number[]): Path | undefined {
    const ramps = [...built.values()].filter(p => p.kind === 'ramp').sort((a, b) => b.r - a.r || a.c - b.c)
    let ramp = ramps[0]
    if (!ramp) return undefined
    const path = [ramp]
    for (let guard = 0; guard < 12; guard++) {
        const c = ramp.c + (ramp.left ? -1 : 1)
        const top = topOf(built, c)
        if (top < 0) return bells.includes(c) ? { ramps: path, bell: c } : undefined
        const next = built.get(spot(c, top))
        if (!next || next.kind !== 'ramp' || top >= ramp.r) return undefined
        path.push(next)
        ramp = next
    }
    return undefined
}

function finish(phase: PhaseDef, built: Map<string, Piece>, acts: Act[], side: Side | undefined, history: Act[]): Outcome {
    const by = (piece: Piece) => history.find(a => a.piece === piece)
    const extra = [...built.values()].filter(p => !fits(phase, p)).sort((a, b) => b.r - a.r)[0]
    if (extra) return { acts, built, fail: { why: 'extra', piece: extra, slot: by(extra)?.slot, pocket: by(extra)?.pocket } }
    const missing = expected(phase).find(p => !built.has(spot(p.c, p.r)))
    if (missing) return { acts, built, fail: { why: 'missing', piece: missing } }
    const path = descend(built, phase.bells)
    if (!path) return { acts, built, fail: { why: 'missing', piece: expected(phase).find(p => p.kind === 'ramp') ?? phase.model[0] } }
    if (side && path.bell === bellOf(phase, side)) {
        const chosen = history.find(a => a.pocket)
        return { acts, built, path, fail: { why: 'cat', piece: chosen?.piece ?? path.ramps[0], slot: chosen?.slot, pocket: chosen?.pocket } }
    }
    return { acts, built, path }
}

export function run(phase: PhaseDef, tape: Tape, side?: Side): Outcome {
    const built = new Map<string, Piece>()
    const acts: Act[] = []
    for (let slot = 0; slot < phase.slots; slot++) {
        const pocket = slot === phase.ifSlot && side ? pocketFor(phase, side) : undefined
        const page = pocket ? tape[pocket] : tape.slots[slot]
        if (!page) continue
        const fail = apply(phase, built, page, slot, pocket, acts)
        if (fail) return { acts, built, fail }
    }
    return finish(phase, built, acts, side, acts)
}

export function again(phase: PhaseDef, first: Outcome, tape: Tape, side: Side): Outcome {
    const built = new Map(first.built)
    const kept = first.acts.filter(a => !a.pocket)
    first.acts.filter(a => a.pocket && a.ok).forEach(a => built.delete(spot(a.piece.c, a.piece.r)))
    const pocket = pocketFor(phase, side)
    const page = tape[pocket]
    const acts: Act[] = []
    const fail = page ? apply(phase, built, page, phase.ifSlot ?? 0, pocket, acts) : undefined
    if (fail) return { acts, built, fail }
    return finish(phase, built, acts, side, [...kept, ...acts])
}

export const columns = (phase: PhaseDef) => Math.max(...phase.bells, ...phase.model.map(p => p.c)) + 1

export const height = (phase: PhaseDef) => Math.max(...expected(phase).map(p => p.r)) + 1

export const pageById = (phase: PhaseDef, id: string) => phase.tray.find(p => p.id === id)
