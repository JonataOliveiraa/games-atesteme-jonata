import { place } from './files'
import type { AskDef, LevelDef, PhaseDef, Place, SlotDef, Verdict } from '../types'

/**
 * OS TRÊS NÍVEIS — um assunto cada, e o de baixo só chega depois de o de cima
 * estar respondido.
 *
 * 1. **onde cada coisa mora.** Nada arrebenta: o pedido nomeia uma coisa e a
 *    criança diz de que lugar ela abre;
 * 2. **a desconexão.** O mesmo arquivo passa a poder morar em dois lugares, o
 *    cabo arrebenta no meio da tela, e um dos dois some;
 * 3. **a nuvem é uma ONDA.** O mundo deita, o pen drive dá lugar ao celular, e
 *    o que arrebenta não é a nuvem: é o SINAL de um aparelho.
 *
 * A divisão é do usuário, em 18/09/2026, e ela conserta um empilhamento: o
 * nível 1 pedia *onde as coisas moram* e *o que a internet leva embora* na
 * mesma tela.
 */
export const LEVELS: LevelDef[] = [
    /* ───────────────────────── 1 · ONDE CADA COISA MORA ──────────────────── */
    {
        level: 1,
        world: 'room',
        subtitle: 'Você já sabe onde cada coisa mora.',
        message:
            'O computador e o pen drive ficam aqui, na sua mesa. A nuvem fica longe, lá em cima no céu.',
        phases: [
            {
                // um arquivo em cada lugar: a resposta é achar, e mais nada
                id: 'l1f1',
                slots: [
                    { file: 'video', place: 'cloud' },
                    { file: 'musica', place: 'pc' },
                ],
                asks: [{ file: 'video' }, { file: 'musica' }],
            },
            {
                // entra o pen drive, e com ele o terceiro botão
                id: 'l1f2',
                slots: [
                    { file: 'foto', place: 'cloud' },
                    { file: 'musica', place: 'pc' },
                    { file: 'jogo', place: 'drive' },
                ],
                asks: [{ file: 'jogo' }, { file: 'foto' }],
            },
            {
                // quatro arquivos, e a nuvem com dois: rolar até lá passa a
                // valer mais do que chutar
                id: 'l1f3',
                slots: [
                    { file: 'desenho', place: 'cloud' },
                    { file: 'video', place: 'cloud' },
                    { file: 'dever', place: 'pc' },
                    { file: 'jogo', place: 'drive' },
                ],
                asks: [{ file: 'desenho' }, { file: 'dever' }],
            },
        ],
    },

    /* ───────────────────────────── 2 · A DESCONEXÃO ──────────────────────── */
    {
        level: 2,
        world: 'room',
        subtitle: 'Você já sabe o que a internet leva embora.',
        message:
            'Os arquivos não mudaram de lugar. O que mudou foi o caminho até eles: o que está longe precisa do fio.',
        phases: [
            {
                /**
                 * O ENSINO PURO: a mesma pergunta, duas respostas certas, e
                 * depois do estalo uma só. Nada mais muda na tela — e é essa
                 * imobilidade que prova que o arquivo não foi a lugar nenhum.
                 */
                id: 'l2f1',
                slots: [
                    { file: 'video', place: 'cloud' },
                    { file: 'video', place: 'pc' },
                ],
                asks: [{ file: 'video' }, { file: 'video', cut: ['cloud'] }],
            },
            {
                /**
                 * A QUE DÓI: o JOGO só existe na nuvem. A criança usa ele no
                 * primeiro pedido e VÊ ele trancar no estalo. Ele nunca mais é
                 * pedido — algumas coisas simplesmente não estão mais lá.
                 */
                id: 'l2f2',
                slots: [
                    { file: 'jogo', place: 'cloud' },
                    { file: 'musica', place: 'cloud' },
                    { file: 'musica', place: 'pc' },
                    { file: 'dever', place: 'drive' },
                ],
                asks: [{ file: 'jogo' }, { file: 'musica', cut: ['cloud'] }],
            },
            {
                // os dois lugares de perto dando a mesma resposta: perto é
                // perto, seja no computador ou no pen drive
                id: 'l2f3',
                slots: [
                    { file: 'desenho', place: 'cloud' },
                    { file: 'foto', place: 'pc' },
                    { file: 'foto', place: 'drive' },
                ],
                asks: [{ file: 'desenho' }, { file: 'foto', cut: ['cloud'] }],
            },
        ],
    },

    /* ─────────────────────── 3 · A NUVEM CHEGA POR ONDA ──────────────────── */
    {
        level: 3,
        world: 'air',
        subtitle: 'Você já sabe que a nuvem chega pelo ar.',
        message:
            'A nuvem não tem fio: ela chega em cada aparelho por ondas. Quando um fica sem sinal, o outro continua — e o que está guardado dentro dele abre do mesmo jeito.',
        phases: [
            {
                /**
                 * Nada guardado em aparelho nenhum: TUDO vem da nuvem. Os dois
                 * abrem a mesma foto, um perde o sinal, e o outro continua
                 * abrindo. É a fase que separa "a nuvem caiu" de "este aqui
                 * ficou sem sinal".
                 */
                id: 'l3f1',
                slots: [{ file: 'foto', place: 'cloud' }],
                asks: [{ file: 'foto' }, { file: 'foto', cut: ['phone'] }],
            },
            {
                /**
                 * A MAIS IMPORTANTE DAS TRÊS: quem cai é o computador, e o
                 * pedido seguinte é justamente o DEVER, que está guardado
                 * dentro dele. Sem sinal ele ainda abre — um aparelho sem sinal
                 * não é um aparelho morto.
                 */
                id: 'l3f2',
                slots: [
                    { file: 'musica', place: 'cloud' },
                    { file: 'dever', place: 'pc' },
                    { file: 'jogo', place: 'phone' },
                ],
                asks: [{ file: 'musica' }, { file: 'dever', cut: ['pc'] }],
            },
            {
                /**
                 * A SIMETRIA FECHADA: o pedido é da nuvem, como na 3.1, mas
                 * quem caiu foi o OUTRO aparelho. A criança não pode mais
                 * responder de cor — tem de olhar qual dos dois está sem sinal.
                 * A música guardada no celular está ali só para a tela não ser
                 * uma conta de duas peças.
                 */
                id: 'l3f3',
                slots: [
                    { file: 'desenho', place: 'cloud' },
                    { file: 'video', place: 'cloud' },
                    { file: 'musica', place: 'phone' },
                ],
                asks: [{ file: 'desenho' }, { file: 'video', cut: ['pc'] }],
            },
        ],
    },
]

/* ──────────────────────────── a regra, em função ─────────────────────── */

/**
 * O VEREDITO — e ele é uma função, nunca um campo guardado no arquivo.
 *
 * Dois mundos, dois parágrafos, e a diferença entre eles é o que o botão
 * pergunta:
 *
 * - no **quarto**, o botão é um LUGAR, e a pergunta é *de que lugar isso abre*.
 *   A nuvem tem botão próprio, então pedir um arquivo da nuvem ao computador é
 *   errado — ele não está guardado ali;
 * - no **ar**, o botão é um APARELHO, e a pergunta é *quem consegue abrir isso
 *   agora*. A nuvem não tem botão: ela é alcançada ATRAVÉS de um aparelho, e é
 *   por isso que o mesmo toque acerta antes do corte e erra depois.
 */
export function verdict(level: LevelDef, phase: PhaseDef, ask: AskDef, target: Place): Verdict {
    const cut = ask.cut ?? []
    const here = phase.slots.some(s => s.place === target && s.file === ask.file)

    if (level.world === 'room') {
        if (!here) return { kind: 'wrong', why: 'notHere' }
        if (place(target).needsWire && cut.includes(target)) return { kind: 'wrong', why: 'offline' }
        return { kind: 'opens' }
    }

    // guardado dentro do próprio aparelho: abre com sinal ou sem
    if (here) return { kind: 'opens' }

    if (!phase.slots.some(s => s.place === 'cloud' && s.file === ask.file)) {
        return { kind: 'wrong', why: 'notHere' }
    }
    if (cut.includes(target)) return { kind: 'wrong', why: 'noReach' }
    return { kind: 'opens' }
}

/** Quais botões abrem o arquivo pedido agora. */
export const rightPlaces = (level: LevelDef, phase: PhaseDef, ask: AskDef): Place[] =>
    targetsOf(level, phase).filter(p => verdict(level, phase, ask, p).kind === 'opens')

/**
 * QUEM GANHA BOTÃO NESTA TELA.
 *
 * No quarto, os lugares que guardam alguma coisa. No ar, os dois aparelhos —
 * sempre os dois, mesmo o que não guarda nada, porque ele ainda pode alcançar
 * a nuvem. Um aparelho sem botão seria um aparelho que a criança não pode
 * testar, e testar é o nível inteiro.
 */
export const targetsOf = (level: LevelDef, phase: PhaseDef): Place[] =>
    level.world === 'air'
        ? ['pc', 'phone']
        : (['pc', 'drive', 'cloud'] as Place[]).filter(p => phase.slots.some(s => s.place === p))

/** Onde o arquivo pedido ESTÁ, quando o toque em `target` deu certo. */
export const openedAt = (level: LevelDef, phase: PhaseDef, ask: AskDef, target: Place): Place =>
    phase.slots.some(s => s.place === target && s.file === ask.file) ? target : 'cloud'

export const slotsAt = (phase: PhaseDef, target: Place): SlotDef[] =>
    phase.slots.filter(s => s.place === target)

/**
 * O que o jogo diz quando o arquivo abre.
 *
 * Ele fala de ONDE ESTAVA, e nunca do que quebrou: assim a mesma linha serve ao
 * nível 1, que não corta nada, e aos outros dois, onde o corte é que dá o
 * sentido. Perto, longe e "veio pelo ar" é o que a criança precisa guardar.
 */
export const cheerFor = (where: Place, target: Place): string => {
    if (where === 'cloud') {
        return target === where
            ? 'Eu estou na nuvem, lá longe, no céu.'
            : 'Eu vim da nuvem, pelo ar, sem fio nenhum.'
    }
    if (where === 'drive') return 'Eu estou no pen drive, aqui na sua mesa.'
    if (where === 'phone') return 'Eu estou guardado aqui dentro do celular.'
    return 'Eu estou aqui no computador, na sua mesa.'
}

/** A plaquinha do erro fala do lugar TOCADO, nunca do certo. */
export const WRONG_TEXT: Record<'offline' | 'notHere' | 'noReach', string> = {
    offline: 'A nuvem está longe, e o cabo arrebentou.',
    notHere: 'Esse arquivo não está guardado aqui.',
    noReach: 'Este aparelho está sem sinal. Ele não alcança a nuvem.',
}

/** Dez por fase, e cinco depois de errar. Nunca escrito na mão. */
export const pointsFor = (phases: number, firstTry: boolean) => (30 / phases) * (firstTry ? 1 : 0.5)

/* ──────────────────────────── a validação ────────────────────────────── */

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        if (level.phases.length > 3) problems.push(`${level.level}: mais de 3 fases`)

        level.phases.forEach(phase => {
            const places = new Set(phase.slots.map(s => s.place))

            if (phase.slots.length > 4) problems.push(`${phase.id}: no máximo quatro arquivos`)
            if (!places.has('cloud')) problems.push(`${phase.id}: sem nuvem não há jogo`)
            if (targetsOf(level, phase).length < 2) problems.push(`${phase.id}: pelo menos dois botões`)
            if (targetsOf(level, phase).length > 3) problems.push(`${phase.id}: no máximo três botões`)

            if (phase.asks.length !== 2) problems.push(`${phase.id}: dois pedidos por tela`)

            /**
             * O ESTALO ACONTECE ENTRE DOIS PEDIDOS, nunca antes do primeiro.
             *
             * Quem decide SE ele acontece é o dado — um `cut` que aparece no
             * segundo pedido e não estava no primeiro —, e não o código. É por
             * isso que o nível 1 não arrebenta nada sem uma linha de lógica a
             * menos do que os outros.
             */
            if (phase.asks[0]?.cut?.length) {
                problems.push(`${phase.id}: o primeiro pedido chega com tudo ligado`)
            }

            phase.asks.forEach((ask, i) => {
                if (rightPlaces(level, phase, ask).length === 0) {
                    problems.push(`${phase.id}: o pedido ${i} não tem resposta`)
                }
                ;(ask.cut ?? []).forEach(p => {
                    const ok = level.world === 'air' ? place(p).device : p === 'cloud'
                    if (!ok) problems.push(`${phase.id}: ${p} não pode ser cortado neste mundo`)
                })
            })

            /** O mundo diz quem pode morar nele. Misturar os dois não desenha. */
            const allowed: Place[] =
                level.world === 'air' ? ['pc', 'phone', 'cloud'] : ['pc', 'drive', 'cloud']
            places.forEach(p => {
                if (!allowed.includes(p)) problems.push(`${phase.id}: ${p} não existe no mundo ${level.world}`)
            })

            /**
             * O NÍVEL 1 É SÓ "ONDE MORA", e a validação cobra isso.
             *
             * Um arquivo em dois lugares daria duas respostas certas, e a
             * pergunta deixaria de ser uma pergunta. Isso é do nível 2, e é lá
             * que passa a valer.
             */
            if (level.level === 1) {
                const homes = new Set<string>()
                phase.slots.forEach(slot => {
                    if (homes.has(slot.file)) {
                        problems.push(`${phase.id}: no nível 1 cada arquivo mora num lugar só`)
                    }
                    homes.add(slot.file)
                })
            }

            /**
             * No ar, cada aparelho guarda no MÁXIMO um arquivo.
             *
             * A tela do celular tem 200 px de largura: dois cartões ali não
             * caberiam, e empilhá-los transformaria o aparelho num terceiro
             * depósito — que é justamente o que o nível 3 não está discutindo.
             */
            if (level.world === 'air') {
                ;(['pc', 'phone'] as Place[]).forEach(p => {
                    if (slotsAt(phase, p).length > 1) {
                        problems.push(`${phase.id}: ${p} guarda mais de um arquivo`)
                    }
                })
            }
        })
    })

    return problems
}
