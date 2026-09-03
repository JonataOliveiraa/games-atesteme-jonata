import type { LevelDef, MediumId, SubjectDef } from '../types'

export const SUBJECTS: SubjectDef[] = [
    { id: 'bolo', word: 'BOLO', texture: 'bolo' },
    { id: 'lapis', word: 'LÁPIS', texture: 'lapis' },
    { id: 'presente', word: 'PRESENTE', texture: 'presente' },
    { id: 'relogio', word: 'RELÓGIO', texture: 'relogio' },
]

export const WHEEL: MediumId[] = ['voz', 'carta', 'celular']

export const MATE_FRAMES = [0, 1, 2, 3]
export const GOAL_FRAMES = [4, 5]

export const LEVELS: LevelDef[] = [
    { level: 1, runs: 3, passes: 2, sameSubject: true, movingGoal: false },
    { level: 2, runs: 3, passes: 2, sameSubject: false, movingGoal: true },
    { level: 3, runs: 3, passes: 3, sameSubject: false, movingGoal: true },
]

export const mediaChain = (runIndex: number, passes: number): MediumId[] =>
    Array.from({ length: passes + 1 }, (_, step) => WHEEL[(runIndex + step) % WHEEL.length])

export const rightGoal = (level: LevelDef, runIndex: number) =>
    level.movingGoal ? runIndex % GOAL_FRAMES.length : 0

export function planSubjects(level: LevelDef, random: () => number): SubjectDef[] {
    const pool = [...SUBJECTS]
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1))
        const swap = pool[i]
        pool[i] = pool[j]
        pool[j] = swap
    }
    if (level.sameSubject) return Array.from({ length: level.runs }, () => pool[0])
    return Array.from({ length: level.runs }, (_, i) => pool[i % pool.length])
}

export const passesInLevel = (level: LevelDef) => level.runs * level.passes

export const TOTAL_PASSES = LEVELS.reduce((sum, level) => sum + passesInLevel(level), 0)

export const passesBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, level) => sum + passesInLevel(level), 0)

export const LEVEL_DONE = 'Recado entregue!'

export const GAME_DONE = 'Craque dos recados!'
