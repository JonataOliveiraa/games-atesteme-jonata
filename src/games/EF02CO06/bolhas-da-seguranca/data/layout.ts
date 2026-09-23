export const W = 1280
export const H = 720

export const DEPTH = {
    scene: 0,
    tablet: 10,
    queue: 20,
    /** O recado do cuidado: ABAIXO dos perigos, que continuam passando e não podem sumir atrás dele. */
    care: 35,
    item: 40,
    bubble: 60,
    seal: 80,
    hud: 100,
    fx: 200,
    overlay: 400,
}

export const HUD = {
    h: 72,
    cy: 36,

    pillX: 20,
    pillY: 15,
    pillW: 168,
    pillH: 42,

    titleX: 660,
    titleY: 24,
    titleW: 620,
    hintY: 52,
    hintW: 700,

    helpX: 1218,
    helpR: 26,
    helpHit: 122,

    livesX: 1040,
}

export const TABLET = {
    cx: 640,
    cy: 392,
    w: 1200,
    h: 616,
    bezel: 22,
    radius: 42,
}

export const FIELD = {
    spawnX: 130,
    lockX: 1150,
    lanes: [215, 370, 525],
    item: 168,
    hit: 196,
    laneClearance: 230,
}

export const QUEUE = {
    cy: 646,
    dot: 34,
    gap: 16,
}

export const queueX = (i: number, n: number) => {
    const span = n * QUEUE.dot + (n - 1) * QUEUE.gap
    return TABLET.cx - span / 2 + QUEUE.dot / 2 + i * (QUEUE.dot + QUEUE.gap)
}

export const fieldBounds = () => ({
    x: (FIELD.spawnX + FIELD.lockX) / 2,
    y: FIELD.lanes[1],
    w: FIELD.lockX - FIELD.spawnX + FIELD.item,
    h: FIELD.lanes[2] - FIELD.lanes[0] + FIELD.item,
})

export const queueBounds = (n: number) => ({
    x: TABLET.cx,
    y: QUEUE.cy,
    w: n * QUEUE.dot + (n - 1) * QUEUE.gap + 40,
    h: QUEUE.dot + 36,
})
