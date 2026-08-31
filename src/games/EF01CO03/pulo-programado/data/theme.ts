export const C = {
    ink: 0x1b2333,
    inkSoft: 0x4a5a70,
    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xe0c391,
    white: 0xffffff,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,
    warn: 0xffc42e,
    warnDark: 0xd99400,
    cyan: 0x5ed2e8,
    cyanDark: 0x2a94ad,

    coral: 0xff8a7a,
    coralDark: 0xd9503f,
    teal: 0x5fd6c9,
    tealDark: 0x2f9c92,
    grape: 0xb79bf0,

    /**
     * O CHÃO. Estas seis cores sao a paleta do cenario, e o buraco e feito
     * com elas em Graphics — nao e mais um PNG embutido num chao desenhado.
     * Era essa costura que aparecia: duas terras diferentes encostando.
     */
    outline: 0x101931,
    grassLight: 0xa3db6a,
    grass: 0x7dc754,
    grassDark: 0x64ac4f,
    dirt: 0xbc7038,
    dirtDark: 0x93522d,
    stone: 0x9aa7b4,
    stoneDark: 0x6d7a86,
}

export const CSS = {
    ink: '#1b2333',
    inkSoft: '#4a5a70',
    cream: '#fff6e4',
    white: '#ffffff',
    ok: '#2b8a44',
    okBright: '#8bf0a4',
    bad: '#c03b30',
    warn: '#d99400',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    hudLevel: '19px',
    hudPhase: '14px',
    hudClock: '22px',
    card: '26px',
    go: '38px',
    balloon: '30px',
    banner: '46px',
    float: '34px',
    help: '34px',
}

/** Uma cor por ação. Ela vale na carta, no quadrado da trilha e no brilho. */
export const ACTION_COLOR: Record<string, { main: number; dark: number }> = {
    pular: { main: 0x5ed2e8, dark: 0x2a94ad },
    abaixar: { main: 0xb79bf0, dark: 0x7a4fd0 },
    andar: { main: 0x8fd66a, dark: 0x4e9a2f },
}

export const ACTION_LABEL: Record<string, string> = {
    pular: 'PULAR',
    abaixar: 'ABAIXAR',
    andar: 'ANDAR',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
