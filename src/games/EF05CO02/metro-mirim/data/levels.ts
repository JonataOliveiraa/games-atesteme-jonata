import type { Edge, LevelDef, Link, PhaseDef, Rider, Station } from '../types'
import { hasEdge, hops, key, pathOf } from './graph'
import { STATION, TRAY } from './layout'

/* ─────────────────────────── o veredito, em função ────────────────────── */

/**
 * O passageiro chegou?
 *
 * Duas condições, e nenhuma delas consultada num gabarito: existe caminho, e
 * (quando ele tem pressa) o caminho cabe no número de trilhos que ele aguenta.
 */
export const served = (rider: Rider, edges: Edge[]) => {
    const d = hops(edges, rider.from, rider.to)
    return d !== null && (rider.rush === undefined || d <= rider.rush)
}

export const stuck = (phase: PhaseDef, edges: Edge[]) =>
    phase.riders.filter(rider => !served(rider, edges))

/**
 * O TRILHO MAIS USADO da rede que a criança montou.
 *
 * A obra cai onde o movimento é maior — não num trilho escolhido a dedo no
 * arquivo de dados. É por isso que ela dói: some justamente o que estava
 * segurando a cidade, e sempre num lugar diferente conforme a rede que ela
 * projetou.
 *
 * Empate vai para o primeiro construído, que é o mais antigo — e ficar velho
 * é um bom motivo para uma obra.
 */
export function busiestEdge(phase: PhaseDef, edges: Edge[]): Edge | null {
    const traffic = new Map<string, number>()
    phase.riders.forEach(rider => {
        const path = pathOf(edges, rider.from, rider.to)
        if (!path) return
        for (let i = 0; i + 1 < path.length; i++) {
            const k = key(path[i], path[i + 1])
            traffic.set(k, (traffic.get(k) ?? 0) + 1)
        }
    })

    /*
     * A CIDADE NÃO FECHA A ÚNICA ENTRADA DE UM LUGAR.
     *
     * Se o trilho mais movimentado for o único que a cidade permite até uma
     * estação, fechá-lo não é uma obra: é apagar aquela estação do mapa, e
     * nenhuma peça reconecta o que não tem por onde. A obra procura o mais
     * movimentado ENTRE os que deixam conserto possível.
     */
    const closable = (edge: Edge) =>
        phase.stations.every(station => {
            if (station.id !== edge.a && station.id !== edge.b) return true
            return phase.links.some(
                l =>
                    (l.a === station.id || l.b === station.id)
                    && key(l.a, l.b) !== key(edge.a, edge.b),
            )
        })

    const open = edges.filter(closable)
    if (!open.length) return null

    let best: Edge | null = null
    let most = 0
    open.forEach(edge => {
        const n = traffic.get(key(edge.a, edge.b)) ?? 0
        if (n > most) {
            most = n
            best = edge
        }
    })
    return most > 0 ? best : open[0]
}

/**
 * A FASE DEPOIS DO SEGUNDO ATO.
 *
 * A mesma função serve a cena e a validação: a cena precisa da fase viva para
 * continuar jogando, e a validação precisa dela para afirmar que o conserto é
 * possível. Duas contas diferentes para a mesma coisa é como um nível passa a
 * ser jogável na conferência e impossível na tela.
 */
export function afterTwist(phase: PhaseDef, edges: Edge[]): { phase: PhaseDef; edges: Edge[] } {
    const twist = phase.twist
    if (!twist) return { phase, edges }

    if (twist.kind === 'chegada') {
        return {
            phase: {
                ...phase,
                stations: [...phase.stations, twist.station],
                links: [...phase.links, ...twist.links],
                riders: [...phase.riders, ...twist.riders],
                tray: twist.tray,
                twist: undefined,
            },
            edges,
        }
    }

    // A obra TIRA o trilho: ele sai da rede montada e some da lista de
    // ligações possíveis — não dá para simplesmente reconstruir o que fechou.
    const gone = busiestEdge(phase, edges)
    const closed = gone ? [{ a: gone.a, b: gone.b }] : []
    const isClosed = (a: string, b: string) => closed.some(c => key(c.a, c.b) === key(a, b))
    return {
        phase: {
            ...phase,
            links: phase.links.filter(l => !isClosed(l.a, l.b)),
            closed,
            tray: twist.tray,
            twist: undefined,
        },
        edges: edges.filter(e => !isClosed(e.a, e.b)),
    }
}

export const solved = (phase: PhaseDef, edges: Edge[]) => stuck(phase, edges).length === 0

/** PARTIR só é resposta quando a criança gastou o que tinha para gastar. */
export const canDepart = (tray: number) => tray === 0

export const pointsFor = (locked: boolean) => (locked ? 5 : 10)

/**
 * A dica do segundo erro: a ligação possível que sozinha faz mais gente chegar.
 *
 * Ela é CALCULADA em cima da rede que está na tela — uma dica guardada na fase
 * mentiria assim que a criança montasse uma rede parcial diferente da prevista.
 */
export function hintLink(phase: PhaseDef, edges: Edge[]): Link | null {
    const now = stuck(phase, edges).length
    let best: Link | null = null
    let bestLeft = now

    for (const link of phase.links) {
        if (hasEdge(edges, link.a, link.b)) continue
        const left = stuck(phase, [...edges, { a: link.a, b: link.b }]).length
        if (left < bestLeft) {
            bestLeft = left
            best = link
        }
    }
    return best
}

/* ────────────────────────────── os níveis ─────────────────────────────── */

const PLACE = {
    escola: { label: 'Escola', dative: 'à Escola', art: 0 },
    praca: { label: 'Praça', dative: 'à Praça', art: 1 },
    mercado: { label: 'Mercado', dative: 'ao Mercado', art: 2 },
    biblioteca: { label: 'Biblioteca', dative: 'à Biblioteca', art: 3 },
    estadio: { label: 'Estádio', dative: 'ao Estádio', art: 4 },
    hospital: { label: 'Hospital', dative: 'ao Hospital', art: 5 },
    casa: { label: 'Casa', dative: 'em Casa', art: 6 },
    central: { label: 'Estação', dative: 'à Estação', art: 7 },
} as const

const at = (
    base: { label: string; dative: string; art: number },
    id: string,
    x: number,
    y: number,
): Station => ({ id, label: base.label, dative: base.dative, art: base.art, x, y })

const WHO = {
    teo: { art: 0, name: 'Téo' },
    bia: { art: 1, name: 'Bia' },
    rafa: { art: 2, name: 'Rafa' },
    duda: { art: 3, name: 'Duda' },
} as const

const rider = (
    who: keyof typeof WHO,
    from: string,
    to: string,
    line: string,
    rush?: number,
): Rider => ({
    id: who,
    art: WHO[who].art,
    name: WHO[who].name,
    from,
    to,
    line,
    ...(rush === undefined ? {} : { rush }),
})

const link = (a: string, b: string): Link => ({ a, b })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Todo mundo chega',
        goal: 'Ligue as estações até todo mundo chegar',
        closing: 'Você montou uma rede: pontos ligados por linhas.',
        phases: [
            {
                /**
                 * A introdução. Duas ligações possíveis, duas peças: não há o
                 * que errar — o que a fase ensina é o gesto e a ideia de que dá
                 * para chegar PASSANDO por outra estação.
                 *
                 * O mapa é o menor dos três (1700 × 820): quase cabe na janela,
                 * então a criança descobre que ele anda sem precisar disso para
                 * resolver a fase.
                 */
                id: '1.1',
                world: { w: 1700, h: 820 },
                stations: [
                    at(PLACE.escola, 'escola', 330, 300),
                    at(PLACE.praca, 'praca', 860, 630),
                    at(PLACE.mercado, 'mercado', 1390, 300),
                ],
                links: [link('escola', 'praca'), link('praca', 'mercado')],
                tray: 2,
                riders: [
                    rider('teo', 'escola', 'mercado', 'Preciso ir ao mercado comprar o lanche da festa!'),
                ],
            },
            {
                /**
                 * A primeira decisão: quatro ligações possíveis, três peças.
                 * Gastar uma em Casa–Mercado ainda vence (vira corrente), mas
                 * gastar as três no triângulo deixa a Escola fora da rede.
                 */
                id: '1.2',
                world: { w: 1980, h: 940 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 310),
                    at(PLACE.mercado, 'mercado', 330, 740),
                    at(PLACE.praca, 'praca', 1000, 500),
                    at(PLACE.escola, 'escola', 1660, 310),
                ],
                links: [
                    link('casa', 'praca'),
                    link('praca', 'escola'),
                    link('praca', 'mercado'),
                    link('casa', 'mercado'),
                ],
                tray: 3,
                riders: [
                    rider('bia', 'casa', 'escola', 'Quero chegar na escola a tempo do ensaio.'),
                    rider('teo', 'mercado', 'escola', 'Eu também vou pra escola, levar o lanche!'),
                ],
            },
            {
                /**
                 * O Hospital é ponta: uma única ligação possível. Esquecer dele
                 * é o erro que a fase quer que aconteça — e a Duda é quem vai
                 * dizer que ficou sem caminho.
                 */
                id: '1.3',
                world: { w: 2280, h: 1040 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 320),
                    at(PLACE.mercado, 'mercado', 330, 800),
                    at(PLACE.praca, 'praca', 1000, 650),
                    at(PLACE.escola, 'escola', 1580, 330),
                    at(PLACE.hospital, 'hospital', 2020, 720),
                ],
                links: [
                    link('casa', 'mercado'),
                    link('casa', 'praca'),
                    link('mercado', 'praca'),
                    link('praca', 'escola'),
                    link('escola', 'hospital'),
                ],
                tray: 4,
                riders: [
                    rider('duda', 'casa', 'hospital', 'Vou levar um desenho pro meu primo no hospital.'),
                    rider('teo', 'mercado', 'escola', 'Tenho treino na escola hoje!'),
                    rider('bia', 'praca', 'casa', 'Já brinquei bastante, agora quero ir pra casa.'),
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 2 — QUEM TEM PRESSA
     * ══════════════════════════════════════════════════════════════════════
     *
     * No nível 1 bastava EXISTIR caminho. Aqui alguns passageiros têm
     * pontinhos no balão: eles aguentam um número de trilhos, e não mais que
     * isso. Ligar tudo em corrente continua conectando todo mundo — e passa a
     * não bastar, porque a corrente é longa. É aí que a FORMA da rede começa
     * a importar, e não só se ela é inteira.
     *
     * A fase 2.2 estreia o segundo ato: depois que o primeiro trem chega, a
     * biblioteca abre com duas pessoas querendo ir até lá, e vem UMA peça
     * para ligá-la. A cidade não espera a rede ficar pronta.
     */
    {
        level: 2,
        title: 'Quem tem pressa',
        goal: 'Ligue tudo — e curto para quem tem pressa',
        closing: 'Numa rede não basta chegar: às vezes importa por quantas linhas.',
        phases: [
            {
                /*
                 * A estreia dos pontinhos. Ligar tudo em corrente ainda
                 * conecta a cidade inteira, e deixa a Bia com quatro trilhos
                 * pela frente — que é um a mais do que ela aguenta.
                 */
                id: '2.1',
                world: { w: 2280, h: 1040 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 320),
                    at(PLACE.mercado, 'mercado', 330, 800),
                    at(PLACE.praca, 'praca', 1000, 560),
                    at(PLACE.escola, 'escola', 1620, 320),
                    at(PLACE.estadio, 'estadio', 1900, 800),
                ],
                links: [
                    link('casa', 'mercado'),
                    link('casa', 'praca'),
                    link('mercado', 'praca'),
                    link('praca', 'escola'),
                    link('praca', 'estadio'),
                    link('escola', 'estadio'),
                ],
                tray: 4,
                riders: [
                    rider('teo', 'casa', 'escola', 'Vou pra escola, sem pressa nenhuma.'),
                    rider('bia', 'mercado', 'estadio', 'O jogo já vai começar! Me leva rápido!', 3),
                    rider('duda', 'praca', 'casa', 'Tá na hora do meu lanche.'),
                ],
            },
            {
                /*
                 * O segundo ato estreia aqui. A rede que resolve o primeiro
                 * ato não é necessariamente a que aguenta o segundo: quem
                 * gastar as quatro peças longe do mercado vai ter de ligar a
                 * biblioteca com a única peça que sobra.
                 */
                id: '2.2',
                world: { w: 2280, h: 1040 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 320),
                    at(PLACE.escola, 'escola', 330, 800),
                    at(PLACE.praca, 'praca', 1000, 560),
                    at(PLACE.mercado, 'mercado', 1660, 320),
                    at(PLACE.estadio, 'estadio', 1660, 820),
                ],
                links: [
                    link('casa', 'escola'),
                    link('casa', 'praca'),
                    link('escola', 'praca'),
                    link('praca', 'mercado'),
                    link('praca', 'estadio'),
                    link('mercado', 'estadio'),
                ],
                tray: 4,
                riders: [
                    rider('teo', 'casa', 'estadio', 'Tenho treino no estádio hoje.'),
                    rider('bia', 'escola', 'mercado', 'Preciso comprar o lanche antes da aula!', 3),
                ],
                twist: {
                    kind: 'chegada',
                    station: at(PLACE.biblioteca, 'biblioteca', 2020, 560),
                    links: [link('biblioteca', 'mercado'), link('biblioteca', 'estadio')],
                    tray: 1,
                    riders: [
                        rider('duda', 'casa', 'biblioteca', 'Abriu biblioteca! Quero pegar um livro.'),
                        rider('rafa', 'escola', 'biblioteca', 'Eu também vou! Tenho que devolver o meu.'),
                    ],
                },
            },
            {
                /*
                 * Seis estações e dois apressados que puxam para lados
                 * diferentes: a praça vira o centro, e é quase sempre por ela
                 * que os dois caminhos curtos passam.
                 */
                id: '2.3',
                world: { w: 2500, h: 1100 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 330),
                    at(PLACE.mercado, 'mercado', 330, 830),
                    at(PLACE.praca, 'praca', 1000, 580),
                    at(PLACE.escola, 'escola', 1620, 330),
                    at(PLACE.estadio, 'estadio', 1620, 830),
                    at(PLACE.hospital, 'hospital', 2200, 580),
                ],
                links: [
                    link('casa', 'mercado'),
                    link('casa', 'praca'),
                    link('mercado', 'praca'),
                    link('praca', 'escola'),
                    link('praca', 'estadio'),
                    link('escola', 'estadio'),
                    link('escola', 'hospital'),
                    link('estadio', 'hospital'),
                ],
                tray: 5,
                riders: [
                    rider('duda', 'casa', 'hospital', 'Vou visitar minha avó no hospital.'),
                    rider('bia', 'mercado', 'escola', 'Vou levar o lanche pra sala, rapidinho!', 3),
                    rider('teo', 'praca', 'estadio', 'O treino começa em dois minutos!', 2),
                ],
            },
        ],
    },

    /*
     * ══════════════════════════════════════════════════════════════════════
     *  NÍVEL 3 — A REDE SE CONSERTA
     * ══════════════════════════════════════════════════════════════════════
     *
     * A pergunta do nível é "e se cortar?". Depois que o primeiro trem chega,
     * a obra fecha o TRILHO MAIS USADO da rede que a criança montou — não um
     * trilho escolhido aqui no arquivo. Quem ligou tudo numa corrente perde o
     * meio dela e fica com a cidade partida em duas; quem deixou um desvio
     * perde pouco.
     *
     * A peça do conserto é UMA. É o que transforma "reconectar" numa escolha
     * em vez de uma reconstrução: existe mais de um jeito de fechar o buraco,
     * e nem todos servem para quem tem pressa.
     */
    {
        level: 3,
        title: 'A rede se conserta',
        goal: 'Monte a rede — e conserte quando a obra fechar',
        closing: 'Rede boa não é só a que liga tudo: é a que aguenta perder uma linha.',
        phases: [
            {
                id: '3.1',
                world: { w: 2500, h: 1100 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 330),
                    at(PLACE.mercado, 'mercado', 330, 830),
                    at(PLACE.praca, 'praca', 1000, 580),
                    at(PLACE.escola, 'escola', 1620, 330),
                    at(PLACE.estadio, 'estadio', 1620, 830),
                    at(PLACE.hospital, 'hospital', 2200, 580),
                ],
                links: [
                    link('casa', 'mercado'),
                    link('casa', 'praca'),
                    link('mercado', 'praca'),
                    link('praca', 'escola'),
                    link('praca', 'estadio'),
                    link('escola', 'estadio'),
                    link('escola', 'hospital'),
                    link('estadio', 'hospital'),
                ],
                tray: 5,
                riders: [
                    rider('teo', 'casa', 'hospital', 'Vou levar um desenho pro meu primo.'),
                    rider('bia', 'mercado', 'escola', 'Tô atrasada pra aula!', 4),
                    rider('duda', 'praca', 'estadio', 'Vou ver o jogo com o meu pai.'),
                ],
                twist: { kind: 'obra', tray: 2 },
            },
            {
                id: '3.2',
                world: { w: 2760, h: 1160 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 350),
                    at(PLACE.mercado, 'mercado', 330, 870),
                    at(PLACE.praca, 'praca', 980, 610),
                    at(PLACE.central, 'central', 1640, 350),
                    at(PLACE.escola, 'escola', 1640, 870),
                    at(PLACE.estadio, 'estadio', 2300, 350),
                    at(PLACE.hospital, 'hospital', 2300, 870),
                ],
                links: [
                    link('casa', 'mercado'),
                    link('casa', 'praca'),
                    link('mercado', 'praca'),
                    link('praca', 'central'),
                    link('praca', 'escola'),
                    link('central', 'escola'),
                    link('central', 'estadio'),
                    link('escola', 'hospital'),
                    link('estadio', 'hospital'),
                ],
                tray: 6,
                riders: [
                    rider('duda', 'casa', 'estadio', 'Vou pro jogo com a minha turma.'),
                    rider('bia', 'mercado', 'escola', 'Preciso entregar o trabalho!', 4),
                    rider('teo', 'praca', 'hospital', 'Vou buscar um remédio pra vovó.', 4),
                ],
                twist: { kind: 'obra', tray: 2 },
            },
            {
                id: '3.3',
                world: { w: 2760, h: 1160 },
                stations: [
                    at(PLACE.casa, 'casa', 330, 350),
                    at(PLACE.escola, 'escola', 330, 870),
                    at(PLACE.praca, 'praca', 980, 610),
                    at(PLACE.mercado, 'mercado', 1640, 350),
                    at(PLACE.central, 'central', 1640, 870),
                    at(PLACE.biblioteca, 'biblioteca', 2300, 350),
                    at(PLACE.hospital, 'hospital', 2300, 870),
                ],
                links: [
                    link('casa', 'escola'),
                    link('casa', 'praca'),
                    link('escola', 'praca'),
                    link('praca', 'mercado'),
                    link('praca', 'central'),
                    link('mercado', 'central'),
                    link('mercado', 'biblioteca'),
                    link('central', 'hospital'),
                    link('biblioteca', 'hospital'),
                ],
                tray: 6,
                riders: [
                    rider('teo', 'casa', 'biblioteca', 'Quero pegar um livro de dinossauro.'),
                    rider('bia', 'escola', 'hospital', 'Vou visitar a minha tia depois da aula.', 5),
                    rider('duda', 'praca', 'mercado', 'Vou comprar pão antes de voltar.', 3),
                ],
                twist: { kind: 'obra', tray: 2 },
            },
        ],
    },
]

/* ──────────────────────────── validação de carga ──────────────────────── */

/** O espaço que o passageiro ocupa à esquerda da estação. */
const RIDER_ROOM = 220

function combos<T>(items: T[], k: number): T[][] {
    if (k === 0) return [[]]
    if (items.length < k) return []
    const [head, ...rest] = items
    return [...combos(rest, k - 1).map(c => [head, ...c]), ...combos(rest, k)]
}

const distToSegment = (p: Station, a: Station, b: Station) => {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = dx * dx + dy * dy
    const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len))
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy))
}

/**
 * O que derruba uma fase antes de a criança ver: mapa impossível, mapa sem
 * decisão, estação em cima de outra ou trilho passando por dentro de uma
 * terceira. Roda uma vez, no `create`.
 */
/** As redes de `tray` peças que atendem todo mundo desta fase. */
const winningSets = (phase: PhaseDef, from: Edge[] = []): Edge[][] => {
    const open = phase.links.filter(l => !hasEdge(from, l.a, l.b))
    return combos(open, phase.tray)
        .map(set => [...from, ...set.map(l => ({ a: l.a, b: l.b }))])
        .filter(edges => solved(phase, edges))
}

/**
 * A CHECAGEM DO SEGUNDO ATO.
 *
 * O ato 2 não pode ser impossível a partir de NENHUMA rede que o ato 1
 * aceitou — e isso não é óbvio: a obra cai no trilho mais usado da rede que a
 * criança montou, então cada rede vencedora do ato 1 abre uma fase diferente
 * no ato 2. Aqui todas elas são jogadas.
 */
function checkTwist(phase: PhaseDef, where: string, problems: string[]) {
    if (!phase.twist) return

    const firstActWins = winningSets(phase)
    if (!firstActWins.length) return

    let dead = 0
    let broke = 0
    firstActWins.forEach(edges => {
        const act2 = afterTwist(phase, edges)
        if (!solved(act2.phase, act2.edges)) broke += 1
        if (!winningSets(act2.phase, act2.edges).length) dead += 1
    })

    if (dead) {
        problems.push(`${where}: ${dead} de ${firstActWins.length} redes do ato 1 não têm conserto`)
    }
    if (phase.twist.kind === 'obra' && !broke) {
        problems.push(`${where}: a obra nunca quebra nada — o ato 2 não pede conserto`)
    }
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level =>
        level.phases.forEach(phase => {
            const where = `nível ${level.level}, fase ${phase.id}`
            const byId = new Map(phase.stations.map(s => [s.id, s]))

            if (phase.twist?.kind === 'chegada') {
                const t = phase.twist
                if (byId.has(t.station.id)) problems.push(`${where}: a estação que chega já está no mapa`)
                if (phase.riders.length + t.riders.length > 4)
                    problems.push(`${where}: mais de 4 passageiros depois da chegada`)
                const ids = new Set([...phase.riders, ...t.riders].map(r => r.id))
                if (ids.size !== phase.riders.length + t.riders.length)
                    problems.push(`${where}: dois passageiros com o mesmo id`)
                if (t.links.every(l => l.a !== t.station.id && l.b !== t.station.id))
                    problems.push(`${where}: a estação que chega não se liga a nada`)
            }

            if (phase.tray !== phase.stations.length - 1)
                problems.push(`${where}: a bandeja tem ${phase.tray} peças para ${phase.stations.length} estações`)
            if (phase.tray > Math.floor((TRAY.w - (TRAY.x0 - TRAY.x)) / TRAY.pitch) + 1)
                problems.push(`${where}: ${phase.tray} peças não cabem na bandeja`)
            if (phase.riders.length > 4) problems.push(`${where}: mais de 4 passageiros`)

            phase.links.forEach(l => {
                if (!byId.has(l.a) || !byId.has(l.b)) problems.push(`${where}: ligação com estação que não existe`)
            })
            phase.riders.forEach(r => {
                if (!byId.has(r.from) || !byId.has(r.to)) problems.push(`${where}: passageiro sem estação`)
            })

            const linked = new Set(phase.links.flatMap(l => [l.a, l.b]))
            const margin = STATION.r + RIDER_ROOM
            phase.stations.forEach(s => {
                if (!linked.has(s.id)) problems.push(`${where}: ${s.label} não tem ligação possível`)
                if (s.x - margin < 0 || s.x + STATION.r + 40 > phase.world.w)
                    problems.push(`${where}: ${s.label} sai do mapa na horizontal`)
                if (s.y - STATION.r - 120 < 0 || s.y + STATION.labelDy + 30 > phase.world.h)
                    problems.push(`${where}: ${s.label} sai do mapa na vertical`)
            })

            phase.stations.forEach((s, i) =>
                phase.stations.slice(i + 1).forEach(other => {
                    if (Math.hypot(s.x - other.x, s.y - other.y) < 380)
                        problems.push(`${where}: ${s.label} e ${other.label} estão perto demais`)
                }),
            )

            phase.links.forEach(l => {
                const a = byId.get(l.a)
                const b = byId.get(l.b)
                if (!a || !b) return
                phase.stations.forEach(s => {
                    if (s.id === l.a || s.id === l.b) return
                    if (distToSegment(s, a, b) < 150)
                        problems.push(`${where}: o trilho ${a.label}–${b.label} passa por dentro de ${s.label}`)
                })
            })

            const sets = combos(phase.links, phase.tray)
            const wins = sets.filter(set => solved(phase, set.map(l => ({ a: l.a, b: l.b }))))
            if (!wins.length) problems.push(`${where}: nenhuma rede possível atende todo mundo`)
            if (sets.length > 1 && wins.length === sets.length)
                problems.push(`${where}: qualquer rede vence — a fase não tem decisão`)

            checkTwist(phase, where, problems)

            // A estação que chega precisa caber no mapa e longe das outras,
            // igual às que já estavam: ela é desenhada na mesma cidade.
            if (phase.twist?.kind === 'chegada') {
                const s = phase.twist.station
                const margin = STATION.r + RIDER_ROOM
                if (s.x - margin < 0 || s.x + STATION.r + 40 > phase.world.w)
                    problems.push(`${where}: ${s.label} (que chega) sai do mapa na horizontal`)
                if (s.y - STATION.r - 120 < 0 || s.y + STATION.labelDy + 30 > phase.world.h)
                    problems.push(`${where}: ${s.label} (que chega) sai do mapa na vertical`)
                phase.stations.forEach(other => {
                    if (Math.hypot(s.x - other.x, s.y - other.y) < 380)
                        problems.push(`${where}: ${s.label} (que chega) fica perto demais de ${other.label}`)
                })
                phase.twist.links.forEach(l => {
                    const all = [...phase.stations, s]
                    const a = all.find(x => x.id === l.a)
                    const b = all.find(x => x.id === l.b)
                    if (!a || !b) {
                        problems.push(`${where}: ligação da chegada com estação que não existe`)
                        return
                    }
                    all.forEach(x => {
                        if (x.id === l.a || x.id === l.b) return
                        if (distToSegment(x, a, b) < 150)
                            problems.push(`${where}: o trilho ${a.label}–${b.label} passa por dentro de ${x.label}`)
                    })
                })
            }

            const seen = new Set<string>()
            phase.links.forEach(l => {
                if (seen.has(key(l.a, l.b))) problems.push(`${where}: ligação repetida`)
                seen.add(key(l.a, l.b))
            })
        }),
    )

    return problems
}

