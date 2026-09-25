/**
 * A paleta da festa.
 *
 * A noite é azul, não preta: o fundo entregue já traz a luz quente das barracas,
 * e o jogo só escurece o que precisa. As três cores de canal aparecem em dois
 * lugares — no rótulo da torneira e na luz que ela acende — e são a MESMA
 * constante, porque uma cor de rótulo diferente da cor da luz seria mentira.
 */
export const C = {
    ink: 0x20283a,
    white: 0xffffff,

    skyHigh: 0x111a2e,
    skyLow: 0x28375a,
    roof: 0x3d4a63,
    wood: 0x8a5f3c,
    woodDeep: 0x5c3d24,
    brass: 0xc89b4b,
    brassDeep: 0x8a6a2e,
    bulb: 0xd8dee4,
    warm: 0xf6c66b,
    crowd: 0x1a2234,

    /** Os três canais. Cor de rótulo e cor de luz, numa fonte só. */
    r: 0xe5584f,
    g: 0x4eaa78,
    b: 0x4b8fe0,

    ok: 0x4eaa78,
    trava: 0xe59a52,
} as const

export const CSS = {
    ink: '#20283a',
    white: '#ffffff',
    paper: '#f6e7c8',
    wood: '#5c3d24',
    dim: '#8f9bb0',
    r: '#e5584f',
    g: '#4eaa78',
    b: '#4b8fe0',
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

export const CHANNEL_COLOR = { r: C.r, g: C.g, b: C.b } as const
