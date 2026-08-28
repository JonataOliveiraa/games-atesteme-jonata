import type { Biome, ColorName } from '../types'

export const C = {
    ink: 0x1b2a3a,
    inkSoft: 0x51687e,
    cream: 0xfff4de,
    creamEdge: 0xe6d2ae,
    white: 0xffffff,
    night: 0x11202e,

    ok: 0x3fbf5f,
    okDark: 0x27823f,
    bad: 0xe24940,
    badDark: 0x9e2b25,
    warn: 0xffb020,
    warnDark: 0xc07b00,
    info: 0x2e9bf0,

    steel: 0x7f93a6,
    bolt: 0xc3d0da,
    tire: 0x2a3440,
}

export const CSS = {
    ink: '#1b2a3a',
    inkSoft: '#51687e',
    cream: '#fff4de',
    white: '#ffffff',
    ok: '#2c8f47',
    okBright: '#5fe07f',
    bad: '#e24940',
    warn: '#c07b00',
    info: '#2e9bf0',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    hudLevel: '20px',
    verb: '26px',
    verbSmall: '21px',
    ruleWord: '32px',
    score: '30px',
    stretch: '19px',
    copilot: '20px',
    float: '34px',
    banner: '38px',
}

/** Tinta de cada cor nomeada. Só o pictograma da placa usa isto. */
export const SWATCH: Record<ColorName, { main: number; dark: number; light: number }> = {
    vermelho: { main: 0xe63a34, dark: 0x9c211d, light: 0xff9086 },
    azul: { main: 0x2e9bf0, dark: 0x1663a8, light: 0x9fd8ff },
    amarelo: { main: 0xffc42e, dark: 0xbf8600, light: 0xffe89a },
    roxo: { main: 0xa855f7, dark: 0x6b21a8, light: 0xdcb6ff },
    verde: { main: 0x4ec44e, dark: 0x2b7a2b, light: 0xaeeaa0 },
    laranja: { main: 0xff8a1f, dark: 0xbf5a00, light: 0xffc78a },
}

export type FleckKind = 'none' | 'snow' | 'leaf'

export interface BiomePalette {
    groundA: number
    groundB: number
    verge: number
    road: number
    roadPatch: number
    shoulder: number
    dash: number
    edgeLine: number
    plant: number
    plantLight: number
    plantDark: number
    trunk: number
    ornament: number
    fleck: number[]
    fleckKind: FleckKind
    fleckCount: number
    cloud: number
    cloudAlpha: number
    cloudCount: number
    /** Véu por cima do mundo inteiro: é ele que faz o cenário virar fundo. */
    veil: number
    veilAlpha: number
}

/**
 * Um bioma por nível. A moldura, as faixas e as regras não mudam — só a
 * estação. Trocar de cenário ENTRE níveis marca a virada de etapa; trocar no
 * meio de um nível confundiria.
 */
export const BIOME: Record<Biome, BiomePalette> = {
    forest: {
        groundA: 0x63b552,
        groundB: 0x52a344,
        verge: 0x81cc6b,
        road: 0x6d7280,
        roadPatch: 0x62666f,
        shoulder: 0xa7b0ba,
        dash: 0xfff3c9,
        edgeLine: 0xf6f9fc,
        plant: 0x2f8f45,
        plantLight: 0x6fce6a,
        plantDark: 0x1e6631,
        trunk: 0x7a4a26,
        ornament: 0xff7ab8,
        fleck: [],
        fleckKind: 'none',
        fleckCount: 0,
        cloud: 0xffffff,
        cloudAlpha: 0.16,
        cloudCount: 3,
        veil: 0x0a2a1a,
        veilAlpha: 0.06,
    },
    snow: {
        groundA: 0xeef6ff,
        groundB: 0xdbe9f7,
        verge: 0xffffff,
        road: 0x5b6470,
        roadPatch: 0x93a6b6,
        shoulder: 0xd6e5f2,
        dash: 0xffd75e,
        edgeLine: 0xffffff,
        plant: 0x2b6b4a,
        plantLight: 0x3f8f63,
        plantDark: 0x1a4632,
        trunk: 0x5b3a22,
        ornament: 0xbfe4ff,
        fleck: [0xffffff, 0xeaf4ff, 0xd8ecff],
        fleckKind: 'snow',
        fleckCount: 54,
        cloud: 0xcfdcea,
        cloudAlpha: 0.4,
        cloudCount: 3,
        veil: 0x1b3a5c,
        veilAlpha: 0.08,
    },
    autumn: {
        groundA: 0xc98f45,
        groundB: 0xb87c36,
        verge: 0xdcae5e,
        road: 0x6a6a6d,
        roadPatch: 0x5b5b5f,
        shoulder: 0xa89a86,
        dash: 0xffe9b0,
        edgeLine: 0xf2ece0,
        plant: 0xd9622b,
        plantLight: 0xf2a03c,
        plantDark: 0x8f3b18,
        trunk: 0x6b4326,
        ornament: 0xffd166,
        fleck: [0xe2622c, 0xf0a63a, 0xc23f22, 0xffd166],
        fleckKind: 'leaf',
        fleckCount: 34,
        // outono não tem nuvem: as folhas já ocupam o ar
        cloud: 0xf1e4d0,
        cloudAlpha: 0,
        cloudCount: 0,
        veil: 0x5c2a0a,
        veilAlpha: 0.07,
    },
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
