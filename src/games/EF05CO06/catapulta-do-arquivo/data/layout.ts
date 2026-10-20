export const W = 1280
export const H = 720

export const DEPTH = {
    sky: 0,
    cloud: 5,
    ground: 10,
    platform: 11,
    device: 12,
    label: 14,
    preview: 19,
    catapult: 20,
    band: 21,
    ball: 22,
    minimap: 90,
    header: 40,
    fx: 70,
    banner: 80,
    hud: 100,
} as const

export const HEADER = { height: 96 } as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 48,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 48,
    helpR: 32,
    helpHit: 88,
} as const

export const ORDER = { x: 700, y: 48, w: 560, h: 72, icon: 50 } as const

export const CLOUD = { r: 80, scale: 0.62, labelDy: 74 } as const

/** o dispositivo no fundo do túnel e a plaquinha com o nome em cima da boca */
export const HOLE_ART = { deviceY: 664, deviceMinDrop: 92, labelDy: -46 } as const

/** a tábua escorrega: quem para em cima dela rola até a borda mais perto e cai */
export const PLATFORM = { h: 26, slide: 70 } as const

export const SPRING = { w: 90, h: 34, kick: 860 } as const

/** o mapinha embaixo do cabeçalho: o mundo todo e a janela da câmera */
export const MINIMAP = { x: 880, y: 112, w: 380, h: 64 } as const

export const CAMERA = { tourMs: 1800, followLerp: 0.12, panDrag: 1 } as const

export const DEVICE_SCALE = { hdInterno: 0.5, penDrive: 0.5, cartao: 0.55, hdExterno: 0.5 } as const

/** a célula do gabinete é 320, com o compartimento do HD em (160, 175) */
export const GABINETE = { scale: 0.34, bayDy: 15 } as const

export const CATAPULT = {
    x: 190,
    baseY: 460,
    scale: 0.6,
    rest: { x: 190, y: 306 },
    tips: [
        { x: 160, y: 298 },
        { x: 220, y: 298 },
    ],
    maxPull: 190,
    grab: 150,
    power: 8,
} as const

export const BALL = { r: 24, size: 56, icon: 32 } as const

export const PHYS = {
    gravity: 980,
    bounce: 0.35,
    bounceMin: 240,
    landKeep: 0.55,
    rollDrag: 2.6,
    stopSpeed: 14,
    previewDt: 0.035,
    previewDots: 16,
} as const

export const BANNER = { x: 640, y: 330, w: 820, h: 92 } as const
