import type { Edge, LevelDef, Link, PhaseDef, Rider, Station } from '../types'
import { hasEdge, hops, key } from './graph'
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
export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []

    levels.forEach(level =>
        level.phases.forEach(phase => {
            const where = `nível ${level.level}, fase ${phase.id}`
            const byId = new Map(phase.stations.map(s => [s.id, s]))

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

            const seen = new Set<string>()
            phase.links.forEach(l => {
                if (seen.has(key(l.a, l.b))) problems.push(`${where}: ligação repetida`)
                seen.add(key(l.a, l.b))
            })
        }),
    )

    return problems
}

