import type { LevelDef } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  NÍVEL 1 — UM LAÇO SIMPLES
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Este é o primeiro corte que o §14 do planejamento pede: só o nível 1, para
 * o teste real com criança antes de o aninhamento e o sinal indefinido
 * entrarem. Os níveis 2 e 3 estão desenhados no §7 e a máquina de `rules.ts`
 * já os executa; o que falta é a arte de tela deles e o teste deste aqui.
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
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        phases: [
            {
                id: '1.1',
                title: 'O passo que se repete',
                ask: 'Faça o dançarino repetir este passo.',
                // três PASSOS: o refrão tem um movimento só, e o laço conta 3
                pattern: ['step'],
                rounds: 3,
                sheet: { outer: 'times', leading: 1, nested: false, trailing: false },
            },
            {
                id: '1.2',
                title: 'A palma que se repete',
                ask: 'Agora é outro movimento — e outra quantidade.',
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
                ask: 'O laço repete os dois, na ordem que você puser.',
                pattern: ['step', 'clap'],
                rounds: 2,
                sheet: { outer: 'times', leading: 2, nested: false, trailing: false },
            },
        ],
    },
]

/** +10 sem TRAVA, +5 depois dela: o §10. Nada disso aparece no canvas. */
export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5

/** O tempo de um movimento no ensaio. Fixo e confortável, como pede o §11. */
export const BEAT_MS = 500
