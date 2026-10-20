import type { Cd, LevelDef, PhaseDef, Song } from '../types'
import { OWNERS } from './owners'
import { beatMs, notesOf } from './song'

export const POINTS = 10

export const COVERS = 20

export const guideKey = (level: number) => `ef05co09-radio-l${level}`

const CHUVA: Song = { title: 'Chuva no Telhado', bpm: 96, intro: 4, chart: '1.2.3.4.3.2.1.3.2.3.4.1.', scale: [60, 64, 67, 72], root: 48 }
const VOVO: Song = { title: 'Parabéns, Vovó!', bpm: 96, intro: 4, chart: '1.1.2.1.4.3.', scale: [60, 62, 65, 67], root: 53 }
const GATO: Song = { title: 'Canção do Gato', bpm: 100, intro: 4, chart: '3.2.1.2.3.3.3.', scale: [62, 65, 69, 72], root: 50 }
const BATUQUE: Song = { title: 'Batuque do Recreio', bpm: 100, intro: 4, chart: '1.1.2.3.4.3.2.1.2.23.4.34.2.1.', scale: [57, 60, 64, 69], root: 45 }
const FOGUETE: Song = { title: 'Foguete Dançante', bpm: 104, intro: 4, chart: '4.3.4.2.1.2.4.', scale: [64, 67, 71, 76], root: 52 }
const CORDA: Song = { title: 'Pula-Corda', bpm: 104, intro: 4, chart: '1.2.3.4.43.2.1.12.3.4.3.21.2.3.4.4.', scale: [55, 59, 62, 67], root: 43 }
const SAPO: Song = { title: 'Sapo Cantor', bpm: 96, intro: 4, chart: '1.2.1.2.', scale: [60, 64, 67, 72], root: 48 }
const ASSOBIO: Song = { title: 'Assobio do Zeca', bpm: 96, intro: 4, chart: '1.2.3.4.', scale: [67, 71, 74, 79], root: 43 }

const PIPOCA: Song = {
    title: 'Dança da Pipoca',
    bpm: 100,
    intro: 4,
    chart: '1.3.2.4.3.1.2.3.4.3.2.1.',
    beats: '1.2.1.2.1.2.13.4.1.2.1.2.3.4.',
    scale: [60, 64, 67, 71],
    root: 48,
}
const ROBO: Song = {
    title: 'Robô Dançarino',
    bpm: 104,
    intro: 4,
    chart: '4.4.3.2.1.2.3.4.4.3.2.1.',
    beats: '1.2.1.2.3.3.4.1.2.1.2.3.4.4.',
    scale: [62, 66, 69, 74],
    root: 50,
}
const BICICLETA: Song = {
    title: 'Samba da Bicicleta',
    bpm: 108,
    intro: 5,
    chart: '1.2.3.2.1.2.3.4.3.2.3.4.1.',
    beats: '1.2.12.3.1.2.12.3.1.2.3.4.4.3.2.1.',
    scale: [57, 61, 64, 69],
    root: 45,
}
const TREM: Song = { title: 'Trem da Madrugada', bpm: 96, intro: 4, chart: '1.1.1.2.3.', scale: [55, 58, 62, 67], root: 43 }
const CIRANDA: Song = { title: 'Ciranda do Sol', bpm: 100, intro: 4, chart: '1.2.3.1.2.3.4.3.2.1.2.3.4.4.', scale: [60, 62, 64, 67], root: 48 }
const SKATE: Song = { title: 'Skate no Parque', bpm: 104, intro: 4, chart: '2.4.2.4.1.3.1.3.2.3.4.3.2.1.4.', scale: [57, 60, 64, 67], root: 45 }
const FLORESTA: Song = { title: 'Canto da Floresta', bpm: 108, intro: 5, chart: '1.2.3.4.3.2.1.2.34.3.2.1.2.3.4.4.', scale: [62, 64, 69, 71], root: 50 }
const VALSA: Song = { title: 'Valsa da Bailarina', bpm: 96, intro: 4, chart: '1.2.3.3.2.1.', scale: [64, 67, 71, 76], root: 52 }
const UNICORNIO: Song = { title: 'Arco-Íris Brilhante', bpm: 100, intro: 4, chart: '4.3.2.1.2.3.4.', scale: [65, 69, 72, 77], root: 53 }
const DRAGAO: Song = { title: 'Dragão do Rock', bpm: 104, intro: 4, chart: '1.1.4.4.3.2.1.', scale: [52, 55, 59, 64], root: 40 }
const CASTELO: Song = { title: 'Castelo de Doces', bpm: 108, intro: 5, chart: '3.4.3.2.1.2.3.', scale: [67, 71, 74, 79], root: 55 }

const refuse = (who: string) => `${who} não deixou tocar.`
const noMix = (who: string) => `${who} deixou tocar, mas não deixou misturar.`

const BIA: Cd = {
    id: 'chuva',
    owner: 'bia',
    cover: 0,
    note: 'Pode tocar na rádio! Só fala que é minha.',
    plays: true,
    mixes: false,
    credit: 'música da Bia',
    thanks: 'Tocou! E falou o meu nome!',
    song: CHUVA,
}

const TEO: Cd = {
    id: 'vovo',
    owner: 'teo',
    cover: 1,
    note: 'Fiz só pra minha avó. Não toca na rádio!',
    plays: false,
    mixes: false,
    credit: 'música do Téo',
    complaint: 'Ei! Eu não deixei tocar!',
    refusal: refuse('O Téo'),
    song: VOVO,
}

const MALU: Cd = {
    id: 'gato',
    owner: 'malu',
    cover: 2,
    note: 'Ainda não terminei. Não pode tocar!',
    plays: false,
    mixes: false,
    credit: 'música da Malu',
    complaint: 'Ei! Eu não deixei! Nem terminei!',
    refusal: refuse('A Malu'),
    song: GATO,
}

const CAIO: Cd = {
    id: 'batuque',
    owner: 'caio',
    cover: 3,
    note: 'Gravei pra rádio da escola. Pode tocar!',
    plays: true,
    mixes: false,
    credit: 'música do Caio',
    thanks: 'Meu batuque na rádio! Valeu!',
    song: BATUQUE,
}

const IARA: Cd = {
    id: 'foguete',
    owner: 'iara',
    cover: 4,
    note: 'É segredo da minha banda. Não toca!',
    plays: false,
    mixes: false,
    credit: 'música da Iara',
    complaint: 'Ei! Eu não deixei tocar!',
    refusal: refuse('A Iara'),
    song: FOGUETE,
}

const JUCA: Cd = {
    id: 'corda',
    owner: 'juca',
    cover: 5,
    note: 'Pode tocar! E fala meu nome no ar.',
    plays: true,
    mixes: false,
    credit: 'música do Juca',
    thanks: 'Todo mundo ouviu! Que legal!',
    song: CORDA,
}

const ROSA: Cd = {
    id: 'sapo',
    owner: 'rosa',
    cover: 6,
    note: 'Não toca, é surpresa pra festa!',
    plays: false,
    mixes: false,
    credit: 'música da Rosa',
    complaint: 'Ei! Eu não deixei tocar!',
    refusal: refuse('A Rosa'),
    song: SAPO,
}

const ZECA: Cd = {
    id: 'assobio',
    owner: 'zeca',
    cover: 7,
    note: 'Pode tocar! É pra todo mundo ouvir.',
    plays: true,
    mixes: false,
    credit: 'música do Zeca',
    thanks: 'Oba! Tocou o meu assobio!',
    song: ASSOBIO,
}

const keepAsIs = (cd: Cd, note: string, who: string): Cd => ({
    ...cd,
    note,
    complaint: 'Ei! Eu não deixei mexer!',
    refusal: noMix(who),
})

const LIA: Cd = {
    id: 'pipoca',
    owner: 'lia',
    cover: 8,
    note: 'Pode tocar e pode misturar! Faz um remix!',
    plays: true,
    mixes: true,
    credit: 'música da Lia',
    thanks: 'Que remix legal! Ficou demais!',
    song: PIPOCA,
}

const DAVI: Cd = {
    id: 'robo',
    owner: 'davi',
    cover: 9,
    note: 'Pode misturar à vontade! Só fala que é meu.',
    plays: true,
    mixes: true,
    credit: 'música do Davi',
    thanks: 'Meu robô dançou com a batida!',
    song: ROBO,
}

const NINA: Cd = {
    id: 'bicicleta',
    owner: 'nina',
    cover: 10,
    note: 'Pode tocar e misturar com batida!',
    plays: true,
    mixes: true,
    credit: 'música da Nina',
    thanks: 'Virou samba de verdade!',
    song: BICICLETA,
}

const BETO: Cd = {
    id: 'trem',
    owner: 'beto',
    cover: 11,
    note: 'Não toca! Ainda tô gravando.',
    plays: false,
    mixes: false,
    credit: 'música do Beto',
    complaint: 'Ei! Eu ainda tô gravando!',
    refusal: refuse('O Beto'),
    song: TREM,
}

const GABI: Cd = {
    id: 'ciranda',
    owner: 'gabi',
    cover: 12,
    note: 'Música livre! Todo mundo pode tocar. Só fala que é minha.',
    plays: true,
    mixes: false,
    credit: 'música livre da Gabi',
    thanks: 'Música livre é pra todo mundo!',
    song: CIRANDA,
}

const PEDRO: Cd = {
    id: 'skate',
    owner: 'pedro',
    cover: 13,
    note: 'Pode tocar na rádio! Eu deixo.',
    plays: true,
    mixes: false,
    credit: 'música do Pedro',
    thanks: 'Minha música no ar! Irado!',
    song: SKATE,
}

const KAUA: Cd = {
    id: 'floresta',
    owner: 'kaua',
    cover: 14,
    note: 'É música livre: pode tocar! Só lembra de mim.',
    plays: true,
    mixes: false,
    credit: 'música livre do Kauã',
    thanks: 'A floresta cantou na rádio!',
    song: FLORESTA,
}

const SOFIA: Cd = {
    id: 'valsa',
    owner: 'sofia',
    cover: 15,
    note: 'Não toca! É da minha apresentação.',
    plays: false,
    mixes: false,
    credit: 'música da Sofia',
    complaint: 'Ei! Eu não deixei tocar!',
    refusal: refuse('A Sofia'),
    song: VALSA,
}

const blank = (id: string, cover: number, song: Song): Cd => ({
    id,
    owner: null,
    cover,
    note: null,
    plays: false,
    mixes: false,
    credit: 'música de quem?',
    refusal: 'Esse CD não tinha bilhete. Sem o dono deixar, não toca.',
    song,
})

const UNICORN = blank('unicornio', 16, UNICORNIO)
const DRAGON = blank('dragao', 17, DRAGAO)
const CASTLE = blank('castelo', 18, CASTELO)

export const TUTORIAL: PhaseDef = { approach: 2300, cds: [ROSA, ZECA] }

const N1: LevelDef = {
    level: 1,
    title: 'Quem deixa tocar?',
    message: 'Toda música tem dono, e é o dono quem decide se ela vai ao ar. Quando ele deixa, a rádio toca dizendo o nome dele.',
    ask: 'Qual CD pode tocar na rádio?',
    mode: 'play',
    layout: 'row',
    phases: [
        { approach: 2300, cds: [BIA, TEO] },
        { approach: 2200, cds: [MALU, CAIO] },
        { approach: 2100, cds: [IARA, JUCA] },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'Quem deixa misturar?',
    message: 'Deixar tocar não é deixar mexer. Remix só com a música de quem deixou misturar, e dizendo de quem é a música.',
    ask: 'Qual CD pode MISTURAR?',
    mode: 'remix',
    layout: 'row',
    phases: [
        {
            approach: 2200,
            cds: [keepAsIs(BIA, 'Pode tocar! Mas não mexe na minha música.', 'A Bia'), TEO, LIA, MALU],
        },
        {
            approach: 2100,
            cds: [DAVI, IARA, keepAsIs(CAIO, 'Pode tocar. Misturar, não!', 'O Caio'), ROSA],
        },
        {
            approach: 2000,
            cds: [keepAsIs(JUCA, 'Pode tocar, mas não muda nada!', 'O Juca'), BETO, keepAsIs(ZECA, 'Pode tocar. Mexer, não!', 'O Zeca'), NINA],
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'Sem bilhete, não toca',
    message: 'Sem o dono dizer que pode, a música não toca, por mais bonita que seja. A música livre pode tocar, e o nome de quem fez vai junto.',
    ask: 'Qual CD pode tocar na rádio?',
    mode: 'play',
    layout: 'grid',
    phases: [
        { approach: 2100, cds: [TEO, MALU, UNICORN, GABI, IARA, SOFIA] },
        { approach: 2000, cds: [ROSA, PEDRO, BETO, DRAGON, TEO, MALU] },
        { approach: 1900, cds: [IARA, SOFIA, ROSA, BETO, CASTLE, KAUA] },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export const isRight = (level: LevelDef, cd: Cd) => (level.mode === 'remix' ? cd.mixes : cd.plays)

const CHART = /^[1-4.]+$/

function checkCd(cd: Cd, level: LevelDef, approach: number, tag: string, problems: string[]) {
    const owner = cd.owner ? OWNERS[cd.owner] : null
    if (cd.owner && !owner) problems.push(`${tag}: dono ${cd.owner} não existe`)
    if (cd.cover < 0 || cd.cover >= COVERS) problems.push(`${tag}: capa ${cd.cover} fora das folhas`)
    if (cd.mixes && !cd.plays) problems.push(`${tag}: quem deixa misturar tem de deixar tocar`)
    const right = isRight(level, cd)
    if (!cd.note) {
        if (cd.owner || cd.plays) problems.push(`${tag}: CD sem bilhete não tem dono nem pode tocar`)
        if (level.layout !== 'grid') problems.push(`${tag}: CD sem bilhete só no N3`)
        if (!cd.refusal) problems.push(`${tag}: falta a faixa do erro`)
    } else if (right) {
        if (!/\bPode\b|\bpode\b/.test(cd.note) || /\bNão\b/.test(cd.note)) problems.push(`${tag}: o certo tem de dizer "pode" e nunca "Não"`)
        if (level.mode === 'remix' && !/misturar/.test(cd.note)) problems.push(`${tag}: quem deixa misturar tem de dizer "misturar"`)
        if (!cd.thanks) problems.push(`${tag}: falta o agradecimento`)
    } else {
        if (cd.plays && level.mode !== 'remix') problems.push(`${tag}: no modo tocar, quem deixa tocar é o certo`)
        if (cd.plays && !/\bPode\b/.test(cd.note)) problems.push(`${tag}: quem deixa só tocar diz "Pode"`)
        if (cd.plays && !/\b(não|Não)\b/.test(cd.note)) problems.push(`${tag}: quem não deixa misturar tem de dizer "não"`)
        if (!cd.plays && !/\bNão\b/.test(cd.note)) problems.push(`${tag}: quem não deixa tem de dizer "Não"`)
        if (!cd.complaint || !cd.refusal) problems.push(`${tag}: falta a reclamação ou a faixa do erro`)
        if (owner && cd.refusal && !cd.refusal.includes(owner.name)) problems.push(`${tag}: a faixa do erro não diz o nome do dono`)
    }
    if (owner && !cd.credit.endsWith(owner.name)) problems.push(`${tag}: o crédito não diz o nome do dono`)
    const song = cd.song
    if (!CHART.test(song.chart) || (song.beats && !CHART.test(song.beats))) problems.push(`${tag}: a música só aceita 1–4 e "."`)
    if (song.intro * beatMs(song) < approach) problems.push(`${tag}: a 1ª nota nasce antes da música começar`)
    if (beatMs(song) < 540) problems.push(`${tag}: rápida demais (menos de 540 ms por tempo)`)
    if (!notesOf(song).length) problems.push(`${tag}: música sem nota`)
    if (level.mode === 'remix' && right && !song.beats) problems.push(`${tag}: o remix precisa das batidas`)
}

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    TUTORIAL.cds.forEach((cd, i) => checkCd(cd, levels[0], TUTORIAL.approach, `tutorial ${i}`, problems))
    if (TUTORIAL.cds.filter(cd => cd.plays).length !== 1) problems.push('tutorial: precisa de exatamente 1 CD que deixa')
    levels.forEach(level => {
        const tag0 = `N${level.level}`
        if (level.phases.length !== 3) problems.push(`${tag0}: são 3 fases`)
        const sides = new Set<number>()
        const ids = new Map<string, string>()
        level.phases.forEach((phase, p) => {
            const tag = `${tag0} fase ${p + 1}`
            if (phase.cds.length !== level.level * 2) problems.push(`${tag}: o N${level.level} mostra ${level.level * 2} CDs`)
            const right = phase.cds.filter(cd => isRight(level, cd))
            if (right.length !== 1) problems.push(`${tag}: só 1 CD é o certo`)
            sides.add(phase.cds.findIndex(cd => isRight(level, cd)))
            if (new Set(phase.cds.map(cd => cd.id)).size !== phase.cds.length) problems.push(`${tag}: CD repetido na fase`)
            if (level.mode === 'remix' && !phase.cds.some(cd => cd.plays && !cd.mixes)) problems.push(`${tag}: falta o CD que deixa tocar mas não misturar`)
            if (level.layout === 'grid' && phase.cds.filter(cd => !cd.note).length !== 1) problems.push(`${tag}: a grade tem 1 CD sem bilhete`)
            phase.cds.forEach((cd, i) => {
                checkCd(cd, level, phase.approach, `${tag} CD ${i + 1}`, problems)
                const seen = ids.get(cd.id)
                if (seen !== undefined && seen !== cd.note) problems.push(`${tag} CD ${i + 1}: o mesmo CD mudou de bilhete no nível`)
                ids.set(cd.id, cd.note ?? '')
            })
            const prev = level.phases[p - 1]
            if (prev && phase.approach > prev.approach) problems.push(`${tag}: a queda ficou mais lenta`)
        })
        if (sides.size < 2) problems.push(`${tag0}: o certo está sempre no mesmo lugar`)
    })
    if (problems.length) throw new Error(`Rádio da Escola — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
