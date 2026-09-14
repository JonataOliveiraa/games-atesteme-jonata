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
]

export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5
