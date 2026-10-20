import type { DemoDef, ItemDef, LevelDef } from '../types'
import { FRESH, buildCourse, checkCourse } from './course'
import { SUMMIT } from './physics'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co08-pula-l${level}`

export const trusts = (item: ItemDef) => item.clues.quem.ok && item.clues.quando.ok && item.clues.onde.ok

const DEMO: Record<'feira' | 'parque' | 'gato', DemoDef> = {
    feira: {
        text: 'Pistas boas? PODE CONFIAR. Ruim? NÃO CONFIE.',
        item: {
            id: 'demo-feira',
            kind: 'jornal',
            from: 'Jornal da Cidade',
            title: 'A feira do bairro volta no domingo',
            clues: {
                quem: { text: 'Léo Souza, repórter', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'a Prefeitura informou', ok: true },
            },
            why: 'Tem quem escreveu, a data e de onde veio.',
        },
    },
    parque: {
        text: 'Gritou, mas tem as três pistas!',
        item: {
            id: 'demo-parque',
            kind: 'jornal',
            from: 'Grita Notícia',
            title: 'UAU!!! O PARQUE GANHOU UM ESCORREGADOR GIGANTE!!!',
            clues: {
                quem: { text: 'Bia Nunes, repórter', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'a Prefeitura informou', ok: true },
            },
            why: 'Grita, mas tem quem escreveu, a data e de onde veio.',
        },
    },
    gato: {
        text: 'Uma pista ruim já basta!',
        item: {
            id: 'demo-gato',
            kind: 'jornal',
            from: 'Portal Curioso',
            title: 'Gato de rua aprende a ler sozinho',
            clues: {
                quem: { text: 'Davi Costa, repórter', ok: true },
                quando: { text: 'ontem', ok: true },
                onde: { text: 'copiou de um vídeo sem nome', ok: false },
            },
            why: 'Tem autor e data, mas copiou de um vídeo sem nome.',
        },
    },
}

const N1: LevelDef = {
    level: 1,
    title: 'Confira antes de subir',
    message: 'Quem fez, quando e de onde veio: com as três pistas boas, dá para confiar.',
    altitude: 0,
    bad: 3,
    course: {
        seed: 51,
        sections: [5, 6, 6, 7],
        finish: 3,
        step: { min: 135, max: 165 },
        width: { min: 210, max: 260 },
        shift: 230,
    },
    demos: [DEMO.feira],
    items: [
        {
            id: 'vacina',
            kind: 'jornal',
            from: 'Jornal da Cidade',
            title: 'Vacina da gripe chega ao posto do bairro',
            clues: {
                quem: { text: 'Marina Alves, repórter', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'a Prefeitura informou', ok: true },
            },
            why: 'Tem quem escreveu, a data e de onde veio.',
        },
        {
            id: 'chocolate',
            kind: 'alerta',
            from: 'Grupo da família',
            title: 'CHOCOLATE CURA TUDO!!! Mande para todo mundo!',
            forwarded: true,
            clues: {
                quem: { text: 'ninguém assina', ok: false },
                quando: { text: 'não diz', ok: false },
                onde: { text: '"todo mundo está falando"', ok: false },
            },
            why: 'Ninguém assina, não tem data e não diz de onde veio.',
        },
        {
            id: 'arvores',
            kind: 'jornal',
            from: 'Site da Escola',
            title: 'A turma do 5º ano plantou 20 árvores',
            clues: {
                quem: { text: 'Professor Rui', ok: true },
                quando: { text: 'ontem', ok: true },
                onde: { text: 'a escola publicou', ok: true },
            },
            why: 'Tem quem escreveu, a data e de onde veio.',
        },
        {
            id: 'alienigenas',
            kind: 'imagem',
            from: 'Perfil @misterios',
            title: 'ALIENÍGENAS POUSARAM NA PRAÇA!!!',
            photo: 'alienigenas',
            clues: {
                quem: { text: 'ninguém assina', ok: false },
                quando: { text: 'sem data', ok: false },
                onde: { text: '"um amigo mandou"', ok: false },
            },
            why: 'Ninguém assina, não tem data e é só "um amigo mandou".',
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'O grito não decide',
    message: 'Manchete gritada pode ser verdade, e foto de verdade pode ser velha. Quem decide são as três pistas.',
    altitude: 1,
    course: {
        seed: 52,
        sections: [6, 6, 7, 7],
        finish: 3,
        step: { min: 145, max: 180 },
        width: { min: 190, max: 230 },
        shift: 250,
        move: { range: 70, period: 2600, every: 3 },
    },
    demos: [DEMO.parque],
    items: [
        {
            id: 'capivaras',
            kind: 'imagem',
            from: 'Grita Notícia',
            title: 'UAU!!! CAPIVARAS PARAM O TRÂNSITO NO LAGO!!!',
            photo: 'capivaras',
            clues: {
                quem: { text: 'Tino Rocha, fotógrafo', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'o Parque do Lago confirmou', ok: true },
            },
            why: 'Grita e parece estranho, mas tem quem tirou, a data e de onde veio.',
        },
        {
            id: 'aula',
            kind: 'alerta',
            from: 'Grupo da escola',
            title: 'Amanhã não vai ter aula. Avise todo mundo.',
            forwarded: true,
            clues: {
                quem: { text: 'ninguém assina', ok: false },
                quando: { text: 'não diz', ok: false },
                onde: { text: '"a mãe de um colega falou"', ok: false },
            },
            why: 'É calma, mas ninguém assina e não diz de onde veio.',
        },
        {
            id: 'enchente',
            kind: 'imagem',
            from: 'Perfil @noticiasja',
            title: 'Olha a enchente na nossa rua HOJE!',
            photo: 'enchente',
            clues: {
                quem: { text: 'Ana Lima, fotógrafa', ok: true },
                quando: { text: 'a foto é de 2015', ok: false },
                onde: { text: 'Jornal da Cidade, 2015', ok: true },
            },
            why: 'A foto é de verdade, mas é de 2015. Não é de hoje.',
        },
        {
            id: 'biblioteca',
            kind: 'jornal',
            from: 'Site da Prefeitura',
            title: 'Biblioteca abre aos sábados a partir de hoje',
            clues: {
                quem: { text: 'Secretaria de Cultura', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'a Prefeitura publicou', ok: true },
            },
            why: 'Tem quem escreveu, a data e de onde veio.',
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'Uma pista basta',
    message: 'Basta uma pista ruim para não confiar. E um alerta pode ser confiável, se tiver as três.',
    altitude: 2,
    bad: 1,
    course: {
        seed: 53,
        sections: [5, 6, 6, 6],
        finish: 3,
        step: { min: 150, max: 178 },
        width: { min: 170, max: 210 },
        shift: 270,
        move: { range: 90, period: 2200, every: 2 },
    },
    demos: [DEMO.gato],
    items: [
        {
            id: 'dinossauro',
            kind: 'imagem',
            from: 'Site Saber Tudo',
            title: 'Dinossauro escapou do museu e passeia pelo centro',
            photo: 'dinossauro',
            clues: {
                quem: { text: 'Carla Dias, repórter', ok: true },
                quando: { text: 'ontem', ok: true },
                onde: { text: 'copiou de um perfil sem nome', ok: false },
            },
            why: 'Tem autora e data, mas copiou de um perfil sem nome.',
        },
        {
            id: 'chuva',
            kind: 'alerta',
            from: 'Defesa Civil',
            title: 'ALERTA: chuva forte hoje à noite. Fique em casa.',
            clues: {
                quem: { text: 'Defesa Civil', ok: true },
                quando: { text: 'hoje, às 14h', ok: true },
                onde: { text: 'o número oficial da Defesa Civil', ok: true },
            },
            why: 'É alerta, mas tem quem mandou, a hora e a fonte oficial.',
        },
        {
            id: 'piscina',
            kind: 'imagem',
            from: 'Perfil @fofoqueiro',
            title: 'A piscina do clube fechou PARA SEMPRE!!!',
            photo: 'piscina',
            clues: {
                quem: { text: 'Rafa, sócio do clube', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: '"ouvi no vestiário"', ok: false },
            },
            why: 'Tem nome e data, mas a fonte é "ouvi no vestiário".',
        },
        {
            id: 'lua',
            kind: 'imagem',
            from: 'Site da Escola',
            title: 'A lua cheia de ontem, vista do pátio',
            photo: 'lua',
            clues: {
                quem: { text: 'Professora Bia', ok: true },
                quando: { text: 'ontem à noite', ok: true },
                onde: { text: 'foto da professora, na escola', ok: true },
            },
            why: 'Quem tirou, quando e onde: está tudo lá.',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const tag = `N${level.level}`
        if (level.items.length > 5) problems.push(`${tag}: mais de 5 conteúdos`)
        if (level.items.length !== level.course.sections.length)
            problems.push(`${tag}: ${level.items.length} conteúdos para ${level.course.sections.length} trechos`)
        const answers = new Set(level.items.map(trusts))
        if (answers.size < 2) problems.push(`${tag}: todos os conteúdos têm a mesma resposta`)
        if (!level.demos.length) problems.push(`${tag}: sem demonstração`)
        ;[...level.items, ...level.demos.map(d => d.item)].forEach(item => {
            if (item.forwarded && item.kind !== 'alerta') problems.push(`${tag} ${item.id}: só mensagem é encaminhada`)
            if (item.forwarded && trusts(item)) problems.push(`${tag} ${item.id}: encaminhada e confiável`)
            if (level.items.some(i => i !== item && i.title === item.title)) problems.push(`${tag} ${item.id}: manchete repetida`)
        })
        const photos = level.items.filter(item => item.photo).length
        if (photos !== level.level) problems.push(`${tag}: ${photos} fotos, o nível pede ${level.level}`)
        level.items.forEach(item => {
            if ((item.kind === 'imagem') !== (item.photo !== undefined)) problems.push(`${tag} ${item.id}: foto só no conteúdo de imagem`)
            const bad = Object.values(item.clues).filter(c => !c.ok).length
            if (level.bad !== undefined && bad > 0 && bad !== level.bad)
                problems.push(`${tag} ${item.id}: ${bad} pistas ruins, o nível pede ${level.bad}`)
        })
        const start = level.level > 1 ? { y: 0, w: SUMMIT.w } : FRESH
        problems.push(...checkCourse(buildCourse(level.course, level.altitude, start)).map(p => `${tag}: ${p}`))
    })
    const used = levels.flatMap(level => level.items.flatMap(item => (item.photo ? [item.photo] : [])))
    if (new Set(used).size !== used.length) problems.push('foto repetida entre os níveis')
    if (problems.length) throw new Error(`Pula-Pula na Internet — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
