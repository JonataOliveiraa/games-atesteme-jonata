import type { ActionKind, LevelDef, ObstacleKind, PhaseDef } from '../types'

/**
 * O que cada obstáculo pede. É uma FUNÇÃO do marco, nunca um campo guardado
 * na carta: a mesma carta resolve um marco e falha no outro.
 *
 */
const SOLVES: Record<ObstacleKind, ActionKind[]> = {
    buraco: ['pular'],
    tronco: ['pular'],
    pedra: ['pular'],
    galho: ['abaixar'],
    tunel: ['abaixar'],
    livre: ['andar'],
}

export const solves = (mark: ObstacleKind, card: ActionKind) =>
    SOLVES[mark].includes(card)

/** Onde o programa quebra. `-1` quer dizer que ele atravessa inteiro. */
export function firstFailure(marks: ObstacleKind[], program: (ActionKind | null)[]) {
    for (let i = 0; i < marks.length; i++) {
        const card = program[i]
        if (!card || !solves(marks[i], card)) return i
    }
    return -1
}

export const OBSTACLE_NAME: Record<ObstacleKind, string> = {
    buraco: 'um buraco',
    tronco: 'um tronco',
    galho: 'um galho baixo',
    tunel: 'um túnel',
    livre: 'caminho livre',
    pedra: 'uma pedra',
}

const ALL: ActionKind[] = ['pular', 'abaixar', 'andar']
const SIMPLE: ActionKind[] = ['pular', 'andar']

const phase = (marks: ObstacleKind[], palette: ActionKind[]): PhaseDef => ({ marks, palette })

/**
 * Três níveis, TRÊS FASES cada. A fase é um percurso inteiro, e ela cresce
 * dentro do nível — a criança vê o programa ganhar um passo de cada vez, em
 * vez de repetir o mesmo três vezes.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Primeiros pulos',
        phases: [
            phase(['buraco', 'livre'], SIMPLE),
            phase(['buraco', 'livre', 'tronco'], SIMPLE),
            phase(['tronco', 'buraco', 'livre'], SIMPLE),
        ],
    },
    {
        level: 2,
        name: 'Presta atenção',
        phases: [
            phase(['buraco', 'galho', 'livre'], ALL),
            phase(['buraco', 'tunel', 'galho', 'livre'], ALL),
            phase(['galho', 'buraco', 'tunel', 'tronco'], ALL),
        ],
    },
    {
        level: 3,
        name: 'Dois caminhos',
        phases: [
            phase(['buraco', 'pedra', 'galho', 'livre'], ALL),
            phase(['galho', 'buraco', 'pedra', 'livre', 'tunel'], ALL),
            phase(['buraco', 'tunel', 'galho', 'pedra', 'livre'], ALL),
        ],
    },
]

export const marksInLevel = (level: LevelDef) =>
    level.phases.reduce((sum, p) => sum + p.marks.length, 0)

export const TOTAL_MARKS = LEVELS.reduce((sum, l) => sum + marksInLevel(l), 0)

export const marksBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, l) => sum + marksInLevel(l), 0)

// ─────────────────────────────────────────────────────────── as frases

export const ALGORITHM_LINE = 'Essa sequência de passos tem um nome: ALGORITMO!'

export const PHASE_CHEER = [
    'Seu coelho atravessou!',
    'Passou por tudo!',
    'Programa certinho!',
]

/** O erro diz o que estava ali, nunca a resposta e nunca "tente de novo". */
export const bumpSentence = (mark: ObstacleKind) =>
    mark === 'livre'
        ? 'Aqui o caminho estava livre!'
        : `Aqui tinha ${OBSTACLE_NAME[mark]}!`

export const starsFor = (firstTry: number, total: number) => {
    const pct = total > 0 ? firstTry / total : 0
    return pct >= 0.9 ? 3 : pct >= 0.7 ? 2 : 1
}

export const markPositions = (count: number, firstX: number, lastX: number) => {
    if (count <= 1) return [(firstX + lastX) / 2]
    const step = (lastX - firstX) / (count - 1)
    return Array.from({ length: count }, (_, i) => firstX + i * step)
}
