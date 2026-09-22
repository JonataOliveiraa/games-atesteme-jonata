/**
 * EF15CO04 — decomposição: dividir, resolver e combinar.
 *
 * O lote é o átomo do terreno. O PEDAÇO (`Chunk`) é derivado dos cortes que a
 * criança fez, e é dele que sai a pergunta do jogo: esta peça é daqui?
 */

export interface PieceDef {
    id: string
    /** O quadro na folha do canteiro. */
    frame: number
    /** 0–1, onde a peça mora dentro do lote. */
    spot: [number, number]
}

export interface LotDef {
    id: string
    pieces: PieceDef[]
}   

export interface CutDef {
    /** A linha fica à direita deste lote. */
    afterLot: string
    optional: boolean
}

export interface SiteDef {
    id: string
    /** A folha de peças deste projeto. */
    sheet: string
    /** A fala da Tuca ao abrir o canteiro. */
    line: string
    /** A fala dela na inauguração. */
    cheer: string
    lots: LotDef[]
    cuts: CutDef[]
    dependency?: { before: string; after: string }
}

export interface LevelDef {
    level: number
    sites: SiteDef[]
}

/** Um pedaço: lotes vizinhos sem corte feito entre eles. */
export type Chunk = LotDef[]

export type Phase = 'intro' | 'cutting' | 'choosing' | 'working' | 'busy' | 'done'
