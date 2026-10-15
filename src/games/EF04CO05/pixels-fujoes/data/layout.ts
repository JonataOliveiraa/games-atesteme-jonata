export const W = 1280
export const H = 720

/** 1 pixel de arte da interface = 4 px de tela: o cabeçalho, as placas e os botões caem nessa grade */
export const U = 4

export const DEPTH = {
    world: 0,
    swarm: 20,
    beam: 32,
    blaster: 34,
    header: 38,
    panel: 40,
    order: 44,
    controls: 60,
    aim: 64,
    fx: 70,
    banner: 80,
    hud: 100,
} as const

/** o cabeçalho de ponta a ponta: faixa 1 (0–80) nível, ordem e ?; faixa 2 (80–164) o combinado */
export const HEADER = { row: 80, height: 164, margin: 24 } as const

export const HUD = {
    plateX: 16,
    plateW: 156,
    plateH: 48,
    y: 40,
    pipsX: 202,
    pipGap: 34,
    pip: 20,
    pipNow: 28,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1222,
    help: 56,
    helpHit: 80,
} as const

/**
 * O cronômetro na faixa 1, entre a ordem e o ?: um relógio de bolso e uma régua de gomos que esvazia.
 * `x` é o meio da régua; as medidas de arte (gomo, vão, borda) estão em pixels de arte (× U na tela).
 */
export const CLOCK = { x: 1094, y: 40, segments: 10, seg: 3, gap: 1, pad: 2, iconGap: 8, warnAt: 0.34, dangerAt: 0.15 } as const

/** "DEVOLVA OS PIXELS" + uma casinha por fujão, no meio da faixa 1 (em cima do combinado) */
export const ORDER = { x: 640, y: 40, slot: 48, gap: 8, text: 3 } as const

/** o combinado na faixa 2: os cartões centrados na tela, debaixo da ordem */
export const TABLE = { y: 122, cardH: 60, gap: 40, swatch: 40, text: 3, digit: 5 } as const

/**
 * O tablet: 1 pixel de arte = 4 px de mundo (512 × 384). A origem do mundo é o meio da tela dele, onde
 * fica a figurinha (casas de 8 px de mundo). Na vista geral o mundo está em escala 1; no jogo, o zoom do
 * nível (N1: 8 × 8 casas em 6×, casa de 48 px; N2: 12 × 12 em 4×, 32 px; N3: 16 × 16 em 3×, 24 px).
 */
export const TABLET = {
    art: 4,
    w: 128,
    h: 96,
    screen: { x: 7, y: 7, w: 114, h: 82 },
    realX: 640,
    realY: 432,
    cell: 8,
    playY: 378,
    zoomMs: 1400,
    slideMs: 620,
} as const

/** onde os fujões flutuam (centro, em px de tela, sem o olhar) e a distância deles */
export const PLAY = {
    left: 236,
    right: 1010,
    top: 238,
    bottom: 512,
    /** a mira puxa a câmera: 6 % do desvio, até 40 px */
    look: 0.06,
    lookMax: 40,
    gap: 18,
    /** o olhar desloca o fujão por L / z, mas no máximo por 2,2 L (os muito perto não voam longe) */
    parallax: 2.2,
} as const

export const AIM = {
    speed: 560,
    minX: 40,
    maxX: 1240,
    minY: 180,
    maxY: 600,
    pad: 12,
    follow: 14,
    startX: 640,
    startY: 378,
    size: 72,
    /** a mira travada abraça o fujão com esta folga */
    hug: 30,
} as const

/** o joystick: a base em escala 5 e a bolinha em escala 3 (pixels inteiros) */
export const JOY = { x: 140, y: 604, base: 5, knob: 3, r: 54, grabMaxX: 330, grabMinY: 420, hit: 160 } as const

/** os botões que mandam o número: arte de 29 px em escala 4 (116 px) */
export const FIRE = { y: 612, x: { '0': 1062, '1': 1190 } as Record<string, number>, scale: 4, hit: 128, digit: 7 } as const

/** o codificador, em pixels de arte da célula de 48 × 40, colado no pé da tela */
export const BLASTER = {
    x: 640,
    scale: 4,
    cellW: 48,
    cellH: 40,
    muzzle: { x: 24, y: 5 },
    screen: { x: 16, y: 21, w: 16, h: 8 },
    show: 420,
} as const

export const SHOT = { ms: 130, homeMs: 680, readMs: 260 } as const

/** a faixa do erro, embaixo */
export const BANNER = { x: 640, y: 650, w: 840, text: 4 } as const
