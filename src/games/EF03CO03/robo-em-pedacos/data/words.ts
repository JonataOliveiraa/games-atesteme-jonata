import type { ModuleId } from '../types'

export const LABEL: Record<ModuleId, string> = {
    head: 'CABEÇA',
    body: 'CORPO',
    arms: 'BRAÇOS',
    legs: 'PERNAS',
    shoes: 'SAPATOS-FOGUETE',
}

export const NEEDS_SAY: Record<ModuleId, string> = {
    head: 'A cabeça precisa do corpo!',
    body: 'O corpo precisa das pernas!',
    arms: 'Os braços precisam do corpo!',
    legs: 'As pernas precisam dos sapatos!',
    shoes: 'Os sapatos vão embaixo!',
}

export const SAY = {
    broke: 'Vamos por partes!',
    build: 'Agora monte o robô!',
    plug: 'Ligue o robô!',
    walk: 'Ele anda de novo!',
    firm: 'Esse já estava firme!',
    firmGuide: 'Esse já está firme. Deixe assim.',
} as const

export const TEACH = {
    broke: 'O robô quebrou. É conserto demais!',
    parts: 'Vamos por partes. Toque numa parte para consertar.',
    loose: 'Aperte o que está solto.',
    firm: 'Este já está firme. Deixe assim.',
    others: 'Agora conserte as outras partes.',
    build: 'Agora monte o robô!',
    bottom: 'Comece pelo que fica embaixo.',
    plug: 'Ligue o robô!',
    helpRepair: 'Toque numa parte para consertar.',
    helpLoose: 'Aperte só o que está solto.',
    helpBuild: 'Monte de baixo para cima e ligue.',
} as const

export const PANEL = {
    split: 'Dividiu',
    fix: 'Consertou',
    join: 'Juntou!',
} as const
