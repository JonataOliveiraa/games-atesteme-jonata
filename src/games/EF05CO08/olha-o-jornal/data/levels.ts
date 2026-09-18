import type { Clue, LevelDef, Origin, Paper, PhaseDef } from '../types'
import { H, SQUARE } from './layout'

const TODAY = 2026

const paper = (
    id: string,
    name: string,
    headline: string,
    author: string | null,
    year: number,
    origin: Origin,
    originText?: string,
): Paper => ({ id, name, headline, author, year, origin, originText })

export const ORIGIN_TEXT: Record<Exclude<Origin, null>, string> = {
    oficial: 'a prefeitura disse',
    testemunha: 'eu vi acontecer',
    ouviDizer: 'todo mundo comenta',
}

export const originLine = (p: Paper) =>
    p.originText ?? (p.origin ? ORIGIN_TEXT[p.origin] : 'não diz de onde tirou')

/** O peso de uma capa. As três parcelas são as três linhas do cartão. */
export function weight(p: Paper, today: number): number {
    return (
        (p.author ? 2 : 0) +
        (p.year === today ? 2 : 0) +
        (p.origin === 'oficial' ? 3 : p.origin === 'testemunha' ? 2 : 0)
    )
}

/** Qual vale a pena divulgar. Nunca empata com o segundo: validado no import. */
export function stronger(phase: PhaseDef, today: number): number {
    let best = 0
    phase.papers.forEach((p, i) => {
        if (weight(p, today) > weight(phase.papers[best], today)) best = i
    })
    return best
}

/** Por que o escolhido não servia. A plaquinha sai daqui, não de um texto fixo. */
export function weakestLink(p: Paper, today: number): Clue {
    if (!p.author) return 'author'
    if (p.year !== today) return 'year'
    return 'origin'
}

export const WEAK_TEXT: Record<Clue, (p: Paper) => string> = {
    author: () => 'Esse jornal não diz quem escreveu.',
    year: p => `Esse jornal é de ${p.year}. A coisa mudou.`,
    origin: () => 'Esse jornal não diz de onde tirou.',
}

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        clue: 'author',
        backdrop: 'rua',
        today: TODAY,
        phases: [
            {
                id: 'l1f1',
                subject: 'a piscina do bairro',
                papers: [
                    paper('c-piscina', 'Jornal da Cidade', 'A piscina fecha 2 semanas para reforma', 'Marina Alves', TODAY, 'oficial'),
                    paper('t-piscina', 'Tudo Sobre Tudo', 'PISCINA FECHOU PARA SEMPRE!!!', null, TODAY, 'ouviDizer'),
                ],
                groups: [
                    { cx: 620, people: [0, 2] },
                    { cx: 1020, people: [1, 3, 0] },
                ],
            },
            {
                id: 'l1f2',
                subject: 'o lanche da escola',
                papers: [
                    paper('b-lanche', 'Boletim da Escola', 'O lanche novo começa na segunda', 'Diretora Selma', TODAY, 'oficial', 'o cardápio da escola'),
                    paper('z-lanche', 'Zap do Bairro', 'VÃO ACABAR COM O LANCHE!', null, TODAY, 'ouviDizer', 'um amigo mandou'),
                ],
                groups: [
                    { cx: 580, people: [3, 0, 1] },
                    { cx: 1080, people: [2, 1] },
                ],
            },
            {
                id: 'l1f3',
                subject: 'a feira do bairro',
                papers: [
                    paper('r-feira', 'Rádio Prefeitura', 'A feira passa a ser no sábado', 'Equipe da Prefeitura', TODAY, 'oficial', 'o aviso oficial'),
                    paper('g-feira', 'Grita Notícia', 'A FEIRA ACABOU PARA SEMPRE!!!', null, TODAY, 'ouviDizer', 'ouvi dizer na rua'),
                ],
                groups: [
                    { cx: 560, people: [1, 2] },
                    { cx: 850, people: [0, 3, 1] },
                    { cx: 1150, people: [2, 0] },
                ],
            },
        ],
    },
    {
        level: 2,
        clue: 'year',
        hint: 'Agora os três jornais assinam. A diferença está em outra linha.',
        backdrop: 'escola',
        today: TODAY,
        phases: [
            {
                id: 'l2f1',
                subject: 'a quadra da escola',
                papers: [
                    paper('c-quadra-hoje', 'Jornal da Cidade', 'A quadra reabre nesta semana', 'Marina Alves', TODAY, 'oficial'),
                    paper('c-quadra-19', 'Jornal da Cidade', 'A quadra fechou por tempo indeterminado', 'Marina Alves', 2019, 'oficial'),
                    paper('b-quadra-21', 'Boletim da Escola', 'A obra da quadra vai começar', 'Diretora Selma', 2021, 'oficial', 'o plano da escola'),
                ],
                groups: [
                    { cx: 560, people: [2, 0] },
                    { cx: 860, people: [1, 3, 0] },
                    { cx: 1160, people: [0, 1] },
                ],
            },
            {
                id: 'l2f2',
                subject: 'os robôs da escola',
                papers: [
                    paper('g-robos', 'Grita Notícia', 'URGENTE!!! A ESCOLA GANHOU ROBÔS!!!', 'Tino Rocha', TODAY, 'oficial', 'a secretaria informou'),
                    paper('b-robos-19', 'Boletim da Escola', 'Ainda não temos robôs na escola', 'Diretora Selma', 2019, 'oficial', 'o plano da escola'),
                    paper('c-robos-22', 'Jornal da Cidade', 'A escola pediu robôs à secretaria', 'Marina Alves', 2022, 'oficial'),
                ],
                groups: [
                    { cx: 580, people: [0, 1, 2] },
                    { cx: 880, people: [3, 0] },
                    { cx: 1170, people: [1, 2, 3] },
                ],
            },
            {
                id: 'l2f3',
                subject: 'o ônibus 12',
                papers: [
                    paper('r-onibus', 'Rádio Prefeitura', 'O ônibus 12 volta a passar na praça', 'Equipe da Prefeitura', TODAY, 'oficial', 'o aviso oficial'),
                    paper('c-onibus-18', 'Jornal da Cidade', 'O ônibus 12 não passa mais na praça', 'Marina Alves', 2018, 'oficial'),
                    paper('d-onibus-20', 'Diário da Vizinhança', 'Vi o ônibus 12 passar vazio', 'Dona Iara', 2020, 'testemunha'),
                ],
                groups: [
                    { cx: 560, people: [1, 0] },
                    { cx: 850, people: [2, 3, 1] },
                    { cx: 1150, people: [0, 2, 3] },
                ],
            },
        ],
    },
    {
        level: 3,
        clue: 'origin',
        hint: 'Agora os quatro assinam e são de hoje. Sobra uma linha.',
        backdrop: 'praca',
        today: TODAY,
        phases: [
            {
                id: 'l3f1',
                subject: 'a ponte do rio',
                papers: [
                    paper('c-ponte', 'Jornal da Cidade', 'A ponte reabre na sexta', 'Marina Alves', TODAY, 'oficial'),
                    paper('g-ponte', 'Grita Notícia', 'A PONTE NÃO ABRE MAIS!!!', 'Tino Rocha', TODAY, 'ouviDizer'),
                    paper('z-ponte', 'Zap do Bairro', 'A ponte vai cair', 'Beto Lima', TODAY, 'ouviDizer', 'li num grupo'),
                    paper('t-ponte', 'Tudo Sobre Tudo', 'A ponte reabre ano que vem', 'Cris Dantas', TODAY, 'ouviDizer', 'meu primo contou'),
                ],
                groups: [
                    { cx: 600, people: [0, 2] },
                    { cx: 980, people: [1, 3, 0] },
                    { cx: 1760, people: [2, 1] },
                    { cx: 2140, people: [3, 0, 2] },
                ],
            },
            {
                id: 'l3f2',
                subject: 'o desfile da rua',
                papers: [
                    paper('d-desfile', 'Diário da Vizinhança', 'O desfile passou de manhã', 'Dona Iara', TODAY, 'testemunha'),
                    paper('g-desfile', 'Grita Notícia', 'NÃO VAI TER DESFILE!!!', 'Tino Rocha', TODAY, 'ouviDizer'),
                    paper('z-desfile', 'Zap do Bairro', 'O desfile mudou de rua', 'Beto Lima', TODAY, 'ouviDizer', 'um amigo contou'),
                    paper('t-desfile', 'Tudo Sobre Tudo', 'O desfile foi cancelado', 'Cris Dantas', TODAY, 'ouviDizer', 'ouvi na fila'),
                ],
                groups: [
                    { cx: 580, people: [1, 2] },
                    { cx: 960, people: [0, 3] },
                    { cx: 1740, people: [2, 0, 1] },
                    { cx: 2120, people: [3, 1] },
                ],
            },
            {
                id: 'l3f3',
                subject: 'o posto de saúde',
                papers: [
                    paper('c-posto', 'Jornal da Cidade', 'O posto abre aos sábados', 'Marina Alves', TODAY, 'oficial', 'o hospital disse'),
                    paper('d-posto', 'Diário da Vizinhança', 'O posto fecha aos sábados', 'Dona Iara', TODAY, 'ouviDizer', 'um amigo de lá'),
                    paper('g-posto', 'Grita Notícia', 'O POSTO VAI FECHAR!!!', 'Tino Rocha', TODAY, 'ouviDizer'),
                    paper('z-posto', 'Zap do Bairro', 'O posto vai mudar de lugar', 'Beto Lima', TODAY, 'ouviDizer', 'li num grupo'),
                ],
                groups: [
                    { cx: 600, people: [2, 0, 1] },
                    { cx: 1000, people: [3, 1] },
                    { cx: 1780, people: [0, 2] },
                    { cx: 2160, people: [1, 3, 2] },
                ],
            },
        ],
    },
]

export const pointsFor = (phases: number, clean: boolean) =>
    Math.round((clean ? 30 : 15) / phases)

export const groundOf = (frac: number) => Math.round(frac * H)

/**
 * O arco é sempre 40°; o que muda é a força, resolvida para o ponto de mira.
 * É a mesma conta que desenha a linha pontilhada e que move o jornal — assim a
 * mira e o voo não podem discordar.
 */
export function speedFor(targetX: number, muzzleX: number, muzzleY: number, groundY: number): number {
    const dx = Math.max(60, targetX - muzzleX)
    const rad = (SQUARE.angleDeg * Math.PI) / 180
    const denom = dx * Math.tan(rad) + (groundY - muzzleY)
    const v2 = (SQUARE.gravity * dx * dx) / (2 * Math.cos(rad) * Math.cos(rad) * Math.max(1, denom))
    return Math.sqrt(Math.max(1, v2))
}

export function aimSlots(): number[] {
    const out: number[] = []
    for (let x = SQUARE.aimMin; x <= SQUARE.aimMax; x += SQUARE.aimStep) out.push(x)
    return out
}

function fail(msg: string): never {
    throw new Error(`[olha-o-jornal] ${msg}`)
}

const PAPERS_PER_LEVEL: Record<number, number> = { 1: 2, 2: 3, 3: 4 }

function validate() {
    if (LEVELS.length !== 3) fail(`${LEVELS.length} níveis — o catálogo pede 3`)
    LEVELS.forEach(level => {
        if (level.phases.length > 5) fail(`nível ${level.level}: mais de 5 fases`)
        level.phases.forEach(phase => {
            const n = PAPERS_PER_LEVEL[level.level]
            if (phase.papers.length !== n)
                fail(`${phase.id}: ${phase.papers.length} jornais — o nível ${level.level} usa ${n}`)

            const headlines = new Set(phase.papers.map(p => p.headline))
            if (headlines.size !== phase.papers.length)
                fail(`${phase.id}: duas capas dizem a mesma coisa`)

            const sorted = phase.papers
                .map(p => weight(p, level.today))
                .sort((a, b) => b - a)
            if (sorted[0] - sorted[1] < 2)
                fail(`${phase.id}: o primeiro e o segundo colocado quase empatam (${sorted[0]} x ${sorted[1]})`)

            if (level.level > 1 && phase.papers.some(p => !p.author))
                fail(`${phase.id}: sem autor em alguma capa, quem decide volta a ser a pista do nível 1`)
            if (level.level > 2 && phase.papers.some(p => p.year !== level.today))
                fail(`${phase.id}: com uma capa velha, quem decide volta a ser a pista do nível 2`)

            const best = stronger(phase, level.today)
            phase.papers.forEach((p, i) => {
                if (i === best) return
                if (weakestLink(p, level.today) !== level.clue)
                    fail(`${phase.id}: a capa "${p.id}" cai por ${weakestLink(p, level.today)}, não pela pista do nível (${level.clue})`)
            })

            if (phase.groups.length < 2 || phase.groups.length > 4)
                fail(`${phase.id}: ${phase.groups.length} grupos — o teto é 4`)

            /* Todo grupo tem de caber na janela de mira depois de a caminhada
               pô-lo em `walkTo`: é isso que garante que nenhum fica inalcançável. */
            phase.groups.forEach(g => {
                const reach = SQUARE.aimMax - SQUARE.aimMin + 2 * SQUARE.burstR
                if (reach < 2 * SQUARE.burstR) fail('janela de mira menor que o estouro')
                if (g.cx < SQUARE.aimMin - SQUARE.burstR)
                    fail(`${phase.id}: o grupo em ${g.cx} nasce atrás do carteiro`)
            })
        })
    })
}

validate()
