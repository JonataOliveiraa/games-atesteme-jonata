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

    /** O time e o robô, tirados da própria arte. */
    shirt: 0x3fa9f5,
    shirtDark: 0x1d7cc4,
    stripe: 0xffc42e,
    robot: 0xb9c4ce,
    robotGlass: 0x5ed2e8,

    /** A quadra. Verde de campo, linhas brancas, e um verde mais escuro nas listras. */
    field: 0x6fbf5a,
    fieldDark: 0x5aa848,
    fieldLine: 0xf4fff0,
    fieldEdge: 0x3f7a34,

    /** Uma cor por linguagem: ela vale na plaquinha, no painel e no mural. */
    desenho: 0xffa94d,
    desenhoDark: 0xd4761f,
    fala: 0x5ed2e8,
    falaDark: 0x2a94ad,
    palavra: 0xb79bf0,
    palavraDark: 0x7a4fd0,
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
    header: '22px',
    word: '30px',
    balloon: '29px',
    banner: '44px',
    float: '34px',
    help: '34px',
}

export const LANGUAGE_COLOR: Record<string, { main: number; dark: number }> = {
    desenho: { main: C.desenho, dark: C.desenhoDark },
    fala: { main: C.fala, dark: C.falaDark },
    palavra: { main: C.palavra, dark: C.palavraDark },
}

/** Como cada linguagem se chama para a criança, no mural e no painel. */
export const LANGUAGE_LABEL: Record<string, string> = {
    desenho: 'desenho',
    fala: 'fala',
    palavra: 'palavra',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
