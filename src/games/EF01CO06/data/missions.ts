import type { Mission } from '../types'

export const MISSIONS_L1: Mission[] = [
    {
        id: 'm1-1',
        text: 'Saber a hora certa do lanche: 9:00',
        steps: [{
            appId: 'relogio', actionKey: 'set-time',
            hint: 'Arraste o ponteiro azul até o lugar certo',
            clockStart: { h: 8, m: 45 }, clockTarget: { h: 9, m: 0 },
        }],
    },
    {
        id: 'm1-2',
        text: 'Descobrir quantas crianças vieram hoje: 12 meninas e 8 meninos',
        steps: [{
            appId: 'calculadora', actionKey: 'calculate',
            hint: 'Junte os dois números',
            expectedExpr: '12 + 8', expectedAnswer: 20,
        }],
    },
]

export const MISSIONS_L2: Mission[] = [
    {
        id: 'm2-1',
        text: 'Marcar o horário do recreio: 10:30',
        steps: [{
            appId: 'relogio', actionKey: 'set-time',
            hint: 'Dê a volta com o ponteiro azul até chegar em 10:30',
            clockStart: { h: 9, m: 45 }, clockTarget: { h: 10, m: 30 },
        }],
    },
{
    id: 'm2-2',
        text: 'Contar os lápis das duas caixas: 15 e 7',
            steps: [{
                appId: 'calculadora', actionKey: 'calculate',
                hint: 'Some as duas caixas',
                expectedExpr: '15 + 7', expectedAnswer: 22,
            }],
    },
{
    id: 'm2-3',
        text: 'Os trabalhos da turma estão espalhados na mesa',
            steps: [{
                appId: 'pasta', actionKey: 'organize-files',
                hint: 'Cada arquivo tem a sua gaveta',
            }],
    },
{
    id: 'm2-4',
        text: 'Deixar um recado falado para a turma da tarde',
            steps: [{
                appId: 'gravador', actionKey: 'save-recording',
                hint: 'Segure o botão, ouça e depois salve',
            }],
    },
]

export const MISSIONS_L3: Mission[] = [
    {
        id: 'm3-1',
        text: 'Arrumar os trabalhos e marcar a entrada: 8:00',
        steps: [
            { appId: 'pasta', actionKey: 'organize-files', hint: 'Primeiro guarde cada arquivo na gaveta certa' },
            {
                appId: 'relogio', actionKey: 'set-time', hint: 'Agora marque a hora da entrada',
                clockStart: { h: 7, m: 15 }, clockTarget: { h: 8, m: 0 },
            },
        ],
    },
    {
        id: 'm3-2',
        text: 'Preparar o mural: um recado falado e a capa',
        steps: [
            { appId: 'gravador', actionKey: 'save-recording', hint: 'Grave o recado e salve' },
            { appId: 'desenho', actionKey: 'confirm-drawing', hint: 'Agora faça a capa do mural' },
        ],
    },
    {
        id: 'm3-3',
        text: 'Somar o material que chegou: 5 cadernos, 7 canetas e 3 réguas',
        steps: [{
            appId: 'calculadora', actionKey: 'calculate',
            hint: 'Junte os três números',
            expectedExpr: '5 + 7 + 3', expectedAnswer: 15,
        }],
    },
    {
        id: 'm3-4',
        text: 'Animar a hora da saída com som',
        steps: [{ appId: 'player', actionKey: 'play-music', hint: 'Coloque a canção para tocar' }],
    },
    {
        id: 'm3-5',
        text: 'Deixar a sala pronta para amanhã',
        steps: [{ appId: 'power', actionKey: 'shutdown', hint: 'Encerre o computador do jeito certo' }],
    },
]