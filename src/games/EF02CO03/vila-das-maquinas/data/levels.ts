import type { LevelDef, MissionDef } from '../types'

/**
 * Do 1 para o 2 muda uma coisa só, e ela é a que importa: entram TRÊS máquinas
 * na prateleira. Com duas, eliminar uma já entrega a resposta; com três, a
 * criança tem que casar o comando com o problema de verdade.
 *
 * O nível 3 entra aqui como mais um objeto, com uma missão de duas etapas.
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
    {
        level: 2,
        name: 'Vila Cheia',
        message: 'Agora as três máquinas estão no galpão!',
        missions: [
            {
                id: '2.1',
                problem: 'leaves',
                label: 'FOLHAS',
                shelf: ['drone', 'sweeper', 'oven'],
                steps: [
                    {
                        need: 'clean',
                        requiredCommands: ['turn', 'sweep'],
                        hints: {
                            drone: 'Voar não limpa o chão.',
                            oven: 'Assar não limpa o chão.',
                        },
                    },
                ],
            },
            {
                id: '2.2',
                problem: 'roofCat',
                label: 'GATINHO',
                shelf: ['drone', 'oven', 'sweeper'],
                steps: [
                    {
                        need: 'highDelivery',
                        requiredCommands: ['fly', 'drop'],
                        hints: {
                            oven: 'O forninho não sai do lugar.',
                            sweeper: 'A vassoura não alcança o telhado.',
                        },
                    },
                ],
            },
            {
                id: '2.3',
                problem: 'rawBread',
                label: 'PÃO',
                shelf: ['sweeper', 'drone', 'oven'],
                steps: [
                    {
                        need: 'bakeFood',
                        requiredCommands: ['bake', 'beep'],
                        hints: {
                            sweeper: 'Varrer não assa o pão.',
                            drone: 'Voar não assa o pão.',
                        },
                    },
                ],
            },
        ],
    },
]

export const missionsInLevel = (level: LevelDef) => level.missions.length

export const stepsOf = (mission: MissionDef) => mission.steps.length
