/**
 * (EF03CO04) Relacionar o conceito de informação com o de dado.
 *
 * Um `Datum` é um registro solto: `quarta`, `14h`, `festa azul`. Sozinho ele
 * não conta nada. A `Gallery` guarda quais deles, JUNTOS, formam uma frase com
 * sentido — e é essa relação, e não um campo `correct`, que abre a porta.
 */

export type LevelNumber = 1 | 2 | 3

export type DatumId = string

export interface Datum {
    id: DatumId
    /** O que a criança lê na ficha. Até três palavras. */
    label: string
    /** Quadro na folha de pictogramas do nível. */
    frame: number
}

export interface Gallery {
    id: string
    name: string
    /** Só para a frase da trava: "Sapato não conta o café da manhã." */
    subject: string
    data: Datum[]
    information: {
        datumIds: DatumId[]
        sentence: string
    }
    /** Nível 3: entra na bolsa só depois de voltar e rachar a pedra. */
    hiddenDatumId?: DatumId
}

export interface LevelDef {
    level: LevelNumber
    name: string
    /** A folha de pictogramas que os `frame` deste nível endereçam. */
    sheet: string
    galleries: Gallery[]
}

export type Mode = 'explore' | 'walking' | 'altar' | 'locked' | 'done'

export type Pose =
    | 'idle'
    | 'walkA'
    | 'walkB'
    | 'reach'
    | 'curious'
    | 'surprise'
    | 'cheer'
    | 'enter'
    | 'mineUp'
    | 'mineDown'
