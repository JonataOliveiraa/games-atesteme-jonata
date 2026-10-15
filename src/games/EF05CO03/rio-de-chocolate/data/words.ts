import type { Literal, Sweet, Term } from '../types'

export const TEACH = {
    party: 'A festa é do outro lado!',
    hop: 'Vou pular de doce em doce!',
    rule: 'A placa diz qual aguenta.',
    not: 'O NÃO troca a resposta.',
    go: 'Sua vez!',
} as const

export const HELP = {
    rule: 'A placa diz qual aguenta.',
    not: 'O NÃO troca a resposta.',
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

export function why(sweet: Sweet, l: Literal): string {
    const verb = verbOf(l.term)
    const yes = sweet[l.term.attr] === l.term.value
    return yes ? `Esse doce ${verb} ${l.term.value}!` : `Esse doce não ${verb} ${l.term.value}!`
}
