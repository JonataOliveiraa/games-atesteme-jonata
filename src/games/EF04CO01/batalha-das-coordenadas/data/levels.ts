import type { Caso, Cell, Level } from '../types'

/**
 * Os nove casos.
 *
 * ── COMO LER UMA COORDENADA AQUI ─────────────────────────────────────────
 *
 * `col` e `row` são 0-based; a criança vê `A`, `B`, `C`… e `1`, `2`, `3`…
 * Então `{ col: 1, row: 2 }` é a célula **B3** na tela. A conversão mora em
 * `theme.ts` (`cellName`) e em lugar nenhum mais.
 *
 * ── O QUE CADA NÍVEL ACRESCENTA ──────────────────────────────────────────
 *
 *   N1  a coordenada vem pronta        → ler letra e número, achar o cruzamento
 *   N2  duas pistas separadas          → cruzar coluna com linha sozinha
 *   N3  pistas de descarte             → eliminar o que não pode ser
 *
 * O Nível 3 é o único em que o toque MARCA em vez de escolher, e é de
 * propósito: "registro de descarte" é o que a habilidade pede, e é o raciocínio
 * que sobra quando a resposta não está escrita em lugar nenhum.
 */

const at = (col: number, row: number): Cell => ({ col, row })

export const LEVELS: Level[] = [

    /* ────────────────────────────────── NÍVEL 1 — ache a coordenada */
    {
        level: 1,
        title: 'Ache a coordenada',
        objective: 'Cada posição tem uma letra e um número.',
        tip: 'A letra é a coluna. O número é a linha.',
        cases: [
            {
                id: 'b1-1',
                kind: 'coordenada',
                cols: 4, rows: 4,
                question: 'Cave onde o mapa mandar.',
                hint: 'Ache a coluna da letra, depois desça até a linha do número.',
                targets: [at(1, 2), at(3, 0), at(0, 3)],
                successLine: 'Letra primeiro, número depois. É assim que se acha qualquer posição.',
            },
            {
                id: 'b1-2',
                kind: 'coordenada',
                cols: 4, rows: 4,
                question: 'Mais três buracos para cavar.',
                hint: 'Confira a letra antes de cavar: C não é B.',
                targets: [at(2, 1), at(0, 0), at(3, 3)],
                successLine: 'Três tesouros seguidos. Você já lê coordenada sem contar no dedo.',
            },
            {
                id: 'b1-3',
                kind: 'coordenada',
                cols: 4, rows: 4,
                question: 'O último mapa do dia.',
                hint: 'A mesma letra pode estar em linhas diferentes.',
                targets: [at(2, 3), at(2, 0), at(1, 1)],
                successLine: 'Mesma coluna, linhas diferentes: a letra sozinha não basta.',
            },
        ],
    },

    /* ──────────────────────────────── NÍVEL 2 — cruze as duas pistas */
    {
        level: 2,
        title: 'Cruze as duas pistas',
        objective: 'Uma pista dá a coluna, a outra dá a linha.',
        tip: 'Ache onde as duas pistas se encontram.',
        cases: [
            {
                id: 'b2-1',
                kind: 'cruzar',
                cols: 4, rows: 4,
                question: 'O tesouro está onde as duas pistas se cruzam.',
                hint: 'Ande pela coluna da primeira pista até a linha da segunda.',
                clues: [
                    'O tesouro está na coluna C.',
                    'E está na linha 2.',
                ],
                target: at(2, 1),
                successLine: 'Coluna C com linha 2 dá C2. Uma pista sozinha não acha nada.',
            },
            {
                id: 'b2-2',
                kind: 'cruzar',
                cols: 4, rows: 4,
                question: 'Duas pistas, um lugar só.',
                hint: 'Entre B e D só existe uma coluna.',
                clues: [
                    'O tesouro está na linha 4.',
                    'E numa coluna que fica entre B e D.',
                ],
                target: at(2, 3),
                successLine: 'Entre B e D só cabe o C. A pista não precisa dar o nome para dar a coluna.',
            },
            {
                id: 'b2-3',
                kind: 'cruzar',
                cols: 4, rows: 4,
                question: 'A última pista do capitão.',
                hint: 'A última linha é a de baixo de todas.',
                clues: [
                    'O tesouro está na primeira coluna.',
                    'E na última linha.',
                ],
                target: at(0, 3),
                successLine: 'Primeira coluna é A, última linha é 4. A matriz tem começo e fim.',
            },
        ],
    },

    /* ───────────────────────────── NÍVEL 3 — descarte o que não pode */
    {
        level: 3,
        title: 'Descarte o que não pode',
        objective: 'Riscar o impossível é o que sobra quando ninguém diz a resposta.',
        tip: 'Toque nos baús que as pistas eliminam. O que sobrar é o tesouro.',
        cases: [
            {
                id: 'b3-1',
                kind: 'descartar',
                cols: 4, rows: 4,
                question: 'Toque nos baús que as pistas ELIMINAM.',
                hint: 'Confira baú por baú: alguma pista risca este?',
                clues: [
                    'Não está na linha 1.',
                    'Não está na coluna B.',
                    'Não está na coluna D.',
                ],
                //         A1        B4        D3        C2 (fica)
                chests: [at(0, 0), at(1, 3), at(3, 2), at(2, 1)],
                discard: [0, 1, 2],
                successLine: 'Sobrou C2 sem ninguém dizer onde era. Descartar também é achar.',
            },
            {
                id: 'b3-2',
                kind: 'descartar',
                cols: 5, rows: 4,
                question: 'Toque nos baús que as pistas ELIMINAM.',
                hint: 'Uma pista pode riscar mais de um baú.',
                clues: [
                    'Não está nas duas primeiras colunas.',
                    'Não está na linha 4.',
                    'Não está na coluna E.',
                ],
                //         A2        B1        E3        C4        D2 (fica)
                chests: [at(0, 1), at(1, 0), at(4, 2), at(2, 3), at(3, 1)],
                discard: [0, 1, 2, 3],
                successLine: 'Quatro riscados, um de pé. D2 era o único que passava nas três pistas.',
            },
            {
                id: 'b3-3',
                kind: 'descartar',
                cols: 5, rows: 4,
                question: 'Toque nos baús que as pistas ELIMINAM.',
                hint: 'Leia as três pistas antes de tocar no primeiro baú.',
                clues: [
                    'Não está na linha 1 nem na linha 2.',
                    'Não está na coluna A.',
                    'Não está na coluna C.',
                ],
                //         A3        C4        B1        E2        D1        B3 (fica)
                chests: [at(0, 2), at(2, 3), at(1, 0), at(4, 1), at(3, 0), at(1, 2)],
                discard: [0, 1, 2, 3, 4],
                successLine: 'Cinco baús eliminados por três frases. É assim que um detetive fecha um caso.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/**
 * O baú que as pistas NÃO eliminam.
 *
 * Calculado, nunca escrito: se o alvo fosse um campo à parte, daria para ele
 * discordar de `discard` e o caso ficaria sem solução sem ninguém perceber.
 */
export function survivorOf(caso: Caso): Cell | null {
    const chests = caso.chests ?? []
    const cut = new Set(caso.discard ?? [])
    const left = chests.filter((_, i) => !cut.has(i))
    return left.length === 1 ? left[0] : null
}

export const sameCell = (a: Cell, b: Cell) => a.col === b.col && a.row === b.row
