export const W = 1280
export const H = 720

export const DEPTH = {
    bg: 0,
    cast: 20,
    slot: 30,
    card: 60,
    medal: 70,
    query: 80,
    choice: 100,
    fx: 200,
    hint: 300,
    hud: 500,
}

export const HUD = {
    h: 78,
    cy: 38,
    pillX: 20,
    pillY: 14,
    pillW: 186,
    pillH: 48,
    markX: 226,
    markW: 26,
    markH: 34,
    markGap: 12,
    livesX: 362,
    goalX: 770,
    helpX: 1226,
    helpR: 27,
    helpHit: 116,
}

export const CAST = {
    height: 208,
    visitor: { x: 112, y: 504 },
    keeper: { x: 1172, y: 504 },
}

export const VISITOR_ART = {
    key: 'visitantes-reacoes',
    cols: 4,
    rows: 3,
    scale: 0.49,
    feet: [437, 435, 437, 437, 423, 419, 421, 422, 430, 428, 429, 427],
    footX: [174, 164, 146, 150, 172, 167, 149, 154, 162, 167, 147, 156],
    cuts: { 9: { right: 633 }, 10: { left: 634 } } as Record<number, { left?: number; right?: number }>,
}

export const REACTION = { wait: 0, doubt: 1, happy: 2 }

export const REQUEST = { x: 650, y: 136, w: 820, h: 70 }
export const QUERY = { x: 650, y: 218, w: 700, h: 60, chipH: 42, chipGap: 10 }

export const RESULT = {
    w: 270,
    h: 222,
    art: 178,
    small: 0.76,
    bottom: 504,
    xs: [392, 684, 940],
    arrowX: 214,
}

export const CHOICE = {
    y: 634,
    w: 342,
    h: 112,
    gap: 356,
    cx: 640,
    hitW: 356,
    hitH: 130,
}

export const HINT = { x: 650, y: 541, w: 940 }
