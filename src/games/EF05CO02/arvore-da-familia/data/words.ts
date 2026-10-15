import type { Stage } from '../types'

export interface Talk {
    home: string
    coming: string
    again: string
    fallen: string
    help: string
}

export const TALK: Record<Exclude<Stage, 'yard'>, Talk> = {
    park: {
        home: 'Esta é a árvore da minha família!',
        coming: 'Ih! Lá vem o vento!',
        again: 'O vento voltou!',
        fallen: 'O vento derrubou todo mundo!',
        help: 'Me ajuda a pendurar cada um?',
    },
    beach: {
        home: 'Desenhei a família toda na areia!',
        coming: 'Cuidado, a onda!',
        again: 'Lá vem outra onda!',
        fallen: 'O mar levou os cartões!',
        help: 'Agora são os dois lados da família!',
    },
}

export const YARD_TALK = {
    hello: (name: string) => `Eu sou ${name === 'Totó' ? 'o' : 'a'} ${name}!`,
    mail: 'Chegou carta!',
} as const

export const TEACH = {
    parents: 'Pais ficam em cima dos filhos.',
    link: 'O cartão diz a ligação.',
    family: 'Cada um na sua família.',
    go: 'Sua vez!',
} as const

export const HELP = {
    lines: 'Siga as linhas da família.',
    parents: 'Pais em cima dos filhos.',
    link: 'Leia a ligação no cartão.',
    family: 'Cada um na sua família.',
} as const

export const LABEL = {
    level: 'Nível',
} as const
