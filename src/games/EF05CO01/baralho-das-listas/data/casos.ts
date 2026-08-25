import { CORINGA, VALOR_J, type Carta, type Level } from '../types'

/**
 * Os nove casos.
 *
 * ── A PROGRESSÃO ─────────────────────────────────────────────────────────
 *
 *   N1  INSERIR              → onde esta carta entra, e quem fica ao lado?
 *   N2  BUSCAR e SUBSTITUIR  → procurar uma que pode não estar; trocar por curinga
 *   N3  VÁRIAS AÇÕES         → listas maiores, dois ou três passos em sequência
 *
 * ── O BARALHO QUE EXISTE ─────────────────────────────────────────────────
 *
 * Todo caso usa APENAS cartas que estão na pasta de assets: copas 2, 3, 4, 6,
 * 7, 8, 9, 10 e J; espadas 2, 4, 6, 8, 9 e J; e o curinga. Não há 5 em naipe
 * nenhum, nem 3, 7 ou 10 de espadas. As listas foram desenhadas em cima dessa
 * lista de compras, e não o contrário — assim nenhuma carta aparece como
 * retângulo desenhado no meio de um baralho 3D.
 *
 * Os buracos do baralho até ajudam: uma lista [2, 4, 8, 10] tem saltos, e é
 * justamente o salto que faz a criança perguntar "então o 6 entra onde?".
 */

let seq = 0
const copas = (valor: number): Carta => ({ id: `c${seq++}`, valor, naipe: 'copas' })
const espadas = (valor: number): Carta => ({ id: `e${seq++}`, valor, naipe: 'espadas' })
const curinga = (): Carta => ({ id: `k${seq++}`, valor: CORINGA, naipe: 'coringa' })

export const LEVELS: Level[] = [

    /* ══════════════════════════════ NÍVEL 1 — inserir na ordem */
    {
        level: 1,
        title: 'Onde esta carta entra?',
        objective: 'Numa lista em ordem, cada carta nova tem um lugar só — e dois vizinhos.',
        tip: 'Toque no espaço entre as cartas certas.',
        cases: [
            {
                id: 'b1-1',
                lista: [copas(2), copas(4), copas(8), copas(10)],
                passos: [{
                    verbo: 'inserir',
                    carta: copas(6),
                    objetivo: 'Coloque o 6 no lugar certo da lista.',
                    dica: 'O 6 é maior que o 4 e menor que o 8.',
                }],
                acoesMinimas: 1,
                successLine: 'O 6 ficou entre o 4 e o 8.',
            },
            {
                id: 'b1-2',
                lista: [copas(4), copas(6), copas(8), copas(9)],
                passos: [{
                    verbo: 'inserir',
                    carta: copas(3),
                    objetivo: 'Coloque o 3 no lugar certo da lista.',
                    dica: 'O 3 é menor que todas.',
                }],
                acoesMinimas: 1,
                successLine: 'O 3 é a primeira. Não tem ninguém antes.',
            },
            {
                id: 'b1-3',
                lista: [copas(2), copas(3), copas(6), copas(8)],
                passos: [{
                    verbo: 'inserir',
                    carta: copas(10),
                    objetivo: 'Coloque o 10 no lugar certo da lista.',
                    dica: 'O 10 é maior que todas.',
                }],
                acoesMinimas: 1,
                successLine: 'O 10 fechou a lista.',
            },
        ],
    },

    /* ══════════════════════════════ NÍVEL 2 — buscar e substituir */
    {
        level: 2,
        title: 'Procure e troque',
        objective: 'Para saber se uma carta NÃO está, é preciso olhar a lista inteira.',
        tip: 'Vire uma carta de cada vez, da esquerda para a direita.',
        cases: [
            {
                id: 'b2-1',
                lista: [copas(2), copas(4), copas(6), copas(7), copas(9), copas(VALOR_J)],
                passos: [{
                    verbo: 'buscar',
                    valor: 7,
                    existe: true,
                    objetivo: 'Vire as cartas até achar o 7.',
                    dica: 'Vire a carta que está levantada.',
                }],
                acoesMinimas: 4,
                successLine: 'Achou o 7 na quarta carta.',
            },
            {
                id: 'b2-2',
                lista: [copas(2), copas(3), copas(6), copas(8), copas(10)],
                passos: [{
                    verbo: 'buscar',
                    valor: 7,
                    existe: false,
                    objetivo: 'Vire as cartas e procure o 7.',
                    dica: 'Vire todas antes de decidir.',
                }],
                acoesMinimas: 5,
                successLine: 'Não tinha mesmo. Você virou todas.',
            },
            {
                id: 'b2-3',
                lista: [copas(3), copas(7), copas(7), copas(9), copas(VALOR_J)],
                passos: [{
                    verbo: 'substituir',
                    valor: 7,
                    objetivo: 'Troque os dois 7 por curingas.',
                    dica: 'São dois 7. Toque em um de cada vez.',
                }],
                acoesMinimas: 2,
                successLine: 'Os dois 7 viraram curinga. Ninguém saiu do lugar.',
            },
        ],
    },

    /* ══════════════════════════════ NÍVEL 3 — várias ações seguidas */
    {
        level: 3,
        title: 'Uma coisa depois da outra',
        objective: 'Cada ação muda a lista — e a próxima acontece na lista já mudada.',
        tip: 'Faça um passo de cada vez, e sem gastar ação à toa.',
        cases: [
            {
                id: 'b3-1',
                lista: [espadas(2), espadas(4), espadas(6), espadas(8), espadas(VALOR_J)],
                passos: [
                    {
                        verbo: 'remover',
                        valor: 4,
                        objetivo: 'Primeiro: tire o 4 da lista.',
                        dica: 'Toque no 4. Os vizinhos vão se juntar.',
                    },
                    {
                        verbo: 'inserir',
                        carta: espadas(9),
                        objetivo: 'Agora coloque o 9 no lugar certo.',
                        dica: 'O 9 vai entre o 8 e o J.',
                    },
                ],
                acoesMinimas: 2,
                successLine: 'Tirou uma, pôs outra, e continua em ordem.',
            },
            {
                id: 'b3-2',
                lista: [espadas(2), espadas(4), espadas(8), espadas(9), espadas(VALOR_J)],
                passos: [
                    {
                        verbo: 'inserir',
                        carta: espadas(6),
                        objetivo: 'Primeiro: coloque o 6 no lugar certo.',
                        dica: 'Entre o 4 e o 8.',
                    },
                    {
                        verbo: 'remover',
                        valor: 9,
                        objetivo: 'Agora tire o 9 da lista.',
                        dica: 'Sem o 9, o 8 e o J ficam vizinhos.',
                    },
                ],
                acoesMinimas: 2,
                successLine: 'A lista cresceu e depois encolheu.',
            },
            {
                id: 'b3-3',
                lista: [espadas(4), espadas(6), espadas(8), espadas(9), espadas(VALOR_J)],
                passos: [
                    {
                        verbo: 'remover',
                        valor: VALOR_J,
                        objetivo: 'Primeiro: tire o J, que é a última.',
                        dica: 'Sem o J, o 9 vira a última.',
                    },
                    {
                        verbo: 'inserir',
                        carta: espadas(2),
                        objetivo: 'Agora coloque o 2 no lugar certo.',
                        dica: 'O 2 é menor que todas.',
                    },
                    {
                        verbo: 'substituir',
                        valor: 8,
                        objetivo: 'Por último: troque o 8 por um curinga.',
                        dica: 'O curinga fica no lugar do 8.',
                    },
                ],
                acoesMinimas: 3,
                successLine: 'Três ações, e nunca saiu da ordem.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/**
 * Quanto tempo a barra do header leva para esvaziar, neste caso.
 *
 * Sai do próprio caso em vez de ser um número fixo: um caso de uma inserção e
 * um de cinco cartas conferidas não podem ter o mesmo orçamento.
 *
 * **A conta é generosa de propósito, porque zerar agora CUSTA O CASO.**
 * Quarenta e cinco segundos de partida mais vinte por ação mínima dá 65s no
 * Nível 1 e 145s na busca vazia do Nível 2 — muito mais do que qualquer
 * criança que esteja de fato jogando vai precisar. Perder tem que ser raro, e
 * acontecer com quem travou de verdade; para essa criança, remontar o caso com
 * a tela limpa costuma ser mais útil do que continuar encarando.
 *
 * Se um dia isto for apertado, aperte com uma criança do lado, e não numa
 * planilha.
 */
export function tempoDoCaso(caso: { acoesMinimas: number }): number {
    return 45_000 + caso.acoesMinimas * 20_000
}

/** Uma carta nova de curinga, para quando alguém é substituído. */
export const novoCuringa = curinga
