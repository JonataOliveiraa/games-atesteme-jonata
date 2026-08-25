import type { Formato } from '../types'

/**
 * As três mídias.
 *
 * A GEOMETRIA da obra é a mesma nas três — um storyboard de peças em retrato,
 * da esquerda para a direita. O que muda é a PELE do cartão: papel, tela de
 * slide, ou filme com as perfurações na borda.
 *
 * Foi de propósito. Mídias diferentes com layouts diferentes obrigariam a
 * criança a reaprender onde clicar a cada nível; mídias diferentes com a mesma
 * caixa e caras diferentes ensinam o contrário — que a decisão é a mesma e o
 * suporte é que muda.
 */
export const MIDIAS: Array<{
    key: Formato
    nome: string
    resumo: string
    /** O que essa mídia tem de próprio, escrito na carta de escolha. */
    recursos: string
}> = [
    {
        key: 'texto',
        nome: 'TEXTO ILUSTRADO',
        resumo: 'cartaz, bilhete, convite',
        recursos: 'título, imagem e frase',
    },
    {
        key: 'apresentacao',
        nome: 'APRESENTAÇÃO',
        resumo: 'slides, para alguém mostrar',
        recursos: 'capa, tópicos e encerramento',
    },
    {
        key: 'video',
        nome: 'VÍDEO CURTO',
        resumo: 'passa sozinho, do começo ao fim',
        recursos: 'cena, narração e transição',
    },
]

export const NOME: Record<Formato, string> = {
    texto: 'TEXTO ILUSTRADO',
    apresentacao: 'APRESENTAÇÃO',
    video: 'VÍDEO CURTO',
}

/** A abinha de cada mídia no HUD. */
export const SIGLA: Record<Formato, string> = {
    texto: 'TEXTO',
    apresentacao: 'SLIDES',
    video: 'VÍDEO',
}

/**
 * As cinco imagens do acervo.
 *
 * Elas se repetem entre os briefings de propósito: a foto que não serve num
 * pedido é justamente a certa em outro. É assim que "adequação" deixa de ser
 * uma regra decorada e vira uma pergunta que se refaz a cada trabalho.
 */
export const ACERVO = {
    lixeiras: 'foto-lixeiras',
    horta: 'foto-horta',
    festa: 'foto-festa',
    quadra: 'foto-quadra',
    /** A bonita e sempre errada. */
    gato: 'foto-gato',
} as const

/** O nome que aparece embaixo da miniatura, na caixa de ferramentas. */
export const LEGENDA_FOTO: Record<string, string> = {
    'foto-lixeiras': 'lixeiras de coleta',
    'foto-horta': 'a horta da escola',
    'foto-festa': 'a festa junina',
    'foto-quadra': 'a quadra',
    'foto-gato': 'um gatinho',
}
