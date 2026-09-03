import type { ChestDef, LevelDef, Word } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Praia',
        from: 'batidas',
        to: 'cor',
        legend: 'always',
        playsOnTap: false,
        chests: [
            {
                message: ['SOL', 'PEIXE'],
                decoys: [['LUA', 'SOL'], ['PEIXE', 'LUA']],
                correctAt: 0,
            },
            {
                message: ['LUA', 'SOL'],
                decoys: [['SOL', 'PEIXE'], ['PEIXE', 'LUA']],
                correctAt: 1,
            },
            {
                message: ['PEIXE', 'LUA'],
                decoys: [['SOL', 'PEIXE'], ['LUA', 'SOL']],
                correctAt: 2,
            },
            {
                message: ['SOL', 'LUA'],
                decoys: [['SOL', 'PEIXE'], ['LUA', 'PEIXE']],
                correctAt: 0,
            },
            {
                message: ['PEIXE', 'SOL'],
                decoys: [['PEIXE', 'LUA'], ['LUA', 'SOL']],
                correctAt: 1,
            },
        ],
    },
    {
        level: 2,
        name: 'Trilha',
        from: 'cor',
        to: 'figura',
        legend: 'peek',
        playsOnTap: false,
        chests: [
            {
                message: ['PEIXE', 'SOL', 'LUA'],
                decoys: [['SOL', 'LUA', 'PEIXE'], ['LUA', 'PEIXE', 'SOL']],
                correctAt: 1,
            },
            {
                message: ['LUA', 'PEIXE', 'SOL'],
                decoys: [['PEIXE', 'SOL', 'LUA'], ['SOL', 'LUA', 'PEIXE']],
                correctAt: 2,
            },
            {
                message: ['SOL', 'PEIXE', 'PEIXE'],
                decoys: [['SOL', 'PEIXE', 'LUA'], ['SOL', 'LUA', 'PEIXE']],
                correctAt: 0,
            },
            {
                message: ['LUA', 'SOL', 'LUA'],
                decoys: [['LUA', 'SOL', 'PEIXE'], ['PEIXE', 'SOL', 'LUA']],
                correctAt: 2,
            },
            {
                message: ['PEIXE', 'LUA', 'SOL'],
                decoys: [['PEIXE', 'LUA', 'PEIXE'], ['LUA', 'LUA', 'SOL']],
                correctAt: 0,
            },
        ],
    },
    {
        level: 3,
        name: 'Gruta',
        from: 'figura',
        to: 'som',
        legend: 'first',
        playsOnTap: true,
        chests: [
            {
                message: ['PEIXE', 'LUA', 'SOL'],
                decoys: [['LUA', 'PEIXE', 'SOL'], ['PEIXE', 'SOL', 'LUA']],
                correctAt: 2,
            },
            {
                message: ['LUA', 'SOL', 'PEIXE'],
                decoys: [['SOL', 'LUA', 'PEIXE'], ['LUA', 'PEIXE', 'SOL']],
                correctAt: 0,
            },
            {
                message: ['SOL', 'PEIXE', 'PEIXE'],
                decoys: [['SOL', 'PEIXE', 'LUA'], ['SOL', 'LUA', 'PEIXE']],
                correctAt: 1,
            },
            {
                message: ['LUA', 'LUA', 'SOL'],
                decoys: [['LUA', 'LUA', 'PEIXE'], ['SOL', 'LUA', 'SOL']],
                correctAt: 2,
            },
            {
                message: ['PEIXE', 'SOL', 'LUA'],
                decoys: [['PEIXE', 'LUA', 'SOL'], ['SOL', 'SOL', 'LUA']],
                correctAt: 1,
            },
        ],
    },
]

export const TOTAL_CHESTS = LEVELS.reduce((sum, level) => sum + level.chests.length, 0)

export const chestsBefore = (level: number) =>
    LEVELS.slice(0, level - 1).reduce((sum, l) => sum + l.chests.length, 0)

export function optionsOf(chest: ChestDef): Word[][] {
    const list: Word[][] = [chest.decoys[0], chest.decoys[1]]
    list.splice(chest.correctAt, 0, chest.message)
    return list
}
