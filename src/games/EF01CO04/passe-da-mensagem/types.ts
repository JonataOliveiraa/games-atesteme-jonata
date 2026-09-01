/**
 * ══════════════════════════════════════════════════════════════════════
 *  PASSE DA MENSAGEM — EF01CO04
 * ══════════════════════════════════════════════════════════════════════
 *
 * A criança recebe um recado em DESENHO e monta o mesmo recado na linguagem
 * que a fase pede — em fala, ou em palavra. Aperta ENVIAR, e o colega do outro
 * lado lê o que ela mandou e põe na mesa dele, um item de cada vez.
 *
 * A prova de que a informação sobreviveu à troca de linguagem é a MESA DELE
 * ficar igual ao recado do topo. Não é uma frase explicando: é a tela
 * mostrando.
 *
 * Ver PLANEJAMENTO.md.
 */

export type LevelNumber = 1 | 2 | 3

/** Os quatro objetos do jogo. A paleta mostra sempre os quatro, nesta ordem. */
export type ItemId = 'bolo' | 'lapis' | 'presente' | 'relogio'

/** As linguagens em que o mesmo recado pode ser descrito. */
export type Language = 'desenho' | 'fala' | 'palavra'

export type PlayState = 'tutorial' | 'building' | 'sending' | 'locked' | 'ending'

export interface ItemDef {
    id: ItemId
    word: string
    texture: string
}

export interface PhaseDef {
    /** O recado, em ordem. Pode repetir o mesmo item. */
    message: ItemId[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    /** A linguagem que a mesa pede nesta rodada inteira. */
    language: Language
    /**
     * Cartas de PALAVRA com o desenho pequeno no canto. É o degrau entre ler
     * a figura e ler a palavra: some no nível 3.
     */
    wordHint: boolean
    phases: PhaseDef[]
}
