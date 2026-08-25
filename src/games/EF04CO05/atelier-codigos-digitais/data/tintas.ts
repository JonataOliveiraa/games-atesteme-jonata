import type { Formato, Tinta } from '../types'

/**
 * As quatro legendas.
 *
 * Cada oficina é uma lista de tintas, e a grade não sabe qual é qual: ela só
 * pinta `color`, escreve `code` e, quando existe, desenha `char`. Trocar de
 * oficina é trocar esta lista — nada além disso.
 */

/** Preto e branco: o bitmap do enunciado da habilidade (PBM). */
const BITMAP: Tinta[] = [
    { code: '0', color: 0xfdfcf7 },
    { code: '1', color: 0x1b2430 },
]

/**
 * Tons de cinza (PGM).
 *
 * O enunciado fala em 0 a 255. Cinco degraus, e não duzentos e cinquenta e
 * seis: a criança precisa entender que o número É o tom, não decorar a escala.
 * Os cinco cobrem os extremos e o meio, que é o que ensina.
 */
const CINZA: Tinta[] = [
    { code: '0', color: 0x000000 },
    { code: '64', color: 0x404040 },
    { code: '128', color: 0x808080 },
    { code: '192', color: 0xc0c0c0 },
    { code: '255', color: 0xffffff },
]

/** Cor: o "RGB etc." da habilidade — cada pixel custa TRÊS números. */
const COR: Tinta[] = [
    { code: '255,0,0', color: 0xff3b30 },
    { code: '255,255,0', color: 0xffd60a },
    { code: '0,255,0', color: 0x2bd46a },
    { code: '0,0,255', color: 0x3b6bff },
    { code: '255,255,255', color: 0xfdfcf7 },
]

/**
 * Letras (ASCII).
 *
 * As mesmas doze do Tradutor da Máquina, de propósito: é a mesma tabela, e a
 * criança que veio de lá reconhece as fichas. Aqui a "imagem" de um código é a
 * própria letra — e é por isso que a grade não precisou de nenhum caso
 * especial para esta oficina.
 */
const ASCII: Tinta[] = [
    { code: '65', color: 0xfff6e8, char: 'A' },
    { code: '67', color: 0xfff6e8, char: 'C' },
    { code: '72', color: 0xfff6e8, char: 'H' },
    { code: '73', color: 0xfff6e8, char: 'I' },
    { code: '76', color: 0xfff6e8, char: 'L' },
    { code: '77', color: 0xfff6e8, char: 'M' },
    { code: '79', color: 0xfff6e8, char: 'O' },
    { code: '80', color: 0xfff6e8, char: 'P' },
    { code: '82', color: 0xfff6e8, char: 'R' },
    { code: '83', color: 0xfff6e8, char: 'S' },
    { code: '84', color: 0xfff6e8, char: 'T' },
    { code: '85', color: 0xfff6e8, char: 'U' },
]

export const TINTAS: Record<Formato, Tinta[]> = {
    bitmap: BITMAP,
    cinza: CINZA,
    cor: COR,
    ascii: ASCII,
}

/** O nome e a explicação de cada formato, nas cartas do Nível 3. */
export const FORMATOS: Array<{ key: Formato; nome: string; resumo: string }> = [
    { key: 'bitmap', nome: 'BITMAP', resumo: 'só preto e branco' },
    { key: 'cinza', nome: 'CINZA', resumo: 'do preto ao branco' },
    { key: 'cor', nome: 'COR', resumo: 'três números por pixel' },
    { key: 'ascii', nome: 'LETRAS', resumo: 'a tabela de caracteres' },
]

/** A abinha de cada oficina no HUD. */
export const SIGLA: Record<Formato, string> = {
    bitmap: '0 1',
    cinza: 'TONS',
    cor: 'COR',
    ascii: 'ABC',
}

/**
 * Por que o formato escolhido não serve para esta encomenda.
 *
 * Uma frase por formato, e não uma por caso: o motivo é do FORMATO, não do
 * pedido — "com 0 e 1 não existe meio-tom" vale para toda encomenda que
 * precisa de sombra. Escrever isso caso a caso só criaria nove chances de as
 * frases se contradizerem.
 */
export const PORQUE: Record<Formato, string> = {
    bitmap: 'Com 0 e 1 só existe aceso e apagado: não cabe meio-tom, nem cor, nem letra.',
    cinza: 'Tons de cinza mostram sombra, mas cor nenhuma — e letra, muito menos.',
    cor: 'Dá para fazer, mas você gastaria três números em cada pixel para algo que precisa de bem menos.',
    ascii: 'A tabela de caracteres guarda letra. Desenho ela não sabe guardar.',
}
