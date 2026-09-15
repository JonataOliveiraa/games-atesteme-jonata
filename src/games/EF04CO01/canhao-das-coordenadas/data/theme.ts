export const C = {
    ink: 0x203149,
    inkSoft: 0x51648a,
    white: 0xffffff,

    wall: 0xf5e8d4,
    wallDeep: 0xe2d2b8,
    floor: 0xd9b987,
    sky: 0xaee2f7,
    leaf: 0x78ba78,

    steel: 0x344459,
    wood: 0x98613f,

    /** Azul de seleção: o guia da linha e da coluna que acende antes do tiro. */
    aim: 0x43b8d8,
    /** A tinta padrão. Níveis 1 e 2 usam só ela. */
    paint: 0x38a4d4,
    paintDeep: 0x1f6f97,
    /** Amarelo neutro do nível 2: "esta é a janela", sem dizer certo nem errado. */
    spot: 0xf7d154,

    amber: 0xf4b942,
    amberDeep: 0xb07f16,
    green: 0x4eaa78,
    greenDeep: 0x2f7553,
    /** Cinza do erro: a tinta que não pega. Nunca vermelho. */
    miss: 0x9aa8b5,
}

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  AS TINTAS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O §8 do planejamento tinha decidido uma cor só, para MOVER e COPIAR não
 * virarem escolha de cor. A regra continua: a criança nunca escolhe tinta. O
 * que a cor faz é IDENTIFICAR cada mancha, e é justamente isso que separa os
 * dois verbos — com tudo azul, mover e copiar terminam iguais na tela, uma
 * célula pintada a mais. Com cor, vê-se a laranja SAIR de um lugar e chegar no
 * outro, e a verde continuar onde estava enquanto a cópia aparece ao lado.
 *
 * Em mover e copiar a cor vem da origem, nunca do disparo.
 *
 * Contraste: todas escuras o bastante para o branco do caixilho aparecer por
 * cima, e distintas por matiz E por luminosidade, para não dependerem de
 * visão de cor normal.
 */
export const INKS = [
    { face: 0x38a4d4, deep: 0x1f6f97 },
    { face: 0xe2725b, deep: 0xa8452f },
    { face: 0x5eae62, deep: 0x357a39 },
    { face: 0xe09a2c, deep: 0xa66a11 },
    { face: 0x8a6bc0, deep: 0x5b418c },
]

export const inkOf = (i = 0) => INKS[i % INKS.length]

export const CSS = {
    ink: '#203149',
    inkSoft: '#51648a',
    white: '#ffffff',
    wall: '#f5e8d4',
    amberInk: '#3c2a05',
    paint: '#38a4d4',
}

export const FONT = {
    black: '"DynaPuff Black", "Arial Black", Arial, sans-serif',
    body: 'DynaPuff, Arial, sans-serif',
}
