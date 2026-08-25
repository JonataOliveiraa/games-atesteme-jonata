import { TOP, type Caso, type Level, type RunResult } from '../types'

/**
 * Os nove prédios.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  um andar só            → um laço, e ele conta janelas
 *   N2  laço dentro de laço    → dois números resolvem o prédio inteiro
 *   N3  prédios grandes        → "até o topo" resolve QUALQUER prédio
 *
 * O Nível 3 não fica mais difícil de contar por capricho: 60 janelas com dois
 * números é exatamente o argumento da BNCC para o laço aninhado. E o "até o
 * topo" existe para a criança descobrir que um programa pode funcionar sem
 * saber o tamanho do problema — a iteração indefinida.
 */

export const LEVELS: Level[] = [

    /* ─────────────────────────────────── NÍVEL 1 — um andar de cada vez */
    {
        level: 1,
        title: 'Um laço, um andar',
        objective: 'Repetir é dizer quantas vezes, não repetir a ordem.',
        tip: 'Ajuste o número até ele bater com as janelas do andar.',
        sky: 'day',
        cases: [
            {
                id: 'p1-1',
                floors: 1, windows: 4, nested: false, allowTop: false,
                question: 'Lave as janelas deste andar.',
                hint: 'Conte as janelas e ponha esse número no laço.',
                successLine: 'Uma ordem só, repetida 4 vezes. É isso que um laço faz.',
            },
            {
                id: 'p1-2',
                floors: 1, windows: 6, nested: false, allowTop: false,
                question: 'Este andar é mais largo. Lave tudo.',
                hint: 'Mais janelas, mesmo laço: só muda o número.',
                successLine: 'O programa não cresceu: só o número mudou.',
            },
            {
                id: 'p1-3',
                floors: 1, windows: 3, nested: false, allowTop: false,
                question: 'E agora um andar curto.',
                hint: 'Número a mais e ele passa da última janela.',
                successLine: 'Número certo, nem sobra nem falta.',
            },
        ],
    },

    /* ──────────────────────────── NÍVEL 2 — um laço dentro do outro */
    {
        level: 2,
        title: 'Um laço dentro do outro',
        objective: 'O laço de fora conta andares; o de dentro conta janelas.',
        tip: 'Dois números resolvem o prédio inteiro.',
        sky: 'sunset',
        cases: [
            {
                id: 'p2-1',
                floors: 3, windows: 4, nested: true, allowTop: false,
                question: 'Três andares, quatro janelas em cada um.',
                hint: 'O de fora é quantos andares. O de dentro, quantas janelas.',
                successLine: '3 × 4 = 12 janelas, e você escreveu só dois números.',
            },
            {
                id: 'p2-2',
                floors: 4, windows: 3, nested: true, allowTop: false,
                question: 'Agora são quatro andares de três janelas.',
                hint: 'Trocar os dois números de lugar dá outro prédio.',
                successLine: '4 × 3 também dá 12 — mas o caminho é outro.',
            },
            {
                id: 'p2-3',
                floors: 5, windows: 4, nested: true, allowTop: false,
                question: 'Cinco andares, quatro janelas.',
                hint: 'O laço de dentro roda inteiro antes de subir um andar.',
                successLine: 'O de dentro deu 4 voltas, cinco vezes seguidas. 20 janelas.',
            },
        ],
    },

    /* ────────────────────────── NÍVEL 3 — o laço que não tem número */
    {
        level: 3,
        title: 'Até o topo, sem contar',
        objective: 'Um laço pode repetir até acabar, sem saber quantas vezes são.',
        tip: 'O bloco roxo não tem número: ele vai até o topo. Diga só as janelas.',
        sky: 'night',
        cases: [
            {
                id: 'p3-1',
                floors: 7, windows: 5, nested: true, allowTop: true,
                question: 'Este laço de fora não pergunta quantos andares: ele vai até o topo.',
                hint: 'Só falta um número — o de janelas de um andar.',
                successLine: '35 janelas, e você não contou nenhum andar.',
            },
            {
                id: 'p3-2',
                floors: 9, windows: 6, nested: true, allowTop: true,
                question: 'Nove andares. O mesmo bloco roxo continua servindo.',
                hint: 'Conte as janelas de UM andar. Os outros são iguais.',
                successLine: '54 janelas. Este mesmo programa lavaria um prédio de vinte.',
            },
            {
                id: 'p3-3',
                floors: 10, windows: 6, nested: true, allowTop: true,
                question: 'O prédio da BNCC: dez andares.',
                hint: 'Repita por andar até o topo, e em cada andar repita por janela.',
                successLine: 'Sessenta lavagens — com um programa que nem sabe o tamanho do prédio.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/**
 * Roda o programa no papel, antes de a animação começar.
 *
 * A cena anima o que ESTA função decidiu. Separar as duas é o que permite a
 * animação ser interrompida (troca de caso, `shutdown`) sem que o placar fique
 * dependendo de quantos quadros deu tempo de desenhar.
 */
export function simulate(caso: Caso, outer: number, inner: number): RunResult {
    const usedTop = outer === TOP
    const floors = usedTop ? caso.floors : outer
    const total = caso.floors * caso.windows

    let washed = 0
    for (let f = 0; f < Math.min(floors, caso.floors); f += 1) {
        washed += Math.min(inner, caso.windows)
    }

    return {
        washed,
        total,
        overFloors: !usedTop && outer > caso.floors,
        overWindows: inner > caso.windows,
        /*
         * "Exato" não é só lavar tudo: mandar subir dez andares num prédio de
         * sete lava tudo E bate no telhado três vezes. O laço certo é o que
         * cobre sem sobrar volta — que é a parte "eficiência" da habilidade.
         */
        exact: washed === total
            && inner === caso.windows
            && (usedTop || outer === caso.floors),
        usedTop,
    }
}

/** Os passos que a animação vai percorrer, na ordem. */
export function plan(caso: Caso, outer: number, inner: number): Array<{ floor: number; win: number }> {
    const floors = outer === TOP ? caso.floors : outer
    const steps: Array<{ floor: number; win: number }> = []
    for (let f = 0; f < floors; f += 1) {
        for (let w = 0; w < inner; w += 1) steps.push({ floor: f, win: w })
    }
    return steps
}
