import type { ItemDef, LevelDef } from '../types'
import { buildCourse, checkCourse } from './course'

export const POINTS = 10

export const guideKey = (level: number) => `ef05co08-pula-l${level}`

export const trusts = (item: ItemDef) => item.clues.quem.ok && item.clues.quando.ok && item.clues.onde.ok

const N1: LevelDef = {
    level: 1,
    title: 'Confira antes de subir',
    message: 'Quem fez, quando e de onde veio: com as três pistas boas, dá para confiar.',
    bad: 3,
    course: {
        seed: 51,
        sections: [2, 4, 4, 5],
        step: { min: 135, max: 165 },
        width: { min: 210, max: 260 },
        shift: 230,
    },
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
            from: 'Mensagem encaminhada',
            title: 'CHOCOLATE CURA TUDO!!! Mande para todo mundo!',
            clues: {
                quem: { text: 'ninguém assina', ok: false },
                quando: { text: 'não diz', ok: false },
                onde: { text: '"todo mundo está falando"', ok: false },
            },
            why: 'Ninguém assina, não tem data e não diz de onde veio.',
        },
        {
            id: 'arvores',
            kind: 'imagem',
            from: 'Site da Escola',
            title: 'A turma do 5º ano plantou 20 árvores',
            photo: 0,
            clues: {
                quem: { text: 'Professor Rui', ok: true },
                quando: { text: 'ontem', ok: true },
                onde: { text: 'fotos da turma, na escola', ok: true },
            },
            why: 'Quem tirou, quando e onde: está tudo lá.',
        },
        {
            id: 'ferias',
            kind: 'jornal',
            from: 'Blog Fofoca Total',
            title: 'As férias vão durar 3 meses',
            clues: {
                quem: { text: 'não diz quem escreveu', ok: false },
                quando: { text: 'sem data', ok: false },
                onde: { text: '"ouvi dizer"', ok: false },
            },
            why: 'Ninguém assina, não tem data e é só "ouvi dizer".',
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'O grito não decide',
    message: 'Manchete gritada pode ser verdade, e foto de verdade pode ser velha. Quem decide são as três pistas.',
    course: {
        seed: 52,
        sections: [3, 4, 5, 5],
        step: { min: 145, max: 180 },
        width: { min: 190, max: 230 },
        shift: 250,
        move: { range: 70, period: 2600, every: 3 },
    },
    items: [
        {
            id: 'robos',
            kind: 'jornal',
            from: 'Grita Notícia',
            title: 'URGENTE!!! A ESCOLA GANHOU ROBÔS!!!',
            clues: {
                quem: { text: 'Tino Rocha, repórter', ok: true },
                quando: { text: 'hoje', ok: true },
                onde: { text: 'a Secretaria de Educação informou', ok: true },
            },
            why: 'Grita, mas tem quem escreveu, a data e de onde veio.',
        },
        {
            id: 'aula',
            kind: 'alerta',
            from: 'Mensagem encaminhada',
            title: 'Amanhã não vai ter aula. Avise todo mundo.',
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
            photo: 2,
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
    bad: 1,
    course: {
        seed: 53,
        sections: [4, 5, 5, 5],
        step: { min: 150, max: 178 },
        width: { min: 170, max: 210 },
        shift: 270,
        move: { range: 90, period: 2200, every: 2 },
    },
    items: [
        {
            id: 'dormir',
            kind: 'jornal',
            from: 'Site Saber Tudo',
            title: 'Dormir tarde deixa a gente mais inteligente',
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
            photo: 1,
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
            photo: 3,
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
        level.items.forEach(item => {
            if (item.kind === 'imagem' && item.photo === undefined) problems.push(`${tag} ${item.id}: foto sem imagem`)
            const bad = Object.values(item.clues).filter(c => !c.ok).length
            if (level.bad !== undefined && bad > 0 && bad !== level.bad)
                problems.push(`${tag} ${item.id}: ${bad} pistas ruins, o nível pede ${level.bad}`)
        })
        problems.push(...checkCourse(buildCourse(level.course), level.course).map(p => `${tag}: ${p}`))
    })
    if (problems.length) throw new Error(`Pula-Pula na Internet — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
