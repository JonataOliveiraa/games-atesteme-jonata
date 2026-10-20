import type { ClueId, ItemKind } from '../types'

export const KIND_NAME: Record<ItemKind, string> = {
    jornal: 'NOTÍCIA',
    alerta: 'MENSAGEM',
    imagem: 'FOTO',
}

export const CLUE_LABEL: Record<ItemKind, Record<ClueId, string>> = {
    jornal: { quem: 'QUEM ESCREVEU?', quando: 'QUANDO?', onde: 'DE ONDE VEIO?' },
    alerta: { quem: 'QUEM ESCREVEU?', quando: 'QUANDO?', onde: 'DE ONDE VEIO?' },
    imagem: { quem: 'QUEM TIROU?', quando: 'QUANDO?', onde: 'DE ONDE VEIO?' },
}

export const LABEL = {
    level: 'Nível',
    goTo: (kind: ItemKind) => `Suba até a ${KIND_NAME[kind]}!`,
    goTop: 'Suba até o TOPO!',
    trustAsk: 'Dá para confiar?',
    trust: 'PODE CONFIAR',
    distrust: 'NÃO CONFIE',
    forwarded: 'Encaminhada',
    saved: 'GUARDADO!',
    blocked: 'BLOQUEADO!',
    oops: 'Ops!',
} as const

export const CAPTION = {
    move: 'SEGURE PARA ANDAR',
    climb: (kind: ItemKind) => `SUBA ATÉ A ${KIND_NAME[kind]}`,
    yourTurn: 'SUA VEZ!',
    top: 'TOPO!',
} as const
