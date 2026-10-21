import type { Poly, Vec } from '../types'
import { CAP, CRUMB, LIFT, MAX_PIECES, WIND_AREA } from './fruits'
import { area, bounds, centroid, crosses, split } from './geometry'

/** Folga do "passa na fresta", para a criança não entalar por um fio. */
export const FIT_SLACK = 1.03

export const fits = (a: number) => a <= CAP * FIT_SLACK

/** A formiga levanta o pedaço (a mesma folga da fresta). */
export const lifts = (a: number) => a <= LIFT * FIT_SLACK

export const blows = (a: number) => a < WIND_AREA

export type CutResult =
    | { kind: 'cut'; pieces: { from: number; parts: [Poly, Poly] }[] }
    | { kind: 'crumb' }
    | { kind: 'full' }
    | { kind: 'miss' }

/**
 * Um traço sobre os pedaços `polys` (todos em px de arte do item inteiro).
 * Corta cada pedaço que ele atravessa de ponta a ponta, menos os cortes que
 * deixariam farelo. `whole` é a área do item inteiro.
 */
export function cutAll(polys: Poly[], a: Vec, b: Vec, whole: number): CutResult {
    const hit = polys.map((p, i) => ({ p, i })).filter(({ p }) => crosses(p, a, b))
    if (!hit.length) return { kind: 'miss' }
    const done: { from: number; parts: [Poly, Poly] }[] = []
    let crumb = false
    let count = polys.length
    for (const { p, i } of hit) {
        const parts = split(p, a, b)
        if (!parts) continue
        if (area(parts[0]) < whole * CRUMB || area(parts[1]) < whole * CRUMB) {
            crumb = true
            continue
        }
        if (count + 1 > MAX_PIECES) return done.length ? { kind: 'cut', pieces: done } : { kind: 'full' }
        count += 1
        done.push({ from: i, parts })
    }
    if (done.length) return { kind: 'cut', pieces: done }
    return crumb ? { kind: 'crumb' } : { kind: 'miss' }
}

/** Aplica o resultado na lista (os dois lados entram no lugar do pedaço cortado). */
export function applyCut(polys: Poly[], result: CutResult): Poly[] {
    if (result.kind !== 'cut') return polys
    const out: Poly[] = []
    polys.forEach((p, i) => {
        const hit = result.pieces.find(c => c.from === i)
        if (hit) out.push(hit.parts[0], hit.parts[1])
        else out.push(p)
    })
    return out
}

/** A linha sugerida para cortar de novo: atravessada ao lado mais comprido, pelo centro (px de arte). */
export function hintLine(poly: Poly): { a: Vec; b: Vec } {
    const c = centroid(poly)
    const b = bounds(poly)
    const reach = Math.max(b.w, b.h) / 2 + 40
    if (b.w >= b.h) return { a: { x: c.x, y: c.y - reach }, b: { x: c.x, y: c.y + reach } }
    return { a: { x: c.x - reach, y: c.y }, b: { x: c.x + reach, y: c.y } }
}
