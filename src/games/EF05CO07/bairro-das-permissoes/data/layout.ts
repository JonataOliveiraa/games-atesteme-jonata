export const W = 1280
export const H = 720

export const DEPTH = {
    ground: 0,
    road: 1,
    shade: 2,
    sorted: 10,
    label: 30,
    smoke: 32,
    pointer: 34,
    beam: 40,
    hand: 50,
    marker: 90,
    header: 100,
    bag: 103,
    hud: 106,
    door: 120,
    banner: 140,
} as const

export const HEADER = {
    h: 96,
    dividers: [306, 1150],
    hideAfter: 140,
    showAfter: 380,
    ease: 110,
    moving: 60,
} as const

export const HUD = {
    y: 48,
    levelX: 24,
    levelW: 132,
    levelH: 44,
    pipsX: 186,
    pipGap: 32,
    pipR: 11,
    helpX: 1216,
    helpY: 48,
    helpR: 30,
    helpHit: 86,
    livesX: 1100,
    livesY: 48,
    livesSize: 30,
} as const

export const GOAL = {
    x: 640,
    maxW: 660,
    disc: 29,
    icon: 46,
    gap: 14,
    padX: 22,
    h: 70,
    compact: 0.92,
} as const

export const VIEW = {
    x: 0,
    y: 0,
    w: W,
    h: H,
    top: HEADER.h,
    follow: 170,
} as const

export const RUN = {
    maxSpeed: 560,
    accel: 1900,
    drag: 1.3,
    glide: 2.8,
    brake: 11,
    deadZone: 34,
    radius: 26,
    bounce: 0.35,
    stride: 40,
    skidSpeed: 230,
    idleSpeed: 22,
} as const

export const KID = { size: 150, shadowW: 70, shadowH: 22 } as const

export const HOUSE = {
    size: 330,
    body: { w: 280, h: 150, lift: 6 },
    door: { dy: 46, r: 120 },
    gate: 100,
    name: 20,
    arrow: 64,
    shot: 150,
} as const

export const DECO = {
    size: 190,
    fountain: 300,
    pond: 260,
    solid: { arvore: 40, pinheiro: 36, chafariz: 112, lago: 80, pedra: 48, escorregador: 46, sorvete: 40 } as Record<string, number>,
    lift: { chafariz: 52, lago: 44, pedra: 40, escorregador: 50, sorvete: 40 } as Record<string, number>,
    shadow: { poste: 0.3, hidrante: 0.3, correio: 0.3, lago: 0.92, canteiro: 0.86 } as Record<string, number>,
} as const

export const ROAD = { width: 116, edge: 10, path: 64 } as const

export const FENCE = { inset: 34, post: 70 } as const

export const PANEL = {
    x: 640,
    y: 548,
    w: 880,
    h: 290,
    icon: 104,
    iconDx: 170,
    iconY: -80,
    saysY: 12,
    buttonY: 88,
    buttonDx: 230,
    buttonW: 300,
    buttonH: 84,
    trio: { dx: 296, w: 240 },
    pair: { dx: [140, 262], icon: 84 },
    seal: { r: 24, icon: 34, at: 0.74 },
    tag: { w: 100, h: 32, at: 0.72 },
    glass: 64,
    arm: 450,
    focus: 32,
} as const

export const BAG = {
    slots: 3,
    x: 70,
    w: 112,
    top: 200,
    bottom: 540,
    art: 100,
    artY: 214,
    slotY: 318,
    slotGap: 84,
    slotR: 36,
    icon: 58,
    fly: 600,
    peek: 900,
} as const

export const SWAP = {
    titleY: -96,
    itemY: 6,
    itemDx: 260,
    r: 62,
    icon: 94,
    nameY: 96,
} as const

export const CAPTION = { x: 640, y: 168 } as const

export const BUSY = { dx: 104, dy: -6, r: 34, icon: 46, tagY: 50, tagW: 92, tagH: 30, spin: 7000 } as const

export const HAND = { r: 30, stroke: 7, wave: 6, spread: 2.6 } as const

export const ZOOM = { town: 0.98, show: 0.62, call: 0.8 } as const

export const MARKER = {
    inset: 46,
    size: 36,
    icon: 48,
    tip: 16,
} as const

export const BANNER = {
    x: 640,
    y: 600,
    w: 1060,
    h: 96,
} as const
