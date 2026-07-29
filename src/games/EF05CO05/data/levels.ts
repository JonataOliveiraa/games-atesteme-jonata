import type { LevelConfig } from '../types'

export const LEVELS: LevelConfig[] = [
    {
        level: 1,
        title: 'Conheça as peças',
        objective: 'Cada lugar vazio mostra a sombra da peça que encaixa ali. Encontre e instale.',
        tip: 'Comece sempre pelo gabinete: sem ele, nada tem onde ficar.',
        challenges: [
            {
                id: 'l1-c1',
                mode: 'identificar',
                title: 'A base de tudo',
                required: ['gabinete', 'placa-mae', 'fonte'],
                available: ['gabinete', 'placa-mae', 'fonte'],
                startView: 'oficina',
                explanation: 'O gabinete abriga, a placa-mãe conecta e a fonte alimenta. Sem esses três, nenhuma outra peça funciona.',
            },
            {
                id: 'l1-c2',
                mode: 'identificar',
                title: 'Cérebro e memória',
                required: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram'],
                available: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram'],
                startView: 'oficina',
                explanation: 'O processador faz as contas e a memória RAM segura o que ele está usando naquele instante.',
            },
            {
                id: 'l1-c3',
                mode: 'identificar',
                title: 'Onde os arquivos moram',
                required: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                available: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                startView: 'oficina',
                explanation: 'A RAM esquece tudo ao desligar. O HD é quem guarda seus arquivos para sempre.',
            },
            {
                id: 'l1-c4',
                mode: 'identificar',
                title: 'Falar e ver',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'monitor',
                ],
                available: ['teclado', 'monitor', 'mouse'],
                preInstalled: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                startView: 'mesa',
                explanation: 'O teclado leva a informação para dentro. O monitor traz o resultado para fora. Entrada e saída.',
            },
        ],
    },

    {
        level: 2,
        title: 'Cada peça, uma função',
        objective: 'Agora o lugar vazio não mostra a peça — mostra o que ela faz. Leia e decida.',
        tip: 'Pergunte-se sempre: essa peça calcula, guarda, recebe ou mostra?',
        challenges: [
            {
                id: 'l2-c1',
                mode: 'funcao',
                title: 'Quem faz as contas?',
                required: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                available: ['processador', 'ram', 'hd'],
                preInstalled: ['gabinete', 'placa-mae', 'fonte'],
                startView: 'oficina',
                explanation: 'Três peças, três funções diferentes: uma calcula, uma lembra por enquanto e outra lembra para sempre.',
            },
            {
                id: 'l2-c2',
                mode: 'funcao',
                title: 'Lembrar agora ou lembrar sempre',
                required: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                available: ['ram', 'hd'],
                preInstalled: ['gabinete', 'placa-mae', 'fonte', 'processador'],
                startView: 'oficina',
                explanation: 'As duas guardam informação, mas só o HD continua com ela depois que o computador desliga.',
            },
            {
                id: 'l2-c3',
                mode: 'funcao',
                title: 'Entra ou sai?',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'mouse', 'monitor', 'som',
                ],
                available: ['teclado', 'mouse', 'monitor', 'som'],
                preInstalled: ['gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd'],
                startView: 'mesa',
                explanation: 'Teclado e mouse mandam informação para o computador. Monitor e caixas de som trazem informação de volta para você.',
            },
            {
                id: 'l2-c4',
                mode: 'funcao',
                title: 'Montagem completa',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'mouse', 'monitor', 'som',
                ],
                available: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'mouse', 'monitor', 'som',
                ],
                startView: 'oficina',
                explanation: 'Um computador inteiro, montado só pela função de cada peça. Você não precisou reconhecer nenhuma pela aparência.',
            },
        ],
    },

    {
        level: 3,
        title: 'Diagnóstico',
        objective: 'Computadores com problema. Descubra o que falta — ou o que está sobrando.',
        tip: 'Aperte LIGAR e observe até onde o computador consegue chegar. É aí que está a pista.',
        challenges: [
            {
                id: 'l3-c1',
                mode: 'diagnostico',
                title: 'Do zero, contra o relógio',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'monitor',
                ],
                available: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'mouse', 'monitor', 'som',
                ],
                startView: 'oficina',
                timeLimit: 120,
                explanation: 'Estrutura, energia, processamento, memória, armazenamento, entrada e saída. Todo computador precisa dos sete.',
            },
            {
                id: 'l3-c2',
                mode: 'diagnostico',
                title: 'Este não liga',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'monitor',
                ],
                available: ['fonte', 'ram', 'som'],
                preInstalled: [
                    'gabinete', 'placa-mae', 'processador', 'ram', 'hd',
                    'teclado', 'monitor',
                ],
                startView: 'oficina',
                explanation: 'Nenhuma luz acendeu. Quando nem a primeira etapa acontece, o problema é sempre a energia.',
            },
            {
                id: 'l3-c3',
                mode: 'diagnostico',
                title: 'Este esquece tudo',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'monitor',
                ],
                available: ['hd', 'ram', 'mouse'],
                preInstalled: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram',
                    'teclado', 'monitor',
                ],
                startView: 'oficina',
                explanation: 'Ele ligava e funcionava, mas perdia tudo ao desligar. A RAM sozinha não guarda nada de forma permanente.',
            },
            {
                id: 'l3-c4',
                mode: 'diagnostico',
                title: 'Só o necessário',
                required: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'monitor', 'som',
                ],
                available: [
                    'gabinete', 'placa-mae', 'fonte', 'processador', 'ram', 'hd',
                    'teclado', 'mouse', 'monitor', 'som',
                ],
                startView: 'oficina',
                exactSet: true,
                explanation: 'Para escrever e ouvir música bastam teclado, monitor e caixas de som. O mouse é útil, mas não era necessário aqui.',
            },
        ],
    },
]