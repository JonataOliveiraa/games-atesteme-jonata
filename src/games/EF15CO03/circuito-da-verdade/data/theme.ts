export const C = {
    sky: 0x0dc0fa,
    skyDeep: 0x0a9ccc,
    night: 0x003f78,
    nightSoft: 0x0a5390,
    nightDeep: 0x002b53,

    cream: 0xfbf49e,
    gold: 0xfdd855,
    goldDark: 0xbeb466,
    goldDeep: 0x8f8749,

    grassDark: 0x2f6a5f,
    grass: 0x669965,

    panel: 0xfbf49e,
    panelSoft: 0xf3ecb4,
    white: 0xffffff,

    ink: 0x003f78,
    inkSoft: 0x2c6394,
    border: 0xbeb466,
    grey: 0x8fa7bd,
    greySoft: 0xd9e6f0,

    on: 0x3fbf7a,
    onSoft: 0xc6ecd4,
    onGlow: 0x8df5b2,
    onDark: 0x2f6a5f,

    off: 0xe8544a,
    offSoft: 0xf7cec9,
    offGlow: 0xff9b92,
    offDark: 0xa8352e,

    rail: 0x0a5390,
    railDark: 0x002b53,
    metal: 0x8fa7bd,
    metalDark: 0x4d6f92,

    shadow: 0x001a33,
} as const

export const A = {
    veil: 0.34,
    shadow: 0.24,
    gloss: 0.28,
    overlay: 0.78,
    railOff: 0.38,
    preview: 0.5,
    glowSoft: 0.3,
    glowStrong: 0.68,
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

export const TEX = {
    bgOff: 'bg-parque-apagado',
    bgOn: 'bg-parque-iluminado',
} as const

export const ATTRACTION = {
    carrossel: {
        id: 'carrossel',
        name: 'carrossel',
        off: 'atracao-carrossel-apagado',
        on: 'atracao-carrossel-aceso',
        portrait: false,
        spin: true,
        bob: false,
        scale: 1,
    },
    roda: {
        id: 'roda',
        name: 'roda-gigante',
        off: 'atracao-roda-apagada',
        on: 'atracao-roda-acesa',
        portrait: true,
        spin: true,
        bob: false,
        scale: 1,
    },
    poste: {
        id: 'poste',
        name: 'poste de luz',
        off: 'poste-desligado',
        on: 'poste-aceso',
        portrait: true,
        spin: false,
        bob: false,
        scale: 0.92,
    },
    queda: {
        id: 'queda',
        name: 'queda-livre',
        off: 'atracao-queda-apagada',
        on: 'atracao-queda-acesa',
        portrait: true,
        spin: false,
        bob: true,
        scale: 0.98,
    },
    montanha: {
        id: 'montanha',
        name: 'montanha-russa',
        off: 'atracao-montanha-apagada',
        on: 'atracao-montanha-acesa',
        portrait: false,
        spin: false,
        bob: false,
        scale: 1.04,
    },
} as const

export const OPERATOR_NAME: Record<'nao' | 'e' | 'ou', string> = {
    nao: 'NÃO',
    e: 'E',
    ou: 'OU',
}

export const OPERATOR_RULE: Record<'nao' | 'e' | 'ou', string> = {
    nao: 'O NÃO troca o sinal: verde vira vermelho e vermelho vira verde.',
    e: 'O E só acende se os dois sinais forem verdes.',
    ou: 'O OU acende se pelo menos um sinal for verde.',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`

export const signalColor = (v: boolean) => (v ? C.on : C.off)
export const signalSoft = (v: boolean) => (v ? C.onSoft : C.offSoft)
export const signalGlow = (v: boolean) => (v ? C.onGlow : C.offGlow)
export const signalDark = (v: boolean) => (v ? C.onDark : C.offDark)
export const signalWord = (v: boolean) => (v ? 'VERDADEIRO' : 'FALSO')
export const signalShort = (v: boolean) => (v ? 'V' : 'F')