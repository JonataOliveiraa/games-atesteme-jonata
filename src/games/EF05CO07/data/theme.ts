import type { ProgramId, ResourceState } from '../types'

/** Numeric colors for Phaser objects. */
export const C = {
    background: 0x17120d,
    panelDeep: 0x231a12,
    surface: 0x34261a,
    elevated: 0x4a3727,
    border: 0x7b5b3f,
    borderSoft: 0x4f3a2a,
    cyan: 0xf6e7cc,
    cyanDeep: 0xb99163,
    violet: 0xc99b65,
    green: 0x85d68b,
    yellow: 0xf4c86a,
    red: 0xe56b5f,
    text: 0xfffbf3,
    textMuted: 0xd6c4aa,
    disabled: 0x746554,
    shadow: 0x080604,
} as const

/** Matching CSS colors for Phaser text and DOM-adjacent helpers. */
export const CSS = {
    background: '#17120D',
    panelDeep: '#231A12',
    surface: '#34261A',
    elevated: '#4A3727',
    border: '#7B5B3F',
    borderSoft: '#4F3A2A',
    cyan: '#F6E7CC',
    cyanDeep: '#B99163',
    violet: '#C99B65',
    green: '#85D68B',
    yellow: '#F4C86A',
    red: '#E56B5F',
    text: '#FFFBF3',
    textMuted: '#D6C4AA',
    disabled: '#746554',
    shadow: '#080604',
} as const

export const FONT = {
    title: '"Baloo 2", "Nunito Sans", Arial, sans-serif',
    body: '"Nunito Sans", Arial, sans-serif',
} as const

export const FONT_SIZE = {
    phaseTitle: 28,
    currentRequest: 24,
    panelTitle: 20,
    card: 20,
    label: 17,
    button: 20,
} as const

export const FONT_WEIGHT = {
    regular: '400',
    semibold: '600',
    bold: '700',
    extraBold: '800',
} as const

export const RADIUS = {
    panel: 22,
    card: 18,
    button: 18,
    pill: 999,
} as const

export const STROKE = {
    default: 2,
    focus: 4,
    glow: 8,
} as const

export const ALPHA = {
    shadow: 0.52,
    overlay: 0.78,
    muted: 0.64,
    disabled: 0.42,
    backgroundVeil: 0.68,
    glow: 0.18,
} as const

export const MOTION = {
    cardTransition: 210,
    entrance: 440,
    entranceStagger: 42,
    tapDown: 70,
    tapReturn: 120,
    feedbackPulse: 240,
    errorShake: 55,
} as const

export type StateShape = 'check' | 'clock' | 'slash'

export interface ResourceStateVisual {
    label: string
    color: number
    cssColor: string
    shape: StateShape
}

export const RESOURCE_STATE_VISUAL: Record<ResourceState, ResourceStateVisual> = {
    livre: {
        label: 'Livre',
        color: C.green,
        cssColor: CSS.green,
        shape: 'check',
    },
    ocupado: {
        label: 'Ocupado',
        color: C.yellow,
        cssColor: CSS.yellow,
        shape: 'clock',
    },
    desligado: {
        label: 'Desligado',
        color: C.disabled,
        cssColor: CSS.disabled,
        shape: 'slash',
    },
}

/** Differentiates memory blocks without relying only on icons. */
export const PROGRAM_COLOR: Record<ProgramId, number> = {
    navegador: 0xf6e7cc,
    editor: C.violet,
    jogo: C.green,
    player: C.yellow,
    fotos: C.red,
    impressao: 0xd7b17a,
}
