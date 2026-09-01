/**
 * O baú diz uma mensagem num código; a criança escreve a MESMA mensagem no
 * outro código, encaixe por encaixe, e a chave abre o baú.
 *
 * A mensagem nunca é guardada como desenho: ela é uma lista de `Word`, e cada
 * `Code` é só uma vista dela. É isso que permite o mesmo baú pedir cor no
 * nível 1 e som no nível 3 sem duplicar dado nenhum.
 */

export type Word = 'SOL' | 'PEIXE' | 'LUA' | 'COCO'

export type Code = 'figura' | 'cor' | 'som'

export type SoundId = 'chocalho' | 'agua' | 'tambor' | 'madeira'

/** Quanto a legenda ajuda: sempre, só nos primeiros segundos, ou só no 1º baú. */
export type LegendMode = 'always' | 'peek' | 'first'

export type LevelNumber = 1 | 2 | 3

export interface ChestDef {
    message: Word[]
}

export interface LevelDef {
    level: LevelNumber
    name: string
    from: Code
    to: Code
    alphabet: Word[]
    legend: LegendMode
    chests: ChestDef[]
}

export type PlayState =
    | 'intro'
    | 'tutorial'
    | 'walking'
    | 'telling'
    | 'building'
    | 'checking'
    | 'locked'
    | 'opening'
    | 'ending'
