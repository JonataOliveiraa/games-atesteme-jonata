/**
 * As cores saem da paleta do TEXTURAS.md, que por sua vez sai das capas do
 * Elementary: a tinta é MARROM QUENTE, nunca preto puro. É a primeira coisa
 * que separa este estilo do traço antigo do catálogo, e vale também para o
 * que o código desenha — senão o Graphics denuncia o PNG.
 */
export const C = {
    ink: 0x3a2a22,
    inkSoft: 0x7a6154,
    cream: 0xfff3e0,
    creamDeep: 0xf7e2c3,
    creamEdge: 0xd9bf9b,
    white: 0xffffff,

    ok: 0x3fbf7f,
    okDark: 0x2a8a5c,
    bad: 0xe2563f,
    badDark: 0xb03a27,
    warn: 0xf5c542,
    warnDark: 0xc79a1f,

    shirt: 0xf4743b,
    shirtDark: 0xc4501f,
    pants: 0x3e5c9a,
    pantsDark: 0x2a4270,
    board: 0x7b4ae2,
    boardDark: 0x5730a8,

    /**
     * O CONCRETO. O deck que o código desenha é um PLANO DA FRENTE com
     * contorno próprio — ele não finge ser o mesmo piso pintado no fundo.
     * Duas superfícies em planos diferentes não criam emenda; emenda nasce
     * quando duas fingem ser uma só.
     */
    deck: 0xe6d9c4,
    deckDark: 0xc9b696,
    deckEdge: 0xa88f6d,
    metal: 0x9aa7b4,
    metalDark: 0x6d7a86,
}

export const CSS = {
    ink: '#3a2a22',
    inkSoft: '#7a6154',
    cream: '#fff3e0',
    white: '#ffffff',
    ok: '#2a8a5c',
    bad: '#b03a27',
    warn: '#c79a1f',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    card: '22px',
    go: '34px',
    balloon: '30px',
    help: '34px',
}

/** Uma cor por manobra. Ela vale na carta, no espaço da fita e no brilho. */
export const TRICK_COLOR: Record<string, { main: number; dark: number }> = {
    empurrar: { main: 0x5ecb9a, dark: 0x2a8a5c },
    subir: { main: 0xf4a03b, dark: 0xc46a12 },
    pular: { main: 0x6fb3f2, dark: 0x2f6fb8 },
}

export const TRICK_LABEL: Record<string, string> = {
    empurrar: 'EMPURRAR',
    subir: 'SUBIR',
    pular: 'PULAR',
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
