/**
 * EF04CO01 — objetos do mundo real representados por matrizes: cada componente numa posição
 * definida por coordenadas. O pátio é a matriz; a criança dirige até a vaga L, C pedida.
 */

/** [linha, coluna], a partir de 1; a linha 1 é a de cima, a coluna 1 é a da esquerda */
export type Cell = readonly [number, number]

/**
 * Como a matriz está numerada (N3 troca a cada pedido):
 * - `lc`: L1…L3 e C1…C4 → "L2, C3";
 * - `colLetters`: linhas 1…3, colunas A…D → "2C";
 * - `rowLetters`: linhas A…C, colunas 1…4 → "B3";
 * - `map`: o painel mostra uma miniatura da matriz com a vaga acesa (as placas ficam em `lc`).
 */
export type Scheme = 'lc' | 'colLetters' | 'rowLetters' | 'map'

/** de frente: entra andando para a frente (nariz para o fundo da vaga); de ré: entra de costas */
export type Facing = 'front' | 'back'

export interface Request {
    kind: 'park'
    to: Cell
    /** as guias da linha e da coluna ficam acesas até o carro estacionar (primeira jogada) */
    guided?: boolean
    scheme?: Scheme
    face?: Facing
}

export interface LevelDef {
    level: number
    title: string
    message: string
    rows: number
    cols: number
    /** carros que já estão no pátio quando o nível começa */
    parked: Array<{ at: Cell; color: number }>
    requests: Request[]
}

export type Mode = 'intro' | 'guide' | 'arrive' | 'drive' | 'park' | 'jam' | 'finale' | 'done' | 'panel'
