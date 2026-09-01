import type { Caso, Chunk, Level, Message } from '../types'

/**
 * Os nove casos.
 *
 * ── COMO ESCREVER UM CASO ────────────────────────────────────────────────
 *
 * A mensagem é uma lista de pedaços. `t()` é texto de ligação (não tocável),
 * `risco()` é um dado pessoal que não devia estar ali, `ok()` é um pedaço de
 * informação que PODE ser postado.
 *
 * Todo caso precisa de pelo menos um `ok()`. Sem ele, a criança descobre em
 * dois casos que basta tocar em tudo que é pastilha — e o jogo deixa de pedir
 * julgamento para pedir varredura. O `ok()` é o que torna a escolha uma escolha.
 *
 * `watchers` é o peso do vazamento em número de desconhecidos: 4 é sério, 6 é
 * grave. Endereço e foto de outra pessoa são sempre 6.
 */

const t = (id: string, text: string): Chunk => ({ id, text, pill: false })

const risco = (
    id: string, text: string, impact: string, watchers = 5,
): Chunk => ({ id, text, pill: true, risky: true, impact, watchers })

const ok = (id: string, text: string, safe: string): Chunk =>
    ({ id, text, pill: true, safe })

const post = (from: string, chunks: Chunk[], why?: string): Message =>
    ({ from, chunks, why })

/** Nível 3: a mensagem inteira é texto corrido — quem se toca é o cartão. */
const plain = (from: string, text: string, why: string): Message =>
    ({ from, chunks: [t('txt', text)], why })

const ACHAR = 'Toque no que não devia estar nesse post.'
const ESCOLHER = 'As duas contam a mesma novidade. Qual pode ir para a internet?'

export const LEVELS: Level[] = [

    /* ───────────────────────────────── NÍVEL 1 — um erro evidente */
    {
        level: 1,
        title: 'Ache o dado exposto',
        objective: 'Tem informação que não se posta.',
        tip: 'Toque no pedaço que conta algo demais sobre você.',
        cases: [
            {
                id: 'd1-1',
                kind: 'achar',
                question: ACHAR,
                hint: 'Procure o que diz onde a pessoa está.',
                message: post('Lia', [
                    t('a', 'Oi! Meu nome é'),
                    ok('nome', 'Lia', 'Só o primeiro nome não diz onde você está. Pode postar.'),
                    t('b', 'e eu moro na'),
                    risco('end', 'Rua das Flores, 42',
                        'Com o endereço, um estranho descobre onde você mora.', 6),
                    t('c', '!'),
                ]),
                successLine: 'O endereço é o dado que mais expõe: ele diz exatamente onde te achar.',
            },
            {
                id: 'd1-2',
                kind: 'achar',
                question: ACHAR,
                hint: 'Procure o que deixa qualquer pessoa falar com você.',
                message: post('Téo', [
                    t('a', 'Ganhei um'),
                    ok('presente', 'celular novo', 'Contar que ganhou um presente não diz nada sobre você. Pode postar.'),
                    t('b', '! Meu número é'),
                    risco('tel', '9 9999-1234',
                        'Com o telefone, qualquer pessoa pode te ligar e mandar mensagem.', 5),
                    t('c', ', me liga!'),
                ]),
                successLine: 'Número de telefone é só para quem você conhece de verdade.',
            },
            {
                id: 'd1-3',
                kind: 'achar',
                question: ACHAR,
                hint: 'Procure o lugar onde a pessoa está todo dia.',
                message: post('Nina', [
                    t('a', 'Hoje teve'),
                    ok('prova', 'prova de matemática', 'Falar da prova não conta onde você está. Pode postar.'),
                    t('b', 'na'),
                    risco('escola', 'Escola Vila Nova',
                        'Com o nome da escola, um estranho sabe onde te encontrar todo dia.', 6),
                    t('c', '!'),
                ]),
                successLine: 'Onde você estuda é um lugar onde te acham todo dia. Não vai para a internet.',
            },
        ],
    },

    /* ─────────────────────── NÍVEL 2 — três pontos de exposição */
    {
        level: 2,
        title: 'Três dados no mesmo post',
        objective: 'Um post pode vazar várias coisas de uma vez.',
        tip: 'Ache os três pedaços que expõem. Um deles pode ser postado.',
        cases: [
            {
                id: 'd2-1',
                kind: 'achar',
                question: ACHAR,
                hint: 'Onde você mora aparece de mais de um jeito.',
                message: post('Lia', [
                    t('a', 'Minha festa é'),
                    ok('dia', 'sábado', 'O dia da festa sozinho não diz onde nem quem. Pode postar.'),
                    t('b', 'na'),
                    risco('end', 'Rua das Flores, 42',
                        'Com o endereço, qualquer um sabe onde você mora.', 6),
                    t('c', '! Confirma com a minha mãe no'),
                    risco('tel', '9 9999-1234',
                        'O telefone da sua mãe também é dado pessoal — dela, não seu.', 5),
                    t('d', '. Olha a'),
                    risco('foto', 'foto do meu prédio',
                        'A foto do prédio mostra onde você mora mesmo sem escrever o endereço.', 6),
                    t('e', '!'),
                ]),
                successLine: 'Um post só vazou três coisas: o endereço, o telefone da sua mãe e a foto que entrega o lugar.',
            },
            {
                id: 'd2-2',
                kind: 'achar',
                question: ACHAR,
                hint: 'Contar que a casa fica vazia também é um dado.',
                message: post('Téo', [
                    t('a', 'Vamos viajar!'),
                    risco('vazia', 'Ficamos fora a semana toda',
                        'Contar que a casa fica vazia avisa quem quer entrar nela.', 5),
                    t('b', '. Estamos no'),
                    risco('hotel', 'Hotel Mar Azul',
                        'O nome do hotel diz exatamente onde você está agora.', 4),
                    t('c', 'e o carro é o de placa'),
                    risco('placa', 'ABC-1234',
                        'A placa identifica o carro da sua família em qualquer lugar.', 4),
                    t('d', '. Vai ser'),
                    ok('legal', 'muito legal', 'Dizer que está animado não conta nada sobre você. Pode postar.'),
                    t('e', '!'),
                ]),
                successLine: 'Casa vazia, onde você está e qual é o carro. Três pistas num post de viagem.',
            },
            {
                /*
                 * O ÚNICO CASO SOBRE O DADO DO OUTRO, e é de propósito.
                 *
                 * A habilidade diz "informações pessoais OU DE SEUS PARES", e é
                 * a metade que ninguém pensa: a criança aprende a proteger o
                 * próprio endereço e no dia seguinte posta a foto do colega
                 * dormindo. Aqui os três vazamentos são todos do Téo.
                 */
                id: 'd2-3',
                kind: 'achar',
                question: ACHAR,
                hint: 'Repare de quem são os dados deste post.',
                message: post('Nina', [
                    t('a', 'Olha o'),
                    risco('nome', 'Téo Almeida Souza',
                        'O nome inteiro é dado pessoal — e não é seu, é dele.', 5),
                    t('b', 'dormindo na aula! Ele estuda comigo na'),
                    risco('escola', 'Escola Vila Nova',
                        'Você contou onde o seu colega estuda todo dia.', 5),
                    t('c', '. Tirei essa'),
                    risco('foto', 'foto sem ele ver',
                        'Foto de outra pessoa só vai para a internet com a permissão dela.', 6),
                    t('d', '. Que'),
                    ok('graca', 'engraçado', 'Achar graça não expõe ninguém. O problema é o que está na foto.'),
                    t('e', '!'),
                ]),
                successLine: 'Dado do colega também é dado pessoal. Expor o outro é tão sério quanto se expor.',
            },
        ],
    },

    /* ────────────────────── NÍVEL 3 — qual pode ir para a internet */
    {
        level: 3,
        title: 'Qual pode ir para a internet',
        objective: 'Dá para contar a mesma coisa sem se expor.',
        tip: 'As duas dão a mesma notícia. Escolha a que não entrega nada.',
        cases: [
            {
                id: 'd3-1',
                kind: 'escolher',
                question: ESCOLHER,
                hint: 'Uma delas diz onde a Lia mora.',
                safeIndex: 1,
                options: [
                    plain('Lia', 'Ganhei uma bicicleta! Moro na Rua das Flores, 42, vem ver!',
                        'Essa conta o seu endereço para todo mundo que vir o post.'),
                    plain('Lia', 'Ganhei uma bicicleta! Depois eu te mostro na escola.',
                        'Essa dá a mesma notícia e combina de mostrar em pessoa.'),
                ],
                successLine: 'A notícia é a mesma. Só uma delas entrega onde você mora.',
            },
            {
                id: 'd3-2',
                kind: 'escolher',
                question: ESCOLHER,
                hint: 'Pedir ajuda pode. Espalhar o seu número, não.',
                safeIndex: 0,
                options: [
                    plain('Téo', 'Meu cachorro sumiu! Se achar, avisa a minha mãe na portaria.',
                        'Essa pede ajuda com um adulto no meio.'),
                    plain('Téo', 'Meu cachorro sumiu! Me liga no 9 9999-1234.',
                        'Essa espalha o seu telefone para desconhecidos.'),
                ],
                successLine: 'Pedir ajuda pode. Espalhar o seu número, não.',
            },
            {
                id: 'd3-3',
                kind: 'escolher',
                question: ESCOLHER,
                hint: 'Uma delas mostra o colega sem ele saber.',
                safeIndex: 1,
                options: [
                    plain('Nina', 'Olha a foto do Téo dormindo na aula!',
                        'Essa expõe o seu colega sem ele saber.'),
                    plain('Nina', 'Olha o desenho que eu fiz na aula hoje!',
                        'Essa mostra uma coisa sua, e não do colega.'),
                ],
                successLine: 'O que é seu você escolhe postar. O que é do outro, não.',
            },
        ],
    },
]

export const TOTAL_CASES = LEVELS.reduce((sum, l) => sum + l.cases.length, 0)

/** Quantos pedaços perigosos este caso tem. */
export function riskyOf(caso: Caso): Chunk[] {
    return (caso.message?.chunks ?? []).filter(c => c.risky)
}
