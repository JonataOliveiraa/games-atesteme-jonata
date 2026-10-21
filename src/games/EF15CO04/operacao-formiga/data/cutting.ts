import type { Poly, Vec } from '../types'
import { CAP, CRUMB, MAX_PIECES, WIND_MIN } from './fruits'
import { area, crosses, split } from './geometry'

/** Folga do "passa na fresta", para a criança não entalar por um fio. */
export const FIT_SLACK = 1.03

export const fits = (a: number) => a <= CAP * FIT_SLACK

export const blows = (a: number, whole: number) => a < whole * WIND_MIN

export type CutResult =
    | { kind: 'cut'; pieces: { from: number; parts: [Poly, Poly] }[] }
    | { kind: 'crumb' }
    | { kind: 'full' }
    | { kind: 'miss' }

/**
 * Um traço sobre os pedaços `polys` (todos em px de arte da fruta inteira).
 * Corta cada pedaço que ele atravessa de ponta a ponta, menos os cortes que
 * deixariam farelo. `whole` é a área da fruta inteira.
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
