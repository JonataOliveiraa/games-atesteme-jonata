import type { Level } from '../types'

/**
 * As dez encomendas.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  preto e branco   → a imagem É uma matriz de 0 e 1
 *   N2  tons e letras    → o número é o tom; a tabela é o combinado
 *   N3  qual código?     → informação diferente pede código diferente
 *
 * O Nível 3 tem QUATRO casos, e não três: são quatro formatos, e cada carta
 * precisa ser a certa exatamente uma vez. Carta que nunca serve vira pegadinha,
 * e criança sente pegadinha na hora.
 */

/** Lê o desenho de strings de dígitos — cada dígito é um índice da legenda. */
const art = (rows: string[]): number[][] =>
    rows.map(row => row.split('').map(Number))

export const LEVELS: Level[] = [

    /* ────────────────────────── NÍVEL 1 — oficina do preto e branco */
    {
        level: 1,
        title: 'Oficina do preto e branco',
        objective: 'Uma imagem pode ser escrita inteira com 0 e 1.',
        tip: 'Escolha na legenda, toque no quadro. A linha acende quando bate.',
        escolhe: false,
        oficinas: ['bitmap'],
        cases: [
            {
                id: 'a1-1', formato: 'bitmap', direcao: 'decodificar',
                cols: 5, rows: 5,
                art: art([
                    '01010',
                    '11111',
                    '11111',
                    '01110',
                    '00100',
                ]),
                titulo: 'um coração',
                question: 'A máquina mandou este código. Pinte o quadro.',
                hint: '1 é preto, 0 é branco. Uma linha de cada vez.',
                successLine: 'Vinte e cinco números viraram um coração. Era só isso o desenho o tempo todo.',
            },
            {
                id: 'a1-2', formato: 'bitmap', direcao: 'decodificar',
                cols: 5, rows: 5,
                art: art([
                    '10001',
                    '01010',
                    '00100',
                    '01010',
                    '10001',
                ]),
                titulo: 'um xis',
                question: 'Outro código chegou. Pinte de novo.',
                hint: 'Repare que cada linha tem só dois pretos.',
                successLine: 'Um xis. E a máquina nunca soube que era um xis: ela só guardou os números.',
            },
            {
                id: 'a1-3', formato: 'bitmap', direcao: 'codificar',
                cols: 5, rows: 5,
                art: art([
                    '00100',
                    '01110',
                    '11111',
                    '00100',
                    '00100',
                ]),
                titulo: 'uma seta',
                question: 'Agora ao contrário: o desenho é seu, escreva o código dele.',
                hint: 'Marque 1 onde o desenho é preto. É a mesma coisa, escrita.',
                successLine: 'Pintar e escrever o código eram o mesmo gesto — você acabou de codificar uma imagem.',
            },
        ],
    },

    /* ───────────────────────────── NÍVEL 2 — oficina dos tons e letras */
    {
        level: 2,
        title: 'Oficina dos tons e das letras',
        objective: 'Com mais números por pixel cabe sombra; com uma tabela, cabe texto.',
        tip: 'A legenda mostra quanto vale cada tom. 0 é preto, 255 é branco.',
        escolhe: false,
        oficinas: ['cinza', 'ascii'],
        cases: [
            {
                id: 'a2-1', formato: 'cinza', direcao: 'decodificar',
                cols: 4, rows: 4,
                art: art([
                    '4444',
                    '3333',
                    '2222',
                    '1111',
                ]),
                titulo: 'um degradê',
                question: 'Agora cada número é um tom. Pinte o que a máquina pediu.',
                hint: 'Quanto maior o número, mais claro. 255 é branco.',
                successLine: 'Do 192 ao 64: com dois valores só dava preto e branco, com mais valores cabe sombra.',
            },
            {
                id: 'a2-2', formato: 'cinza', direcao: 'codificar',
                cols: 4, rows: 4,
                art: art([
                    '1111',
                    '1441',
                    '1441',
                    '1111',
                ]),
                titulo: 'uma moldura',
                question: 'Este quadro já está pronto. Escreva o código dos tons.',
                hint: 'Doze células de um tom, quatro de outro. Olhe a legenda.',
                successLine: 'Uma moldura em dois números: 64 na borda, 255 no meio.',
            },
            {
                id: 'a2-3', formato: 'ascii', direcao: 'decodificar',
                cols: 3, rows: 1,
                art: art(['703']),
                titulo: 'a palavra PAI',
                question: 'Chegou 80, 65, 73. Use a tabela e monte a palavra.',
                hint: 'Cada ficha da legenda tem a letra e o número dela.',
                successLine: 'Texto também é matriz — só que de uma linha, e a legenda dela é a tabela.',
            },
        ],
    },

    /* ─────────────────────────────── NÍVEL 3 — qual código serve? */
    {
        level: 3,
        title: 'Qual código serve?',
        objective: 'Cada informação pede o código que dá conta dela, sem desperdício.',
        tip: 'Leia a encomenda e escolha o formato antes de pintar.',
        escolhe: true,
        oficinas: ['bitmap', 'cinza', 'cor', 'ascii'],
        cases: [
            {
                id: 'a3-1', formato: 'bitmap', direcao: 'decodificar',
                cols: 4, rows: 4,
                art: art([
                    '0110',
                    '1111',
                    '0110',
                    '0110',
                ]),
                titulo: 'uma seta',
                pedido: 'Uma seta preta num fundo branco.',
                question: 'Qual código serve para esta encomenda?',
                hint: 'Só existem duas cores aqui. Não desperdice números.',
                successLine: 'Duas cores, dois valores. Qualquer código maior seria peso à toa.',
            },
            {
                id: 'a3-2', formato: 'cinza', direcao: 'decodificar',
                cols: 3, rows: 3,
                art: art([
                    '432',
                    '321',
                    '210',
                ]),
                titulo: 'uma sombra',
                pedido: 'Uma bolinha com sombra, do claro ao escuro.',
                question: 'E para esta?',
                hint: 'Sombra é meio-tom. Com 0 e 1 não existe meio.',
                successLine: 'Do 255 ao 0 na diagonal. Sombra precisa dos degraus do meio.',
            },
            {
                id: 'a3-3', formato: 'ascii', direcao: 'decodificar',
                cols: 2, rows: 1,
                art: art(['63']),
                titulo: 'a palavra OI',
                pedido: 'A palavra OI.',
                question: 'E para esta?',
                hint: 'Isto não é desenho: é texto.',
                successLine: 'Para texto, a tabela. Desenhar as letras pixel a pixel gastaria cem vezes mais.',
            },
            {
                id: 'a3-4', formato: 'cor', direcao: 'decodificar',
                cols: 3, rows: 3,
                art: art([
                    '000',
                    '111',
                    '222',
                ]),
                titulo: 'uma bandeirinha',
                pedido: 'Uma bandeirinha de três faixas coloridas.',
                question: 'E na última?',
                hint: 'Cor não cabe em tom de cinza. Repare no que cada ficha custa.',
                successLine: 'Cada pixel colorido custa três números — e é por isso que só se paga isso quando precisa.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)
