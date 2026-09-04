import type { LevelDef, MissionDef } from '../types'

/**
 * NÍVEL 1 DE TESTE. O planejamento prevê três níveis; este arquivo é o único
 * lugar onde eles moram, e os níveis 2 e 3 entram aqui como mais dois objetos.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Vila Nova',
        message: 'Cada máquina sabe os comandos dela!',
        missions: [
            {
                id: '1.1',
                problem: 'leaves',
                label: 'FOLHAS',
                shelf: ['sweeper', 'oven'],
                steps: [
                    {
                        need: 'clean',
                        requiredCommands: ['turn', 'sweep'],
                        hints: { oven: 'Procure quem varre.' },
                    },
                ],
            },
            {
                id: '1.2',
                problem: 'rawBread',
                label: 'PÃO',
                shelf: ['drone', 'oven'],
                steps: [
                    {
                        need: 'bakeFood',
                        requiredCommands: ['bake', 'beep'],
                        hints: { drone: 'Procure quem assa.' },
                    },
                ],
            },
            {
                id: '1.3',
                problem: 'roofCat',
                label: 'GATINHO',
                shelf: ['sweeper', 'drone'],
                steps: [
                    {
                        need: 'highDelivery',
                        requiredCommands: ['fly', 'drop'],
                        hints: { sweeper: 'Procure quem voa.' },
                    },
                ],
            },
        ],
    },
]

export const missionsInLevel = (level: LevelDef) => level.missions.length

export const stepsOf = (mission: MissionDef) => mission.steps.length
