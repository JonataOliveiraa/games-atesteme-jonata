/**
 * EF04CO05 — codificar diferentes informações para o computador. A figurinha (ou a mensagem) do tablet é
 * uma grade de casas, e o tablet guarda cada casa como um código de 0 e 1. Os que fogem só voltam quando a
 * criança manda o código deles, número por número; é o tablet quem lê o código e pinta (ou escreve) a casa.
 */

export type Bit = '0' | '1'

/** que informação cada casa guarda: pixel aceso/apagado (1 número), cor RGB (3 números) ou letra ASCII (8 números) */
export type Kind = 'bit' | 'rgb' | 'ascii'

/** um cartão do combinado: o que é, o código e como aparece (cor da casa, ou a letra) */
export interface Entry {
    id: string
    code: string
    name: string
    color: number
    glyph?: string
}

export type Cell = readonly [row: number, col: number]

/** o quanto o zoom aproxima e a distância dos fujões (z) */
export interface View {
    zoom: number
    near: number
    far: number
}

export interface PhaseDef {
    id: string
    /** as linhas da figura (ou da mensagem), um símbolo por casa */
    rows: string[]
    /** as casas que fogem; a primeira da fase 1 é a da demonstração */
    escaped: Cell[]
    /** segundos com a mira travada até o fujão fugir dela (0 = não foge) */
    dodge: number
    /** px/s */
    speed: number
    /** escapadas curtas de vez em quando */
    dash: boolean
}

export interface LevelDef {
    level: number
    kind: Kind
    title: string
    message: string
    view: View
    /** quantos números do começo do código já vêm prontos (o 010 das letras) */
    given: number
    phases: PhaseDef[]
}

export type Mode = 'intro' | 'guide' | 'play' | 'help' | 'error' | 'finale' | 'done'
