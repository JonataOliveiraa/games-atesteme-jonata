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
    tap: 85,
    hud: 100,
} as const

/** arrastando o mapa, puxando a catapulta ou com o arquivo voando, a faixa sobe e só o pedido fica */
export const HEADER = { height: 96, slideMs: 220, showAfter: 200 } as const

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

/** `storyW`: no N3 o pedido é uma situação em duas linhas, sem a pílula do lugar */
export const ORDER = { x: 700, y: 48, w: 560, storyW: 690, h: 72, icon: 50 } as const

/** o pedido sozinho no alto, justo no conteúdo e menor */
export const ORDER_COMPACT = { x: 640, y: 40, scale: 0.8, padRight: 10 } as const

export const CLOUD = { r: 80, scale: 0.62, labelDy: 74 } as const

/** os aparelhos ficam em pé na superfície: a célula de 320 tem a base em y 300; a plaquinha fica `labelGap` acima da arte */
export const DEVICE_ART = { baseY: 300, labelGap: 26 } as const

/** a altura da arte na tela; a caixa de acerto é generosa (encostou, guardou) */
export const DEVICE_H = { hdInterno: 140, penDrive: 110, cartao: 100, hdExterno: 110 } as const
export const DEVICE_BOX = { w: 116, minH: 116, pad: 10 } as const

/**
 * O túnel é um cano estreito enterrado: `width` da boca, afunilando da largura da abertura nos
 * primeiros `taper` px de cada ponta. O trecho deitado passa com o topo `cover` px abaixo do chão
 * mais fundo do caminho (o eixo nunca abaixo de `maxY`); boca e saída ficam a pelo menos `minRun` px.
 * A curva tem raio maior que meio cano e começa `straight` px depois da boca. Bocas e saídas têm
 * `lip` px de chão plano dos dois lados. Da saída, o arquivo sai com um pulinho `hop`.
 */
export const TUNNEL_PATH = {
    width: 0.6,
    taper: 50,
    cover: 100,
    maxY: 682,
    minRun: 260,
    corner: 58,
    straight: 12,
    lip: 40,
    step: 12,
    hop: { vx: 300, vy: -360 },
} as const

/** a tábua escorrega: quem para em cima dela rola até a borda mais perto e cai */
export const PLATFORM = { h: 26, slide: 70 } as const

export const SPRING = { w: 90, h: 34, kick: 860 } as const

/** o mapinha embaixo do cabeçalho: o mundo todo e a janela da câmera */
export const MINIMAP = { x: 880, y: 112, w: 380, h: 64 } as const

/** `slack`: quanto o dedo anda antes de o toque virar arrasto */
export const CAMERA = { tourMs: 1800, followLerp: 0.12, panDrag: 1, slack: 12 } as const

export const DEVICE_SCALE = { hdInterno: 0.5, penDrive: 0.55, cartao: 0.55, hdExterno: 0.55 } as const


export const CATAPULT = {
    x: 190,
    baseY: 460,
    scale: 0.6,
    rest: { x: 190, y: 306 },
    /** as pontas do Y no PNG (célula 320: (89, 31) e (234, 31)), levadas à tela pela escala 0,6 */
    tips: [
        { x: 147, y: 299 },
        { x: 234, y: 299 },
    ],
    maxPull: 190,
    /** o arquivo nunca desce para dentro do chão (chão em 460, raio 24) */
    maxDown: 124,
    grab: 150,
    power: 8,
} as const

/** puxando e voando, a câmera se afasta até caber o mapa inteiro (nunca menor que `minZoom`) */
export const OVERVIEW = { minZoom: 0.4, outMs: 450, inMs: 400 } as const

/** a jogada que o próprio jogo faz na estreia: no VALE esse puxão para no chão perto da mola (simulado: ±2 px também) */
export const DEMO = { pull: { x: -61, y: 35 }, pullMs: 900, holdMs: 350, pan: { fromX: 900, toX: 380, y: 520, ms: 1500 } } as const

export const BALL = { r: 24, size: 56, icon: 32 } as const

export const PHYS = {
    gravity: 980,
    bounce: 0.35,
    bounceMin: 240,
    landKeep: 0.55,
    rollDrag: 2.6,
    stopSpeed: 14,
    previewDt: 0.045,
    /** s: a mira desenha até a aterrissagem, no máximo isto de voo */
    previewMax: 6,
} as const

export const BANNER = { x: 640, y: 330, w: 820, h: 92 } as const
