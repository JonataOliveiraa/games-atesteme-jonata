import type { Level } from '../types'

/**
 * Os nove envios.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  uma letra          → a máquina guarda NÚMERO, não letra
 *   N2  uma palavra        → texto é uma fila de números, um por letra
 *   N3  a mensagem torta   → uma lâmpada errada já vira outra letra
 *
 * O Nível 3 não é "mais difícil" por capricho. Ele inverte o caminho: em vez
 * de codificar, a criança lê o que a máquina decodificou e procura a fileira
 * que não bate. É a segunda metade da habilidade — e é onde a codificação
 * deixa de ser um ritual e passa a ter consequência.
 */

export const LEVELS: Level[] = [

    /* ──────────────────────────────── NÍVEL 1 — uma letra de cada vez */
    {
        level: 1,
        title: 'Uma letra de cada vez',
        objective: 'A máquina não guarda letra: guarda número, e o número vira lâmpadas.',
        tip: 'Acenda as chaves que somam o número da letra.',
        cases: [
            {
                id: 't1-1', mode: 'letra', word: 'A',
                question: 'Envie a letra A para a máquina.',
                hint: 'A tabela diz que A é 65. Quais chaves somam 65?',
                successLine: '64 + 1 = 65. Para a máquina, isso É a letra A.',
            },
            {
                id: 't1-2', mode: 'letra', word: 'H',
                question: 'Agora a letra H.',
                hint: 'H é 72. Duas chaves bastam.',
                successLine: '64 + 8 = 72. Outra letra, outras lâmpadas.',
            },
            {
                id: 't1-3', mode: 'letra', word: 'C',
                question: 'E agora a letra C.',
                hint: 'C é 67 — só dois a mais que o A.',
                successLine: '64 + 2 + 1 = 67. Quase o A, e mesmo assim outra letra.',
            },
        ],
    },

    /* ─────────────────────────── NÍVEL 2 — a palavra, letra por letra */
    {
        level: 2,
        title: 'Palavras, letra por letra',
        objective: 'Uma palavra é uma fila de números, um para cada letra.',
        tip: 'Procure cada letra na tabela. Uma de cada vez, na ordem.',
        cases: [
            {
                id: 't2-1', mode: 'palavra', word: 'PAI',
                question: 'Mande a palavra PAI. Uma letra de cada vez.',
                hint: 'Agora a tabela não aponta mais: procure o P você mesmo.',
                successLine: 'Três letras, três números: 80, 65, 73.',
            },
            {
                id: 't2-2', mode: 'palavra', word: 'LUA',
                question: 'Agora a palavra LUA.',
                hint: 'O U precisa de quatro chaves. Some devagar.',
                successLine: '76, 85, 65 — e a máquina lê LUA.',
            },
            {
                id: 't2-3', mode: 'palavra', word: 'MAR',
                question: 'A última: MAR.',
                hint: 'M e R começam igual. Olhe bem os dois números.',
                successLine: 'Para você é uma palavra. Para a máquina, 77, 65, 82.',
            },
        ],
    },

    /* ──────────────────────── NÍVEL 3 — a mensagem que chegou torta */
    {
        level: 3,
        title: 'A mensagem chegou torta',
        objective: 'Uma lâmpada errada já é outra letra: por isso o código tem que ser exato.',
        tip: 'Ache a fileira que não bate com a palavra e conserte a lâmpada.',
        cases: [
            {
                id: 't3-1', mode: 'conserto', word: 'SOL', received: 'SOM',
                question: 'Devia chegar SOL, e a máquina leu SOM. Ache a fileira errada.',
                hint: 'Toque na fileira que não bate. Sobra uma lâmpada só.',
                successLine: 'M é 77 e L é 76: uma lâmpada de diferença, e já era outra letra.',
            },
            {
                id: 't3-2', mode: 'conserto', word: 'PAI', received: 'TAI',
                question: 'Devia chegar PAI, e a máquina leu TAI. Desta vez o erro é logo no começo.',
                hint: 'T é 84 e P é 80. Qual lâmpada está sobrando?',
                successLine: 'Apagou a lâmpada do 4 e o T virou P. É só isso que separa os dois.',
            },
            {
                id: 't3-3', mode: 'conserto', word: 'LUA', received: 'LTA',
                question: 'Devia chegar LUA, e a máquina leu LTA. Agora o erro está no meio.',
                hint: 'T é 84 e U é 85. Falta uma lâmpada, a menor de todas.',
                successLine: 'Uma lâmpada de 1 separava LUA de LTA. A máquina não adivinha: ela lê.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)
