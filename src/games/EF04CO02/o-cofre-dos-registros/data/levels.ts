import type { Clue, CreatureId, FieldId, LevelDef, SightingRecord } from '../types'

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS NOMES DOS CAMPOS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Isto é o conteúdo do jogo, não rótulo de interface. A criança não decide
 * ONDE um valor vai olhando a forma dele; ela decide lendo o NOME do campo.
 * Por isso cada nome carrega junto a sua função, e é essa função que a dica
 * devolve quando o encaixe é recusado.
 */
export const FIELD_LABEL: Record<FieldId, string> = {
    creature: 'CRIATURA',
    color: 'COR',
    place: 'LOCAL',
    status: 'SITUAÇÃO',
}

/** O que cada campo guarda, dito do jeito que entra na dica. */
export const FIELD_ROLE: Record<FieldId, string> = {
    creature: 'diz quem apareceu',
    color: 'diz de que cor ela é',
    place: 'conta onde ela estava',
    status: 'conta o que já foi feito com a ficha',
}

/** O artigo de cada nome, para a dica sair em português e não em código. */
export const FIELD_ARTICLE: Record<FieldId, string> = {
    creature: 'a',
    color: 'a',
    place: 'o',
    status: 'a',
}

/**
 * O nome da ficha no arquivo final.
 *
 * Separado do título da fase de propósito: o cabeçalho pede uma AÇÃO
 * ("Conserte a ficha do polvo"), e o arquivo guarda um REGISTRO. Uma ordem
 * impressa na capa de uma ficha arquivada não faria sentido nenhum.
 */
export const SHEET_NAME: Record<CreatureId, string> = {
    octopus: 'Ficha do polvo',
    fish: 'Ficha do peixe',
    crab: 'Ficha do caranguejo',
}

/** A ordem fixa dos campos na ficha: o registro não se remonta a cada fase. */
export const FIELD_ORDER: FieldId[] = ['creature', 'color', 'place', 'status']

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  O VOCABULÁRIO
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Fechado e curto de propósito. Cada campo tem quatro valores possíveis no
 * máximo, e todos cabem numa etiqueta sem quebrar linha — `CARANGUEJO`, com
 * dez letras, é o maior de todos e foi ele que fixou a largura da bandeja.
 *
 * O campo SITUAÇÃO usa vocabulário de ARQUIVO, não de bicho: observando,
 * catalogado, revisar. É o que deixa o nível 3 atualizar a ficha sem que a
 * criança precise supor o que aconteceu com o animal.
 */
const CRIATURA = { POLVO: 'POLVO', PEIXE: 'PEIXE', CARANGUEJO: 'CARANGUEJO', TARTARUGA: 'TARTARUGA' }
const COR = { LARANJA: 'LARANJA', AMARELO: 'AMARELO', VERMELHO: 'VERMELHO', ROXO: 'ROXO' }
const LOCAL = { NAUFRAGIO: 'NAUFRÁGIO', RECIFE: 'RECIFE', CAVERNA: 'CAVERNA', CORAL: 'CORAL' }
const SIT = { OBSERVANDO: 'OBSERVANDO', CATALOGADO: 'CATALOGADO', REVISAR: 'REVISAR' }

/* ────────────────────────────── os avistamentos ────────────────────────── */

const sighting = (
    creatureId: Clue['creatureId'],
    truth: SightingRecord,
    sentence: string,
): Clue => ({ creatureId, truth, sentence })

/**
 * `truth` traz os QUATRO campos mesmo no nível 1, que só mostra três.
 *
 * O registro verdadeiro do avistamento não muda de tamanho porque a fase
 * mostra menos campos — e é dele que os níveis 2 e 3 tiram a SITUAÇÃO sem
 * precisar de uma segunda tabela de dados.
 */
const POLVO: SightingRecord = {
    creature: CRIATURA.POLVO,
    color: COR.LARANJA,
    place: LOCAL.NAUFRAGIO,
    status: SIT.OBSERVANDO,
}

const PEIXE: SightingRecord = {
    creature: CRIATURA.PEIXE,
    color: COR.AMARELO,
    place: LOCAL.RECIFE,
    status: SIT.OBSERVANDO,
}

const CARANGUEJO: SightingRecord = {
    creature: CRIATURA.CARANGUEJO,
    color: COR.VERMELHO,
    place: LOCAL.CAVERNA,
    status: SIT.OBSERVANDO,
}

const TRES = ['creature', 'color', 'place'] as FieldId[]
const QUATRO = ['creature', 'color', 'place', 'status'] as FieldId[]

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  OS NÍVEIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um verbo por nível — montar, corrigir, atualizar — e as mesmas três
 * criaturas nos três. Trocar de bicho a cada nível faria a criança gastar
 * atenção reconhecendo um animal novo justamente quando o pedido mudou; com
 * as mesmas três, o que ela percebe mudando é a OPERAÇÃO sobre o registro,
 * que é o conteúdo da EF04CO02.
 *
 * A ordem das fichas não é sorteada: polvo, peixe e caranguejo é também a
 * ordem dos quadros da folha de criaturas, e a criança reconhece o conjunto
 * quando as três fichas aparecem juntas dentro da cápsula no fim.
 */
export const LEVELS: LevelDef[] = [
    /* ═══════════════════════ NÍVEL 1 — MONTAR ═══════════════════════════ */
    {
        level: 1,
        phases: [
            {
                id: 'polvo',
                title: 'Ficha do polvo',
                task: {
                    kind: 'fill',
                    clue: sighting('octopus', POLVO, 'Avistei o polvo laranja no naufrágio.'),
                    initial: {},
                    fieldIds: TRES,
                },
            },
            {
                id: 'peixe',
                title: 'Ficha do peixe',
                task: {
                    kind: 'fill',
                    clue: sighting('fish', PEIXE, 'Avistei o peixe amarelo no recife.'),
                    initial: {},
                    fieldIds: TRES,
                },
            },
            {
                id: 'caranguejo',
                title: 'Ficha do caranguejo',
                task: {
                    kind: 'fill',
                    clue: sighting('crab', CARANGUEJO, 'Avistei o caranguejo vermelho na caverna.'),
                    initial: {},
                    fieldIds: TRES,
                },
            },
        ],
    },

    /* ═══════════════════════ NÍVEL 2 — CORRIGIR ═════════════════════════ */
    /*
     * A ficha chega PREENCHIDA e um valor não bate com a pista.
     *
     * ── A PISTA PRECISA DIZER OS QUATRO CAMPOS ──────────────────────────
     *
     * Aqui a pista deixa de ser uma frase de diário e vira uma NOTA DE
     * CAMPO, com os quatro valores. Não é estilo: no nível 2 tocar num campo
     * que bate com a pista é erro conceitual e custa vida, e cobrar isso de
     * um campo que a pista nunca mencionou seria punir a criança por conferir
     * uma informação que o jogo não deu.
     *
     * ── O VALOR ERRADO É DO MESMO TIPO ──────────────────────────────────
     *
     * `COR: roxo` numa nota que diz laranja, e não `COR: caverna`. Com um
     * valor de outro tipo, o intruso saltaria pela forma e a criança acharia
     * o erro sem comparar nada com a pista.
     */
    {
        level: 2,
        phases: [
            {
                id: 'polvo-cor',
                title: 'Conserte a ficha do polvo',
                task: {
                    kind: 'correct',
                    clue: sighting('octopus', POLVO, 'Polvo laranja, no naufrágio, observando.'),
                    initial: { ...POLVO, color: COR.ROXO },
                    fieldIds: QUATRO,
                    options: [COR.LARANJA, COR.ROXO, COR.VERMELHO],
                },
            },
            {
                id: 'peixe-local',
                title: 'Conserte a ficha do peixe',
                task: {
                    kind: 'correct',
                    clue: sighting('fish', PEIXE, 'Peixe amarelo, no recife, observando.'),
                    initial: { ...PEIXE, place: LOCAL.CAVERNA },
                    fieldIds: QUATRO,
                    options: [LOCAL.RECIFE, LOCAL.CAVERNA, LOCAL.NAUFRAGIO],
                },
            },
            {
                id: 'caranguejo-criatura',
                title: 'Conserte a ficha do caranguejo',
                task: {
                    kind: 'correct',
                    clue: sighting('crab', CARANGUEJO, 'Caranguejo vermelho, na caverna, observando.'),
                    initial: { ...CARANGUEJO, creature: CRIATURA.TARTARUGA },
                    fieldIds: QUATRO,
                    options: [CRIATURA.CARANGUEJO, CRIATURA.TARTARUGA, CRIATURA.POLVO],
                },
            },
        ],
    },

    /* ═══════════════════════ NÍVEL 3 — ATUALIZAR ════════════════════════ */
    /*
     * A ficha começa CERTA. Chega uma novidade, e ela fica desatualizada.
     *
     * É o que separa atualizar de corrigir, e o motivo de os dois serem
     * níveis diferentes: no nível 2 alguém escreveu errado; aqui ninguém
     * errou — o mundo mudou. A ficha antiga não estava errada, estava velha.
     *
     * ── O VALOR ATUAL ESTÁ SEMPRE ENTRE AS OPÇÕES ───────────────────────
     *
     * De propósito. Escolhê-lo é não mudar nada, e é justamente o engano que
     * o §10 manda tratar: quem não leu a nota tende a reconfirmar o que já
     * está escrito na ficha.
     */
    {
        level: 3,
        phases: [
            {
                id: 'polvo-mudou',
                title: 'Atualize a ficha do polvo',
                task: {
                    kind: 'update',
                    creatureId: 'octopus',
                    initial: POLVO,
                    fieldIds: QUATRO,
                    changes: [
                        {
                            note: 'O polvo saiu do naufrágio e foi para o coral.',
                            next: { ...POLVO, place: LOCAL.CORAL },
                            options: [LOCAL.CORAL, LOCAL.NAUFRAGIO, LOCAL.CAVERNA],
                        },
                    ],
                },
            },
            {
                id: 'peixe-arquivado',
                title: 'Atualize a ficha do peixe',
                task: {
                    kind: 'update',
                    creatureId: 'fish',
                    initial: PEIXE,
                    fieldIds: QUATRO,
                    changes: [
                        {
                            note: 'A ficha do peixe entrou no arquivo.',
                            next: { ...PEIXE, status: SIT.CATALOGADO },
                            options: [SIT.CATALOGADO, SIT.OBSERVANDO, SIT.REVISAR],
                        },
                    ],
                },
            },
            {
                /*
                 * Duas novidades em sequência, ainda numa fase só.
                 *
                 * O pedido mostra uma de cada vez, como manda o §8. É aqui
                 * que a criança vê que atualizar um campo NÃO mexe nos
                 * outros: o LOCAL muda e a SITUAÇÃO continua onde estava, até
                 * que a segunda nota fale dela.
                 */
                id: 'caranguejo-duas',
                title: 'Atualize a ficha do caranguejo',
                task: {
                    kind: 'update',
                    creatureId: 'crab',
                    initial: CARANGUEJO,
                    fieldIds: QUATRO,
                    changes: [
                        {
                            note: 'O caranguejo se mudou para o recife.',
                            next: { ...CARANGUEJO, place: LOCAL.RECIFE },
                            options: [LOCAL.RECIFE, LOCAL.CAVERNA, LOCAL.CORAL],
                        },
                        {
                            note: 'A ficha do caranguejo entrou no arquivo.',
                            next: { ...CARANGUEJO, place: LOCAL.RECIFE, status: SIT.CATALOGADO },
                            options: [SIT.CATALOGADO, SIT.OBSERVANDO, SIT.REVISAR],
                        },
                    ],
                },
            },
        ],
    },
]

export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5

/** A frase que fecha cada nível, do §11 do planejamento. */
export const CLOSING =
    'No registro, cada informação tem um campo com nome. Podemos preencher, corrigir e atualizar esses campos.'
