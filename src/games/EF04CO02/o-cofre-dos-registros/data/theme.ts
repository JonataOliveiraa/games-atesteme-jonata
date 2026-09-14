/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A PALETA, E POR QUE A ÁGUA É ESCURA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * A ficha é papel creme, a seleção é ciano e a TRAVA é âmbar; os três moram
 * EM CIMA do cenário. Com água clara e saturada, o papel deixaria de ser a
 * superfície mais luminosa da tela e o contorno de seleção sumiria dentro do
 * azul do fundo. Por isso o véu do §1 do TEXTURAS.md escurece a sala inteira:
 * não é clima, é contraste.
 */
export const C = {
    ink: 0x203149,
    inkSoft: 0x51648a,
    white: 0xffffff,

    deep: 0x0e3a52,
    water: 0x15556f,
    beam: 0x2e8aa8,
    hull: 0x7e93a8,
    hullDeep: 0x41586f,
    lamp: 0xf0c99a,
    glass: 0xa9dcea,
    reef: 0x3fa089,

    /** O papel da ficha e a sombra dele. */
    paper: 0xfff7e8,
    paperDeep: 0xe6d5b8,
    paperEdge: 0xcbb692,

    /** Ciano de seleção: "esta etiqueta está na mão". */
    aim: 0x43b8d8,
    aimDeep: 0x1f7f9c,
    /** Âmbar da TRAVA: o campo que recusou, e a dica que vem junto. */
    amber: 0xf4b942,
    amberDeep: 0xb07f16,
    /** Verde do campo que travou no lugar certo. */
    green: 0x4eaa78,
    greenDeep: 0x2f7553,

    /** As três criaturas, para o aro e para o brilho do encaixe. */
    octopus: 0xe2722f,
    fish: 0xf0c132,
    crab: 0xd9533f,
}

export const CSS = {
    ink: '#203149',
    inkSoft: '#51648a',
    white: '#ffffff',
    paper: '#fff7e8',
    amberInk: '#3c2a05',
    deep: '#0e3a52',
    aim: '#43b8d8',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}
