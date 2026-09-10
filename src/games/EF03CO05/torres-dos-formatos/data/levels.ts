import type { FileDef, FormatId, LevelDef, Payload, WaveDef } from '../types'

/**
 * O veredito nasce da FORMA do payload, não de um campo `correct`. Trocar o
 * conteúdo de um arquivo não muda para onde ele vai; trocar a estrutura muda.
 */
export const formatOf = (payload: Payload): FormatId => {
    if ('samples' in payload) return 'audio'
    if ('pixels' in payload) return 'image'
    if ('tokens' in payload) return 'text'
    return 'video'
}

export const formatOfFile = (file: FileDef) => formatOf(file.payload)

export const belongs = (lane: FormatId, file: FileDef) => lane === formatOfFile(file)

const audio = (id: string, contentFrame: number, samples: number[]): FileDef => ({
    id,
    contentFrame,
    payload: { samples },
})

const image = (id: string, contentFrame: number, pixels: string[][]): FileDef => ({
    id,
    contentFrame,
    payload: { pixels },
})

const text = (id: string, contentFrame: number, tokens: string[]): FileDef => ({
    id,
    contentFrame,
    payload: { tokens },
})

const video = (id: string, contentFrame: number, strip: string[]): FileDef => ({
    id,
    contentFrame,
    payload: { strip },
})

/**
 * O NINJA. Cai devagar e escondido; no meio do caminho se revela como um dos
 * arquivos da lista, sorteado na hora. Enquanto está disfarçado não há o que
 * decidir — a decisão começa quando a estrutura aparece.
 */
const ninja = (id: string, options: FileDef[]): FileDef => ({
    id,
    contentFrame: options[0].contentFrame,
    payload: options[0].payload,
    ninja: options,
})

// Grades 4 x 3, no máximo cinco cores. Ver `PIXEL` em data/theme.ts.
const MONTANHA = [
    ['b', 'b', 'b', 'b'],
    ['k', 'k', 'b', 'k'],
    ['g', 'g', 'g', 'g'],
]
const FLOR = [
    ['.', 'p', 'p', '.'],
    ['.', 'y', 'y', '.'],
    ['.', 'g', 'g', '.'],
]
const ESCOLA = [
    ['.', 'r', 'r', '.'],
    ['y', 'y', 'y', 'y'],
    ['y', 'b', 'b', 'y'],
]
const BOLA = [
    ['.', 'r', 'b', '.'],
    ['y', 'y', 'r', 'b'],
    ['.', 'b', 'y', '.'],
]
const ARVORE = [
    ['.', 'g', 'g', '.'],
    ['g', 'g', 'g', 'g'],
    ['.', 'o', 'o', '.'],
]
const PRAIA = [
    ['b', 'b', 'y', 'b'],
    ['y', 'y', 'y', 'y'],
    ['b', 'b', 'b', 'b'],
]
const JANELA = [
    ['o', 'o', 'o', 'o'],
    ['o', 'b', 'b', 'o'],
    ['o', 'b', 'b', 'o'],
]
const DOCE = [
    ['.', 'p', 'p', '.'],
    ['p', 'w', 'w', 'p'],
    ['.', 'r', 'r', '.'],
]

/**
 * NÍVEL 1 — as quatro estruturas entram de duas em duas.
 *
 * Onda 1: som e imagem. Onda 2: entra o texto. Onda 3: entra o vídeo, e as
 * quatro pistas ficam abertas ao mesmo tempo.
 */
export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Som, imagem, texto e vídeo',
        bg: 'bg-jardim-tecnologico',
        fallSpeed: 62,
        skinTwo: 0.2,
        waves: [
            {
                id: 'som-e-imagem',
                name: 'Som e imagem',
                lanes: ['audio', 'image'],
                files: [
                    audio('a1', 11, [0.2, 0.7, 0.4, 0.9, 0.3, 0.6, 0.2, 0.8]),
                    image('i1', 4, MONTANHA),
                    audio('a2', 10, [0.5, 0.2, 0.8, 0.3, 0.7, 0.4, 0.9, 0.3]),
                    image('i2', 5, FLOR),
                ],
            },
            {
                id: 'entra-o-texto',
                name: 'Entra o texto',
                lanes: ['audio', 'image', 'text'],
                files: [
                    text('t1', 9, ['OI', 'LIA']),
                    image('i3', 6, ESCOLA),
                    audio('a3', 11, [0.3, 0.8, 0.5, 0.2, 0.9, 0.4, 0.6, 0.3]),
                    text('t2', 8, ['SALA', '3']),
                    image('i4', 7, BOLA),
                ],
            },
            {
                id: 'entra-o-video',
                name: 'Entra o vídeo',
                lanes: ['audio', 'image', 'text', 'video'],
                files: [
                    video('v1', 1, ['b', 'g', 'y', 'g']),
                    audio('a4', 10, [0.6, 0.3, 0.9, 0.2, 0.7, 0.5, 0.3, 0.8]),
                    text('t3', 8, ['LEVAR', 'ÁGUA']),
                    video('v2', 3, ['o', 'r', 'y', 'b']),
                    image('i5', 4, ARVORE),
                    audio('a5', 11, [0.4, 0.9, 0.3, 0.6, 0.8, 0.2, 0.7, 0.4]),
                ],
            },
        ],
    },

    /**
     * NÍVEL 2 — as quatro pistas desde a primeira onda, a queda mais rápida e,
     * a partir da segunda onda, AS CAIXAS TROCAM DE LUGAR.
     *
     * É a diferença curricular do nível: quem decorou "som é a primeira" perde
     * a muleta e passa a ter que ler o ícone da caixa e a estrutura do dado.
     */
    {
        level: 2,
        title: 'Caixas trocadas',
        bg: 'bg-galpao-triagem',
        fallSpeed: 80,
        skinTwo: 0.55,
        waves: [
            {
                id: 'todas-as-caixas',
                name: 'Todas as caixas',
                lanes: ['audio', 'image', 'text', 'video'],
                files: [
                    image('n2-i1', 4, PRAIA),
                    audio('n2-a1', 10, [0.7, 0.3, 0.8, 0.5, 0.2, 0.9, 0.4, 0.6]),
                    video('n2-v1', 1, ['g', 'b', 'g', 'y']),
                    text('n2-t1', 8, ['BOM', 'DIA']),
                    image('n2-i2', 5, JANELA),
                    video('n2-v2', 3, ['r', 'o', 'r', 'y']),
                ],
            },
            {
                id: 'caixas-trocadas',
                name: 'Caixas trocadas',
                lanes: ['video', 'text', 'audio', 'image'],
                files: [
                    text('n2-t2', 9, ['LIA', 'E', 'TOM']),
                    audio('n2-a2', 11, [0.4, 0.8, 0.2, 0.7, 0.5, 0.9, 0.3, 0.6]),
                    image('n2-i3', 6, JANELA),
                    video('n2-v3', 1, ['b', 'y', 'b', 'g']),
                    ninja('n2-x1', [
                        audio('n2-x1a', 10, [0.6, 0.2, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5]),
                        image('n2-x1b', 6, JANELA),
                        video('n2-x1c', 3, ['r', 'y', 'r', 'o']),
                    ]),
                    text('n2-t3', 8, ['SALA', '5']),
                    audio('n2-a3', 10, [0.9, 0.2, 0.6, 0.4, 0.8, 0.3, 0.7, 0.5]),
                    image('n2-i4', 7, PRAIA),
                ],
            },
            {
                id: 'sem-parar',
                name: 'Sem parar',
                lanes: ['image', 'video', 'audio', 'text'],
                files: [
                    video('n2-v4', 3, ['y', 'g', 'o', 'g']),
                    image('n2-i5', 4, DOCE),
                    text('n2-t4', 9, ['OI']),
                    ninja('n2-x2', [
                        text('n2-x2a', 9, ['OLA', 'TOM']),
                        image('n2-x2b', 7, DOCE),
                        audio('n2-x2c', 11, [0.8, 0.4, 0.2, 0.9, 0.5, 0.7, 0.3, 0.6]),
                    ]),
                    audio('n2-a4', 11, [0.3, 0.6, 0.9, 0.4, 0.7, 0.2, 0.8, 0.5]),
                    video('n2-v5', 1, ['b', 'r', 'y', 'b']),
                    image('n2-i6', 5, DOCE),
                    ninja('n2-x3', [
                        video('n2-x3a', 1, ['g', 'b', 'y', 'g']),
                        audio('n2-x3b', 10, [0.2, 0.9, 0.4, 0.6, 0.8, 0.3, 0.5, 0.7]),
                        text('n2-x3c', 8, ['FIM']),
                    ]),
                    text('n2-t5', 8, ['LEVAR', 'BONÉ']),
                    audio('n2-a5', 10, [0.5, 0.9, 0.3, 0.8, 0.2, 0.6, 0.4, 0.7]),
                ],
            },
        ],
    },

    /**
     * NÍVEL 3 — as caixas trocam DENTRO da onda.
     *
     * No nível 2 a criança relia as caixas a cada onda; aqui elas deslizam no
     * meio do caminho e ela precisa reler com um arquivo já caindo. Somado ao
     * ninja, é o nível em que olhar uma vez deixa de bastar.
     */
    {
        level: 3,
        title: 'Nada fica parado',
        bg: 'bg-galpao-triagem',
        fallSpeed: 92,
        skinTwo: 0.85,
        waves: [
            {
                id: 'olhe-de-novo',
                name: 'Olhe de novo',
                lanes: ['audio', 'image', 'text', 'video'],
                swapTo: ['text', 'video', 'image', 'audio'],
                swapAfter: 3,
                files: [
                    video('n3-v1', 3, ['o', 'y', 'o', 'r']),
                    text('n3-t1', 8, ['TUDO', 'BEM']),
                    image('n3-i1', 6, PRAIA),
                    audio('n3-a1', 11, [0.6, 0.9, 0.2, 0.5, 0.8, 0.3, 0.7, 0.4]),
                    image('n3-i2', 7, DOCE),
                    video('n3-v2', 1, ['b', 'g', 'b', 'y']),
                    text('n3-t2', 9, ['ATÉ', 'JÁ']),
                ],
            },
            {
                id: 'ninjas-e-troca',
                name: 'Ninjas e troca',
                lanes: ['video', 'audio', 'image', 'text'],
                swapTo: ['image', 'text', 'video', 'audio'],
                swapAfter: 4,
                files: [
                    audio('n3-a2', 10, [0.2, 0.8, 0.5, 0.9, 0.3, 0.6, 0.4, 0.7]),
                    ninja('n3-x1', [
                        video('n3-x1a', 1, ['y', 'b', 'g', 'b']),
                        text('n3-x1b', 9, ['OI', 'SOL']),
                        image('n3-x1c', 4, JANELA),
                    ]),
                    image('n3-i3', 5, ARVORE),
                    text('n3-t3', 8, ['SALA', '2']),
                    video('n3-v3', 3, ['r', 'r', 'o', 'y']),
                    ninja('n3-x2', [
                        audio('n3-x2a', 11, [0.7, 0.4, 0.9, 0.2, 0.6, 0.8, 0.3, 0.5]),
                        image('n3-x2b', 6, PRAIA),
                        video('n3-x2c', 3, ['g', 'y', 'r', 'g']),
                    ]),
                    audio('n3-a3', 10, [0.5, 0.3, 0.8, 0.6, 0.9, 0.2, 0.7, 0.4]),
                    text('n3-t4', 9, ['BOA', 'NOITE']),
                ],
            },
            {
                id: 'tudo-junto',
                name: 'Tudo junto',
                lanes: ['image', 'video', 'text', 'audio'],
                swapTo: ['audio', 'image', 'video', 'text'],
                swapAfter: 5,
                files: [
                    text('n3-t5', 8, ['LEVAR', 'CAPA']),
                    video('n3-v4', 1, ['b', 'o', 'b', 'g']),
                    ninja('n3-x3', [
                        text('n3-x3a', 8, ['FIM', 'DE', 'DIA']),
                        audio('n3-x3b', 10, [0.4, 0.7, 0.2, 0.9, 0.5, 0.3, 0.8, 0.6]),
                        video('n3-x3c', 1, ['y', 'g', 'b', 'o']),
                    ]),
                    image('n3-i4', 4, MONTANHA),
                    audio('n3-a4', 11, [0.8, 0.5, 0.3, 0.7, 0.2, 0.9, 0.4, 0.6]),
                    image('n3-i5', 7, DOCE),
                    ninja('n3-x4', [
                        image('n3-x4a', 5, JANELA),
                        video('n3-x4b', 3, ['r', 'y', 'g', 'r']),
                        text('n3-x4c', 9, ['TCHAU']),
                    ]),
                    audio('n3-a5', 10, [0.3, 0.9, 0.6, 0.4, 0.7, 0.5, 0.2, 0.8]),
                    video('n3-v5', 3, ['o', 'g', 'y', 'b']),
                ],
            },
        ],
    },
]

export const lanesOf = (wave: WaveDef) => wave.lanes

export const TOTAL_WAVES = LEVELS.reduce((sum, level) => sum + level.waves.length, 0)
