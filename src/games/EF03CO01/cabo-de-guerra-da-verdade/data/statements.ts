import type { Statement, Token } from '../types'

/** A conta inteira do jogo: negar inverte, e é só isso. */
export const valueOf = (fact: boolean, token: Token) =>
    token === 'negated' ? !fact : fact

export const solves = (target: Statement, token: Token) =>
    valueOf(target.factValue, token) === target.asked

export const answerOf = (target: Statement): Token =>
    target.factValue === target.asked ? 'plain' : 'negated'

export const sentenceWith = (target: Statement, label: string) =>
    `${target.before} ${label} ${target.after}`
