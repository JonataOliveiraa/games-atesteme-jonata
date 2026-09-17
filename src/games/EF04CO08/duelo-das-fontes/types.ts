/**
 * Duelo das Fontes — EF04CO08.
 *
 * O robô espalha tudo sem conferir. A criança pergunta aos vizinhos antes de
 * decidir se aquilo sai do balcão. O veredito nunca está guardado num campo:
 * ele sai do que as fontes responderam e de quem elas são.
 */

export type AnswerKind = 'confirms' | 'denies' | 'offTopic'

export type Choice = 'spread' | 'hold'

export type Phase = 'dealing' | 'asking' | 'locked' | 'resolved' | 'paused'

export interface Neighbour {
    id: string
    name: string
    /**
     * Como ele se apresenta, na própria voz, uma vez por nível.
     *
     * Não é um cargo escrito numa etiqueta: é ele dizendo o que FAZ, e portanto
     * do que ele pode saber. A pergunta do jogo inteiro é "quem podia saber
     * disso?", e é esta frase que dá à criança como respondê-la.
     */
    intro: string
    /** Frame do selo dele na folha de ícones. */
    icon: number
    /** Ele viu, ou só ouviu falar? */
    firsthand: boolean
}

export interface Answer {
    neighbour: string
    /** Frame do desenho da plaquinha. */
    icon: number
    /** Até 5 palavras. */
    text: string
    kind: AnswerKind
    fresh: boolean
    /** "de 2019" — só aparece quando `fresh` é falso. */
    stamp?: string
}

export interface Headline {
    id: string
    icon: number
    text: string
    answers: Answer[]
    close: string
}

export interface LevelDef {
    level: number
    /** O lembrete do cabeçalho. */
    goal: string
    /** A fala do robô quando os vizinhos sobem, na primeira rodada do nível. */
    meet: string
    /** A única linha do tutorial do nível: o que ele estreia. */
    hint: string
    neighbours: Neighbour[]
    headlines: Headline[]
}
