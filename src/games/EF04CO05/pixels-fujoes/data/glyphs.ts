/**
 * A fonte de pixel do jogo: maiúsculas de 5 × 7 (o I tem 3), com os acentos do português em duas linhas
 * por cima e a cedilha embaixo. Tudo o que o jogo escreve (cabeçalho, combinado, botões, faixa, raio-x)
 * sai daqui, então o número e a palavra têm a mesma cara.
 */
export const GLYPH_W = 5
export const GLYPH_H = 7
/** 2 linhas de acento + 7 da letra + 2 de descida */
export const CELL_H = 11
export const CAP_TOP = 2

const BASE: Record<string, string[]> = {
    A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
    C: ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.'],
    D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
    E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
    F: ['#####', '#....', '#....', '####.', '#....', '#....', '#....'],
    G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####'],
    H: ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
    I: ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###'],
    J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
    K: ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#'],
    L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
    M: ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#'],
    N: ['#...#', '#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#'],
    O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
    Q: ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#'],
    R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
    S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
    T: ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..'],
    U: ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
    W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.'],
    X: ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#'],
    Y: ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..'],
    Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
    '0': ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
    '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
    '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
    '3': ['####.', '....#', '....#', '.###.', '....#', '....#', '####.'],
    '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
    '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
    '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
    '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
    '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
    '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
    '?': ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..'],
    '!': ['#', '#', '#', '#', '#', '.', '#'],
    '.': ['.', '.', '.', '.', '.', '.', '#'],
    ',': ['.', '.', '.', '.', '.', '.', '#'],
    ':': ['.', '#', '.', '.', '.', '#', '.'],
    '=': ['.....', '.....', '#####', '.....', '#####', '.....', '.....'],
    '-': ['...', '...', '...', '###', '...', '...', '...'],
}

const MARK: Record<string, string[]> = {
    acute: ['...#.', '..#..'],
    acuteNarrow: ['..#', '.#.'],
    tilde: ['.#..#', '#.##.'],
    circ: ['..#..', '.#.#.'],
    grave: ['.#...', '..#..'],
}

const ACCENTED: Record<string, [string, keyof typeof MARK]> = {
    Á: ['A', 'acute'],
    À: ['A', 'grave'],
    Â: ['A', 'circ'],
    Ã: ['A', 'tilde'],
    É: ['E', 'acute'],
    Ê: ['E', 'circ'],
    Í: ['I', 'acuteNarrow'],
    Ó: ['O', 'acute'],
    Ô: ['O', 'circ'],
    Õ: ['O', 'tilde'],
    Ú: ['U', 'acute'],
}

const DESCENT: Record<string, string[]> = {
    Ç: ['..#..', '.##..'],
    ',': ['#', '.'],
}

/** as 11 linhas de um caractere (acento, letra, descida); null se a fonte não tem */
export function glyphRows(ch: string): string[] | null {
    if (ch === ' ') return ['...', '...', '...', '...', '...', '...', '...', '...', '...', '...', '...']
    const accented = ACCENTED[ch]
    const baseKey = accented ? accented[0] : ch === 'Ç' ? 'C' : ch
    const base = BASE[baseKey]
    if (!base) return null
    const w = base[0].length
    const blank = '.'.repeat(w)
    const top = accented ? MARK[accented[1]] : [blank, blank]
    const bottom = DESCENT[ch] ?? [blank, blank]
    return [...top, ...base, ...bottom]
}

/** os caracteres da fonte, na ordem do atlas */
export const FONT_CHARS = [' ', ...Object.keys(BASE), ...Object.keys(ACCENTED), 'Ç']

/** só a letra (7 linhas), para os números desenhados como imagem */
export const GLYPHS: Record<string, string[]> = BASE

/** os jeitos de pintar um número-imagem: claro com contorno, o brilho do visor e a marca do buraco */
export type GlyphStyle = 'light' | 'glow' | 'mark' | 'ink'

export const glyphKey = (ch: string, style: GlyphStyle) => `glyph-${style}-${ch.charCodeAt(0)}`

/** a caixinha do raio-x: a casa vira o número dela (16 × 16) */
export const tileKey = (ch: string) => `tile-${ch.charCodeAt(0)}`

/** as cores da fonte de texto (um atlas por cor: não depende de tint) */
export type FontTone = 'white' | 'cyan' | 'dark' | 'soft' | 'yellow' | 'red' | 'green' | 'blue'
export const fontKey = (tone: FontTone) => `pixel-font-${tone}`
/** altura de linha da fonte, em pixels de arte; `fontSize = LINE × k` dá escala inteira k */
export const LINE = 12
