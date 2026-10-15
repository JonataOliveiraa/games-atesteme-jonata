import type { FindDef, LevelDef, MapDef, PhaseDef, Request, Spot, Vec } from '../types'
import { PLACE } from './files'
import { answers, FIND, matches } from './finds'
import { AIR, DEEP, SHALLOW, SUB } from './layout'
import { distances, MAPS } from './maps'

export const POINTS_SCORE = 10
export const MAX_CHIPS = 6
export const MAX_SPOTS = 12
export const SPOT_LIFT = 60

export const guideKey = (level: number) => `ef03co07-mergulho-l${level}`

const PLACE_ORDER = [PLACE.wreck, PLACE.reef, PLACE.chest, PLACE.cave, PLACE.shell, PLACE.rock, PLACE.amphora, PLACE.lighthouse, PLACE.reef]

const sea = (map: MapDef, ids: string[], order: number[], shift = 0): Spot[] =>
    ids.map((find, i) => {
        const slot = map.slots[order[i]]
        return { find, place: PLACE_ORDER[(i + shift) % PLACE_ORDER.length], x: slot.x, y: slot.y }
    })

const phase = (
    map: MapDef,
    client: number,
    ask: string,
    requests: Request[],
    chips: string[],
    ids: string[],
    order: number[],
    shift = 0,
): PhaseDef => ({ map, client, ask, requests, chips, spots: sea(map, ids, order, shift) })

export const LEVELS: LevelDef[] = [
    {
        level: 1,
        title: 'Palavra certa',
        message: 'Uma palavra acende muita coisa. Junte o tipo e acende só o que foi pedido!',
        world: SHALLOW,
        single: false,
        drain: 2.2,
        phases: [
            phase(
                MAPS.jardim,
                0,
                'Preciso de uma FOTO de tucano!',
                [{ topic: 'tucano', kind: 'foto' }],
                ['tucano', 'foto', 'desenho', 'pelúcia'],
                ['foto-tucano', 'desenho-tucano', 'pelucia-tucano', 'chinelo-tucano', 'foto-vulcao', 'texto-baleia', 'boia-baleia', 'maquete-vulcao', 'foto-baleia'],
                [3, 0, 2, 7, 4, 8, 1, 11, 9],
            ),
            phase(
                MAPS.cavernas,
                1,
                'Quero um VÍDEO de vulcão!',
                [{ topic: 'vulcão', kind: 'vídeo' }],
                ['vulcão', 'vídeo', 'foto', 'maquete'],
                ['video-vulcao-erupcao', 'foto-vulcao', 'maquete-vulcao', 'desenho-vulcao', 'texto-vulcao', 'foto-tucano-voando', 'pelucia-tucano', 'video-baleia-pulando', 'texto-baleia'],
                [6, 1, 8, 4, 2, 9, 0, 10, 7],
                3,
            ),
            phase(
                MAPS.desfiladeiro,
                2,
                'Me traz um TEXTO sobre baleia?',
                [{ topic: 'baleia', kind: 'texto' }],
                ['baleia', 'texto', 'foto', 'boia'],
                ['texto-baleia', 'foto-baleia', 'foto-baleia-pulando', 'boia-baleia', 'desenho-baleia', 'video-baleia-pulando', 'texto-vulcao', 'foto-tucano', 'chinelo-tucano'],
                [4, 2, 8, 6, 0, 9, 1, 11, 3],
                5,
            ),
        ],
    },
    {
        level: 2,
        title: 'Uma palavra só',
        message: 'Com uma palavra só, escolha a que acende menos e confira cada achado!',
        world: DEEP,
        single: true,
        drain: 1.6,
        phases: [
            phase(
                MAPS.abismo,
                0,
                'Quero um VÍDEO de tucano!',
                [{ topic: 'tucano', kind: 'vídeo' }],
                ['tucano', 'vídeo', 'foto', 'desenho'],
                ['video-tucano', 'video-vulcao-erupcao', 'foto-tucano', 'foto-tucano-voando', 'desenho-tucano', 'pelucia-tucano', 'foto-baleia', 'texto-vulcao', 'boia-baleia'],
                [5, 9, 1, 4, 7, 2, 0, 10, 3],
                1,
            ),
            phase(
                MAPS.degraus,
                1,
                'Quero um DESENHO de vulcão!',
                [{ topic: 'vulcão', kind: 'desenho' }],
                ['vulcão', 'desenho', 'vídeo', 'texto'],
                ['desenho-vulcao', 'desenho-baleia', 'foto-vulcao', 'video-vulcao-parado', 'texto-vulcao', 'maquete-vulcao', 'pelucia-tucano', 'foto-baleia-pulando', 'chinelo-tucano'],
                [4, 8, 1, 6, 2, 3, 0, 10, 11],
                4,
            ),
            phase(
                MAPS.fendas,
                2,
                'Me traz uma FOTO de baleia?',
                [{ topic: 'baleia', kind: 'foto' }],
                ['baleia', 'foto', 'texto', 'boia'],
                ['foto-baleia', 'foto-vulcao', 'texto-baleia', 'video-baleia-pulando', 'boia-baleia', 'desenho-baleia', 'desenho-tucano', 'maquete-vulcao', 'video-tucano'],
                [6, 3, 0, 9, 1, 4, 8, 2, 11],
                7,
            ),
        ],
    },
    {
        level: 3,
        title: 'Dois achados',
        message: 'Uma busca para cada achado. Pegue os dois e leve ao cliente!',
        world: DEEP,
        single: false,
        drain: 1.4,
        phases: [
            phase(
                MAPS.serpente,
                0,
                'Quero uma FOTO e um VÍDEO de tucano!',
                [
                    { topic: 'tucano', kind: 'foto' },
                    { topic: 'tucano', kind: 'vídeo' },
                ],
                ['tucano', 'foto', 'vídeo', 'desenho', 'texto'],
                ['foto-tucano', 'video-tucano', 'desenho-tucano', 'texto-tucano', 'pelucia-tucano', 'foto-vulcao', 'video-baleia-pulando', 'chinelo-tucano', 'foto-baleia'],
                [5, 8, 3, 1, 6, 0, 9, 10, 4],
                2,
            ),
            phase(
                MAPS.colunas,
                1,
                'Quero um TEXTO e uma MAQUETE de vulcão!',
                [
                    { topic: 'vulcão', kind: 'texto' },
                    { topic: 'vulcão', kind: 'maquete' },
                ],
                ['vulcão', 'texto', 'maquete', 'foto', 'desenho'],
                ['texto-vulcao', 'maquete-vulcao', 'foto-vulcao', 'desenho-vulcao', 'video-vulcao-parado', 'texto-baleia', 'pelucia-tucano', 'desenho-baleia', 'texto-tucano'],
                [4, 9, 1, 3, 6, 2, 8, 0, 11],
                6,
            ),
            phase(
                MAPS.grutas,
                2,
                'Quero um DESENHO e uma BOIA de baleia!',
                [
                    { topic: 'baleia', kind: 'desenho' },
                    { topic: 'baleia', kind: 'boia' },
                ],
                ['baleia', 'desenho', 'boia', 'foto', 'texto'],
                ['desenho-baleia', 'boia-baleia', 'foto-baleia', 'texto-baleia', 'video-baleia-pulando', 'desenho-tucano', 'desenho-vulcao', 'foto-tucano', 'texto-baleia-filhote'],
                [5, 7, 1, 3, 10, 2, 6, 0, 11],
                8,
            ),
        ],
    },
]

export const spotCenter = (s: { x: number; y: number }): Vec => ({ x: s.x, y: s.y - SPOT_LIFT })

export function tripLength(map: MapDef, stops: Vec[]): number {
    const reach = SUB.touch - 8
    const home = distances(map, SUB.start)
    if (stops.length === 1) return home.at(stops[0], reach) * 2
    const [a, b] = stops
    const between = distances(map, a).at(b, reach)
    return Math.min(home.at(a, reach), home.at(b, reach)) + between + Math.max(home.at(a, reach), home.at(b, reach))
}

export function validateLevels(levels: LevelDef[]): string[] {
    const problems: string[] = []
    levels.forEach((level, index) => {
        const tag = `N${level.level}`
        if (level.level !== index + 1) problems.push(`${tag}: fora de ordem`)
        level.phases.forEach((phase, p) => {
            const at = `${tag}/fase ${p + 1}`
            if (phase.map.w !== level.world.w || phase.map.h !== level.world.h) problems.push(`${at}: o mapa não tem o tamanho do nível`)
            const finds = phase.spots.map(s => FIND[s.find])
            if (finds.some(f => !f)) problems.push(`${at}: achado inexistente`)
            if (phase.chips.length > MAX_CHIPS) problems.push(`${at}: ${phase.chips.length} fichas`)
            if (phase.spots.length > MAX_SPOTS) problems.push(`${at}: ${phase.spots.length} lugares`)
            if (new Set(phase.spots.map(s => `${s.x},${s.y}`)).size !== phase.spots.length) problems.push(`${at}: dois achados no mesmo lugar`)
            const lit = (words: string[]) => finds.filter(f => matches(f, words))
            const targets: FindDef[] = []
            phase.requests.forEach((request, r) => {
                const good = finds.filter(f => f && answers(f, request))
                if (good.length !== 1) problems.push(`${at}: ${good.length} achados atendem o pedido ${r + 1}`)
                const target = good[0]
                if (!target) return
                targets.push(target)
                const right = phase.chips.filter(c => target.words.includes(c))
                if (level.single) {
                    const counts = right.map(c => lit([c]).length).sort((x, y) => x - y)
                    if (counts.length < 2) problems.push(`${at}: falta ficha certa`)
                    else {
                        if (counts[0] < 2 || counts[0] > 3) problems.push(`${at}: a melhor ficha acende ${counts[0]} (quero 2 ou 3)`)
                        if (counts[1] < counts[0] + 2) problems.push(`${at}: as duas fichas certas acendem quase igual (${counts.join(', ')})`)
                    }
                    return
                }
                const exact = lit(right)
                if (exact.length !== 1 || exact[0] !== target) problems.push(`${at}: as fichas certas acendem ${exact.length}`)
                if (lit([request.topic]).length < 3) problems.push(`${at}: o assunto sozinho acende pouco`)
                phase.chips
                    .filter(c => !right.includes(c))
                    .forEach(c => {
                        if (lit([...right, c]).includes(target)) problems.push(`${at}: a ficha ${c} não atrapalha`)
                    })
            })
            if (new Set(targets).size !== targets.length) problems.push(`${at}: o mesmo achado atende dois pedidos`)
            const stops = targets.map(t => spotCenter(phase.spots.find(s => s.find === t.id)!))
            stops.forEach((s, i) => {
                const dist = Math.hypot(s.x - SUB.start.x, s.y - SUB.start.y)
                if (dist < 1400) problems.push(`${at}: o achado ${i + 1} está perto demais do cais (${Math.round(dist)})`)
            })
            if (stops.length) {
                const need = (tripLength(phase.map, stops) / SUB.speed) * level.drain
                if (!(need <= AIR.max * 0.9)) problems.push(`${at}: ar apertado para ida e volta (${Math.round(need)})`)
            }
        })
    })
    return problems
}

if (import.meta.env?.DEV) {
    const problems = validateLevels(LEVELS)
    if (problems.length) console.error('[mergulho-da-pesquisa]', problems)
}
