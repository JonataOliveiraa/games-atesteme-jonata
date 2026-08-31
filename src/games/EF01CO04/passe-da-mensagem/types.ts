/**
 * ══════════════════════════════════════════════════════════════════════
 *  PASSE DA MENSAGEM — EF01CO04
 * ══════════════════════════════════════════════════════════════════════
 *
 * A habilidade pede reconhecer que a informação pode ser ARMAZENADA,
 * TRANSMITIDA e DESCRITA EM VÁRIAS LINGUAGENS. O jogo irmão desta habilidade,
 * o Correio Multimídia, já cobre o meio de transmissão; aqui o assunto é a
 * linguagem: a bola só chega em quem está dizendo A MESMA COISA de outro jeito.
 *
 * O veredito nunca é um campo guardado na plaquinha — é uma função da bola e
 * da plaquinha no instante do toque (ver `sameInformation`). A mesma plaquinha
 * é resposta certa numa fase e distrator na outra.
 */

export type LevelNumber = 1 | 2 | 3

/** Os quatro assuntos das mensagens. */
export type SubjectId = 'festa' | 'lapis' | 'treino' | 'parabens'

/** As três linguagens em que uma mensagem pode ser descrita. */
export type Language = 'desenho' | 'fala' | 'palavra'

export type PlayState = 'intro' | 'tutorial' | 'playing' | 'passing' | 'locked' | 'mural' | 'ending'

export interface SubjectDef {
    id: SubjectId
    /** A palavra escrita — a linguagem `palavra`. */
    word: string
    /** A frase inteira, usada no mural e nos balões. */
    phrase: string
    texture: string
}

/** Uma mensagem é sempre um par: o que ela diz, e em que linguagem está. */
export interface Message {
    subject: SubjectDef
    language: Language
}

export interface PhaseDef {
    /** Quantos colegas ficam em quadra. */
    players: number
    /** As linguagens que podem aparecer nesta fase. */
    languages: Language[]
    /**
     * Distratores do mesmo mundo (bolo × presente). É assim que o nível 3
     * aperta: por semelhança, e não por velocidade.
     */
    nearMiss: boolean
}

export interface LevelDef {
    level: LevelNumber
    name: string
    phases: PhaseDef[]
}

/** Um colega em quadra, com a plaquinha que ele está segurando. */
export interface Teammate {
    index: number
    x: number
    y: number
    message: Message
    /** Linha já recusada nesta parada: não aceita mais a bola. */
    blocked: boolean
}
