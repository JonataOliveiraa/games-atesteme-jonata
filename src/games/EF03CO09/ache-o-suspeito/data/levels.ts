import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        waves: [
            {
                id: 'endereco',
                movement: 'still',
                cards: [
                    {
                        id: 'endereco-premio',
                        message: 'Mandar meu endereço para ganhar um prêmio.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'address',
                        note: 'O endereço mostraria a desconhecidos onde você mora.',
                    },
                    {
                        id: 'desenho-professora',
                        message: 'Enviar meu desenho para a professora.',
                        destination: 'PROFESSORA',
                        owner: 'self',
                        audience: 'teacher',
                        kind: 'school-work',
                        note: 'O desenho é seu e vai para a professora num espaço fechado.',
                    },
                ],
            },
            {
                id: 'telefone',
                movement: 'still',
                cards: [
                    {
                        id: 'telefone-desconhecido',
                        message: 'Dar meu telefone para alguém que não conheço.',
                        destination: 'PESSOA DESCONHECIDA',
                        owner: 'self',
                        audience: 'unknown',
                        kind: 'phone',
                        note: 'Um desconhecido poderia ligar ou mandar mensagens para você.',
                    },
                    {
                        id: 'animal-turma',
                        message: 'Contar meu animal favorito no grupo da turma.',
                        destination: 'GRUPO DA TURMA',
                        owner: 'self',
                        audience: 'closed-group',
                        kind: 'preference',
                        note: 'Um gosto seu no grupo da turma não diz onde você está.',
                    },
                ],
            },
            {
                id: 'localizacao',
                movement: 'still',
                cards: [
                    {
                        id: 'localizacao-publica',
                        message: 'Mostrar onde estou agora no meu perfil público.',
                        destination: 'PERFIL PÚBLICO',
                        owner: 'self',
                        audience: 'public',
                        kind: 'live-location',
                        note: 'Qualquer pessoa saberia onde você está neste momento.',
                    },
                    {
                        id: 'experimento-site',
                        message: 'Postar o experimento sem rostos no site da escola.',
                        destination: 'SITE DA ESCOLA',
                        owner: 'self',
                        audience: 'school-site',
                        kind: 'school-work',
                        note: 'O trabalho não tem rostos e o site é da escola.',
                    },
                ],
            },
        ],
    },
]

export const WAVES_PER_LEVEL = LEVELS[0].waves.length
export const POINTS_CLEAN = 10
export const POINTS_AFTER_STALL = 5
