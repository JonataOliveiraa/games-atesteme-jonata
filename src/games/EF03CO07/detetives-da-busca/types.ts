/**
 * Modelo de dados do Detetives da Busca. Ver MECANICA.md §2.
 */

export type ResultType = 'site' | 'imagem' | 'video'

export type FilterId = 'all' | ResultType

export interface Result {
    id: string
    /** Título curto. No máximo duas linhas no cartão. */
    title: string
    /** De onde veio: 'Enciclopédia Infantil'. Dá contexto sem exigir leitura longa. */
    source: string
    /**
     * O trecho, no máximo duas linhas.
     *
     * As palavras entre asteriscos são pintadas em destaque quando a lupa abre:
     * `'Ave que vive no *gelo* e nada muito bem.'`
     */
    snippet: string
    type: ResultType
    /**
     * As palavras que fazem este resultado aparecer.
     *
     * É SÓ ISTO que a busca casa. Não existe `correctKeywordId` em lugar nenhum
     * do modelo: se uma palavra é boa ou não, o jogo calcula na hora
     * (MECANICA.md §4.3). O dado declara fatos, não gabarito.
     */
    tags: string[]
    /** O que o navegador diz quando a criança escolhe este resultado. */
    verdict: string
}

export interface Word {
    id: string
    label: string
}

export interface Case {
    id: string
    /** O pedido, em português normal. */
    question: string
    /** Etiqueta do critério, só no Nível 3: 'APRENDER A FAZER'. */
    criterion?: string
    /** Qual resultado responde ao pedido. */
    answerId: string
    /** Palavras já na barra quando o caso abre. Vazio no N1. */
    baseWords: string[]
    /** Palavras oferecidas na bandeja. Vazio no N3. */
    tray: Word[]
    /**
     * Quantas palavras a barra comporta.
     *
     * 1 no N1 (tocar substitui), 2 no N2 (a bandeja escreve no segundo e o
     * toque repetido desliga), 0 no N3 (a busca já está pronta e só é exibida).
     * A bandeja escreve sempre no ÚLTIMO slot — os três níveis saem dessa regra
     * só, sem nenhum caso especial.
     */
    slots: 0 | 1 | 2
    /** Vazio = a faixa de filtros não existe neste caso. */
    filters: FilterId[]
    results: Result[]
    hint: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    cases: Case[]
}

/** O que está escrito na barra agora. */
export interface Query {
    words: string[]
    filter: FilterId
}

/** Fase do caso. Ver MECANICA.md §1. */
export type CaseState =
    | 'briefing'
    | 'searching'
    | 'refreshing'
    | 'reading'
    | 'solved'
