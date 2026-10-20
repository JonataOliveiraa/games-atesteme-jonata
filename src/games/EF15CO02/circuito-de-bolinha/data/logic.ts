import type { BuildStep, PhaseDef, Piece } from '../types'

export const spot = (c: number, r: number) => `${c},${r}`

export function supported(piece: Piece, built: Map<string, Piece>): boolean {
    if (piece.r === 0) return true
    return built.get(spot(piece.c, piece.r - 1))?.kind === 'block'
}

export function build(order: Piece[]): BuildStep[] {
    const built = new Map<string, Piece>()
    const steps: BuildStep[] = []
    for (const piece of order) {
        const ok = supported(piece, built) && !built.has(spot(piece.c, piece.r))
        steps.push({ piece, ok })
        if (!ok) break
        built.set(spot(piece.c, piece.r), piece)
    }
    return steps
}

export const works = (order: Piece[]) => {
    const steps = build(order)
    return steps.length === order.length && steps.every(s => s.ok)
}

export const ramps = (phase: PhaseDef) =>
    phase.pieces.filter(p => p.kind === 'ramp').sort((a, b) => b.r - a.r || a.c - b.c)

export const columns = (phase: PhaseDef) => Math.max(phase.bell, ...phase.pieces.map(p => p.c)) + 1

export const height = (phase: PhaseDef) => Math.max(...phase.pieces.map(p => p.r)) + 1

export const pieceById = (phase: PhaseDef, id: string) => phase.pieces.find(p => p.id === id)
