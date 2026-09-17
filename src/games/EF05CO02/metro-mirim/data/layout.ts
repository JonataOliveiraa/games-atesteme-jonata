export const W = 1280
export const H = 720

/**
 * ══════════════════════════════════════════════════════════════════════════
 *  A TELA É UMA JANELA, O MAPA É MAIOR QUE ELA
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Na primeira versão a cidade inteira cabia em 1280 × 720 e tudo ficou
 * pequeno: estação de 140 px vira 42 px reais num celular, e o prédio dentro
 * dela, 36. Agora cada fase tem um MUNDO próprio (`PhaseDef.world`), a câmera
 * mostra um pedaço dele, e a criança arrasta o mapa para ver o resto.
 *
 * Com isso a estação dobrou: 220 px de disco, 66 px reais no celular.
 */

export const HUD = {
    h: 82,
    cy: 41,
    pillX: 20,
    pillY: 18,
    pillW: 126,
    pillH: 46,
    dotX: 176,
    dotGap: 42,
    dotR: 14,
    titleX: 600,
    livesX: 1006,
    helpX: 1212,
    helpR: 28,
    helpHit: 128,
} as const

/** A janela do mapa: o que fica entre o HUD e a bancada. */
export const MAP = { y: HUD.h, h: 514 } as const

export const BENCH = { y: MAP.y + MAP.h, h: H - (MAP.y + MAP.h) } as const

export const STATION = {
    r: 110,
    art: 208,
    labelDy: 138,
    labelSize: 30,
    lift: 8,
} as const

export const TRACK = {
    width: 30,
    tie: 7,
    knobR: 44,
    knobHit: 150,
    dash: 26,
    gap: 20,
} as const

/** Onde o passageiro espera: ao lado da estação, com o balão acima. */
export const RIDER = {
    dx: -156,
    height: 180,
    footDy: 100,
    balloonDy: 66,
    balloonW: 152,
    balloonH: 120,
    dotR: 9,
    dotGap: 26,
} as const

/**
 * A bancada tem duas coisas e mais nada: as peças e o apito.
 *
 * Ela já teve um painel de carinhas ("quem falta chegar") e um minimapa. Os
 * dois saíram: quem falta chegar está **no mapa**, esperando ao lado da
 * estação, e é lá que a criança olha.
 */
export const TRAY = {
    x: 24,
    y: 608,
    w: 660,
    h: 100,
    cy: 658,
    x0: 76,
    pitch: 96,
    icon: 78,
} as const

export const GO = { cx: 1112, cy: 658, w: 312, h: 104 } as const

/**
 * O mundo e a interface vivem em profundidades separadas: tudo abaixo de 40
 * anda com a câmera, tudo acima fica parado (`setScrollFactor(0)`).
 */
export const DEPTH = {
    city: 0,
    links: 4,
    tracks: 6,
    knobs: 8,
    station: 12,
    rider: 16,
    balloon: 20,
    train: 26,
    bench: 40,
    note: 56,
    hud: 60,
    diagram: 70,
    talk: 80,
    frame: 90,
} as const
