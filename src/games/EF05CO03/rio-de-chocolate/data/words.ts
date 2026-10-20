import type { Literal, Rule, Sweet, Term } from '../types'
import { culprits, has } from './logic'

export const TEACH = {
    party: 'A festa é do outro lado!',
    hop: 'Vou pular de doce em doce!',
    rule: 'A placa diz qual aguenta.',
    not: 'O NÃO troca a resposta.',
    and: 'Com E, as duas partes têm que valer.',
    or: 'Com OU, basta uma parte valer.',
    go: 'Sua vez!',
} as const

export const HELP = {
    rule: 'A placa diz qual aguenta.',
    not: 'O NÃO troca a resposta.',
    and: 'Com E, as duas partes têm que valer.',
    or: 'Com OU, basta uma parte valer.',
} as const

export const LABEL = {
    level: 'Nível',
    lead: 'Aguenta o doce que',
    not: 'NÃO',
    e: 'E',
    ou: 'OU',
} as const

const VERB: Record<Term['attr'], (v: string) => string> = {
    color: () => 'é',
    shape: () => 'é',
    top: v => (v === 'granulado' ? 'tem' : 'é'),
    size: () => 'é',
}

export const verbOf = (t: Term) => VERB[t.attr](t.value)

export const chipText = (t: Term) => `${verbOf(t)} ${t.value.toUpperCase()}`

const said = (t: Term) => `${verbOf(t)} ${t.value}`

const fact = (sweet: Sweet, l: Literal) => (has(sweet, l.term) ? said(l.term) : `não ${said(l.term)}`)

export function why(sweet: Sweet, rule: Rule): string {
    const [a, b] = culprits(rule, sweet)
    if (!a) return ''
    if (!b) return `Esse doce ${fact(sweet, a)}!`
    if (!has(sweet, a.term) && !has(sweet, b.term)) return `Esse doce ${fact(sweet, a)} nem ${said(b.term)}!`
    return `Esse doce ${fact(sweet, a)} e ${fact(sweet, b)}!`
}
