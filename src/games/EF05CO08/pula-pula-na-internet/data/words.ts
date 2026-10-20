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
    goTo: (kind: ItemKind) => `Pegue a ${KIND_NAME[kind]}!`,
    hurry: (kind: ItemKind) => `Volte! A ${KIND_NAME[kind]} vai passar!`,
    goTop: 'Suba até o TOPO!',
    trustAsk: 'Dá para confiar?',
    trust: 'PODE CONFIAR',
    distrust: 'NÃO CONFIE',
    forwarded: 'Encaminhada',
    oops: 'Ops!',
    missed: (kind: ItemKind) => `A ${KIND_NAME[kind]} ficou para trás!`,
} as const

export const CAPTION = {
    sky: 'CÉU!',
    space: 'ESPAÇO!',
    top: 'TOPO!',
} as const

export const TUTOR = {
    collect: 'Pegue todas! Nenhuma pode passar.',
    yourTurn: 'Sua vez!',
    see: 'Ver',
} as const
