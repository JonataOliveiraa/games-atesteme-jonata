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
    packet: 20,
    fx: 22,
    hand: 24,
    marker: 90,
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

/** A legenda curta da demonstração, logo abaixo do cabeçalho. */
export const CAPTION = { x: 640, y: 168 } as const

/** A mãozinha: tamanho no mapa e quanto ela sobe entre um toque e outro. */
export const HAND = { size: 130, tapLift: 26 } as const

/** Zoom da demonstração: no processador e em cada tomada. */
export const ZOOM = { chip: 2.1, socket: 1.4, bottom: 1.2 } as const

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
