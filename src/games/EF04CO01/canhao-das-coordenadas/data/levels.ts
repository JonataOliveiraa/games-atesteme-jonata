import type { LevelDef } from '../types'

const at = (row: number, col: number) => ({ row, col })

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS MURAIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A ordem dos pedidos NÃO é sorteada: cada mural constrói um padrão que a
 * criança reconhece quando a fachada aparece inteira no fim. Sortear
 * transformaria o resultado num amontoado e tiraria a única prova visível de
 * que ela mexeu na matriz.
 *
 * Primeiro corte: só o nível 1, como manda o §16 do planejamento. Os níveis 2
 * e 3 entram depois da avaliação, e o modelo de `Task` em `types.ts` já os
 * comporta sem refatoração.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        murals: [
            {
                id: 'cantos',
                title: 'Quatro cantos',
                initialPainted: [],
                tasks: [
                    { kind: 'paint', target: at(1, 1) },
                    { kind: 'paint', target: at(1, 4) },
                    { kind: 'paint', target: at(4, 1) },
                    { kind: 'paint', target: at(4, 4) },
                ],
            },
            {
                id: 'centro',
                title: 'Janela central',
                initialPainted: [],
                tasks: [
                    { kind: 'paint', target: at(2, 2) },
                    { kind: 'paint', target: at(2, 3) },
                    { kind: 'paint', target: at(3, 2) },
                    { kind: 'paint', target: at(3, 3) },
                ],
            },
            {
                id: 'coluna',
                title: 'Coluna azul',
                initialPainted: [],
                tasks: [
                    { kind: 'paint', target: at(1, 2) },
                    { kind: 'paint', target: at(2, 2) },
                    { kind: 'paint', target: at(3, 2) },
                    { kind: 'paint', target: at(4, 2) },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — LER A POSIÇÃO, EM VEZ DE ACHAR
     * ══════════════════════════════════════════════════════════════════════
     *
     * O caminho inverte: a janela é apontada e a criança diz o nome dela. É o
     * que separa saber ACHAR uma coordenada de saber ESCREVER uma, que são
     * duas habilidades diferentes e só a segunda prova que a convenção L-antes
     * -de-C foi entendida.
     *
     * Cada trio traz a resposta, a INVERSÃO dela e uma vizinha de coluna. A
     * inversão é o distrator que importa: é o erro que o jogo inteiro existe
     * para desfazer, e escondê-lo das opções seria deixar a criança acertar
     * sem precisar decidir.
     */
    {
        level: 2,
        murals: [
            {
                id: 'leitura-1',
                title: 'Três janelas lidas',
                initialPainted: [],
                tasks: [
                    {
                        kind: 'read',
                        highlighted: at(2, 3),
                        options: [at(2, 3), at(3, 2), at(2, 2)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(3, 1),
                        options: [at(3, 1), at(1, 3), at(3, 2)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(1, 4),
                        options: [at(1, 4), at(4, 1), at(1, 3)],
                    },
                ],
            },
            {
                id: 'leitura-2',
                title: 'Escada de janelas',
                initialPainted: [],
                tasks: [
                    {
                        kind: 'read',
                        highlighted: at(4, 2),
                        options: [at(4, 2), at(2, 4), at(4, 3)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(1, 3),
                        options: [at(1, 3), at(3, 1), at(1, 2)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(3, 4),
                        options: [at(3, 4), at(4, 3), at(3, 3)],
                    },
                ],
            },
            {
                id: 'leitura-3',
                title: 'Diagonal quebrada',
                initialPainted: [],
                tasks: [
                    {
                        kind: 'read',
                        highlighted: at(2, 1),
                        options: [at(2, 1), at(1, 2), at(2, 2)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(4, 3),
                        options: [at(4, 3), at(3, 4), at(4, 2)],
                    },
                    {
                        kind: 'read',
                        highlighted: at(3, 2),
                        options: [at(3, 2), at(2, 3), at(3, 1)],
                    },
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — MEXER NA REPRESENTAÇÃO
     * ══════════════════════════════════════════════════════════════════════
     *
     * Aqui entra o "fazendo manipulações simples" da EF04CO01, que os níveis 1
     * e 2 não tocam: a matriz deixa de ser consultada e passa a ser ALTERADA.
     *
     * Cada mural começa com TRÊS manchas de cores diferentes, e cada pedido
     * mexe em uma delas. A cor não é enfeite: ela é o nome da mancha. O pedido
     * diz "MOVER L1, C1", a criança olha e vê que o que mora ali é laranja, e
     * depois vê a laranja chegar do outro lado — que é a prova de que a tinta
     * mudou de lugar, e não de que apareceu tinta nova.
     *
     * É também o que separa os dois verbos: no COPIAR a cor fica nos dois
     * lugares; no MOVER ela some de um. Com tudo da mesma cor, os dois
     * terminariam iguais na tela.
     */
    {
        level: 3,
        murals: [
            {
                id: 'um-passo',
                title: 'Um passo para o lado',
                initialPainted: [
                    { row: 1, col: 1, ink: 3 },
                    { row: 2, col: 3, ink: 2 },
                    { row: 4, col: 2, ink: 4 },
                ],
                tasks: [
                    { kind: 'move', source: at(1, 1), shift: { row: 0, col: 1 } },
                    { kind: 'copy', source: at(2, 3), shift: { row: 1, col: 0 } },
                    { kind: 'move', source: at(4, 2), shift: { row: -1, col: 0 } },
                ],
            },
            {
                id: 'linha-cheia',
                title: 'A linha do meio',
                initialPainted: [
                    { row: 2, col: 1, ink: 0 },
                    { row: 3, col: 4, ink: 3 },
                    { row: 1, col: 3, ink: 2 },
                ],
                tasks: [
                    { kind: 'copy', source: at(2, 1), shift: { row: 0, col: 1 } },
                    { kind: 'move', source: at(3, 4), shift: { row: -1, col: 0 } },
                    { kind: 'move', source: at(1, 3), shift: { row: 1, col: 0 } },
                ],
            },
            {
                id: 'tres-cantos',
                title: 'Tinta que viaja',
                initialPainted: [
                    { row: 4, col: 1, ink: 4 },
                    { row: 1, col: 4, ink: 0 },
                    { row: 3, col: 2, ink: 1 },
                ],
                tasks: [
                    { kind: 'move', source: at(4, 1), shift: { row: -1, col: 0 } },
                    { kind: 'move', source: at(1, 4), shift: { row: 1, col: 0 } },
                    { kind: 'copy', source: at(3, 2), shift: { row: 0, col: 1 } },
                ],
            },
        ],
    },
]

export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5
