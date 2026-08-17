import type { SwatchId } from '../types'

export const C = {
    cream: 0xf9eff2,
    lilac: 0xb8a2d9,
    lilacSoft: 0xbaa9dd,
    butter: 0xfbe9ac,
    panel: 0xffffff,
    panelSoft: 0xfdf7f9,
    border: 0xd9cbe9,
    stroke: 0x8a72b5,
    ink: 0x4a3a63,
    inkSoft: 0x7a6a93,
    good: 0x6fae8b,
    goodSoft: 0xe4f2eb,
    warn: 0xe0a05c,
    warnSoft: 0xfbe9ac,
    grey: 0xc4bad2,
    greySoft: 0xefe9f4,
    white: 0xffffff,
    shadow: 0x4a3a63,
    night: 0x3a2c50,
    nightSoft: 0x5c4a7d,
}

export const A = {
    veil: 0.42,
    shadow: 0.14,
    gloss: 0.34,
    overlay: 0.5,
    dim: 0.42,
    locked: 0.3,

}

export const SWATCH: Record<SwatchId, number> = {
    lilas: 0xb8a2d9,
    creme: 0xfbe9ac,
    rosa: 0xf2c6d4,
    uva: 0x8a72b5,
    areia: 0xe4d3b8,
}

export const SWATCH_NAME: Record<SwatchId, string> = {
    lilas: 'lilás',
    creme: 'amarelo',
    rosa: 'rosa',
    uva: 'roxo',
    areia: 'areia',
}

export const hex = (n: number) => '#' + n.toString(16).padStart(6, '0')