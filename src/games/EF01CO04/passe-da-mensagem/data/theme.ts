export const C = {
    ink: 0x1b2333,
    inkSoft: 0x4a5a70,
    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xdcc199,
    white: 0xffffff,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,
    warn: 0xffc42e,
    warnDark: 0xd99400,

    blue: 0x3fa9f5,
    blueDark: 0x1d7cc4,

    /** A sala: parede clara, chão de madeira, tapete. */
    wall: 0xbfe3f5,
    wallDeep: 0x9ecfe8,
    floor: 0xe8b980,
    floorDark: 0xcf9c62,
    floorLine: 0xb98a55,

    /** Uma cor por linguagem — vale na carta, na mesa e no selo. */
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
    bad: '#c03b30',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const LANGUAGE_COLOR: Record<string, { main: number; dark: number }> = {
    desenho: { main: C.desenho, dark: C.desenhoDark },
    fala: { main: C.fala, dark: C.falaDark },
    palavra: { main: C.palavra, dark: C.palavraDark },
}

/** Como a mesa pede a linguagem, em duas palavras. */
export const LANGUAGE_CALL: Record<string, string> = {
    desenho: 'EM DESENHO',
    fala: 'EM FALA',
    palavra: 'EM PALAVRAS',
}
