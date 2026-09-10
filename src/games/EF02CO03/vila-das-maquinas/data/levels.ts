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
        seconds: 100,
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
        seconds: 90,
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
                            sweeper: 'A vassoura não leva encomenda.',
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
    {
        level: 3,
        name: 'Vila Grande',
        message: 'Tem missão que precisa de DUAS máquinas!',
        seconds: 80,
        missions: [
            {
                id: '3.1',
                problem: 'roofCat',
                label: 'GATINHO',
                shelf: ['sweeper', 'oven', 'drone'],
                steps: [
                    {
                        need: 'highDelivery',
                        requiredCommands: ['fly', 'drop'],
                        hints: {
                            sweeper: 'A vassoura não leva encomenda.',
                            oven: 'O forninho não sai do lugar.',
                        },
                    },
                ],
            },
            {
                id: '3.2',
                problem: 'leaves',
                label: 'FOLHAS',
                shelf: ['oven', 'drone', 'sweeper'],
                steps: [
                    {
                        need: 'clean',
                        requiredCommands: ['turn', 'sweep'],
                        hints: {
                            oven: 'Assar não limpa o chão.',
                            drone: 'Voar não limpa o chão.',
                        },
                    },
                ],
            },
            /*
             * A missão de duas etapas, e o degrau do nível: primeiro alguém
             * assa, depois alguém leva. Uma máquina só não resolve, e a ordem
             * importa — não dá para entregar o pão que ainda é massa.
             */
            {
                id: '3.3',
                problem: 'rawBread',
                label: 'PÃO',
                shelf: ['drone', 'sweeper', 'oven'],
                steps: [
                    {
                        need: 'bakeFood',
                        requiredCommands: ['bake', 'beep'],
                        hints: {
                            sweeper: 'Varrer não assa o pão.',
                            drone: 'O pão ainda está cru.',
                        },
                    },
                    {
                        need: 'highDelivery',
                        requiredCommands: ['fly', 'drop'],
                        hints: {
                            sweeper: 'A vassoura não leva o pão.',
                            oven: 'O pão já está assado.',
                        },
                    },
                ],
            },
        ],
    },
]

export const missionsInLevel = (level: LevelDef) => level.missions.length

export const stepsOf = (mission: MissionDef) => mission.steps.length
