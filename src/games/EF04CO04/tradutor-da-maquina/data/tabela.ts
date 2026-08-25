import { BITS, type Entry } from '../types'

/**
 * A tabela — um PEDAÇO dela.
 *
 * São as doze letras que este jogo usa, em ordem alfabética, com o número que
 * a tabela ASCII dá a cada uma. Não é a tabela inteira de propósito: a própria
 * habilidade fala em "tabela de códigos simplificada", e vinte e seis fichas
 * numa tira de 1280px sairiam com letra de 13px, ilegível para 4º ano.
 *
 * As reticências desenhadas nas duas pontas da tira dizem, sem uma palavra,
 * que a tabela continua para os dois lados.
 */
export const TABLE: Entry[] = [
    { char: 'A', code: 65 },
    { char: 'C', code: 67 },
    { char: 'H', code: 72 },
    { char: 'I', code: 73 },
    { char: 'L', code: 76 },
    { char: 'M', code: 77 },
    { char: 'O', code: 79 },
    { char: 'P', code: 80 },
    { char: 'R', code: 82 },
    { char: 'S', code: 83 },
    { char: 'T', code: 84 },
    { char: 'U', code: 85 },
]

export const codeOf = (char: string): number =>
    TABLE.find(e => e.char === char)?.code ?? 0

/** A letra daquele número, ou nada — nem todo número é letra. */
export const charOf = (code: number): string | undefined =>
    TABLE.find(e => e.code === code)?.char

export const indexOf = (char: string): number =>
    TABLE.findIndex(e => e.char === char)

/** O número virando lâmpadas. */
export function bitsOf(code: number): boolean[] {
    return BITS.map(value => (code & value) !== 0)
}

/**
 * As lâmpadas virando número.
 *
 * É uma soma e nada além dela, e é por isso que cada chave mostra o quanto
 * vale: a criança não decora binário, ela soma 64 + 1.
 */
export function valueOf(bits: boolean[]): number {
    return bits.reduce((sum, on, i) => sum + (on ? BITS[i] : 0), 0)
}

/**
 * Onde a mensagem recebida difere da que devia chegar.
 *
 * O caso NÃO declara a posição do erro: declara as duas palavras, e quem
 * compara é o jogo. Assim é impossível o dado dizer uma coisa e a tela mostrar
 * outra, e um engano de digitação em `casos.ts` vira uma posição errada
 * visível em vez de um caso sem resposta.
 */
export function wrongIndex(word: string, received: string): number {
    for (let i = 0; i < word.length; i += 1) {
        if (word[i] !== received[i]) return i
    }
    return -1
}

/** Quantas lâmpadas separam duas letras. No Nível 3 tem que dar sempre 1. */
export function bitDistance(a: string, b: string): number {
    const x = bitsOf(codeOf(a))
    const y = bitsOf(codeOf(b))
    return x.reduce((n, on, i) => n + (on === y[i] ? 0 : 1), 0)
}
