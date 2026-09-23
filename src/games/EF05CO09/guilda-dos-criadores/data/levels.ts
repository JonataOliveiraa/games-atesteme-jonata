import {
    ARTIST_NAMES,
    signLength,
    type Falha,
    POSE,
    type LevelDef,
    type Piece,
    type Sign,
} from '../types'

const letra = (ch: string): Piece => ({ kind: 'letra', ch })

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  NÍVEL 1 — CREDITAR
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Um nível, um verbo. Aqui existe UM ÚNICO carimbo na mesa: a criança não
 * escolhe, ela carimba. O que o nível ensina é a sequência — virou, carimbou,
 * escreveu, subiu —, e sequência não se aprende escolhendo.
 *
 * O que cresce DENTRO do nível é a assinatura, nunca a regra:
 * marca (1 toque) → 3 letras → 4 letras com repetida. Copiar um desenho é mais
 * barato que soletrar, então quem trava na letra começa acertando.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        prompt: 'Monte o mural da festa.',
        /* Onde estou → o que falta → o que eu faço. A terceira linha já
           entrega a primeira obra, para a Lia não falar duas vezes
           seguidas: a fala de fase da 1.1 saiu, e virou esta. */
        opening: [
            { who: 0, pose: POSE.esperando, text: 'Oi! Bem-vindo à Guilda dos Criadores.' },
            { who: 0, pose: POSE.explicando, text: 'Hoje tem festa, e o nosso mural está vazio.' },
            { who: 0, pose: POSE.explicando, text: 'Estas figuras não são suas. Antes de usar, a gente descobre quem fez.' },
        ],
        phases: [
            {
                obra: {
                    id: 'l1f1',
                    frame: 0,
                    title: 'o pôr do sol',
                    seal: 'credito',
                    sign: { kind: 'marca', id: 'sol' },
                    note: 'Tirei no quintal da vovó.\nPõe minha marca!',
                    author: 0,
                },
                /* Sem fala de fase: quem apresenta a 1.1 é a abertura do nível,
                   e a Lia não pode falar quatro vezes seguidas. */
                /* A marca certa e cinco vizinhas. Sol e estrela juntos de
                   propósito: é o par mais parecido, e separá-los é o que a
                   criança tem de fazer olhando o verso. */
                tray: [
                    { kind: 'marca', id: 'lua' },
                    { kind: 'marca', id: 'sol' },
                    { kind: 'marca', id: 'estrela' },
                    { kind: 'marca', id: 'folha' },
                    { kind: 'marca', id: 'gato' },
                    { kind: 'marca', id: 'coracao' },
                ],
            },
            {
                obra: {
                    id: 'l1f2',
                    frame: 1,
                    title: 'o gato na caixa',
                    seal: 'credito',
                    sign: { kind: 'letras', text: 'TOM' },
                    note: 'Fiz às três da manhã.\nNão me arrependo.',
                    author: 1,
                },
                /* Quem fala é o DAVI, que não fez esta obra: o autor é o
                   Tom, e o nome dele é a resposta. */
                intro: { who: 3, pose: POSE.explicando, text: 'Chegou figura nova na caixa. Veja quem fez antes de pendurar!' },
                /* As intrusas formam LIA de propósito: nome errado que é de
                   OUTRO artista faz esse artista aparecer confuso, e é a
                   melhor coisa em que o erro pode virar. */
                tray: [letra('L'), letra('T'), letra('I'), letra('O'), letra('A'), letra('M')],
            },
            {
                obra: {
                    id: 'l1f3',
                    frame: 2,
                    title: 'a horta da escola',
                    seal: 'credito',
                    sign: { kind: 'letras', text: 'NINA' },
                    note: 'Plantei essa alface eu mesma.\nNina, com N de Nina.',
                    author: 2,
                },
                /* De novo a Lia, e de novo sem ser a autora — aqui ela diz
                   em voz alta a coisa que o jogo existe para ensinar. */
                intro: { who: 0, pose: POSE.explicando, text: 'Esta aqui não é minha. Só o lado de trás sabe quem fez.' },
                /* Três peças para quatro toques: o N é tocado duas vezes. */
                tray: [letra('A'), letra('N'), letra('O'), letra('I'), letra('T'), letra('L')],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — PEDIR
     * ══════════════════════════════════════════════════════════════════════
     *
     * O verso agora mostra um CADEADO. A sequência que a criança já sabe
     * ganha um passo na frente dela: toca a campainha, o autor atende e
     * entrega o carimbo — e só então ela credita como no nível 1.
     *
     * O erro deste nível já existia no motor antes de o nível existir:
     * carimbar sem pedir é `semLicenca`, e a frase é "Essa está fechada.
     * Pergunte antes." — o que o `avaliar` cobra com o `licensed`.
     *
     * A ficha prevê que o autor possa dizer NÃO. Aqui ele sempre atende, e
     * é decisão de projeto: o assunto do nível é PEDIR, e "devolver a obra"
     * é um segundo gesto e um segundo assunto. Se ele entrar, entra num
     * nível próprio.
     */
    {
        level: 2,
        prompt: 'Peça licença antes de usar.',
        opening: [
            { who: 1, pose: POSE.esperando, text: 'Opa! Tem figura nova chegando pro mural.' },
            { who: 1, pose: POSE.explicando, text: 'Repara no cadeado atrás: essa aí ninguém pega sem perguntar.' },
            { who: 1, pose: POSE.explicando, text: 'Toque a campainha. Quem fez vem atender.' },
        ],
        phases: [
            {
                obra: {
                    id: 'l2f1',
                    frame: 3,
                    title: 'a ponte de manhã',
                    seal: 'fechada',
                    sign: { kind: 'marca', id: 'raio' },
                    note: 'Essa é minha.\nPergunta antes, tá?',
                    author: 3,
                },
                /* Marca de novo na fase de estreia, como no nível 1: o passo
                   novo é a campainha, e um toque só fecha a assinatura. */
                tray: [
                    { kind: 'marca', id: 'folha' },
                    { kind: 'marca', id: 'raio' },
                    { kind: 'marca', id: 'sol' },
                    { kind: 'marca', id: 'peixe' },
                    { kind: 'marca', id: 'lua' },
                    { kind: 'marca', id: 'coracao' },
                ],
            },
            {
                obra: {
                    id: 'l2f2',
                    frame: 4,
                    title: 'a chuva na janela',
                    seal: 'fechada',
                    sign: { kind: 'letras', text: 'NINA' },
                    note: 'Demorei uma tarde inteira.\nFala comigo antes.',
                    author: 2,
                },
                /* Quem fala é o Tom, que não é a autora: numa fase de letras
                   o nome de quem fala seria a resposta de graça. */
                intro: { who: 1, pose: POSE.explicando, text: 'Essa está fechada. Chame quem fez antes de carimbar.' },
                tray: [letra('I'), letra('N'), letra('A'), letra('T'), letra('O'), letra('L')],
            },
            {
                obra: {
                    id: 'l2f3',
                    frame: 5,
                    title: 'o bolo de aniversário',
                    seal: 'fechada',
                    sign: { kind: 'letras', text: 'DAVI' },
                    note: 'Foi o bolo da minha irmã.\nPede antes de usar.',
                    author: 3,
                },
                intro: { who: 0, pose: POSE.explicando, text: 'Fechada também. Você já sabe o que fazer primeiro.' },
                tray: [letra('D'), letra('A'), letra('V'), letra('I'), letra('N'), letra('O')],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — CRIAR
     * ══════════════════════════════════════════════════════════════════════
     *
     * O verso não mostra nada, e não é esquecimento: a figura é DELA. Não há
     * de quem é escrito em lugar nenhum porque quem faz é quem assina, e o
     * carimbo da mesa deixa de ser o do crédito e passa a ser o dela.
     *
     * A PRIMEIRA obra do nível é a que ESTABELECE a marca — qualquer uma das
     * oito serve, e é a única vez no jogo inteiro em que não existe resposta
     * certa. As duas seguintes cobram a mesma marca: uma assinatura que muda
     * a cada obra não assina nada, e é isso que o nível ensina.
     */
    {
        level: 3,
        prompt: 'Assine o que é seu.',
        opening: [
            { who: 2, pose: POSE.esperando, text: 'Sua vez! Estas três figuras são suas.' },
            { who: 2, pose: POSE.explicando, text: 'Vira que você vai ver: atrás não tem nada escrito.' },
            { who: 2, pose: POSE.explicando, text: 'Escolha a SUA marca. Ela vai ser a mesma nas três.' },
        ],
        phases: [
            {
                obra: {
                    id: 'l3f1',
                    frame: 6,
                    title: 'o seu desenho do mar',
                    seal: 'nenhum',
                    sign: null,
                    note: null,
                    author: null,
                },
                /* As oito marcas, e nenhuma delas é a certa: a que ela tocar
                   vira a dela, e as duas fases seguintes cobram essa. */
                tray: [
                    { kind: 'marca', id: 'sol' },
                    { kind: 'marca', id: 'raio' },
                    { kind: 'marca', id: 'estrela' },
                    { kind: 'marca', id: 'coracao' },
                    { kind: 'marca', id: 'gato' },
                    { kind: 'marca', id: 'peixe' },
                ],
            },
            {
                obra: {
                    id: 'l3f2',
                    frame: 7,
                    title: 'a sua foto do quintal',
                    seal: 'nenhum',
                    sign: null,
                    note: null,
                    author: null,
                },
                intro: { who: 2, pose: POSE.explicando, text: 'Mais uma sua. A marca é a mesma de antes.' },
                tray: [
                    { kind: 'marca', id: 'sol' },
                    { kind: 'marca', id: 'raio' },
                    { kind: 'marca', id: 'estrela' },
                    { kind: 'marca', id: 'coracao' },
                    { kind: 'marca', id: 'gato' },
                    { kind: 'marca', id: 'peixe' },
                ],
            },
            {
                obra: {
                    id: 'l3f3',
                    frame: 8,
                    title: 'o seu cartaz da festa',
                    seal: 'nenhum',
                    sign: null,
                    note: null,
                    author: null,
                },
                intro: { who: 0, pose: POSE.explicando, text: 'A última é sua também. Fecha o mural com a sua marca!' },
                tray: [
                    { kind: 'marca', id: 'sol' },
                    { kind: 'marca', id: 'raio' },
                    { kind: 'marca', id: 'estrela' },
                    { kind: 'marca', id: 'coracao' },
                    { kind: 'marca', id: 'gato' },
                    { kind: 'marca', id: 'peixe' },
                ],
            },
        ],
    },
]

/**
 * O VERBO DO NÍVEL, tirado das obras dele.
 *
 * Não existe um campo dizendo "este é o nível de pedir": o selo das obras já
 * diz isso, e um campo a mais seria uma segunda fonte de verdade que pode
 * discordar da primeira. A validação afirma que as três fases concordam.
 */
export function verboDoNivel(level: LevelDef): 'creditar' | 'pedir' | 'criar' {
    const seal = level.phases[0]?.obra.seal
    if (seal === 'fechada') return 'pedir'
    if (seal === 'nenhum') return 'criar'
    return 'creditar'
}

export const TOTAL_FASES = LEVELS.reduce((n, l) => n + l.phases.length, 0)

/** 30 por nível, divididos pelas fases. Nunca escrito na mão. */
export function pointsFor(level: LevelDef, firstTry: boolean): number {
    const full = 30 / level.phases.length
    return firstTry ? full : full / 2
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PALAVRA DO GESTO — "A MARCA" OU "O NOME", NUNCA OS DOIS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A fase 1.1 se resolve com uma MARCA: a criança toca num sol, e NADA é
 * escrito. Mas todos os textos do jogo tinham sido escritos pensando nas
 * fases de letras, e diziam "nome" e "escrito" em toda fase. O dono do
 * projeto pegou jogando:
 *
 *   *"tem hora que o personagem diz 'ficou escrito X no mural' sendo que não
 *   foi escrito nada. por exemplo, logo na fase 1 do n1, eu coloco o símbolo
 *   do sol e ela diz 'ficou escrito LIA'."*
 *
 * Duas coisas erradas numa frase só: a criança colava um sol e ouvia falar de
 * uma palavra que não existia em lugar nenhum da tela — e a palavra era o
 * nome da própria Lia, dito por ela, em terceira pessoa.
 *
 * Um jogo que descreve um gesto que a criança NÃO fez ensina, em uma frase,
 * que o texto dele não vale a leitura. Por isso toda frase que fala da
 * assinatura passa por aqui, e por aqui só: a palavra sai do `sign.kind` da
 * fase, e não do que o autor do texto tinha em mente naquele dia.
 */
export function palavraDaAssinatura(sign: Sign | null): 'a marca' | 'o nome' {
    return sign?.kind === 'marca' ? 'a marca' : 'o nome'
}

/**
 * O aviso âmbar do erro, na palavra do gesto daquela fase.
 *
 * `propria` troca a referência: numa obra da criança não há verso para
 * conferir, e mandar ela "olhar atrás" seria mandar olhar para um papel em
 * branco. O que existe é a marca que ELA escolheu na primeira obra.
 */
export function falhaTexto(falha: Falha, sign: Sign | null, propria = false): string {
    const marca = sign?.kind === 'marca'
    switch (falha) {
        case 'incompleta':
            if (propria) return 'Falta a sua marca.'
            return marca ? 'Falta a marca de quem fez.' : 'Falta o nome de quem fez.'
        case 'assinaturaErrada':
            if (propria) return 'A sua marca é outra. Use sempre a mesma.'
            return marca
                ? 'Não é essa a marca que está atrás.'
                : 'Não é esse o nome que está atrás.'
        case 'semLicenca':
            return 'Essa está fechada. Pergunte antes.'
        case 'semDono':
            return 'Atrás não diz quem fez. Não dá para dar o crédito.'
    }
}

/**
 * O "valeu" DO AUTOR, em primeira pessoa.
 *
 * Quem fala é o dono da figura, então ele diz "a minha marca" — e não o
 * próprio nome. Antes era `Ficou escrito ${ARTIST_NAMES[autor]}`, o que fazia
 * a Lia se referir a si mesma em terceira pessoa, como um locutor.
 */
export function agradecimento(sign: Sign | null): string {
    return sign?.kind === 'marca'
        ? 'Valeu! A minha marca ficou lá no mural.'
        : 'Valeu! O meu nome ficou escrito lá no mural.'
}

/** A dica do autor depois de um erro, também na palavra certa. */
export function dicaDoAutor(sign: Sign | null): string {
    return sign?.kind === 'marca'
        ? 'Olha atrás: a minha marca está lá.'
        : 'Olha atrás: o meu nome está escrito lá.'
}

/** O nome que as peças tocadas formam, se ele for de algum artista da casa. */
export function artistNamed(text: string): number | null {
    const i = ARTIST_NAMES.indexOf(text as (typeof ARTIST_NAMES)[number])
    return i >= 0 ? i : null
}

/* ══════════════════════════════════════════════════════════════════════════
 *  VALIDAÇÃO NO IMPORT
 *
 *  Quebra alto em desenvolvimento. Fase sem saída não aparece em revisão de
 *  código — tem de ser afirmada aqui.
 * ════════════════════════════════════════════════════════════════════════ */
if (import.meta.env.DEV) {
    const erro = (m: string) => {
        throw new Error(`[guilda-dos-criadores] ${m}`)
    }

    LEVELS.forEach(level => {
        if (level.phases.length !== 3) erro(`nível ${level.level}: são 3 fases por nível`)

        /* UM NÍVEL, UM VERBO. Misturar selos no mesmo nível põe duas
           aprendizagens na mesma tela, e `verboDoNivel` passaria a mentir. */
        const seals = new Set(level.phases.map(f => f.obra.seal))
        if (seals.size > 1)
            erro(`nível ${level.level}: selos misturados (${[...seals].join(', ')}) — um nível, um verbo`)

        const verbo = verboDoNivel(level)
        if (level.level === 2 && verbo !== 'pedir')
            erro(`nível 2: é o nível de PEDIR, e as obras não estão fechadas`)
        if (level.level === 3 && verbo !== 'criar')
            erro(`nível 3: é o nível de CRIAR, e as obras não são da criança`)

        /* A marca que ela escolheu na primeira obra tem de existir nas outras
           duas — senão o nível cobra uma assinatura que a bandeja não oferece. */
        if (verboDoNivel(level) === 'criar') {
            const chaves = level.phases.map(f =>
                f.tray.map(p => (p as { id: string }).id).sort().join(','))
            if (new Set(chaves).size > 1)
                erro(`nível ${level.level}: as bandejas da marca própria têm de ser iguais`)
        }

        level.phases.forEach(({ obra, tray, intro }, i) => {
            const onde = `${level.level}.${i + 1}`

            /* No nível da criança a bandeja é de MARCAS, e precisa de mais de
               uma: escolher entre uma coisa só não é escolher. */
            if (verbo === 'criar') {
                if (tray.some(p => p.kind !== 'marca'))
                    erro(`${onde}: a obra da criança se assina com marca, não com letras`)
                if (tray.length < 2)
                    erro(`${onde}: a bandeja da marca própria precisa de opção`)
                const ids = new Set(tray.map(p => (p as { id: string }).id))
                if (ids.size !== tray.length) erro(`${onde}: marca repetida na bandeja`)
            }

            // obra sem selo não tem o que copiar; obra com selo não pode estar sem
            if ((obra.seal === 'nenhum') !== (obra.sign === null))
                erro(`${onde}: 'seal: nenhum' e 'sign: null' andam juntos`)
            if (obra.seal === 'fechada' && obra.author === null)
                erro(`${onde}: obra fechada sem autor não tem quem atenda a campainha`)

            if (level.level === 1 && obra.seal !== 'credito')
                erro(`${onde}: o nível 1 só tem obras com crédito — outro selo estreia um segundo assunto`)

            if (obra.frame !== (level.level - 1) * 3 + i)
                erro(`${onde}: o quadro da obra é 'nível × 3 + fase'`)

            if (tray.length > 6) erro(`${onde}: a bandeja não passa de 6 peças`)

            const sign = obra.sign
            if (!sign) return

            if (sign.kind === 'letras') {
                if (!/^[A-Z]{3,4}$/.test(sign.text))
                    erro(`${onde}: o nome é de 3 ou 4 letras A–Z sem acento`)
                const disponiveis = new Set(
                    tray.filter(p => p.kind === 'letra').map(p => (p as { ch: string }).ch),
                )
                for (const ch of sign.text)
                    if (!disponiveis.has(ch)) erro(`${onde}: falta a letra ${ch} na bandeja`)
            } else if (!tray.some(p => p.kind === 'marca' && p.id === sign.id)) {
                erro(`${onde}: falta a marca ${sign.id} na bandeja`)
            }

            /* A regra que impede a fala de entregar a resposta. */
            if (intro && sign.kind === 'letras' && intro.who === obra.author)
                erro(`${onde}: numa fase de letras quem fala não pode ser o autor — o nome dele É a resposta`)

            if (tray.length < signLength(sign))
                erro(`${onde}: a bandeja não tem peças suficientes para fechar a assinatura`)
        })
    })
}
