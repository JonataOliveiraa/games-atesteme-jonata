export type LevelNumber = 1 | 2 | 3

export type ResultType = 'image' | 'video' | 'text'

/**
 * OS DOIS BUSCADORES.
 *
 * Eles mudam a cara da barra e nada mais. É a coisa que o nível 3 existe para
 * mostrar: trocar de ferramenta não melhora a busca — quem melhora a busca são
 * as palavras. O `improves` trata a troca como um passo legítimo que não sobe
 * ninguém, e o balão diz isso em voz alta.
 */
export type EngineId = 'grimorio' | 'bussola'

export const ENGINES: Record<EngineId, { name: string; skin: number; glow: number }> = {
    grimorio: { name: 'GRIMÓRIO', skin: 0xb5832f, glow: 0xe8c15c },
    bussola: { name: 'BÚSSOLA', skin: 0x3f6fae, glow: 0x7fb3e8 },
}

/** O que cada filtro está escrito na peça. Pictograma + palavra. */
export const TYPE_LABEL: Record<ResultType, string> = {
    image: 'IMAGEM',
    video: 'VÍDEO',
    text: 'TEXTO',
}

export interface ResultDef {
    id: string
    frame: number
    terms: string[]
    type: ResultType
}

/**
 * A CONSULTA, inteira.
 *
 * Três eixos que não se misturam: as PALAVRAS somam e subtraem pontos, o
 * FILTRO afasta quem é de outro tipo, e o BUSCADOR não faz nada. Guardar os
 * três no mesmo objeto é o que permite `rankResults` ser a única coisa que
 * decide a ordem da estante.
 */
export interface QueryState {
    terms: string[]
    /** `undefined` é "sem filtro" — o estado de todo o nível 1. */
    filter?: ResultType
    engine: EngineId
}

export type ChoiceDef =
    | { kind: 'add' | 'remove'; term: string; hint: string }
    | { kind: 'filter'; type: ResultType; hint: string }
    | { kind: 'engine'; engine: EngineId; hint: string }

/**
 * O QUE ESTÁ ESCRITO NA PEÇA.
 *
 * Uma função só, porque o rótulo do botão, a dica do tutorial e a consulta
 * final do fim de fase precisam dizer a MESMA palavra — e três lugares
 * montando a mesma frase é três lugares para ela divergir.
 */
export function choiceLabel(choice: ChoiceDef): string {
    switch (choice.kind) {
        case 'add': return `+ ${choice.term}`
        case 'remove': return `− ${choice.term}`
        case 'filter': return TYPE_LABEL[choice.type]
        case 'engine': return ENGINES[choice.engine].name
    }
}

export interface StepDef {
    choices: ChoiceDef[]
}

export interface MissionDef {
    id: string
    request: string
    visitor: number
    initialTerms: string[]
    pool: string[]
    targetId: string
    steps: StepDef[]
}

export interface LevelDef {
    level: LevelNumber
    title: string
    missions: MissionDef[]
}

export type Mode = 'reading' | 'choosing' | 'searching' | 'delivering' | 'done'
