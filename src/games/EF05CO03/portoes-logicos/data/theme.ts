/**
 * As cores saíram AMOSTRADAS dos PNGs, não escolhidas à parte: a metade da tela
 * desenhada em código tem de pertencer à mesma ilustração da metade que veio em
 * arte. O estilo é chibi chapado com contorno colorido, então todo desenho aqui
 * é cor sólida + um contorno num tom mais escuro da mesma cor — nunca preto,
 * nunca degradê, nunca sombra difusa.
 */

export const C = {
    ink: 0x2c3d2a,
    inkSoft: 0x4f6b49,
    white: 0xffffff,
    cream: 0xfff6e2,
    creamDeep: 0xf3e2bd,

    ceu: 0x8dd8fd,
    campo: 0xa8d462,
    campoDark: 0x7fae44,
    morro: 0x73b69e,

    madeira: 0xd78b4b,
    madeiraDark: 0xa4602a,
    trave: 0xbb7040,

    trilha: 0xe8c489,
    trilhaDark: 0xbb8f53,

    azul: 0x51b0fc,
    azulDark: 0x044e98,
    verde: 0x8cd045,
    verdeDark: 0x3e7f17,
    vermelha: 0xfb504b,
    vermelhaDark: 0xa81f1c,
    bone: 0xfcbf34,
    boneDark: 0xc98a12,
    oculos: 0x01a6aa,
    oculosDark: 0x016f72,

    ok: 0x4cc94f,
    okDark: 0x2c8c2f,
    nao: 0xf0484a,
    naoDark: 0xb01f21,
    gold: 0xffcf3d,
    goldDark: 0xc79a10,
} as const

export const CSS = {
    ink: '#2c3d2a',
    inkSoft: '#4f6b49',
    white: '#ffffff',
    cream: '#fff6e2',
    ok: '#2c8c2f',
    nao: '#ffffff',
    naoDark: '#b01f21',
} as const

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
} as const

/** A cor do corpo de cada criaturinha, para o ícone da placa e o halo do curral. */
export const COR = {
    azul: { fill: C.azul, line: C.azulDark },
    verde: { fill: C.verde, line: C.verdeDark },
    vermelha: { fill: C.vermelha, line: C.vermelhaDark },
} as const
