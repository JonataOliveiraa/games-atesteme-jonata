import type { Literal, Miss, Pin, Term } from '../types'
import { has } from './logic'

export const OPENING = {
    hello: 'Oi! Eu sou a Bola Mágica.',
    sleepy: 'Estes pinos estão com sono.',
    rule: 'Eu derrubo quem a frase mandar!',
} as const

export const TEACH = {
    goal: 'Derrube só quem tem sono!',
    build: 'Monte a frase da bola.',
    not: 'O NÃO troca a resposta.',
    go: 'Sua vez!',
} as const

export const LABEL = {
    level: 'Nível',
    lead: 'Derruba quem',
    not: 'NÃO',
    e: 'E',
    ou: 'OU',
    play: 'JOGAR',
    empty: '?',
} as const

const VERB: Record<Term['attr'], string> = {
    color: 'é',
    star: 'tem',
    glasses: 'tem',
    size: 'é',
}

const NAME: Record<'star' | 'glasses', string> = { star: 'estrela', glasses: 'óculos' }

const wordOf = (t: Term) => ('value' in t ? t.value : NAME[t.attr])

export const chipText = (t: Term) => `${VERB[t.attr]} ${wordOf(t).toUpperCase()}`

const said = (t: Term) => `${VERB[t.attr]} ${wordOf(t)}`

const fact = (pin: Pin, l: Literal) => (has(pin, l.term) ? said(l.term) : `não ${said(l.term)}`)

export function why(pin: Pin, l: Literal, miss: Miss): string {
    return miss === 'knocked' ? `Ele ${fact(pin, l)}, mas não tinha sono!` : `Ele ${fact(pin, l)}, mas queria deitar!`
}
