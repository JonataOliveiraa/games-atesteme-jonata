import type { Attribute, Hue, Rule } from '../types'

const HUE_WORD: Record<Hue, string> = {
    blue: 'AZUL',
    red: 'VERMELHO',
    yellow: 'AMARELO',
}

export function ruleWord(rule: Rule): string {
    if (rule.attribute === 'color') return HUE_WORD[rule.value]
    if (rule.attribute === 'size') return rule.value === 'small' ? 'PEQUENO' : 'GRANDE'
    if (rule.attribute === 'antenna') return 'ANTENA'
    return 'LISTRAS'
}

export const TEACH = {
    model: (words: string[]) => `O carimbo mostra o que importa: ${words.join(' e ')}.`,
    pass: 'Este não combina com o carimbo. Deixe passar!',
    tap: 'Este combina! Toque nele quando estiver na luz.',
    note: 'Leia o pedido do bilhete.',
    build: 'Toque na ficha que o pedido pede. O que ele não pede, não entra!',
    help: 'Toque no brinquedo que combina quando ele estiver na luz.',
} as const

export const BUILD_MISS = {
    extra: 'Isso não importa aqui!',
    wrong: 'O pedido não é esse!',
} as const

export const MISS: Record<Attribute, string> = {
    color: 'A cor não bate!',
    size: 'O tamanho não bate!',
    antenna: 'Falta a antena!',
    stripes: 'Faltam as listras!',
}
