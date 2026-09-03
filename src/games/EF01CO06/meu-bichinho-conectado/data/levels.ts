import type { Artifact, LevelConfig, Need } from '../types'

/**
 * O veredito é função do PEDIDO e do artefato escolhido, e não uma marca
 * `isCorrect` presa ao item da prateleira: o mesmo relógio acerta a hora do
 * lanche e erra a hora da história.
 *
 * ── A LISTA É HONESTA COM O MUNDO REAL ───────────────────────────────────
 *
 * Aparelho não é chave de fechadura. Tablet mostra a hora, e faz chamada de
 * vídeo para a vovó — então ele CONTA nos dois casos, junto do relógio e do
 * telefone. Antes ele era distrator do lanche, e a criança que escolhesse
 * pelo que vê em casa perdia vida por estar certa. Distrator só vale quando a
 * resposta é inequivocamente não: caixinha não marca hora, telefone não mostra
 * chuva, relógio não conta história.
 *
 * O que continua sendo escolha, então, não é "adivinhar o aparelho único": é
 * descartar os que de fato não servem. E quando dois servem, os dois valem —
 * é justamente o que o N3 quer ensinar.
 */
export const SOLUTIONS: Record<Need, Artifact[]> = {
    hear_story: ['speaker', 'tablet'],
    call_grandma: ['phone', 'tablet'],
    check_weather: ['tablet'],
    know_snack_time: ['watch', 'tablet'],
    share_party_photos: ['tablet'],
}

export function solves(need: Need, artifact: Artifact) {
    return SOLUTIONS[need].includes(artifact)
}

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Do que ele precisa?',
        message: 'Cada aparelho ajuda de um jeito!',
        requests: [
            {
                id: 'n1-historia',
                need: 'hear_story',
                shelf: ['speaker', 'watch'],
                hints: { watch: 'Tic-tac não conta história.' },
            },
            {
                id: 'n1-vovo',
                need: 'call_grandma',
                shelf: ['phone', 'speaker'],
                hints: { speaker: 'Som toca, mas não chama a vovó.' },
            },
            {
                id: 'n1-lanche',
                need: 'know_snack_time',
                shelf: ['watch', 'phone'],
                hints: { phone: 'Telefone liga, não marca a hora.' },
            },
        ],
    },

    /*
     * N2 — três aparelhos na prateleira, e o último pedido é de todos.
     *
     * O que cresce aqui não é a quantidade de toques: é a escolha. Com três
     * opções, a criança precisa descartar o aparelho PARECIDO (a caixinha
     * também faz som, mas não mostra o tempo) antes de achar o útil.
     *
     * O tablet não entra como distrator do pedido da vovó, embora o
     * planejamento previsse isso. Chamada de vídeo em tablet é coisa que
     * criança de 6 anos faz em casa: ela escolheria certo pelo mundo real e o
     * jogo diria que errou. Distrator só vale quando a resposta é
     * inequivocamente não.
     */
    {
        level: 2,
        title: 'Qual aparelho ajuda?',
        message: 'Um aparelho pode ajudar todo mundo!',
        requests: [
            {
                id: 'n2-chuva',
                need: 'check_weather',
                shelf: ['tablet', 'phone', 'speaker'],
                hints: {
                    phone: 'Telefone liga, não mostra a chuva.',
                    speaker: 'Som toca, mas não mostra o tempo.',
                },
            },
            {
                id: 'n2-vovo',
                need: 'call_grandma',
                shelf: ['phone', 'watch', 'speaker'],
                hints: {
                    watch: 'Tic-tac não fala com a vovó.',
                    speaker: 'Som toca, mas ninguém responde.',
                },
            },
            {
                id: 'n2-fotos',
                need: 'share_party_photos',
                collective: true,
                shelf: ['tablet', 'phone', 'watch'],
                hints: {
                    phone: 'No telefone os amigos não veem foto.',
                    watch: 'Relógio não mostra fotos.',
                },
            },
        ],
    },

    /*
     * N3 — os quatro aparelhos de uma vez, e DOIS pedidos com duas respostas.
     *
     * A história aceita caixinha ou tablet; a hora do lanche aceita relógio ou
     * tablet. É a ideia que fecha a habilidade: aparelho não é chave de
     * fechadura, e mais de um pode atender a mesma necessidade.
     *
     * O jogo não precisa dizer isso em texto. Quem escolhe a caixinha ouve as
     * três notas e vê as ondas de som; quem escolhe o tablet vê a tela acender
     * com o arpejo digital — e o pictograma do pedido pousa no aparelho
     * escolhido, seja ele qual for. A cena muda com a escolha, e é ela que
     * responde.
     *
     * Sobram dois distratores por pedido, e eles são inequívocos: caixinha não
     * marca hora, telefone não mostra chuva, relógio não conta história.
     */
    {
        level: 3,
        title: 'Todos os aparelhos',
        message: 'Às vezes mais de um aparelho ajuda!',
        requests: [
            {
                id: 'n3-historia',
                need: 'hear_story',
                shelf: ['speaker', 'tablet', 'phone', 'watch'],
                hints: {
                    phone: 'No telefone não tem história para ouvir.',
                    watch: 'Tic-tac não conta história.',
                },
            },
            {
                id: 'n3-chuva',
                need: 'check_weather',
                shelf: ['tablet', 'speaker', 'phone', 'watch'],
                hints: {
                    speaker: 'Som toca, mas não mostra o tempo.',
                    phone: 'Telefone liga, não mostra a chuva.',
                    watch: 'O relógio marca a hora, não a chuva.',
                },
            },
            {
                id: 'n3-lanche',
                need: 'know_snack_time',
                shelf: ['watch', 'tablet', 'phone', 'speaker'],
                // Sem dica para o tablet: ele também mostra a hora, e agora
                // conta como acerto.
                hints: {
                    phone: 'Telefone liga, não marca a hora.',
                    speaker: 'Som toca, mas não avisa a hora.',
                },
            },
        ],
    },
]
