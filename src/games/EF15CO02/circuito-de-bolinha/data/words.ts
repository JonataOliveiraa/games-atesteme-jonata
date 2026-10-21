import type { PieceKind } from '../types'

export const TITLE: Record<number, string> = {
    1: 'Em que ordem o Nico monta?',
    2: 'Quantas vezes o Nico repete?',
    3: 'E se a Pipoca estiver no sino?',
}

export const SAY = {
    gift: 'Ganhei um circuito de bolinha!',
    same: 'Vou montar igual ao da caixa.',
    manual: 'Eu só faço o que o manual mostra.',
    falls: 'Sem bloco embaixo, cai!',
    stays: 'Com bloco embaixo, fica!',
} as const

export const TEACH = {
    go: 'Sua vez!',
    times: '×3 é fazer 3 vezes.',
    ifHere: 'Se a Pipoca estiver aqui…',
    ifAway: '…vai pelo outro lado.',
} as const

export const HELP: Record<number, string> = {
    1: 'Peça sem bloco embaixo cai.',
    2: 'Conte os blocos da torre.',
    3: 'A Pipoca muda de sino.',
}

export const FELL: Record<PieceKind, string> = {
    ramp: 'Faltou um bloco embaixo da rampa!',
    block: 'Faltou um bloco embaixo do bloco!',
}

export const COUNT = {
    few: 'Faltou um bloco!',
    many: 'Bloco demais!',
} as const

export const MISSING: Record<PieceKind, string> = {
    ramp: 'Faltou uma rampa!',
    block: 'Faltou um bloco!',
}

export const BLOCKED = 'Já tem uma rampa aí!'

export const CAT = 'A Pipoca estava nesse sino!'

export const MEOW = 'Miau!'

export const IF_WORDS = {
    if: 'SE',
    yes: 'SIM',
    no: 'SENÃO',
} as const

export const LABEL = {
    level: 'Nível',
    build: 'MONTAR',
    next: 'Próximo',
    go: 'Vamos!',
    see: 'Ver',
    resume: 'Continuar',
} as const
