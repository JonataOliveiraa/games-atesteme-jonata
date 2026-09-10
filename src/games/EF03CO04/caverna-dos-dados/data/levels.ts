import type { LevelDef } from '../types'

/**
 * Tudo que varia por conteúdo mora aqui. Nenhum dado carrega `correct`: quem
 * pertence à informação é dito UMA vez, em `information.datumIds`, e o
 * veredito nasce da comparação do conjunto inteiro em `data/rules.ts`.
 *
 * `frame` endereça a folha `sheet` do nível, e a ordem dos quadros é contrato
 * com o TEXTURAS.md — mexer aqui sem mexer lá troca os pictogramas de lugar.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Dados soltos',
        sheet: 'dados-n1',
        galleries: [
            {
                id: 'festa-azul',
                name: 'Festa azul',
                subject: 'a festa azul',
                data: [
                    { id: 'quarta', label: 'quarta', frame: 0 },
                    { id: '14h', label: '14h', frame: 1 },
                    { id: 'festa-azul', label: 'festa azul', frame: 2 },
                ],
                information: {
                    datumIds: ['quarta', '14h', 'festa-azul'],
                    sentence: 'Quarta, às 14h, tem festa azul!',
                },
            },
            {
                id: 'cafe-da-manha',
                name: 'Café da manhã',
                subject: 'o café da manhã',
                data: [
                    { id: '7h', label: '7h', frame: 3 },
                    { id: 'cozinha', label: 'cozinha', frame: 4 },
                    { id: 'cafe', label: 'café da manhã', frame: 5 },
                    { id: 'sapato', label: 'sapato', frame: 6 },
                ],
                information: {
                    datumIds: ['7h', 'cozinha', 'cafe'],
                    sentence: 'Às 7h tem café da manhã na cozinha.',
                },
            },
            {
                id: 'recreio',
                name: 'Recreio',
                subject: 'o recreio',
                data: [
                    { id: '10h', label: '10h', frame: 7 },
                    { id: 'patio', label: 'pátio', frame: 8 },
                    { id: 'recreio', label: 'recreio', frame: 9 },
                    { id: 'travesseiro', label: 'travesseiro', frame: 10 },
                ],
                information: {
                    datumIds: ['10h', 'patio', 'recreio'],
                    sentence: 'Às 10h tem recreio no pátio.',
                },
            },
        ],
    },

    /**
     * NÍVEL 2 — o intruso pertence ao assunto, mas não ao recado.
     *
     * `bola`, `presente` e `recreio` cabem no tema e não completam a
     * informação específica. É a primeira vez que a criança precisa comparar
     * dois dados que "combinam" para escolher só um.
     */
    {
        level: 2,
        name: 'Quase parecido',
        sheet: 'dados-n2',
        galleries: [
            {
                id: 'piquenique',
                name: 'Piquenique',
                subject: 'o piquenique',
                data: [
                    { id: 'sabado', label: 'sábado', frame: 0 },
                    { id: '10h', label: '10h', frame: 1 },
                    { id: 'praca', label: 'praça', frame: 2 },
                    { id: 'piquenique', label: 'piquenique', frame: 3 },
                    { id: 'bola', label: 'bola', frame: 4 },
                ],
                information: {
                    datumIds: ['sabado', '10h', 'praca', 'piquenique'],
                    sentence: 'Sábado, às 10h, tem piquenique na praça!',
                },
            },
            {
                id: 'aniversario',
                name: 'Aniversário',
                subject: 'o aniversário',
                data: [
                    { id: 'dia-12', label: 'dia 12', frame: 5 },
                    { id: 'abril', label: 'abril', frame: 6 },
                    { id: 'casa', label: 'casa', frame: 7 },
                    { id: 'aniversario', label: 'aniversário', frame: 8 },
                    { id: 'presente', label: 'presente', frame: 9 },
                ],
                information: {
                    datumIds: ['dia-12', 'abril', 'casa', 'aniversario'],
                    sentence: 'Dia 12 de abril tem aniversário em casa.',
                },
            },
            {
                id: 'onibus',
                name: 'Ônibus escolar',
                subject: 'a chegada do ônibus',
                data: [
                    { id: '8h', label: '8h', frame: 10 },
                    { id: 'onibus', label: 'ônibus', frame: 11 },
                    { id: 'portao', label: 'portão', frame: 12 },
                    { id: 'escola', label: 'escola', frame: 13 },
                    { id: 'recreio', label: 'recreio', frame: 14 },
                ],
                information: {
                    datumIds: ['8h', 'onibus', 'portao', 'escola'],
                    sentence: 'Às 8h, o ônibus chega ao portão da escola.',
                },
            },
        ],
    },

    /**
     * NÍVEL 3 — duas alternativas plausíveis e um dado que ficou na caverna.
     *
     * `hiddenDatumId` não nasce com as outras pedras: a criança chega ao altar
     * com um encaixe a menos do que precisa e tem que VOLTAR para minerá-lo.
     * A comparação fica fina — `terça` contra `sexta`, `campo` contra `quadra`
     * — e o dado que falta é sempre um dos corretos.
     */
    {
        level: 3,
        name: 'Fundo da caverna',
        sheet: 'dados-n3',
        galleries: [
            {
                id: 'acordar',
                name: 'Acordar',
                subject: 'a hora de acordar',
                hiddenDatumId: 'segunda',
                data: [
                    { id: 'segunda', label: 'segunda', frame: 0 },
                    { id: '7', label: '7', frame: 1 },
                    { id: 'horas', label: 'horas', frame: 2 },
                    { id: 'acordar', label: 'acordar', frame: 3 },
                    { id: '8', label: '8', frame: 4 },
                    { id: 'dormir', label: 'dormir', frame: 5 },
                ],
                information: {
                    datumIds: ['segunda', '7', 'horas', 'acordar'],
                    sentence: 'Na segunda, acordar às 7 horas.',
                },
            },
            {
                id: 'treino',
                name: 'Treino',
                subject: 'o treino',
                hiddenDatumId: 'quadra',
                data: [
                    { id: 'sexta', label: 'sexta', frame: 6 },
                    { id: '16h', label: '16h', frame: 7 },
                    { id: 'quadra', label: 'quadra', frame: 8 },
                    { id: 'treino', label: 'treino', frame: 9 },
                    { id: 'terca', label: 'terça', frame: 10 },
                    { id: 'campo', label: 'campo', frame: 11 },
                ],
                information: {
                    datumIds: ['sexta', '16h', 'quadra', 'treino'],
                    sentence: 'Sexta, às 16h, tem treino na quadra.',
                },
            },
            {
                id: 'almoco',
                name: 'Almoço',
                subject: 'o almoço de domingo',
                hiddenDatumId: 'casa-da-vo',
                data: [
                    { id: 'domingo', label: 'domingo', frame: 12 },
                    { id: '12h', label: '12h', frame: 13 },
                    { id: 'casa-da-vo', label: 'casa da vó', frame: 14 },
                    { id: 'almoco', label: 'almoço', frame: 15 },
                    { id: 'sabado', label: 'sábado', frame: 16 },
                    { id: 'casa-da-tia', label: 'casa da tia', frame: 17 },
                ],
                information: {
                    datumIds: ['domingo', '12h', 'casa-da-vo', 'almoco'],
                    sentence: 'Domingo, às 12h, tem almoço na casa da vó.',
                },
            },
        ],
    },
]

export const TOTAL_GALLERIES = LEVELS.reduce((sum, level) => sum + level.galleries.length, 0)
