import { H } from './layout'
import { CAPTION } from './words'

export interface SkyStop {
    at: number
    key: string
    top: number
    bottom: number
}

export const SKIES: SkyStop[] = [
    { at: 0, key: 'ceu-floresta', top: 0x8fd6c4, bottom: 0xe9f7dc },
    { at: 0.55, key: 'ceu-dia', top: 0x5fb6f2, bottom: 0xd2effc },
    { at: 1.3, key: 'ceu-alto', top: 0x2f6bd0, bottom: 0x8cc6f2 },
    { at: 1.62, key: 'ceu-borda', top: 0x1a1c58, bottom: 0x5a6cd0 },
    { at: 1.76, key: 'ceu-espaco', top: 0x0b0a22, bottom: 0x241f58 },
    { at: 2.6, key: 'ceu-nebulosa', top: 0x140a2c, bottom: 0x3b1a5a },
]

export const STARS = { from: 1.5, to: 1.78, parallax: 260 } as const

export type DecorLayer = 'far' | 'mid' | 'near'

export interface Decor {
    key: string
    x: number
    at: number
    k: number
    layer: DecorLayer
    originY?: number
    scale?: number
    flip?: boolean
    alpha?: number
    drift?: number
    fade?: [number, number, number, number]
}

const around = (key: string, x: number, center: number, k: number, layer: DecorLayer): Decor => ({
    key,
    x,
    at: center + H / 2 / k,
    k,
    layer,
    originY: 0.5,
})

const trees = (key: string, xs: number[], at: number, k: number, layer: DecorLayer, scales: number[]): Decor[] =>
    xs.map((x, i) => ({ key, x, at, k, layer, scale: scales[i % scales.length], flip: i % 2 === 1 }))

export const DECOR: Decor[] = [
    { key: 'montanhas', x: 640, at: 1.6, k: 418, layer: 'far', originY: 0, fade: [0.18, 0.4, 9, 9] },
    ...trees('pinheiro-longe', [70, 300, 520, 770, 990, 1210], 0, 1500, 'mid', [1, 0.86, 1.08, 0.92]),
    ...trees('arvore-longe', [190, 650, 1100], 0.01, 1500, 'mid', [0.95, 1.05, 0.9]),
    ...trees('arvore-perto', [96, 1184], -0.01, 2400, 'near', [1]),
    ...trees('pinheiro-perto', [1236, 34], 0, 2400, 'near', [0.9]),

    ...[
        [180, 0.46], [930, 0.55], [520, 0.66], [1120, 0.74], [330, 0.84], [800, 0.95],
        [120, 1.04], [620, 1.12], [1040, 1.22], [300, 1.3], [880, 1.4], [500, 1.5], [1150, 1.58],
    ].map(([x, at], i): Decor => ({
        key: `nuvem-${'abc'[i % 3]}`,
        x,
        at,
        k: 1700,
        layer: 'mid',
        originY: 0.5,
        scale: [1, 0.8, 1.15][i % 3],
        flip: i % 2 === 1,
        alpha: 0.72,
        drift: i % 2 ? 9 : -7,
        fade: [0.3, 0.45, 1.55, 1.7],
    })),
    ...([
        ['passaros', 900, 0.52, 1900, 34],
        ['passaros', 300, 0.8, 1900, 28],
        ['passaros', 1000, 1.06, 1900, 30],
        ['balao', 1080, 1.18, 1500, 6],
        ['aviao', 200, 1.4, 1600, 70],
    ] as const).map(([key, x, c, k, drift], i): Decor => ({ ...around(key, x, c, k, 'mid'), drift, flip: i === 1, fade: [0.3, 0.42, 1.55, 1.66] })),

    { key: 'terra', x: 640, at: 2.3, k: 545, layer: 'far', originY: 0, fade: [1.58, 1.72, 9, 9] },
    ...([
        ['satelite', 1080, 1.88, 1300, 'mid', 10, 1],
        ['planeta-a', 1120, 1.98, 700, 'far', 0, 1],
        ['satelite', 200, 2.2, 1300, 'mid', -8, 0.85],
        ['planeta-anel', 210, 2.3, 800, 'far', 0, 1],
        ['asteroide', 1100, 2.42, 1500, 'mid', 8, 1],
        ['lua', 1070, 2.58, 900, 'far', 0, 1],
        ['asteroide', 180, 2.64, 1500, 'mid', -10, 0.8],
        ['planeta-b', 170, 2.86, 750, 'far', 0, 1],
        ['nebulosa', 640, 2.9, 900, 'far', 0, 1],
        ['asteroide', 1150, 2.86, 1500, 'mid', 7, 1.1],
        ['foguete', 1140, 3.05, 1400, 'mid', 0, 1],
    ] as const).map(([key, x, c, k, layer, drift, scale], i): Decor => ({
        ...around(key, x, c, k, layer),
        drift: drift || undefined,
        scale,
        flip: i % 3 === 2,
        alpha: key === 'nebulosa' ? 0.6 : 1,
        fade: [1.7, 1.8, 9, 9],
    })),
]

export const COMET = { from: 1.82, every: [5200, 8600] as const } as const

export const BANNERS = [
    { at: 0.5, text: CAPTION.sky },
    { at: 1.75, text: CAPTION.space },
] as const

export const NIGHT_TABS = 1.7

export type Ground = 'floresta' | 'nuvem' | 'lua'

export const groundFor = (altitude: number): Ground => (altitude < 1 ? 'floresta' : altitude < 2 ? 'nuvem' : 'lua')
