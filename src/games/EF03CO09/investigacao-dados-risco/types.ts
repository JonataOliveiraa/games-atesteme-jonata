/**
 * Modelo de dados do Investigação: Dados em Risco.
 */

export type CaseKind = 'achar' | 'escolher'

/**
 * Um pedaço da mensagem.
 *
 * `pill: false` é texto de ligação — não é tocável e serve só para a frase
 * ficar em português de verdade. `pill: true` é um PEDAÇO DE INFORMAÇÃO, e é o
 * que a criança pode tocar.
 *
 * Marcar as pastilhas é metade do ensino: antes de perguntar "qual é o
 * perigoso?", o jogo já mostra "estas são as informações que este post carrega".
 */
export interface Chunk {
    id: string
    text: string
    pill: boolean
    /** Só em pastilha: este pedaço não devia estar no post. */
    risky?: boolean
    /** Só em `risky`: a frase do cartão de impacto. */
    impact?: string
    /** Só em `risky`: quantos desconhecidos sobem. 3 a 6, conforme o peso. */
    watchers?: number
    /** Só em pastilha não perigosa: por que ela pode ser postada. */
    safe?: string
}

export interface Message {
    from: string
    chunks: Chunk[]
    /** Nível 3: o que esta versão entrega, ou por que ela é segura. */
    why?: string
}

export interface Caso {
    id: string
    /** A pergunta acima da mensagem. Muda entre 'achar' e 'escolher'. */
    question: string
    kind: CaseKind
    /** `kind: 'achar'` */
    message?: Message
    /** `kind: 'escolher'` — sempre duas. */
    options?: Message[]
    /** `kind: 'escolher'` — qual das duas pode ir para a internet. */
    safeIndex?: number
    successLine: string
    hint: string
}

export interface Level {
    level: 1 | 2 | 3
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

/** Fase do caso. */
export type CaseState =
    | 'briefing'
    | 'investigando'
    | 'revelando'
    | 'solved'
