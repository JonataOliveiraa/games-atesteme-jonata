import type { Code, SoundId, Word } from '../types'

/**
 * O DICIONÁRIO DA ILHA — uma linha por informação, uma coluna por código.
 *
 * A cor mora aqui, e não dentro de um PNG: ela É o código do jogo, e precisa
 * vir do mesmo lugar de onde vem a resposta certa. Cor guardada em textura
 * seria uma segunda fonte da verdade esperando divergir.
 */

/** A ordem é o frame de `simbolos-ilha.png`. Contrato com a arte. */
export const WORDS: Word[] = ['SOL', 'PEIXE', 'LUA', 'COCO']

export interface WordInfo {
    frame: number
    color: number
    colorDark: number
    sound: SoundId
    /** Como a criança ouve o nome no balão da trava. */
    figureName: string
    colorName: string
    soundName: string
}

export const ISLAND: Record<Word, WordInfo> = {
    SOL: {
        frame: 0,
        color: 0xe5484d,
        colorDark: 0xa32a2e,
        sound: 'chocalho',
        figureName: 'o sol',
        colorName: 'o vermelho',
        soundName: 'o chocalho',
    },
    PEIXE: {
        frame: 1,
        color: 0x3e7bfa,
        colorDark: 0x2350ad,
        sound: 'agua',
        figureName: 'o peixe',
        colorName: 'o azul',
        soundName: 'a água',
    },
    LUA: {
        frame: 2,
        color: 0xf5c542,
        colorDark: 0xb98d15,
        sound: 'tambor',
        figureName: 'a lua',
        colorName: 'o amarelo',
        soundName: 'o tambor',
    },
    COCO: {
        frame: 3,
        color: 0x3fa05a,
        colorDark: 0x256b39,
        sound: 'madeira',
        figureName: 'o coco',
        colorName: 'o verde',
        soundName: 'a madeira',
    },
}

/** O nome da palavra NO código em que ela foi dita — o balão da trava usa isto. */
export function nameOf(word: Word, code: Code): string {
    const info = ISLAND[word]
    if (code === 'cor') return info.colorName
    if (code === 'som') return info.soundName
    return info.figureName
}

export const CODE_TITLE: Record<Code, string> = {
    figura: 'DESENHOS',
    cor: 'CORES',
    som: 'SONS',
}
