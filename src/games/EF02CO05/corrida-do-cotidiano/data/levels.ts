import type { LevelDef } from '../types'

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        name: 'Pela casa',
        place: 'casa',
        mood: { sky: 0x7fcdf2, skyLow: 0xdff3ff, hill: 0x7fb0d6, sun: 0xfff3c4 },
        phases: [
            { situations: ['horas', 'gelar', 'musica'], speed: 480 },
            { situations: ['desenho', 'leite', 'vo'], speed: 545 },
            { situations: ['roupa', 'foto', 'bolo'], speed: 610 },
        ],
    },
    {
        level: 2,
        name: 'Da casa até a escola',
        place: 'escola',
        mood: { sky: 0x5aa6d8, skyLow: 0xffd9a0, hill: 0xc79a86, sun: 0xffd18a, ground: 0xffe6c4 },
        phases: [
            { situations: ['recreio', 'merenda', 'marmita'], speed: 545 },
            { situations: ['chamada', 'festa', 'aviso'], speed: 610 },
            { situations: ['planetas', 'mural', 'uniforme'], speed: 675 },
        ],
    },
    {
        level: 3,
        name: 'A cidade no inverno',
        place: 'cidade',
        mood: {
            sky: 0x8fb6d4,
            skyLow: 0xeaf4fb,
            hill: 0xcfe2ef,
            sun: 0xf4f9ff,
            frost: 0.66,
            wild: true,
        },
        phases: [
            { situations: ['suco', 'calor', 'folhas'], speed: 675 },
            { situations: ['gelo', 'pipoca', 'aniversario'], speed: 745 },
            { situations: ['jornal', 'recado', 'lencol'], speed: 815 },
        ],
    },
]

export const gatesInLevel = (level: LevelDef) =>
    level.phases.reduce((total, phase) => total + phase.situations.length, 0)
