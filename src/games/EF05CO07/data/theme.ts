import type { ProgramId, ResourceState } from '../types'

/** Cores numéricas para objetos Phaser. */
export const C = {
    background: 0x04070d,
    panelDeep: 0x070d16,
    surface: 0x0b1420,
    elevated: 0x112338,
    border: 0x29425e,
    borderSoft: 0x172a3d,
    cyan: 0x39f2ff,
    cyanDeep: 0x087e99,
    violet: 0xa78bfa,
    green: 0x4ade80,
    yellow: 0xfacc15,
    red: 0xff5c7a,
    text: 0xf4fbff,
    textMuted: 0x9fb2c8,
    disabled: 0x526175,
    shadow: 0x010308,
} as const

/** As mesmas cores em CSS, para textos e componentes DOM. */
export const CSS = {
    background: '#04070D',
    panelDeep: '#070D16',
    surface: '#0B1420',
    elevated: '#112338',
    border: '#29425E',
    borderSoft: '#172A3D',
    cyan: '#39F2FF',
    cyanDeep: '#087E99',
    violet: '#A78BFA',
    green: '#4ADE80',
    yellow: '#FACC15',
    red: '#FF5C7A',
    text: '#F4FBFF',
    textMuted: '#9FB2C8',
    disabled: '#526175',
    shadow: '#010308',
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
    panel: 18,
    card: 14,
    button: 16,
    pill: 999,
} as const

export const STROKE = {
    default: 2,
    focus: 4,
    glow: 8,
} as const

export const ALPHA = {
    shadow: 0.58,
    overlay: 0.78,
    muted: 0.64,
    disabled: 0.42,
    backgroundVeil: 0.62,
    glow: 0.16,
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

/** Diferencia os blocos de memória sem depender apenas do ícone. */
export const PROGRAM_COLOR: Record<ProgramId, number> = {
    navegador: C.cyan,
    editor: C.violet,
    jogo: C.green,
    player: C.yellow,
    fotos: C.red,
    impressao: 0x60a5fa,
}
