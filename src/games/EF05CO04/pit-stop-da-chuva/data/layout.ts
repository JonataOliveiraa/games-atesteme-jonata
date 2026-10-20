export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    sun: 1,
    clouds: 2,
    strip: 4,
    mud: 5,
    tent: 6,
    crewBack: 7,
    beto: 7.5,
    finish: 8,
    pitMark: 8.5,
    wet: 9,
    puddle: 10,
    pit: 11,
    crewFront: 12,
    back: 13,
    front: 15,
    hay: 17,
    fx: 20,
    rain: 30,
    header: 100,
    rule: 104,
    hud: 106,
    controls: 110,
    carts: 112,
    caption: 120,
    banner: 140,
    hand: 150,
} as const

export const HEADER = {
    h: 96,
    dividers: [296, 1150],
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 188,
    pipGap: 32,
    pipR: 11,
    mapX0: 340,
    mapX1: 960,
    mapDot: 11,
    posX: 1062,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

/** O painel da regra: uma linha por ramo, no canto de cima à esquerda. */
export const RULE = {
    x: 14,
    y: 108,
    rowH: 44,
    pad: 10,
    indent: 34,
    chipH: 32,
    icon: 38,
    gap: 8,
    bigX: 640,
    bigY: 340,
    bigScale: 1.55,
} as const

export const SKY = {
    h: 460,
    rect: { x: 820, y: 190, w: 860, h: 170 },
} as const

export const SUN = { x: 1080, y: 170, size: 140 } as const

export const CLOUDS = [
    { x: 150, y: 150, s: 1 },
    { x: 420, y: 122, s: 0.8 },
    { x: 700, y: 168, s: 1.15 },
    { x: 960, y: 126, s: 0.9 },
    { x: 1190, y: 172, s: 0.85 },
] as const

export const CLOUD_SIZE = 210

/**
 * A faixa do autódromo (`autodromo.png`, 1280 × 520) entra em y 200:
 * 0–60 céu, 60–220 arquibancada, 220–236 mureta, 236–290 faixa do box,
 * 290–300 linha branca, 300–440 pista (duas faixas), 440–520 grama.
 */
export const STRIP = {
    y: 200,
    h: 520,
    w: 1280,
} as const

/** A lama (`lama.png`, 1280 × 204) cobre a faixa do box e a pista. */
export const MUD = {
    y: 436,
    h: 204,
} as const

/** Onde a roda pisa em cada faixa, e o tamanho do carro nela. */
export const LANES = {
    pit: { ground: 486, scale: 0.8 },
    back: { ground: 560, scale: 0.88 },
    front: { ground: 626, scale: 1 },
} as const

export const PIT_LANE = { top: 436, bottom: 492 } as const
export const TRACK_BAND = { top: 500, bottom: 640 } as const

/** A Kika fica sempre aqui: o que vem pela frente cabe na tela. */
export const CAR_X = 400

/** Geometria dos veículos, em fração da célula (384 × 256). As folhas vêm SEM rodas. */
export const GEOMETRY = {
    carro: { w: 236, cellW: 384, cellH: 256, rearFX: 0.245, frontFX: 0.79, axleFY: 0.8, wheelFR: 0.16, bottomFY: 0.96 },
    moto: { w: 236, cellW: 384, cellH: 256, rearFX: 0.21, frontFX: 0.8, axleFY: 0.75, wheelFR: 0.21, bottomFY: 0.96 },
} as const

export const TENT = {
    w: 380,
    base: 440,
} as const

/** O retângulo de parada, pintado na faixa do box em frente à tenda. */
export const PIT_MARK = {
    y: 464,
    h: 50,
} as const

export const FINISH = {
    w: 30,
    poleH: 250,
    betoDX: -150,
} as const

export const PUDDLES = {
    at: [0.12, 0.33, 0.55, 0.78],
    y: 594,
    w: 170,
} as const

export const HAY = {
    y: 706,
    size: 110,
    ahead: 360,
} as const

export const CREW = {
    luaDX: -150,
    daviDX: 150,
    idleFeet: 446,
    workFeet: 498,
    betoFeet: 440,
    betoH: 168,
    kidH: 124,
    workGap: 34,
} as const

export const CONTROLS = {
    brake: { x: 112, y: 640, w: 188, h: 124 },
    gas: { x: 1168, y: 640, w: 188, h: 124 },
    pit: { x: 790, y: 664, w: 310, h: 84 },
    icon: 82,
} as const

export const CARTS = {
    y: 612,
    plateW: 196,
    plateH: 178,
    size: 140,
    artDY: -18,
    labelDY: 62,
    badge: 54,
    center: 700,
    gap: 220,
    groupGap: 36,
} as const

export const BANNER = {
    x: 640,
    y: 300,
    w: 940,
    h: 84,
} as const

export const CAPTION = {
    x: 780,
    y: 168,
} as const

export const CAMERA = {
    follow: 220,
    closeZoom: 1.55,
} as const

export const HAND = { size: 120, tapLift: 24 } as const
