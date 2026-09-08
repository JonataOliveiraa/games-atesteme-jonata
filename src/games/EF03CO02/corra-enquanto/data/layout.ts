export const W = 1280
export const H = 720

export const DEPTH = {
    world: 0,
    rain: 40,
    prop: 50,
    robot: 60,
    fx: 200,
    card: 300,
    ui: 320,
    trava: 400,
    hud: 500,
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
    titleY: 32,
    titleW: 620,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
    livesX: 252,
}

/** A ficha da regra, fixa no topo enquanto o trecho roda. */
export const CARD = {
    cx: 640,
    cy: 122,
    w: 860,
    h: 100,
}

/** As duas fichas na mesa, na hora de escolher. */
/** A faixa onde o mundo é desenhado. O fundo cabe inteiro aqui. */
export const WORLD = {
    top: 186,
    h: 434,
    scale: 434 / 768,
}

export const GROUND_Y = 596
export const ROBOT_X = 340
export const ROBOT_SCALE = 0.63

export const SIGNAL = { x: 1080, y: 302, size: 196 }

export const CLOCK = { cx: 640, cy: 33, w: 300, h: 20 }

export const PEDAL = { x: 190, y: 632, w: 900, h: 74 }

export const TOUCH_TOP = 192
