import type { Principio } from '../types'

/**
 * Os quatro princípios.
 *
 * ── ELES SAÍRAM DO RODAPÉ ────────────────────────────────────────────────
 *
 * Moravam numa barra de 88px embaixo da tela, cada um com nome E resumo: oito
 * textos parados, que a criança precisava atravessar com o olho toda vez que
 * ia decidir, e que não mudavam nunca durante a decisão.
 *
 * Agora são quatro selos pequenos no HUD — só a palavra, acesa ou apagada. O
 * `resumo` continua existindo e continua sendo lido: ele é o relatório de fim
 * de nível, que é onde o briefing da habilidade pede um relatório.
 */
export const PRINCIPIOS: Array<{
    key: Principio
    nome: string
    /** A palavra do selo. Curta, porque cabe em 88px a 13px de fonte. */
    selo: string
    /** A frase que explica o princípio em uma linha, no relatório. */
    resumo: string
}> = [
    {
        key: 'autoria',
        nome: 'AUTORIA',
        selo: 'AUTOR',
        resumo: 'dizer de quem é o que você usou',
    },
    {
        key: 'permissao',
        nome: 'PERMISSÃO',
        selo: 'PODE',
        resumo: 'olhar o que a etiqueta libera, e o que não',
    },
    {
        key: 'privacidade',
        nome: 'PRIVACIDADE',
        selo: 'PRIVADO',
        resumo: 'cuidar dos dados que são de outras pessoas',
    },
    {
        key: 'guarda',
        nome: 'GUARDA',
        selo: 'GUARDA',
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
 * O acervo.
 *
 * Seis artes para seis arquivos, e não quatro ícones para quatro tipos. A
 * diferença é grande: um ícone de clave de sol diz "isto é música", e a foto
 * da capa diz "isto é o forró da Banda Pé de Vento" — que é a informação que a
 * criança precisa para decidir se dá para usar.
 *
 * As de imagem se repetem entre os casos de propósito: a mesma foto da turma
 * volta no Nível 3, e quem aprendeu no Nível 2 que ali tem sete rostos precisa
 * lembrar disso quando o assunto passa a ser onde guardar.
 */
export const ACERVO = {
    turma: 'arq-turma',
    desenho: 'arq-desenho',
    praca: 'arq-praca',
    trilha: 'arq-trilha',
    documentario: 'arq-documentario',
    lista: 'arq-lista',
} as const
