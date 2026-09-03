export const C = {
    ink: 0x1b2333,
    inkSoft: 0x4a5a70,
    white: 0xffffff,

    cream: 0xfff6e4,
    creamDeep: 0xffe7bd,
    creamEdge: 0xd9b884,

    sand: 0xf2dfb6,
    sandDark: 0xb09681,
    sandDeep: 0x8d7566,
    sky: 0xbfe9f5,
    skyTop: 0x2f95cf,
    skyMid: 0x77cdea,
    sea: 0x2fb8d6,

    wood: 0xa9663b,
    woodDark: 0x71401f,
    metal: 0xe7b84f,

    glyph: 0x5b4030,
    glyphSoft: 0x9c7a5e,

    ok: 0x4ecb63,
    okDark: 0x2b8a44,
    bad: 0xf2685c,
    badDark: 0xc03b30,
    warn: 0xffc42e,
    warnDark: 0xd99400,
    cyan: 0x5ed2e8,
    cyanDark: 0x2a94ad,
}

export const CSS = {
    ink: '#1b2333',
    inkSoft: '#4a5a70',
    cream: '#fff6e4',
    white: '#ffffff',
    ok: '#2b8a44',
    bad: '#c03b30',
    warn: '#d99400',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    help: '30px',
    chip: '22px',
    goal: '20px',
    balloon: '26px',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
