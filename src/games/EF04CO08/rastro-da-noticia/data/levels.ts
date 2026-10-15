import type { CaseDef, Copy, LevelDef, Origin, Page, Rule, SiteId } from '../types'
import { SITES } from './sites'

export const POINTS = 10

export const RECENT_DAYS = 7

export const guideKey = (level: number) => `ef04co08-rastro-l${level}`

const N1: LevelDef = {
    level: 1,
    title: 'Quem escreveu?',
    message: 'Toda notícia vem de um site. Antes de acreditar, vá até lá e veja quem escreveu.',
    rule: 'author',
    trail: 0,
    width: 1280,
    zoom: 1,
    viewY: 360,
    start: 90,
    street: [
        { site: 'escola', x: 400 },
        { site: 'perfil', x: 900 },
    ],
    cases: [
        {
            id: 'zoologico',
            ask: 'Passeio no zoológico?! É verdade?',
            phone: { headline: 'Passeio ao zoológico na sexta!', from: 'escola' },
            copies: [],
            origin: { site: 'escola', headline: 'Passeio ao zoológico na sexta!', author: 'Professora Bia' },
            lia: { right: 'Oba! Vou contar pra mamãe!', wrong: 'Não fui... e a turma foi ao zoológico!' },
            why: 'A professora Bia assinou!',
        },
        {
            id: 'sorvete',
            ask: 'Sorvete de graça?! É verdade?',
            phone: { headline: 'SORVETE DE GRAÇA HOJE!!!', from: 'perfil' },
            copies: [],
            origin: { site: 'perfil', headline: 'SORVETE DE GRAÇA HOJE!!!', author: null },
            lia: { right: 'Boato! Não vou espalhar.', wrong: 'Espalhei pra turma toda!' },
            why: 'Ninguém assina essa notícia!',
        },
        {
            id: 'gatinho',
            ask: 'Um gatinho perdido?! É verdade?',
            phone: { headline: 'Gatinho perdido no pátio procura dono.', from: 'escola' },
            copies: [],
            origin: { site: 'escola', headline: 'Gatinho perdido no pátio procura dono.', author: 'Seu Zé, porteiro' },
            lia: { right: 'Vamos ajudar a achar o dono!', wrong: 'Não acreditei... e o gatinho estava lá!' },
            why: 'O porteiro Seu Zé assinou!',
        },
    ],
}

const N2: LevelDef = {
    level: 2,
    title: 'Copiou de quem?',
    message: 'A notícia muda a cada cópia. Siga o "copiou de" até onde ela começou e veja quem escreveu.',
    rule: 'author',
    trail: 1,
    width: 2560,
    zoom: 1,
    viewY: 360,
    start: 90,
    street: [
        { site: 'escola', x: 400 },
        { site: 'canal', x: 1000 },
        { site: 'blog', x: 1600 },
        { site: 'perfil', x: 2200 },
    ],
    cases: [
        {
            id: 'biblioteca',
            ask: 'A biblioteca vai fechar?! É verdade?',
            phone: { headline: 'A biblioteca vai FECHAR PARA SEMPRE!!!', from: 'canal' },
            copies: [{ site: 'canal', headline: 'A biblioteca vai fechar!', from: 'escola' }],
            origin: { site: 'escola', headline: 'Biblioteca fecha 2 semanas para reforma.', author: 'Diretora Rosa' },
            lia: { right: 'Ufa! São só 2 semanas!', wrong: 'Fiquei triste à toa... era só uma reforma!' },
            why: 'A diretora Rosa assinou!',
        },
        {
            id: 'robos',
            ask: 'Robôs na biblioteca?! É verdade?',
            phone: { headline: 'URGENTE!!! ROBÔS NA BIBLIOTECA!!!', from: 'blog' },
            copies: [{ site: 'blog', headline: 'URGENTE!!! Robôs na biblioteca!!', from: 'canal' }],
            origin: { site: 'canal', headline: 'URGENTE! Biblioteca ganha robôs.', author: 'Duda Lima, repórter' },
            lia: { right: 'Robôs de verdade! Vou contar pra turma!', wrong: 'Não acreditei... e os robôs chegaram!' },
            why: 'A repórter Duda Lima assinou!',
        },
        {
            id: 'sem-aula',
            ask: 'Amanhã não tem aula?! É verdade?',
            phone: { headline: 'AMANHÃ NÃO TEM AULA!!!', from: 'blog' },
            copies: [{ site: 'blog', headline: 'Amanhã não tem aula!!', from: 'perfil' }],
            origin: { site: 'perfil', headline: 'Amanhã não tem aula?', author: null },
            lia: { right: 'Boato! Amanhã tem aula, sim.', wrong: 'Fiquei em casa... e teve aula!' },
            why: 'Ninguém assina essa notícia!',
        },
    ],
}

const N3: LevelDef = {
    level: 3,
    title: 'Quem e quando?',
    message: 'Notícia velha volta a circular. Siga o rastro e veja quem escreveu e quando.',
    rule: 'date',
    trail: 2,
    width: 3600,
    zoom: 1,
    viewY: 360,
    start: 90,
    street: [
        { site: 'escola', x: 400 },
        { site: 'blog', x: 960 },
        { site: 'canal', x: 1520 },
        { site: 'jornal', x: 2080 },
        { site: 'grupo', x: 2640 },
        { site: 'perfil', x: 3200 },
    ],
    cases: [
        {
            id: 'parquinho',
            ask: 'Um parquinho gigante?! É verdade?',
            phone: { headline: 'A PRAÇA GANHOU UM PARQUINHO GIGANTE!!!', from: 'grupo' },
            copies: [
                { site: 'grupo', headline: 'A praça ganhou um parquinho GIGANTE!!', from: 'blog' },
                { site: 'blog', headline: 'Praça ganha parquinho novo!', from: 'jornal' },
            ],
            origin: { site: 'jornal', headline: 'Praça ganha parquinho novo.', author: 'Ana Lima, repórter', daysAgo: 1 },
            lia: { right: 'Oba! Vamos brincar lá!', wrong: 'Não acreditei... e a turma brincou sem mim!' },
            why: 'A repórter Ana Lima assinou ontem!',
        },
        {
            id: 'zoologico-velho',
            ask: 'Passeio no zoológico?! É verdade?',
            phone: { headline: 'SEXTA TEM PASSEIO NO ZOOLÓGICO!!!', from: 'canal' },
            copies: [
                { site: 'canal', headline: 'Sexta tem passeio no zoológico!!', from: 'grupo' },
                { site: 'grupo', headline: 'Passeio ao zoológico na sexta!', from: 'escola' },
            ],
            origin: { site: 'escola', headline: 'Passeio ao zoológico na sexta.', author: 'Professora Bia', daysAgo: 730 },
            lia: { right: 'É notícia velha! Não vou espalhar.', wrong: 'Contei pra turma... e não tinha passeio!' },
            why: 'Essa notícia é de 2 anos atrás!',
        },
        {
            id: 'chocolate',
            ask: 'Chocolate faz crescer?! É verdade?',
            phone: { headline: 'CHOCOLATE FAZ CRESCER 10 CM!!!', from: 'blog' },
            copies: [
                { site: 'blog', headline: 'Chocolate faz crescer 10 cm!!', from: 'canal' },
                { site: 'canal', headline: 'Chocolate faz crescer!', from: 'perfil' },
            ],
            origin: { site: 'perfil', headline: 'Chocolate faz crescer.', author: null, daysAgo: 0 },
            lia: { right: 'Boato! Não vou espalhar.', wrong: 'Espalhei pra turma toda!' },
            why: 'Ninguém assina essa notícia!',
        },
    ],
}

export const LEVELS: LevelDef[] = [N1, N2, N3]

export const isOrigin = (page: Page): page is Origin => !('from' in page)

export const pagesOf = (c: CaseDef): Page[] => [...c.copies, c.origin]

export const isRecent = (origin: Origin) => (origin.daysAgo ?? 0) <= RECENT_DAYS

export function whenLabel(days: number): string {
    if (days <= 0) return 'hoje'
    if (days === 1) return 'ontem'
    if (days < 14) return `há ${days} dias`
    if (days < 60) return `há ${Math.floor(days / 7)} semanas`
    if (days < 365) return `há ${Math.floor(days / 30)} meses`
    const years = Math.floor(days / 365)
    return years === 1 ? 'há 1 ano' : `há ${years} anos`
}

export function trusts(origin: Origin, rule: Rule): boolean {
    if (origin.author === null) return false
    if (rule === 'date') return isRecent(origin)
    return true
}

const shout = (text: string) => (text.match(/!/g)?.length ?? 0) + (text.match(/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g)?.length ?? 0)

export function validateLevels(levels: LevelDef[] = LEVELS) {
    const problems: string[] = []
    levels.forEach(level => {
        const placed = new Set(level.street.map(s => s.site))
        if (placed.size !== level.street.length) problems.push(`N${level.level}: site repetido na rua`)
        const xs = level.street.map(s => s.x).sort((a, b) => a - b)
        xs.forEach((x, i) => {
            if (i > 0 && x - xs[i - 1] < 480) problems.push(`N${level.level}: prédios colados em x ${x}`)
        })
        if (xs[0] < 260 || xs[xs.length - 1] > level.width - 260) problems.push(`N${level.level}: prédio fora da rua`)
        if (level.street.some(s => Math.abs(s.x - level.start) < 220)) problems.push(`N${level.level}: o começo está colado num prédio`)
        level.cases.forEach(c => {
            const tag = `N${level.level} ${c.id}`
            const chain: SiteId[] = [...c.copies.map(p => p.site), c.origin.site]
            if (c.copies.length !== level.trail) problems.push(`${tag}: o rastro tem ${c.copies.length} cópias, o nível pede ${level.trail}`)
            if (new Set(chain).size !== chain.length) problems.push(`${tag}: site repetido no rastro`)
            chain.forEach(id => {
                if (!placed.has(id)) problems.push(`${tag}: ${id} não está na rua`)
                if (!SITES[id]) problems.push(`${tag}: ${id} não existe`)
            })
            if (c.phone.from !== chain[0]) problems.push(`${tag}: o celular não aponta a 1ª parada`)
            c.copies.forEach((copy: Copy, i) => {
                if (copy.from !== chain[i + 1]) problems.push(`${tag}: ${copy.site} copia de quem não é a próxima parada`)
            })
            const versions = [c.phone.headline, ...c.copies.map(p => p.headline), c.origin.headline]
            versions.forEach((v, i) => {
                if (i > 0 && shout(v) > shout(versions[i - 1])) problems.push(`${tag}: a notícia não desincha voltando ("${v}")`)
            })
            if (!c.lia.right || !c.lia.wrong || !c.why || !c.ask) problems.push(`${tag}: falta fala`)
            if (c.origin.author === '') problems.push(`${tag}: autor vazio`)
            const dated = c.origin.daysAgo !== undefined
            if (level.rule === 'date' && !dated) problems.push(`${tag}: falta a data no começo`)
            if (level.rule !== 'date' && dated) problems.push(`${tag}: data num nível que não olha data`)
        })
        const verdicts = level.cases.map(c => trusts(c.origin, level.rule))
        if (!verdicts.includes(true) || !verdicts.includes(false)) problems.push(`N${level.level}: só um tipo de desfecho`)
        if (level.rule === 'date' && !level.cases.some(c => c.origin.author !== null && !isRecent(c.origin)))
            problems.push(`N${level.level}: nenhum caso assinado e velho (a data nunca decide)`)
        if (level.rule === 'date' && !level.cases.some(c => c.origin.author === null))
            problems.push(`N${level.level}: nenhum caso sem autor (o nome nunca decide)`)
    })
    if (problems.length) throw new Error(`Rastro da Notícia — níveis inválidos:\n${problems.join('\n')}`)
}

if (import.meta.env.DEV) validateLevels()
