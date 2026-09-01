import type { ItemDef, ItemId, LevelDef, PhaseDef } from '../types'

/**
 * Os quatro objetos. A paleta mostra sempre os quatro, sempre nesta ordem, em
 * todas as fases — a criança decora onde cada um fica, e a mão dela para de
 * procurar depois da segunda fase.
 */
export const ITEMS: ItemDef[] = [
    { id: 'bolo', word: 'BOLO', texture: 'bolo' },
    { id: 'lapis', word: 'LÁPIS', texture: 'lapis' },
    { id: 'presente', word: 'PRESENTE', texture: 'presente' },
    { id: 'relogio', word: 'RELÓGIO', texture: 'relogio' },
]

export const itemOf = (id: ItemId) => ITEMS.find(item => item.id === id) ?? ITEMS[0]

/**
 * A REGRA, e ela é uma função da POSIÇÃO — nunca um campo guardado na carta.
 * A mesma carta está certa no quadrado 1 e errada no 2, e é isso que faz a
 * ordem ser o assunto do jogo.
 */
export const fits = (message: ItemId[], index: number, card: ItemId) =>
    message[index] === card

/** Onde o colega para de entender. `-1` quer dizer que ele leu tudo. */
export function firstMismatch(message: ItemId[], desk: (ItemId | null)[]) {
    for (let i = 0; i < message.length; i++) {
        if (!desk[i] || !fits(message, i, desk[i]!)) return i
    }
    return -1
}

// ─────────────────────────────────────────────────── níveis e fases

const phase = (...message: ItemId[]): PhaseDef => ({ message })

/**
 * Três níveis, três fases cada, e o recado CRESCE dentro do nível.
 *
 * A progressão é a da alfabetização, e é de propósito: primeiro a figura
 * dentro de um balão (todo mundo lê), depois a palavra com a figura no canto
 * (o par ensina), e por último a palavra sozinha. Em nenhum momento a criança
 * fica sem saída: o recado do topo está sempre em desenho.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Recado falado',
        language: 'fala',
        wordHint: true,
        phases: [
            phase('bolo', 'lapis'),
            phase('presente', 'relogio'),
            phase('lapis', 'bolo', 'presente'),
        ],
    },
    {
        level: 2,
        name: 'Recado escrito',
        language: 'palavra',
        wordHint: true,
        phases: [
            phase('relogio', 'bolo'),
            phase('presente', 'lapis', 'relogio'),
            phase('bolo', 'presente', 'lapis'),
        ],
    },
    {
        level: 3,
        name: 'Só a palavra',
        language: 'palavra',
        wordHint: false,
        phases: [
            phase('lapis', 'relogio', 'presente'),
            phase('bolo', 'lapis', 'bolo'),
            phase('presente', 'relogio', 'relogio'),
        ],
    },
]

export const itemsInLevel = (level: LevelDef) =>
    level.phases.reduce((sum, p) => sum + p.message.length, 0)

export const TOTAL_ITEMS = LEVELS.reduce((sum, l) => sum + itemsInLevel(l), 0)

export const itemsBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, l) => sum + itemsInLevel(l), 0)

// ─────────────────────────────────────────────────── as frases

export const KEY_LINE = 'O MESMO recado, dito de outro jeito!'

export const PHASE_CHEER = [
    'Ele entendeu tudo!',
    'Recado entregue!',
    'Chegou certinho!',
]

/** O erro diz ONDE ele parou, e nunca qual carta era. */
export const MISS_LINE = 'Aqui o recado dizia outra coisa!'

export const HINT_BUILD = 'Toque nas cartas para montar o recado'
export const HINT_SEND = 'Agora toque em ENVIAR'
export const HINT_FIX = 'Toque no quadrado com cadeado para trocar'
