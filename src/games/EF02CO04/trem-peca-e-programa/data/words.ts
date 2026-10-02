import type { Kind } from '../types'

export const SIGN: Record<Kind, { title: string; sub: string }> = {
    part: { title: 'PEÇAS', sub: 'posso tocar' },
    program: { title: 'PROGRAMAS', sub: 'dão ordens' },
}

export const HINT: Record<Kind, string> = {
    part: 'Dá para pegar na mão?',
    program: 'Isso dá ordens?',
}

export const TEACH = {
    partWagon: 'Este vagão leva as PEÇAS: coisas que dá para pegar na mão.',
    programWagon: 'Este leva os PROGRAMAS: eles dão ordens para as peças.',
    part: 'A câmera dá para pegar na mão? Dá! Toque do lado das PEÇAS.',
    program: 'O app de fotos não se pega: ele dá ordens. Lado dos PROGRAMAS!',
    help: 'O item espera aqui. Toque no lado do vagão certo.',
} as const

export const BOARD = {
    part: 'PEÇA = HARDWARE',
    program: 'PROGRAMA = SOFTWARE',
    line: 'Peça que a gente toca = HARDWARE. Programa que dá ordens = SOFTWARE.',
} as const
