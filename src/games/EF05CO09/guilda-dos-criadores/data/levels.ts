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
]

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

/** O aviso âmbar do erro, na palavra do gesto daquela fase. */
export function falhaTexto(falha: Falha, sign: Sign | null): string {
    const marca = sign?.kind === 'marca'
    switch (falha) {
        case 'incompleta':
            return marca ? 'Falta a marca de quem fez.' : 'Falta o nome de quem fez.'
        case 'assinaturaErrada':
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

        level.phases.forEach(({ obra, tray, intro }, i) => {
            const onde = `${level.level}.${i + 1}`

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
