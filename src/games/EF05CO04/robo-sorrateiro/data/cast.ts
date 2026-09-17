import type { Card, OwlDef } from '../types'

/**
 * As três guardiãs. `column` é a coluna em `coruja.png`: a linha de cima é
 * dormindo, a de baixo é acordada, e o quadro sai de `owlFrame`.
 */
export const OWLS: OwlDef[] = [
    { id: 'ru', name: 'Ru', column: 0, cycle: { asleep: 2600, awake: 1800 } },
    { id: 'nina', name: 'Nina', column: 1, cycle: { asleep: 2800, awake: 2200 } },
    { id: 'ze', name: 'Zé', column: 2, cycle: { asleep: 2200, awake: 1800 } },
]

const OWL_INDEX = new Map(OWLS.map(o => [o.id, o]))

export function owl(id: string): OwlDef {
    const found = OWL_INDEX.get(id)
    if (!found) throw new Error(`coruja desconhecida: ${id}`)
    return found
}

export function owlFrame(column: number, awake: boolean): number {
    return column + (awake ? 3 : 0)
}

/**
 * As cartas. Nenhuma guarda se está certa: quem decide é `stepOutcome`, contra
 * o estado da coruja no instante do passo.
 */
export const CARDS: Card[] = [
    { id: 'certa', asks: 'acordada', then: 'esconder', otherwise: 'andar' },
    { id: 'invertida', asks: 'acordada', then: 'andar', otherwise: 'esconder' },
    { id: 'sempre', asks: 'acordada', then: 'esconder', otherwise: 'esconder' },
]

const CARD_INDEX = new Map(CARDS.map(c => [c.id, c]))

export function card(id: string): Card {
    const found = CARD_INDEX.get(id)
    if (!found) throw new Error(`carta desconhecida: ${id}`)
    return found
}

export function cards(ids: string[]): Card[] {
    return ids.map(card)
}

const WORD: Record<string, string> = {
    andar: 'ANDAR',
    esconder: 'ESCONDER',
}

export const askLine = (c: Card) =>
    c.asks === 'acordada' ? 'SE ela estiver ACORDADA' : 'SE ela estiver DORMINDO'

export const thenLine = (c: Card) => `ENTÃO ${WORD[c.then]}`

export const elseLine = (c: Card) => `SENÃO ${WORD[c.otherwise]}`
