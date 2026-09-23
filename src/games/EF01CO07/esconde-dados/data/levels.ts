import { C } from './theme'
import { stopsFor, watcherSpots } from './layout'
import type { CardDef, DataKind, LevelConfig, PersonDef, PersonId, TrustRole } from '../types'

/**
 * Os dados pessoais, em pictograma.
 *
 * Nenhum deles mostra o dado de verdade: o cartão do nome traça riscos, não
 * letras; o do telefone tem bolinhas, não números. O jogo fala SOBRE dado
 * pessoal sem pedir nenhum.
 */
export const CARDS: Record<DataKind, CardDef> = {
    name: {
        kind: 'name', label: 'Meu nome',
        intro: 'Este cartão tem o SEU NOME.', lost: 'Ele levou o seu NOME!',
    },
    photo: {
        kind: 'photo', label: 'Minha foto',
        intro: 'Este cartão tem a SUA FOTO.', lost: 'Ele levou a sua FOTO!',
    },
    address: {
        kind: 'address', label: 'Onde eu moro',
        intro: 'Este cartão diz ONDE VOCÊ MORA.', lost: 'Agora ele sabe ONDE VOCÊ MORA!',
    },
    school: {
        kind: 'school', label: 'Minha escola',
        intro: 'Este cartão tem a SUA ESCOLA.', lost: 'Agora ele sabe a SUA ESCOLA!',
    },
    phone: {
        kind: 'phone', label: 'Meu telefone',
        intro: 'Este cartão tem o SEU TELEFONE.', lost: 'Ele levou o seu TELEFONE!',
    },
}

/** A segunda frase da abertura: por que o cartão precisa chegar ao cofre. */
export const INTRO_MISSION = 'Leve até o cofre sem ninguém ver!'

/**
 * Ordem dos quadros em `pessoas.png`, de cima para baixo.
 *
 * O que as pessoas do portão DIZEM mora na fase (`PhaseDef.talk`), não aqui:
 * a mesma pessoa pede de um jeito rude no nível 1 e de um jeito doce no 2. Só
 * o avatar tem fala fixa, porque ele só aparece no caminho do nível 3.
 */
export const PEOPLE: Record<PersonId, PersonDef> = {
    mother: { role: 'trustedAdult', frame: 0, color: C.safeGreen },
    teacher: { role: 'trustedAdult', frame: 1, color: C.safeGreen },
    curious: { role: 'unknownAdult', frame: 2, color: C.curious },
    avatar: {
        role: 'appAvatar', frame: 3, color: C.avatar,
        ask: 'Me dá seu cartão?', askIcon: 'eye',
    },
    neighbor: { role: 'unknownAdult', frame: 4, color: C.steel },
}

/**
 * A PISTA DO PORTÃO: quem cuida chama a criança pelo que ela é para ele.
 *
 * Mãe diz "filho", professora diz "meu aluno". É a única diferença que a
 * criança precisa achar — os dois pedem o cartão, os dois sorriem, nenhum tem
 * escudo. Um estranho NUNCA usa essas palavras (a validação cobra), senão a
 * pista mente.
 */
export const KIN_WORDS = /\b(filho|aluno)\b/i

/** Fala de NPC curta, para caber em duas linhas do balão e ser lida no 1º ano. */
export const TALK_MAX_CHARS = 34

/** Quem pode ver o cartão. É a única regra de segurança do jogo. */
export function canShareWith(role: TrustRole) {
    return role === 'trustedAdult'
}

export const LEVELS: LevelConfig[] = [
    /*
     * N1 — o ciclo é lento de propósito.
     *
     * Quatro segundos de caminho livre para uma corrida de menos de um: sobra
     * tempo para a criança olhar a lanterna, decidir e tocar. Pressa mede
     * reflexo, e reflexo não é a habilidade daqui.
     *
     * Ser pega pela luz NÃO é erro de segurança: custa uma volta ao
     * esconderijo anterior e nada mais. O que vale vida é mostrar o cartão
     * para quem não cuida — é lá que a BNCC está sendo julgada.
     *
     * No portão, o estranho é SECO: "Me dá isso aí!". A diferença para quem
     * chama de "filho" se ouve na primeira leitura.
     */
    {
        level: 1,
        title: 'Guarde o cartão',
        message: 'Dados só com quem cuida!',
        hideouts: 3,
        freeMs: 4000,
        litMs: 4000,
        watchers: 1,
        phases: [
            {
                id: 'n1-nome', card: 'name', gate: ['mother', 'neighbor'],
                talk: { mother: 'Oi, filho! Eu guardo pra você.', neighbor: 'Ei, você! Me dá isso aí!' },
            },
            {
                id: 'n1-foto', card: 'photo', gate: ['teacher', 'curious'],
                talk: { teacher: 'Oi, meu aluno! Eu guardo pra você.', curious: 'Me dá essa foto aí!' },
            },
            {
                id: 'n1-escola', card: 'school', gate: ['mother', 'curious'],
                talk: { mother: 'Filho, me dá que eu guardo.', curious: 'Me dá isso, rapidinho!' },
            },
        ],
    },

    /*
     * N2 — o estranho simpático.
     *
     * O assunto do nível é que SIMPATIA NÃO É CONFIANÇA. O estranho agora
     * elogia, chama de "fofinho", oferece doce — a fala dele é tão gentil
     * quanto a de quem cuida, e o tom deixa de separar os dois. Sobra a pista
     * que já valia no nível 1: só quem cuida chama de "filho" ou "meu aluno".
     *
     * O resto é aperto de percurso, não regra nova: mais uma parada e um
     * segundo a menos de janela.
     */
    {
        level: 2,
        title: 'Ouça quem pede',
        message: 'Estranho simpático continua estranho.',
        hideouts: 4,
        freeMs: 3000,
        litMs: 3000,
        watchers: 1,
        phases: [
            {
                id: 'n2-endereco', card: 'address', gate: ['mother', 'neighbor'],
                talk: { mother: 'Oi, filho! Vamos guardar?', neighbor: 'Que cartão lindo! Me dá?' },
            },
            {
                id: 'n2-telefone', card: 'phone', gate: ['teacher', 'neighbor'],
                talk: { teacher: 'Oi, meu aluno! Eu guardo.', neighbor: 'Oi, fofinho! Me empresta?' },
            },
            {
                id: 'n2-foto', card: 'photo', gate: ['mother', 'curious'],
                talk: { mother: 'Filho, me dá que eu guardo.', curious: 'Te dou um doce por ele!' },
            },
        ],
    },

    /*
     * N3 — o pedido que vem de dentro do aparelho.
     *
     * Até aqui todo pedido tinha um rosto na frente da criança. O avatar do
     * app para o caminho no meio do percurso e oferece alguma coisa em troca
     * do cartão — e não há ninguém certo para tocar: a resposta é recusar e
     * seguir, que é um gesto novo.
     *
     * Os dois curiosos alternados são a dificuldade que sustenta isso sem
     * ensinar nada por cima: a mesma espera, agora com dois lados para olhar.
     * O portão repete o estranho gentil do nível 2 — nada novo ali.
     */
    {
        level: 3,
        title: 'Diga não e siga',
        message: 'Quem promete figurinha não é quem cuida.',
        hideouts: 4,
        freeMs: 2600,
        litMs: 2600,
        watchers: 2,
        phases: [
            {
                id: 'n3-nome', card: 'name', gate: ['teacher', 'curious'], intercept: 'avatar',
                talk: { teacher: 'Oi, meu aluno! Vamos guardar?', curious: 'Nossa, que legal! Me mostra?' },
            },
            {
                id: 'n3-endereco', card: 'address', gate: ['mother', 'neighbor'], intercept: 'avatar',
                talk: { mother: 'Oi, filho! Eu guardo pra você.', neighbor: 'Me dá? Eu devolvo depois!' },
            },
            {
                id: 'n3-telefone', card: 'phone', gate: ['teacher', 'neighbor'], intercept: 'avatar',
                talk: { teacher: 'Oi, meu aluno! Eu guardo.', neighbor: 'Te dou uma bala por ele!' },
            },
        ],
    },
]

/**
 * A REGRA DE CADA NÍVEL, afirmada aqui.
 *
 * Sem isto, a primeira fase nova quebra a divisão dos assuntos em silêncio: um
 * avatar no nível 1, um segundo curioso no nível 2, uma fase sem ninguém de
 * confiança no portão. Roda no boot e grita no console.
 */
export function validateLevels(levels: LevelConfig[]): string[] {
    const problems: string[] = []

    levels.forEach(level => {
        const where = `nível ${level.level}`

        if (level.phases.length !== 3) {
            problems.push(`${where}: ${level.phases.length} fases (o catálogo pede 3)`)
        }
        if (stopsFor(level.hideouts).length !== level.hideouts + 1) {
            problems.push(`${where}: ${level.hideouts} esconderijos sem paradas desenhadas`)
        }
        if (watcherSpots(level.watchers).length !== level.watchers) {
            problems.push(`${where}: ${level.watchers} curiosos sem lugar no desenho`)
        }

        level.phases.forEach(phase => {
            const roles = phase.gate.map(id => PEOPLE[id].role)
            const trusted = roles.filter(canShareWith).length
            if (trusted !== 1) {
                problems.push(`${where}, ${phase.id}: ${trusted} pessoas de confiança no portão (tem de ser 1)`)
            }
            if (phase.gate.length !== 2) {
                problems.push(`${where}, ${phase.id}: ${phase.gate.length} pessoas no portão (tem de ser 2)`)
            }
            if (phase.gate.includes('avatar')) {
                problems.push(`${where}, ${phase.id}: o avatar é do caminho, não do portão`)
            }
            if (phase.intercept && level.level < 3) {
                problems.push(`${where}, ${phase.id}: o avatar do caminho é o assunto do nível 3`)
            }
            if (phase.intercept && PEOPLE[phase.intercept].role !== 'appAvatar') {
                problems.push(`${where}, ${phase.id}: quem para no caminho tem de ser um avatar de app`)
            }

            // A fala é a pista: quem cuida chama pela relação, estranho nunca.
            phase.gate.forEach(id => {
                const line = phase.talk[id]
                if (!line) {
                    problems.push(`${where}, ${phase.id}: ${id} não tem fala no portão`)
                    return
                }
                if (line.length > TALK_MAX_CHARS) {
                    problems.push(`${where}, ${phase.id}: fala de ${id} com ${line.length} letras (máx. ${TALK_MAX_CHARS})`)
                }
                const kin = KIN_WORDS.test(line)
                if (canShareWith(PEOPLE[id].role) && !kin) {
                    problems.push(`${where}, ${phase.id}: ${id} cuida mas não chama de filho/aluno`)
                }
                if (!canShareWith(PEOPLE[id].role) && kin) {
                    problems.push(`${where}, ${phase.id}: ${id} é estranho e chama de filho/aluno — a pista mente`)
                }
            })
        })
        if (level.watchers === 2 && level.level !== 3) {
            problems.push(`${where}: o segundo curioso é o aperto do nível 3`)
        }
    })

    return problems
}
