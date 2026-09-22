/**
 * Kit do Solucionador — a criança escolhe uma ferramenta e ela sai pela vila.
 * Toda casa marcada que entra no círculo dela acende. O veredito é geometria,
 * apurada no fim da corrida: não existe campo de resposta em lugar nenhum.
 */

export type AndarKind = 'estrada' | 'voo' | 'planta'

export interface Ferramenta {
    id: string
    nome: string
    frame: number
    avisa: boolean
    raio: number
    andar: AndarKind
    sol: number
    gasta: boolean
    /** Para que lado o desenho olha parado. Quem anda vira para o rumo. */
    frente?: 'esquerda' | 'direita'
    planta?: 'praca' | 'igreja'
    so?: 'uma-casa'
}

export interface Casa {
    id: string
    x: number
    y: number
}

export interface No {
    id: string
    x: number
    y: number
}

export interface Trecho {
    de: string
    para: string
    ramo: string
}

export interface Problema {
    id: string
    fala: string
    enunciado: string
    vizinho: number
    marcadas: string[]
}

export interface Dia {
    id: string
    titulo: string
    falaExagero: string
    kit: string[]
    problemas: Problema[]
}

export interface LevelDef {
    level: number
    nome: string
    dias: Dia[]
}

/**
 * O discriminante é STRING, e não um booleano: este projeto compila sem
 * `strict`, e sem `strictNullChecks` o TypeScript não estreita união por
 * literal booleano — `{ ok: true } | { ok: false, motivo }` compila e depois
 * reclama que `motivo` não existe.
 */
export type Veredito =
    | { tipo: 'pode' }
    | { tipo: 'naoAvisa' }
    | { tipo: 'fazFalta'; para: string }

export type Modo =
    | 'abertura'
    | 'lendo'
    | 'correndo'
    | 'bifurcacao'
    | 'travado'
    | 'fechando'
    | 'fim'
    | 'pausado'
