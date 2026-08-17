import type { ProgramId, ResourceState } from '../types'

/** Numeric colors for Phaser objects. */
export const C = {
    background: 0x081321,
    panelDeep: 0x0d1b2e,
    surface: 0x142840,
    elevated: 0x1e3a5c,
    border: 0x3d6690,
    borderSoft: 0x28415f,
    cyan: 0x7dd3fc,
    cyanDeep: 0x3b82f6,
    violet: 0x8b5cf6,
    green: 0x85d68b,
    yellow: 0xf4c86a,
    red: 0xe56b5f,
    text: 0xf2f6fc,
    textMuted: 0x9fb3cc,
    disabled: 0x4c5f7a,
    shadow: 0x030810,
} as const

/** Matching CSS colors for Phaser text and DOM-adjacent helpers. */
export const CSS = {
    background: '#081321',
    panelDeep: '#0D1B2E',
    surface: '#142840',
    elevated: '#1E3A5C',
    border: '#3D6690',
    borderSoft: '#28415F',
    cyan: '#7DD3FC',
    cyanDeep: '#3B82F6',
    violet: '#8B5CF6',
    green: '#85D68B',
    yellow: '#F4C86A',
    red: '#E56B5F',
    text: '#F2F6FC',
    textMuted: '#9FB3CC',
    disabled: '#4C5F7A',
    shadow: '#030810',
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
    navegador: C.cyan,
    editor: C.violet,
    jogo: C.green,
    player: C.yellow,
    fotos: C.red,
    impressao: 0xf59e0b,
}
