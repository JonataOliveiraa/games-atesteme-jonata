/**
 * Modelo de dados do Prédio dos Laços.
 */

/**
 * O valor de um laço.
 *
 * Número positivo é iteração DEFINIDA ("repita 4 vezes"). `TOP` é a iteração
 * INDEFINIDA ("até o topo") — a que funciona sem saber quantos andares o prédio
 * tem. A BNCC pede as duas, e a diferença entre elas é o Nível 3 inteiro.
 */
export const TOP = -1

export interface Caso {
    id: string
    floors: number
    windows: number
    /** N1 não tem laço externo: o editor mostra só o de dentro. */
    nested: boolean
    /** N3: o contador externo aceita `TOP` depois do maior número. */
    allowTop: boolean
    question: string
    hint: string
    successLine: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    /** Qual céu. Um por nível: dia, pôr do sol, noite. */
    sky: 'day' | 'sunset' | 'night'
    cases: Caso[]
}

export type WindowState = 'dirty' | 'washing' | 'clean'

export type CaseState = 'briefing' | 'montando' | 'rodando' | 'solved'

/** O que a simulação devolve. */
export interface RunResult {
    washed: number
    total: number
    /** Mandou subir além do último andar. */
    overFloors: boolean
    /** Mandou lavar além da última janela do andar. */
    overWindows: boolean
    exact: boolean
    usedTop: boolean
}
