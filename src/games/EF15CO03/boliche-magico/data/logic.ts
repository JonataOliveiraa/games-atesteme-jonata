import type { Literal, Pin, Sentence, Term } from '../types'

export function has(pin: Pin, t: Term): boolean {
    if (t.attr === 'color') return pin.color === t.value
    if (t.attr === 'size') return pin.size === t.value
    return pin[t.attr]
}

export const literalHolds = (pin: Pin, l: Literal) => (l.not ? !has(pin, l.term) : has(pin, l.term))

export function holds(s: Sentence, pin: Pin): boolean {
    const a = literalHolds(pin, s.left)
    if (!s.op || !s.right) return a
    const b = literalHolds(pin, s.right)
    return s.op === 'e' ? a && b : a || b
}

export const literals = (s: Sentence): Literal[] => (s.right ? [s.left, s.right] : [s.left])

export const sameTerm = (a: Term, b: Term) =>
    a.attr === b.attr && ('value' in a ? 'value' in b && a.value === b.value : true)

export const fits = (s: Sentence, pins: Pin[]) => pins.every(p => holds(s, p) === p.sleepy)
