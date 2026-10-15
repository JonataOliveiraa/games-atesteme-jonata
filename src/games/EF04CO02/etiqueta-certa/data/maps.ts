/**
 * Os pátios de cada nível. Um trilho termina numa chave (que tem uma alavanca e dois trilhos de saída,
 * o de cima primeiro) ou num galpão. O trem entra sempre pelo trilho 0, vindo da esquerda.
 */

export type Point = { x: number; y: number }

export interface TrackDef {
    /** o desenho do trilho, do começo ao fim (curvas já em pontos) */
    points: Point[]
    next: { switch: number } | { shed: number }
}

export interface SwitchDef {
    at: Point
    /** [trilho de cima, trilho de baixo]: a posição 0 da alavanca manda para o de cima */
    outs: [number, number]
    /** o centro da base da alavanca */
    lever: Point
}

export interface MapDef {
    /** a largura do mundo; 1280 = uma tela só, sem arrastar */
    width: number
    tracks: TrackDef[]
    switches: SwitchDef[]
    /** a ordem dos galpões é a ordem das cidades da fase (`Phase.stations`) */
    sheds: Point[]
    shedSize: number
    /** a plaquinha da cidade, em relação ao centro do galpão */
    plaque: { dy: number; w: number; h: number }
    /** onde a frente da locomotiva para, no sinal */
    stopX: number
    signal: Point
    /** a etiqueta grande no canto (N1) ou a faixa comprida no alto (N2/N3) */
    board: 'big' | 'strip'
    /** N3: o posto do carimbo, com o recado preso */
    booth?: Point
    note?: Point
}

/** o trem nasce fora da tela, à esquerda */
export const START_X = -520
/** depois da porta, o trilho segue até sumir debaixo do telhado */
const PAST_SHED = 0.75
/** a porta fica na borda esquerda do galpão (medida da arte, em fração do tamanho) */
export const DOOR_DX = -112 / 240

/** a curva em S de uma pista para outra, com as pontas na horizontal */
function bend(a: Point, b: Point, steps = 40): Point[] {
    const mid = (a.x + b.x) / 2
    const pts: Point[] = []
    for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const u = 1 - t
        const x = u * u * u * a.x + 3 * u * u * t * mid + 3 * u * t * t * mid + t * t * t * b.x
        const y = u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y
        pts.push({ x, y })
    }
    return pts
}

const p = (x: number, y: number): Point => ({ x, y })

/** do ponto `from`, opcionalmente curvando até `bendTo`, depois reto até o galpão (passando dele) */
function toShed(from: Point, shed: Point, size: number, bendTo?: Point): Point[] {
    return [from, ...(bendTo ? bend(from, bendTo) : []), p(shed.x + size * PAST_SHED, shed.y)]
}

function toSwitch(from: Point, at: Point, bendTo?: Point): Point[] {
    return [from, ...(bendTo ? bend(from, bendTo) : []), at]
}

// ───────────────────────────────────────────── N1: uma tela, uma chave, dois galpões

const N1_Y = 570
const N1_FORK = p(700, N1_Y)
const N1_SHEDS = [p(1150, 280), p(1150, N1_Y)]

const N1: MapDef = {
    width: 1280,
    tracks: [
        { points: [p(START_X, N1_Y), N1_FORK], next: { switch: 0 } },
        { points: toShed(N1_FORK, N1_SHEDS[0], 240, p(1020, 280)), next: { shed: 0 } },
        { points: toShed(N1_FORK, N1_SHEDS[1], 240), next: { shed: 1 } },
    ],
    switches: [{ at: N1_FORK, outs: [1, 2], lever: p(760, 695) }],
    sheds: N1_SHEDS,
    shedSize: 240,
    plaque: { dy: -140, w: 190, h: 72 },
    stopX: 640,
    signal: p(668, 492),
    board: 'big',
}

// ───────────────────────────────────────────── N2 e N3: três pistas num pátio largo

/** as três pistas do pátio largo, de cima para baixo; nenhuma alavanca fica embaixo da pista de baixo (passaria por baixo do PARTIR fixo) */
export const LANE = { top: 330, mid: 450, low: 570 } as const
const WIDE_SHED = 180
const WIDE_PLAQUE = { dy: -40, w: 170, h: 64 }
const WIDE_STOP = 560
const WIDE_SIGNAL = p(588, LANE.low - 78)

/** 2 alavancas, 3 galpões, 2 telas */
const N2_SHEDS = [p(2340, LANE.top), p(1980, LANE.mid), p(2340, LANE.low)]
const N2_S1 = p(760, LANE.low)
const N2_S2 = p(1500, LANE.top)

const N2: MapDef = {
    width: 2560,
    tracks: [
        { points: [p(START_X, LANE.low), N2_S1], next: { switch: 0 } },
        // S1 de cima: sobe para a pista de cima até a S2
        { points: toSwitch(N2_S1, N2_S2, p(1080, LANE.top)), next: { switch: 1 } },
        // S1 de baixo: reto até o galpão de baixo
        { points: toShed(N2_S1, N2_SHEDS[2], WIDE_SHED), next: { shed: 2 } },
        // S2 de cima: reto até o galpão de cima
        { points: toShed(N2_S2, N2_SHEDS[0], WIDE_SHED), next: { shed: 0 } },
        // S2 de baixo: desce para a pista do meio
        { points: toShed(N2_S2, N2_SHEDS[1], WIDE_SHED, p(1740, LANE.mid)), next: { shed: 1 } },
    ],
    switches: [
        { at: N2_S1, outs: [1, 2], lever: p(690, 470) },
        { at: N2_S2, outs: [3, 4], lever: p(1440, 470) },
    ],
    sheds: N2_SHEDS,
    shedSize: WIDE_SHED,
    plaque: WIDE_PLAQUE,
    stopX: WIDE_STOP,
    signal: WIDE_SIGNAL,
    board: 'strip',
}

/** 3 alavancas, 4 galpões, 2,5 telas; o recado fica no posto do carimbo, perto do sinal */
const N3_SHEDS = [p(2950, LANE.top), p(2050, LANE.mid), p(2750, LANE.mid), p(3050, LANE.low)]
const N3_S1 = p(760, LANE.low)
const N3_S2 = p(1400, LANE.mid)
const N3_S3 = p(2300, LANE.low)

const N3: MapDef = {
    width: 3200,
    tracks: [
        { points: [p(START_X, LANE.low), N3_S1], next: { switch: 0 } },
        // S1 de cima: sobe para a pista do meio até a S2
        { points: toSwitch(N3_S1, N3_S2, p(1000, LANE.mid)), next: { switch: 1 } },
        // S1 de baixo: reto até a S3
        { points: toSwitch(N3_S1, N3_S3), next: { switch: 2 } },
        // S2 de cima: sobe para a pista de cima
        { points: toShed(N3_S2, N3_SHEDS[0], WIDE_SHED, p(1640, LANE.top)), next: { shed: 0 } },
        // S2 de baixo: reto na pista do meio
        { points: toShed(N3_S2, N3_SHEDS[1], WIDE_SHED), next: { shed: 1 } },
        // S3 de cima: sobe para a pista do meio
        { points: toShed(N3_S3, N3_SHEDS[2], WIDE_SHED, p(2540, LANE.mid)), next: { shed: 2 } },
        // S3 de baixo: reto
        { points: toShed(N3_S3, N3_SHEDS[3], WIDE_SHED), next: { shed: 3 } },
    ],
    switches: [
        { at: N3_S1, outs: [1, 2], lever: p(690, 470) },
        { at: N3_S2, outs: [3, 4], lever: p(1340, 365) },
        { at: N3_S3, outs: [5, 6], lever: p(2240, 480) },
    ],
    sheds: N3_SHEDS,
    shedSize: WIDE_SHED,
    plaque: WIDE_PLAQUE,
    stopX: WIDE_STOP,
    signal: WIDE_SIGNAL,
    board: 'strip',
    booth: p(130, 430),
    note: p(370, 372),
}

export const MAPS: MapDef[] = [N1, N2, N3]

/** o galpão aonde as alavancas levam, e os trilhos do caminho */
export function follow(map: MapDef, states: number[]): { shed: number; tracks: number[] } {
    const tracks: number[] = []
    let t = 0
    for (let guard = 0; guard < 32; guard++) {
        tracks.push(t)
        const next = map.tracks[t].next
        if ('shed' in next) return { shed: next.shed, tracks }
        const sw = map.switches[next.switch]
        t = sw.outs[states[next.switch] ?? 0]
    }
    return { shed: -1, tracks }
}

/** todas as combinações de alavancas */
export function allStates(map: MapDef): number[][] {
    const n = map.switches.length
    return Array.from({ length: 1 << n }, (_, k) => Array.from({ length: n }, (_, i) => (k >> i) & 1))
}

/** a combinação mais parecida com `from` que leva ao galpão */
export function statesFor(map: MapDef, shed: number, from: number[]): number[] {
    const options = allStates(map).filter(s => follow(map, s).shed === shed)
    const diff = (s: number[]) => s.reduce((n, v, i) => n + (v !== from[i] ? 1 : 0), 0)
    return options.sort((a, b) => diff(a) - diff(b))[0] ?? from
}

export const doorDx = (map: MapDef) => DOOR_DX * map.shedSize
