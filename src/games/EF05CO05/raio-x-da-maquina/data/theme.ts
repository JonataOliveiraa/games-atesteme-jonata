import { FONT_JOGO } from '../../../../shared/fonts/gameFont'
import type { Category } from '../types'

export const C = {
    ink: 0x081726,
    inkSoft: 0x123049,

    screen: 0x0b2135,
    bay: 0x14344f,

    cyan: 0x6ee7f9,
    cream: 0xe8f4ff,
    dim: 0x7d97ae,

    gold: 0xe3a946,
    green: 0x51cf66,
    amber: 0xf2a341,

    white: 0xffffff,
    shadow: 0x000000,
} as const

export const CSS = {
    ink: '#081726',
    cream: '#e8f4ff',
    white: '#ffffff',
    dim: '#7d97ae',
    amber: '#5a3407',
    gold: '#e3a946',
} as const

export const A = {
    veil: 0.42,
    screen: 0.94,
    bay: 0.92,
    named: 0.62,
    dimmed: 0.55,
} as const

export const FONT = {
    black: FONT_JOGO.black,
    body: FONT_JOGO.body,
} as const

export const SIZE = {
    request: 34,
    requestMin: 26,
    stamp: 30,
    sign: 26,
    title: 27,
} as const

/** As cores saíram do próprio `pecas.png`, amostradas pixel a pixel. */
export const TONE: Record<Category, number> = {
    entrada: 0x57affa,
    processador: 0xfcb336,
    memoria: 0xa085f2,
    armazenamento: 0x63c35c,
    saida: 0x7adeea,
    nenhuma: 0x9b9aa2,
}

export const LABEL: Record<Category, string> = {
    entrada: 'ENTRADA',
    processador: 'PROCESSADOR',
    memoria: 'MEMÓRIA',
    armazenamento: 'ARMAZENAMENTO',
    saida: 'SAÍDA',
    nenhuma: '',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
