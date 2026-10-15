export const TEACH = {
    list: 'A receita é uma lista.',
    turn: 'Cada camada tem sua vez.',
    first: 'O 1º vai embaixo.',
    order: 'Pegue na ordem!',
    go: 'Sua vez!',
} as const

export const HELP = {
    next: 'Pegue o próximo da receita.',
    first: 'O 1º vai embaixo.',
} as const

export const LABEL = {
    level: 'Nível',
    why: (of: string) => `Era a vez ${of}!`,
    nth: (i: number) => `${i + 1}º`,
} as const
