import type { Miss, Op, Pin, Sentence, Term } from '../types'
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
    e: 'O E quer as duas.',
    ou: 'O OU quer uma ou outra.',
    nots: 'Cada NÃO vira a sua parte.',
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

export const opText = (op: Op) => (op === 'e' ? LABEL.e : LABEL.ou)

const fact = (pin: Pin, t: Term) => (has(pin, t) ? said(t) : `não ${said(t)}`)

export function why(pin: Pin, s: Sentence, miss: Miss): string {
    const facts = s.right ? `${fact(pin, s.left.term)} e ${fact(pin, s.right.term)}` : fact(pin, s.left.term)
    return miss === 'knocked' ? `Ele ${facts}, mas não tinha sono!` : `Ele ${facts}, mas queria deitar!`
}
