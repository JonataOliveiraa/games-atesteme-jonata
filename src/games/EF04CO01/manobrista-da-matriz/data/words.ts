import type { Cell, Facing, Scheme } from '../types'

const LETTERS = 'ABCDEFGH'

/** o nome da linha e da coluna em cada representação (o `map` usa as placas de `lc`) */
export const rowLabel = (n: number, scheme: Scheme = 'lc') =>
    scheme === 'colLetters' ? `${n}` : scheme === 'rowLetters' ? LETTERS[n - 1] : `L${n}`
export const colLabel = (n: number, scheme: Scheme = 'lc') =>
    scheme === 'colLetters' ? LETTERS[n - 1] : scheme === 'rowLetters' ? `${n}` : `C${n}`

/** a vaga escrita como o painel escreve: "L2, C3", "2C" ou "B3" */
export const coord = (c: Cell, scheme: Scheme = 'lc') =>
    scheme === 'colLetters' || scheme === 'rowLetters'
        ? `${rowLabel(c[0], scheme)}${colLabel(c[1], scheme)}`
        : `${rowLabel(c[0])}, ${colLabel(c[1])}`

export const PANEL_TEXT = { park: 'Estacione em', map: 'Estacione aqui' }

export const FACE: Record<Facing, string> = { front: 'DE FRENTE', back: 'DE RÉ' }

export const BUTTON = { gas: 'ACELERAR', rev: 'RÉ', park: 'ESTACIONAR' }

export const SAY = {
    /** estacionou na vaga errada */
    wrongSpot: (at: Cell, want: Cell, scheme: Scheme = 'lc') =>
        `Você parou em ${coord(at, scheme)}. O pedido era ${coord(want, scheme)}.`,
    /** vaga certa, mas virado ao contrário */
    wrongFace: (want: Facing) => `O carro ficou ${FACE[want === 'front' ? 'back' : 'front']}. O pedido era ${FACE[want]}.`,
}

export const TEACH = {
    cross: (c: Cell) => `L${c[0]} + C${c[1]} = aqui!`,
    yourTurn: 'Sua vez!',
    face: 'DE FRENTE ou DE RÉ?',
}

export const HELP = {
    panel: 'Ache a LINHA, depois a COLUNA. Onde elas se cruzam é a vaga.',
    controls: 'Volante para virar, pedais para andar. Na vaga, ESTACIONAR.',
    controlsKeys: 'Teclado: A e D viram, W acelera, S dá ré, ESPAÇO estaciona.',
}
