import { C } from './theme'
import type { Layer, Piece, ProgramState, Shape } from '../types'

/** Coluna da folha `programas.png`. A ordem é contrato com o desenho. */
export const FRAME = { asking: 0, playing: 1, waiting: 2, frozen: 3 } as const

export interface ProgramInfo {
    name: string
    /** Linha da folha. */
    row: number
    color: number
    layer: Layer
}

export const PROGRAMS: Record<string, ProgramInfo> = {
    joguinho: { name: 'Joguinho', row: 0, color: C.teal, layer: 'beat' },
    musiquinha: { name: 'Musiquinha', row: 1, color: C.coral, layer: 'melody' },
    desenho: { name: 'Desenho', row: 2, color: C.violet, layer: 'bass' },
    video: { name: 'Chamada de Vídeo', row: 3, color: C.leaf, layer: 'pad' },
}

/**
 * A base do alfa de cada quadro, medida no PNG entregue, em fração da célula.
 * É ela que faz os quatro estados pisarem na mesma linha do assoalho: o quadro
 * `esperando` é mais baixo de propósito, e ancorar pelo centro faria o boneco
 * pular ao mudar de estado.
 */
export const FOOT: number[][] = [
    [0.973, 0.973, 0.973, 0.973],
    [0.934, 0.953, 0.949, 0.938],
    [0.996, 0.996, 0.891, 0.887],
    [0.840, 0.875, 0.852, 0.852],
]

export interface PieceInfo {
    name: string
    shape: Shape
    color: number
    /** Coluna da folha `pecas.png`, quando ela existir. */
    frame: number
}

export const PIECES: Record<Piece, PieceInfo> = {
    cpu: { name: 'processador', shape: 'square', color: C.teal, frame: 0 },
    speaker: { name: 'alto-falante', shape: 'circle', color: C.coral, frame: 1 },
    screen: { name: 'tela', shape: 'wide', color: C.plumSoft, frame: 2 },
    memory: { name: 'memória', shape: 'tall', color: C.violet, frame: 3 },
}

export const frameFor = (state: ProgramState): number => {
    if (state === 'playing') return FRAME.playing
    if (state === 'frozen') return FRAME.frozen
    if (state === 'resting') return FRAME.waiting
    return FRAME.asking
}
