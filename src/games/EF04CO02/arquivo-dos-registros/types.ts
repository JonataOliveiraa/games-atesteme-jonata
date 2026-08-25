/**
 * Modelo de dados do Arquivo dos Registros.
 *
 * Um REGISTRO é um conjunto de campos com NOME. É essa a habilidade: a criança
 * aprende que "Recife" sozinho não quer dizer nada — quem dá sentido ao valor é
 * o nome do campo em que ele mora.
 */

export type FieldId = 'cidade' | 'ano' | 'esporte' | 'comida' | 'bicho'

/** Uma criança do arquivo. Os cinco campos são sempre os mesmos. */
export interface Ficha {
    id: string
    nome: string
    /** Chave da textura: 'portrait-7'. */
    portrait: string
    cidade: string
    ano: string
    esporte: string
    comida: string
    bicho: string
}

/** Nível 1: a pergunta em português e o campo que a responde. */
export interface Ask {
    prompt: string
    field: FieldId
}

/** Um par campo/valor: o que o filtro procura, ou o que o formulário diz. */
export interface Criterio {
    field: FieldId
    value: string
}

export type CaseKind =
    /** N1: uma ficha aberta. Toque no campo que responde. */
    | 'campo'
    /** N2: várias fichas. Toque em todas que passam no filtro. */
    | 'filtrar'
    /** N3: um formulário anônimo. Toque na ficha de quem preencheu. */
    | 'identificar'

export interface Caso {
    id: string
    kind: CaseKind
    question: string
    hint: string
    successLine: string

    /** `campo` */
    fichaId?: string
    asks?: Ask[]

    /** `filtrar` e `identificar` */
    fichaIds?: string[]
    /** Quais campos aparecem no cartão pequeno. Três cabem; cinco não. */
    show?: FieldId[]

    /** `filtrar`: todos os critérios precisam bater. */
    filters?: Criterio[]

    /** `identificar`: o que o formulário anônimo revela. */
    form?: Criterio[]
    answerId?: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

export type CardState = 'idle' | 'hover' | 'ok' | 'no'
export type RowState = 'idle' | 'hover' | 'ok' | 'no'
export type CaseState = 'briefing' | 'jogando' | 'revelando' | 'solved'
