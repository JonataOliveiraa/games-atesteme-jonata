import type { LevelDef, PhaseDef, TestZone } from '../types'

const air: TestZone = { kind: 'medium', medium: 'air' }
const land: TestZone = { kind: 'medium', medium: 'land' }
const water: TestZone = { kind: 'medium', medium: 'water' }

const phase = (zones: TestZone[], ...vehicles: PhaseDef['vehicles']): PhaseDef =>
    ({ zones, vehicles })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        phases: [
            phase([air, land], 'plane', 'car', 'helicopter'),
            phase([water, land], 'boat', 'bike', 'speedboat'),
            phase([air, water], 'sailboat', 'rocket', 'helicopter'),
        ],
    },
    {
        level: 2,
        phases: [
            phase([air, water, land], 'plane', 'car', 'boat', 'bus'),
            phase([air, water, land], 'helicopter', 'speedboat', 'bike', 'sailboat'),
            phase([air, water, land], 'rocket', 'scooter', 'boat', 'car'),
        ],
    },
    {
        level: 3,
        phases: [
            phase([air, water, land], 'seaplane', 'plane', 'boat', 'car', 'bike'),
            phase([air, water, land], 'helicopter', 'sailboat', 'bus', 'seaplane', 'scooter'),
            phase([air, water, land], 'rocket', 'speedboat', 'car', 'seaplane', 'boat'),
        ],
    },
]

export const testsInLevel = (level: LevelDef) =>
    level.phases.reduce((sum, p) => sum + p.vehicles.length, 0)

export const TOTAL_TESTS = LEVELS.reduce((sum, level) => sum + testsInLevel(level), 0)

export const testsBefore = (levelNumber: number) =>
    LEVELS.slice(0, levelNumber - 1).reduce((sum, level) => sum + testsInLevel(level), 0)

export const LEVEL_DONE = 'Caso resolvido!'

export const GAME_DONE = 'Detetive dos modelos!'
