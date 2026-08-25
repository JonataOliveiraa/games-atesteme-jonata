import type { Principio } from '../types'

/**
 * O painel.
 *
 * Quatro princípios, quatro lâmpadas, e nada além disso. Eles são ao mesmo
 * tempo o placar da partida e o "relatório final de princípios respeitados"
 * que o briefing pede — a criança não precisa esperar o fim para saber como
 * está indo, e no fim não aparece nada que ela já não estivesse vendo.
 */
export const PRINCIPIOS: Array<{
    key: Principio
    nome: string
    /** A frase que explica o princípio em uma linha, no relatório. */
    resumo: string
}> = [
    {
        key: 'autoria',
        nome: 'AUTORIA',
        resumo: 'dizer de quem é o que você usou',
    },
    {
        key: 'permissao',
        nome: 'PERMISSÃO',
        resumo: 'olhar o que a etiqueta libera, e o que não',
    },
    {
        key: 'privacidade',
        nome: 'PRIVACIDADE',
        resumo: 'cuidar dos dados que são de outras pessoas',
    },
    {
        key: 'guarda',
        nome: 'GUARDA',
        resumo: 'guardar no lugar certo — e apagar quando não precisa mais',
    },
]

export const NOME: Record<Principio, string> = {
    autoria: 'AUTORIA',
    permissao: 'PERMISSÃO',
    privacidade: 'PRIVACIDADE',
    guarda: 'GUARDA',
}

/**
 * As três imagens do acervo.
 *
 * Elas se repetem entre os casos de propósito: a mesma foto da turma volta no
 * Nível 3, e a criança que aprendeu no Nível 2 que ali tem sete rostos precisa
 * lembrar disso quando o assunto passa a ser onde guardar.
 */
export const ACERVO = {
    turma: 'arq-turma',
    desenho: 'arq-desenho',
    praca: 'arq-praca',
} as const
