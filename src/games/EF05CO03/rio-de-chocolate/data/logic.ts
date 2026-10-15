import type { Literal, Rule, Sweet, Term } from '../types'

export const has = (s: Sweet, t: Term) => s[t.attr] === t.value

export const literalHolds = (s: Sweet, l: Literal) => (l.not ? !has(s, l.term) : has(s, l.term))

export function holds(rule: Rule, s: Sweet): boolean {
    const a = literalHolds(s, rule.left)
    if (!rule.op || !rule.right) return a
    const b = literalHolds(s, rule.right)
    return rule.op === 'e' ? a && b : a || b
}

export const literals = (rule: Rule): Literal[] => (rule.right ? [rule.left, rule.right] : [rule.left])

export function culprits(rule: Rule, s: Sweet): Literal[] {
    const ls = literals(rule)
    if (rule.op === 'ou') return ls
    return ls.filter(l => !literalHolds(s, l))
}
