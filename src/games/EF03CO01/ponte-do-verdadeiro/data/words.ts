import type { Critter, HotWord, Item, Sentence, Word } from '../types'

export const NAME: Record<Critter, string> = { sapo: 'sapo', coelho: 'coelho', pato: 'pato' }

export const WITH: Record<Item, string> = {
    chapeu: 'de chapéu',
    guardachuva: 'com guarda-chuva',
    balao: 'com balão',
}

export const WITHOUT: Record<Item, string> = {
    chapeu: 'sem chapéu',
    guardachuva: 'sem guarda-chuva',
    balao: 'sem balão',
}

export const PUT: Record<Item, string> = {
    chapeu: 'pôr o chapéu',
    guardachuva: 'pegar o guarda-chuva',
    balao: 'pegar o balão',
}

export const TAKE: Record<Item, string> = {
    chapeu: 'tirar o chapéu',
    guardachuva: 'guardar o guarda-chuva',
    balao: 'guardar o balão',
}

const split = (text: string, hot = false): Word[] => text.split(' ').map(t => ({ text: t, hot }))

export function sentenceWords(s: Sentence): Word[] {
    const tail = split(`${s.form === 'all' ? 'estão' : 'está'} ${WITH[s.item]}.`)
    if (s.form === 'all') return [{ text: 'TODOS', hot: true }, ...split('os bichinhos'), ...tail]
    if (s.form === 'none') return [{ text: 'NENHUM', hot: true }, ...split('bichinho'), ...tail]
    const head = split(`O ${NAME[s.subject ?? 'sapo']}`)
    return s.not ? [...head, { text: 'NÃO', hot: true }, ...tail] : [...head, ...tail]
}

export const sentenceText = (s: Sentence) => sentenceWords(s).map(w => w.text).join(' ')

export const hotWord = (s: Sentence): HotWord | undefined =>
    s.form === 'all' ? 'TODOS' : s.form === 'none' ? 'NENHUM' : s.not ? 'NÃO' : undefined

export const wrongLine = (c: Critter, has: boolean, item: Item) => `Falso! O ${NAME[c]} está ${has ? WITH[item] : WITHOUT[item]}.`

export const fixLine = (c: Critter, has: boolean, item: Item) => `Toque no ${NAME[c]} para ${has ? TAKE[item] : PUT[item]}.`

export const TEACH = {
    hello: 'Oi! Eu cuido desta ponte.',
    goal: 'Ela só desce quando a placa diz a VERDADE.',
    look: 'Veja o que acontece se a placa for falsa.',
    lever: 'Agora a placa é verdade. Puxe a alavanca!',
    check: 'Confira antes: às vezes a placa já é verdade.',
    toggle: 'Toque num bichinho para trocar.',
    ask: 'Placa verdadeira? Puxe a alavanca!',
    leverShort: 'Puxe a alavanca!',
} as const

export const WORD_INTRO: Record<HotWord, (s: Sentence) => string> = {
    NÃO: s => `Olha o NÃO! Agora o ${NAME[s.subject ?? 'sapo']} fica ${WITHOUT[s.item]}.`,
    TODOS: () => 'TODOS quer dizer cada um dos três.',
    NENHUM: () => 'NENHUM quer dizer nem um só.',
}

export const LEVER_LABEL = 'ABRIR'

export const BOARD_TITLE = 'Verdades da ponte'
