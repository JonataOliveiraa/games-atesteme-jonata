/**
 * Tradutor da Máquina — EF04CO04.
 *
 * A frase da habilidade é curta: para guardar, manipular e transmitir dados, a
 * máquina precisa deles CODIFICADOS. O jogo inteiro é essa frase virando um
 * objeto que a criança pode tocar:
 *
 *      A   ↔   65   ↔   1 0 0 0 0 0 1
 *    letra    número      lâmpadas
 *
 * Os três nunca aparecem separados e nunca ficam fora de sincronia.
 */

export type CaseState = 'briefing' | 'montando' | 'enviando' | 'solved'

/** Uma linha da tabela: um caractere e o número que a máquina guarda no lugar dele. */
export interface Entry {
    char: string
    code: number
}

/**
 * O que a criança faz no caso.
 *
 *   letra     → uma letra só, e a tabela acende sozinha a ficha certa
 *   palavra   → várias letras em sequência, e a tabela para de apontar
 *   conserto  → a mensagem chegou torta; achar a fileira errada e arrumar
 */
export type Mode = 'letra' | 'palavra' | 'conserto'

export interface Caso {
    id: string
    mode: Mode
    /** O que precisa chegar na máquina. */
    word: string
    /**
     * Só no conserto: o que a máquina LEU.
     *
     * Tem o mesmo tamanho de `word` e difere em UMA letra. Qual letra e em que
     * posição, o jogo descobre comparando as duas — o caso não declara isso.
     */
    received?: string
    question: string
    hint: string
    successLine: string
}

export interface Level {
    level: number
    title: string
    objective: string
    tip: string
    cases: Caso[]
}

/**
 * Quanto vale cada chave, da esquerda para a direita.
 *
 * Sete, porque é o que a tabela ASCII usa para as letras maiúsculas: 65 a 90
 * cabem todos em sete lâmpadas. Um oitavo bit só acrescentaria uma chave que
 * nunca acende.
 */
export const BITS = [64, 32, 16, 8, 4, 2, 1] as const
export const BIT_COUNT = BITS.length
