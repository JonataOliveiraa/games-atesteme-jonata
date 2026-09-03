import { C } from './theme'
import type { CardDef, DataKind, LevelConfig, PersonDef, PersonId, TrustRole } from '../types'

/**
 * Os dados pessoais, em pictograma.
 *
 * Nenhum deles mostra o dado de verdade: o cartão do nome traça riscos, não
 * letras; o do telefone tem bolinhas, não números. O jogo fala SOBRE dado
 * pessoal sem pedir nenhum.
 */
export const CARDS: Record<DataKind, CardDef> = {
    name: { kind: 'name', label: 'Meu nome', intro: 'Este cartão tem o SEU NOME.' },
    photo: { kind: 'photo', label: 'Minha foto', intro: 'Este cartão tem a SUA FOTO.' },
    address: { kind: 'address', label: 'Onde eu moro', intro: 'Este cartão diz ONDE VOCÊ MORA.' },
    school: { kind: 'school', label: 'Minha escola', intro: 'Este cartão tem a SUA ESCOLA.' },
    phone: { kind: 'phone', label: 'Meu telefone', intro: 'Este cartão tem o SEU TELEFONE.' },
}

/** A segunda frase da abertura: por que o cartão precisa chegar ao cofre. */
export const INTRO_MISSION = 'Leve até o cofre sem ninguém ver!'

/** Ordem dos quadros em `pessoas.png`, de cima para baixo. */
/**
 * Ordem dos quadros em `pessoas.png`, de cima para baixo.
 *
 * Cada uma PEDE alguma coisa no portão — é a fala que transforma duas figuras
 * paradas numa conversa, e é dela que a criança tira o que está em jogo. Quem
 * cuida oferece guardar; quem não cuida quer ver.
 */
export const PEOPLE: Record<PersonId, PersonDef> = {
    mother: {
        role: 'trustedAdult', frame: 0, color: C.safeGreen,
        ask: 'Guardo no cofre?', askIcon: 'shield',
    },
    teacher: {
        role: 'trustedAdult', frame: 1, color: C.safeGreen,
        ask: 'Eu guardo pra você!', askIcon: 'shield',
    },
    curious: {
        role: 'unknownAdult', frame: 2, color: C.curious,
        ask: 'Deixa eu ver?', askIcon: 'eye',
    },
    avatar: {
        role: 'appAvatar', frame: 3, color: C.avatar,
        ask: 'Me dá seu cartão?', askIcon: 'eye',
    },
    neighbor: {
        role: 'unknownAdult', frame: 4, color: C.steel,
        ask: 'Me mostra isso?', askIcon: 'eye',
    },
}

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
     */
    {
        level: 1,
        title: 'Guarde o cartão',
        message: 'Dados só com quem cuida!',
        hideouts: 3,
        freeMs: 4000,
        litMs: 4000,
        phases: [
            { id: 'n1-nome', card: 'name', gate: ['mother', 'neighbor'] },
            { id: 'n1-foto', card: 'photo', gate: ['teacher', 'curious'] },
            { id: 'n1-escola', card: 'school', gate: ['mother', 'curious'] },
        ],
    },
]
