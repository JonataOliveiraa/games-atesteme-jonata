import type { PieceKind } from '../types'

export const TITLE = 'Em que ordem o Nico monta?'

export const SAY = {
    gift: 'Ganhei um circuito de bolinha!',
    same: 'Vou montar igual ao da caixa.',
    manual: 'Eu só faço o que o manual mostra.',
    falls: 'Sem bloco embaixo, cai!',
    stays: 'Com bloco embaixo, fica!',
} as const

export const TEACH = {
    go: 'Sua vez!',
} as const

export const HELP = {
    rule: 'Peça sem bloco embaixo cai.',
} as const

export const FELL: Record<PieceKind, string> = {
    ramp: 'Faltou um bloco embaixo da rampa!',
    block: 'Faltou um bloco embaixo do bloco!',
}

export const LABEL = {
    level: 'Nível',
    build: 'MONTAR',
    next: 'Próximo',
    go: 'Vamos!',
    resume: 'Continuar',
} as const
