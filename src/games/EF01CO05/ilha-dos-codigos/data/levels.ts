import type { LevelDef, Word } from '../types'

/**
 * Três níveis, três baús cada. A fase é UM BAÚ.
 *
 * Dentro do nível cresce o tamanho da mensagem; entre os níveis mudam três
 * coisas de uma vez — o tamanho, a direção da tradução e o quanto a legenda
 * ajuda. O COCO só entra no nível 3: com três palavras, quatro símbolos
 * seriam o nível 2 mais comprido.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Praia',
        from: 'som',
        to: 'cor',
        alphabet: ['SOL', 'PEIXE', 'LUA'],
        legend: 'always',
        chests: [
            { message: ['SOL', 'PEIXE'] },
            { message: ['LUA', 'SOL'] },
            { message: ['PEIXE', 'LUA', 'SOL'] },
        ],
    },
    {
        level: 2,
        name: 'Trilha',
        from: 'cor',
        to: 'figura',
        alphabet: ['SOL', 'PEIXE', 'LUA'],
        legend: 'peek',
        chests: [
            { message: ['LUA', 'PEIXE'] },
            { message: ['SOL', 'LUA', 'PEIXE'] },
            { message: ['PEIXE', 'SOL', 'LUA'] },
        ],
    },
    {
        level: 3,
        name: 'Gruta',
        from: 'figura',
        to: 'som',
        alphabet: ['SOL', 'PEIXE', 'LUA', 'COCO'],
        legend: 'first',
        chests: [
            { message: ['COCO', 'SOL', 'PEIXE'] },
            { message: ['LUA', 'COCO', 'SOL'] },
            { message: ['PEIXE', 'COCO', 'LUA', 'SOL'] },
        ],
    },
]

export const TOTAL_CHESTS = LEVELS.reduce((sum, level) => sum + level.chests.length, 0)

export const chestsBefore = (level: number) =>
    LEVELS.slice(0, level - 1).reduce((sum, l) => sum + l.chests.length, 0)

/**
 * O VEREDITO É UMA FUNÇÃO, E ELE OLHA A INFORMAÇÃO — não o desenho.
 * Devolve o índice do primeiro encaixe errado, ou -1 se a fechadura inteira
 * está certa.
 */
export function firstWrongSlot(message: Word[], lock: (Word | null)[]): number {
    for (let i = 0; i < message.length; i++) {
        if (lock[i] !== message[i]) return i
    }
    return -1
}

export const lockIsFull = (message: Word[], lock: (Word | null)[]) =>
    message.every((_, i) => lock[i] !== null && lock[i] !== undefined)
