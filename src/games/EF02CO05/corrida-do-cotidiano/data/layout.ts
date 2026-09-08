export const W = 1280
export const H = 720

export const CX = W / 2

export const HORIZON_Y = 334
export const GROUND_Y = 640

/** Onde a grama do PNG comeca. So para o que se apoia nela; a projecao usa HORIZON_Y. */
export const GRASS_Y = 365

export const F = 600

export const pOf = (z: number) => F / (F + z)
export const zOf = (p: number) => F * (1 / p - 1)
export const yOf = (p: number) => HORIZON_Y + (GROUND_Y - HORIZON_Y) * p
export const xOf = (p: number, wx: number) => CX + wx * p
export const depthOf = (p: number) => Math.round(p * 1000)

export const P_ROAD_FAR = 0.1
export const P_ROAD_NEAR = 1.34
export const P_SPAWN = 0.22
export const P_PROP_SPAWN = 0.16
export const P_DECIDE = 0.92
export const P_CULL = 1.5
export const P_PROP_CULL = 1.9

export const LANE_WX = 220
export const ROAD_HALF_WX = 441
export const CURB_WX = 30

export const DEPTH = {
    sky: -200,
    grass: -190,
    road: -180,
    stripe: -170,
    runner: 999,
    zones: 2900,
    reward: 3000,
    balloon: 3100,
    trava: 3200,
    fx: 3300,
    hud: 3400,
    overlay: 5000,
}

export const HUD = {
    h: 64,
    cy: 33,
    pillX: 22,
    pillY: 12,
    pillW: 206,
    pillH: 42,
    titleX: 640,
    titleY: 30,
    titleW: 700,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
    livesX: 252,
}

export const BALLOON = {
    cx: 640,
    cy: 136,
    w: 780,
    h: 112,
    icon: 74,
    textW: 620,
}

export const SIGN = {
    postWX: 470,
    postW: 32,
    postH: 344,
    armH: 22,
    panel: 262,
    panelY: -322,
    icon: 196,
    barrierY: -102,
    barrierH: 46,
}

export const RUNNER = {
    scale: 0.72,
    frameMs: 105,
}

export const STRIPE = { len: 96, gap: 224, halfWX: 10 }

export const PROP = {
    gapZ: 560,
    houseWX: [780, 1180] as const,
    bushWX: [520, 700] as const,
    houseScale: 1.5,
    bushScale: 0.9,
    houseBase: 0.9875,
    bushBase: 0.946,
}

export const GAP_Z = 620
export const WARMUP_Z = 420
