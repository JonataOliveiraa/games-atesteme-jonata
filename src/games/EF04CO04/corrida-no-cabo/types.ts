/**
 * EF04CO04 — para guardar, manipular e transmitir dados, é preciso codificá-los num formato que a
 * máquina entenda. A figurinha (ou a letra) não passa pelo fio: passa o código dela no combinado,
 * escrito porta a porta, e o outro computador lê com a mesma tabela.
 */

export type Bit = '0' | '1'

export type Lane = Bit | 'mid'

export interface Entry {
    id: string
    code: string
    /** célula da folha `pecas` (figurinhas) */
    frame?: number
    /** a letra escrita (N2/N3) */
    glyph?: string
}

/** o que aparece na tela no lugar do código: o desenho ou a letra */
export type Look = { frame: number } | { glyph: string }

export interface LevelDef {
    level: number
    title: string
    message: string
    kind: 'figure' | 'letter'
    bits: number
    table: Entry[]
    /** ids na ordem de envio, uma lista por fase */
    phases: string[][]
    /** o desenho do fio de cada fase (índice em SHAPES) */
    shapes: number[]
    /** px entre dois portais */
    gap: number
    /** px/s */
    cruise: number
}

export type Mode = 'intro' | 'guide' | 'ask' | 'race' | 'arrive' | 'error' | 'finale' | 'done' | 'help'
