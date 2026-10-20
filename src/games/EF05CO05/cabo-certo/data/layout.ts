export const W = 1280
export const H = 720

/** O mapa inteiro. A tela é uma janela sobre ele. */
export const WORLD = { w: 2400, h: 1350 } as const

export const DEPTH = {
    floor: 0,
    pc: 4,
    plate: 5,
    cable: 8,
    device: 10,
    socket: 12,
    plug: 14,
    screen: 16,
    /** O aparelho sem cabo na mão da criança: por cima das tomadas e dos plugues. */
    carry: 18,
    packet: 20,
    fx: 22,
    touch: 24,
    /** A vinheta do foco: por cima do mapa, por baixo das setas da borda, do cabeçalho e das legendas. */
    veil: 95,
    marker: 97,
    header: 100,
    hud: 106,
    bubble: 130,
    banner: 140,
} as const

export const HEADER = {
    h: 96,
    dividers: [300, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 186,
    pipGap: 30,
    pipR: 11,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
    askX: 716,
    askW: 820,
} as const

/** A janela do mapa: tudo abaixo do cabeçalho. */
export const VIEW = {
    x: 0,
    y: HEADER.h,
    w: W,
    h: H - HEADER.h,
    /** Distância da borda em que o mapa anda sozinho durante o arraste. */
    edge: 90,
    edgeSpeed: 0.9,
    keySpeed: 0.8,
} as const

export const PC = {
    x: 1200,
    y: 700,
    w: 360,
    h: 440,
    chip: { x: 0, y: -90 },
    chipSize: 120,
    window: { x: 0, y: -90, w: 260, h: 190 },
} as const

export const DEVICE = {
    size: 170,
    /** Do centro do aparelho até onde o cabo nasce. */
    port: 78,
    /** Onde o plugue descansa, além do ponto do cabo. */
    rest: 54,
    name: 104,
    hit: 190,
} as const

export const MONITOR_SCREEN = {
    /** Relativo ao centro da célula de 256: centro em (128, 104). */
    x: 0,
    y: -24,
    w: 196,
    h: 116,
} as const

export const SOCKET = {
    size: 86,
    /** Raio em que o plugue solto "acha" a tomada. */
    snap: 72,
} as const

export const PLUG = {
    size: 64,
    hit: 104,
} as const

export const CABLE = {
    width: 12,
    inner: 6,
    sag: 0.28,
    maxSag: 140,
} as const

/** A legenda curta da demonstração, logo abaixo do cabeçalho; no foco, sobe para onde ele estava. */
export const CAPTION = { x: 640, y: 168, top: 64 } as const

/**
 * O toque mostrado pelo jogo (a bolinha): raio no mapa, grossura da ondinha,
 * até quantas vezes o raio ela abre e de quanto em quanto tempo ela toca.
 */
export const TOUCH = { r: 17, wave: 6, reach: 4, every: 1150 } as const

/** Zoom da demonstração (processador, tomadas), da bolinha correndo, do erro e do resumo. */
export const ZOOM = { chip: 2.1, socket: 1.4, bottom: 1.2, flow: 1.22, error: 1.35, recapMin: 0.8, recapMax: 1.15 } as const

/**
 * O foco das animações: o cabeçalho sobe (`lift`, com a sombra), o mapa fica com
 * a tela toda e a vinheta escurece tudo menos um círculo macio em volta do que
 * está acontecendo. `alpha` é o escuro da borda.
 */
export const FOCUS = { lift: HEADER.h + 14, alpha: 0.72, asideMs: 200, hintAlpha: 0.62, hintMs: 320 } as const

/**
 * Raio do círculo claro do foco, em pixels do mapa (o zoom aumenta junto). O
 * escuro completo chega a 1,7 × o raio. `device` é o que soma ao meio aparelho,
 * para o nome embaixo dele caber.
 */
export const SPOT = { chip: 118, socket: 112, packet: 120, device: 34, pc: { rx: 330, ry: 290 } } as const

/** A bolinha de informação: o disco com o desenho do que ela leva e o brilho em volta. */
export const PACKET = { r: 21, ring: 5, halo: 36, trail: 18 } as const

export const MARKER = {
    inset: 46,
    size: 30,
} as const

export const BUBBLE = {
    w: 480,
    pad: 22,
    button: 50,
} as const

export const BANNER = {
    x: 640,
    y: 600,
    w: 1060,
    h: 96,
} as const
