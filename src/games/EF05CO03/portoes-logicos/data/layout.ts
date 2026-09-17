/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A MESA, E POR QUE ELA É CHATA E NÃO PROFUNDA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * O cenário entregue é um campo chapado, com o horizonte lá em cima e nada no
 * chão. Então a fazendinha é lida como TABULEIRO: a trilha é uma fita desenhada
 * sobre a grama e portão, curral e placa são peças apoiadas nela. Não há linha
 * de chão nem perspectiva — tentar uma faria a criaturinha "flutuar" em metade
 * dos pontos da trilha, porque a arte não tem para onde recuar.
 *
 * ── AS DUAS RAIAS ────────────────────────────────────────────────────────
 *
 * A criaturinha entra pela esquerda na linha do meio, a fita se abre em duas na
 * bifurcação, e cada raia leva PLACA → PORTÃO → CURRAL, sempre nessa ordem e
 * sempre nos mesmos x. Ordem fixa é o que deixa a criança comparar as duas
 * raias sem reaprender onde as coisas ficam.
 */

export const W = 1280
export const H = 720

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 17,
    pillW: 178,
    pillH: 48,
    dotX: 224,
    dotGap: 36,
    dotR: 11,
    titleX: 684,
    titleW: 660,
    livesX: 1068,
    helpX: 1230,
    helpR: 30,
    helpHit: 112,
} as const

/**
 * A fita. `forkX` é onde ela se abre; a criaturinha decide parada ali.
 *
 * `fromX` é onde a CRIATURINHA nasce, e não onde a fita começa: em 16 ela
 * nascia com metade do corpo fora da tela. A fita continua saindo pela borda
 * (`ribbonX`), que é o que faz parecer que elas vêm de algum lugar.
 */
export const TRACK = {
    y: 440,
    ribbonX: -24,
    fromX: 92,
    // Recuou de 360 para 330 quando a placa cresceu para caber dois termos: a
    // criaturinha parada na bifurcação encostava na borda esquerda da tábua.
    forkX: 330,
    bendX: 470,
    w: 76,
    upY: 310,
    downY: 570,
} as const

export const LANE_Y = { cima: TRACK.upY, baixo: TRACK.downY } as const

/**
 * A tábua. `w` e `h` cabem o pior caso do nível 2 — dois termos e o operador no
 * meio —, e a fileira de fichas é montada por LARGURA MEDIDA, não por posições
 * fixas: "PEQUENA" e "BONÉ" não têm o mesmo tamanho, e centrar no olho deixaria
 * metade das placas tortas.
 */
export const PLACA = {
    cx: 620,
    w: 412,
    h: 118,
    icon: 56,
    /** Vão entre o ícone e a palavra dele, e entre uma ficha e a seguinte. */
    gap: 8,
    entreFichas: 14,
} as const

/** `h` é a altura DESENHADA do arco; a largura sai dela, pela caixa alfa medida. */
export const PORTAO = { cx: 916, h: 168 } as const

export const CURRAL = { cx: 1146, w: 236 } as const

/** Poste com o traço na altura-limite, para `é pequena` virar leitura e não palpite. */
export const MARCO = { x: 262, baseY: TRACK.y, h: 132 } as const

export const FILA = { x: 26, y: 706, gap: 46, h: 46 } as const

export const DEPTH = {
    bg: 0,
    trilha: 10,
    fila: 18,
    marco: 22,
    curral: 30,
    curralPets: 34,
    portao: 40,
    portaoFolha: 44,
    // ACIMA da placa: o braço da raia passa por cima da tábua, e uma criaturinha
    // que anda escondida atrás dela perde justamente o trecho que a criança
    // precisa ver — a entrada no portão que ela mesma escolheu.
    criatura: 66,
    placa: 62,
    balao: 70,
    zones: 120,
    fx: 200,
    hud: 300,
    overlay: 500,
} as const

export const BALAO = { cx: 620, cy: 176, w: 520, h: 78 } as const
