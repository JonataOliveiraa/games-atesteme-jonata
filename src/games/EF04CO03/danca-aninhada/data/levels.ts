import type { LevelDef } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS TRÊS NÍVEIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 *   1  um laço só, com o número escrito na ficha
 *   2  um laço DENTRO do outro
 *   3  o laço de fora troca o número por uma CONDIÇÃO
 *
 * ── O QUE UMA FASE GUARDA, E O QUE ELA NÃO GUARDA ────────────────────────
 *
 * Guarda o REFRÃO (`pattern`) e quantas vezes ele aparece (`rounds`). NÃO
 * guarda a lista de movimentos do pedido nem a ficha que resolve: as duas
 * saem da simulação. É o que impede a fase de "ter a resposta escrita" e o
 * que deixa a criança descobrir o número contando os pictogramas.
 *
 * `sheet` é o FORMATO da ficha — quantos espaços existem e de que tipo. O
 * conteúdo é sempre da criança.
 *
 * ── O NÍVEL 3 NÃO TEM `rounds` ───────────────────────────────────────────
 *
 * Ele tem `signalPlans`: em quantos refrões a luz apaga, em cada um dos dois
 * ensaios. A mesma ficha roda duas vezes com durações diferentes, e é essa
 * repetição que prova que o número não está no programa. Se `rounds`
 * existisse ali, a fase estaria dizendo a resposta que ela quer esconder.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        phases: [
            {
                id: '1.1',
                title: 'O passo que se repete',
                // três PASSOS: o refrão tem um movimento só, e o laço conta 3
                pattern: ['step'],
                rounds: 3,
                sheet: { outer: 'times', leading: 1, nested: false, trailing: false },
            },
            {
                id: '1.2',
                title: 'A palma que se repete',
                pattern: ['clap'],
                rounds: 4,
                sheet: { outer: 'times', leading: 1, nested: false, trailing: false },
            },
            {
                id: '1.3',
                /*
                 * A NOVIDADE DA 1.3 É A ORDEM.
                 *
                 * Dois espaços dentro do mesmo laço, e o laço repete os dois
                 * JUNTOS. A ficha não inventa PALMA, PASSO por conta própria:
                 * cada posição é uma decisão, e trocá-las muda a dança.
                 */
                title: 'Dois movimentos no laço',
                pattern: ['step', 'clap'],
                rounds: 2,
                sheet: { outer: 'times', leading: 2, nested: false, trailing: false },
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — UM LAÇO DENTRO DO OUTRO
     * ══════════════════════════════════════════════════════════════════════
     *
     * O refrão passa a ter DOIS papéis: um movimento que se repete e um que
     * vem depois dele, uma vez só. O de depois fica fora do laço de dentro e
     * dentro do de fora — é esse encaixe que a criança precisa enxergar, e é
     * por isso que todas as três fases têm o mesmo formato de ficha.
     *
     * O que muda entre elas é onde está a dificuldade: a 2.1 apresenta o
     * encaixe, a 2.2 mexe no laço DE FORA (três refrões em vez de dois) e a
     * 2.3 mexe no DE DENTRO (três repetições em vez de duas). Separar os dois
     * números em fases diferentes é o que deixa o erro ser diagnóstico.
     */
    {
        level: 2,
        phases: [
            {
                id: '2.1',
                title: 'Um laço dentro do outro',
                pattern: ['step', 'step', 'clap'],
                rounds: 2,
                sheet: { outer: 'times', leading: 0, nested: true, trailing: true },
            },
            {
                id: '2.2',
                // o de FORA é que cresce: três refrões, o de dentro continua 2
                title: 'Mais refrões',
                pattern: ['clap', 'clap', 'spin'],
                rounds: 3,
                sheet: { outer: 'times', leading: 0, nested: true, trailing: true },
            },
            {
                id: '2.3',
                // e agora o de DENTRO: três passos por refrão, dois refrões
                title: 'Mais repetições dentro',
                pattern: ['step', 'step', 'step', 'clap'],
                rounds: 2,
                sheet: { outer: 'times', leading: 0, nested: true, trailing: true },
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — REPETIR ATÉ O SINAL
     * ══════════════════════════════════════════════════════════════════════
     *
     * A moldura de fora troca o número por uma condição, e o pedido deixa de
     * dizer quantos refrões haverá. Cada fase roda a MESMA ficha duas vezes,
     * com a luz apagando em momentos diferentes: é a única maneira de mostrar
     * que a quantidade não está escrita no programa.
     *
     * `ATÉ A LUZ ACENDER` é o distrator, e ele é plausível de propósito — só
     * que a luz já começa acesa, então esse programa encerra depois do
     * primeiro refrão. A conferência de `validateLevels` exige que ele erre.
     *
     * A 3.1 repete o formato mais simples do jogo para a novidade ser SÓ a
     * condição; as 3.2 e 3.3 trazem de volta o aninhamento do nível 2.
     */
    {
        level: 3,
        phases: [
            {
                id: '3.1',
                title: 'Até a luz apagar',
                pattern: ['step'],
                signalPlans: [2, 4],
                sheet: { outer: 'until', leading: 1, nested: false, trailing: false },
            },
            {
                id: '3.2',
                title: 'O refrão até o sinal',
                pattern: ['step', 'step', 'clap'],
                signalPlans: [2, 3],
                sheet: { outer: 'until', leading: 0, nested: true, trailing: true },
            },
            {
                id: '3.3',
                // a ordem dos ensaios inverte: primeiro o longo, depois o curto,
                // para a criança não ler "o segundo é sempre maior"
                title: 'O sinal manda parar',
                pattern: ['clap', 'clap', 'spin'],
                signalPlans: [3, 2],
                sheet: { outer: 'until', leading: 0, nested: true, trailing: true },
            },
        ],
    },
]

/** +10 sem TRAVA, +5 depois dela: o §10. Nada disso aparece no canvas. */
export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5

/** O tempo de um movimento no ensaio. Fixo e confortável, como pede o §11. */
export const BEAT_MS = 500
