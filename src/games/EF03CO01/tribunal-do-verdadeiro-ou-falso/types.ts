/**
 * O arquivo anterior declarava `LogicSentence` TRÊS vezes.
 *
 * TypeScript funde interfaces homônimas, então o tipo efetivo era a união dos
 * campos das três — funcionava por acidente. O efeito colateral é que nenhuma
 * das três dizia a verdade sozinha: quem lia a primeira não via `source`, quem
 * lia a segunda não via `core`. Aqui existe uma só.
 */

export interface LogicSentence {
    id: string
    /** Veículo/origem da "notícia". Aparece no cabeçalho do cartão. */
    source: string
    /** A frase como a criança lê, já com o NÃO se houver. */
    text: string
    /** A informação central, SEM a negação. Base do painel de explicação. */
    core: string
    /** Essa informação central é verdade? */
    coreValue: boolean
    hasNegation: boolean
    negationWord?: string
    /** Valor final da frase: `hasNegation ? !coreValue : coreValue`. */
    correctValue: boolean
    explanation: string
}

export interface LevelConfig {
    level: 1 | 2 | 3
    /** Segundos por sentença. Ausente = sem cronômetro (Níveis 1 e 2). */
    perSentenceTimer?: number
    sentences: LogicSentence[]
    title: string
    objective: string
    tip: string
}

/** Fase da rodada. Só `waiting-answer` aceita toque nos botões. */
export type RoundPhase =
    | 'intro'
    | 'waiting-answer'
    | 'feedback'
    | 'level-complete'
