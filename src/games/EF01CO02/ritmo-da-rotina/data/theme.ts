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
    coral: '#d9503f',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}

export const SIZE = {
    routine: '25px',
    balloon: '30px',
    banner: '42px',
    float: '34px',
    help: '34px',
}

/**
 * Um cenário por rotina. A arte já é clara e alegre, então o véu é quase
 * nada: ele só amarra a tela e tira o branco do fundo de brigar com a figura.
 *
 * O caminho é CLARO por cima do cenário claro, com contorno grosso — o mesmo
 * acabamento dos móveis do desenho. Um piso escuro deixava a tela pesada e
 * fazia o jogo parecer de outro mundo que não o do quarto.
 */
export const SCENERY: Record<'quarto' | 'cozinha', {
    texture: string
    veil: number
    veilAlpha: number
    path: number
    pathEdge: number
    dash: number
}> = {
    quarto: {
        texture: 'bg-quarto',
        veil: 0x3a2a1a,
        veilAlpha: 0.07,
        path: 0xfff2d8,
        pathEdge: 0xe6bd82,
        dash: 0xffc98a,
    },
    cozinha: {
        texture: 'bg-cozinha',
        veil: 0x1a2a3a,
        veilAlpha: 0.07,
        path: 0xf2fbff,
        pathEdge: 0xa8d8ea,
        dash: 0xbfe8f5,
    },
}

export const hex = (n: number) => `#${n.toString(16).padStart(6, '0')}`
