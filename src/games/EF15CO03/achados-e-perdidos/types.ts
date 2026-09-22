/**
 * ══════════════════════════════════════════════════════════════════════════
 *  EF15CO03 — negação, conjunção e disjunção sobre verdadeiro e falso
 * ══════════════════════════════════════════════════════════════════════════
 *
 *  O fato não é conhecimento prévio: é o bichinho desenhado na tela. Toda
 *  carta é decidida OLHANDO para ele, e é isso que faz o jogo servir ao 1º
 *  ano. O valor de uma carta nunca está nos dados — sai de `evaluate()`,
 *  contra o bichinho da fase.
 *
 *  Nível 1: um termo, com e sem NÃO.
 *  Nível 2: dois termos, ligados por E ou por OU.
 *  Nível 3: o NÃO dentro do E e do OU.
 */

/** Um campo do cartaz. É também a "gaveta" que cada valor acende. */
export type Field = 'color' | 'hat' | 'glasses' | 'size'

export type ColorValue = 'blue' | 'green' | 'red' | 'yellow'

export type SizeValue = 'big' | 'small'

/** O que um termo pode afirmar. */
export type Value = ColorValue | SizeValue | 'hat' | 'glasses'

/** `negated` é o NÃO, e ele só existe grudado num termo — nunca solto. */
export interface Term {
    value: Value
    negated: boolean
}

export type Operator = 'e' | 'ou'

export interface CardDef {
    id: string
    term: Term
    /** Ausente: carta de um termo só. */
    op?: Operator
    right?: Term
}

export interface CritterDef {
    id: string
    /** O quadro dele em `bichinhos.png`. */
    frame: number
    name: string
    color: ColorValue
    hat: boolean
    glasses: boolean
    big: boolean
}

export interface CaseDef {
    id: string
    /** Id em `data/critters.ts`. */
    critter: string
    /** Os campos que este cartaz pede. */
    fields: Field[]
    /** Três ids de carta. Não há compra e não há reposição. */
    hand: string[]
}

export interface LevelDef {
    level: number
    cases: CaseDef[]
    /** A régua só aparece quando alguma carta fala de tamanho. */
    ruler: boolean
}

export type Phase = 'intro' | 'playing' | 'judging' | 'done'
