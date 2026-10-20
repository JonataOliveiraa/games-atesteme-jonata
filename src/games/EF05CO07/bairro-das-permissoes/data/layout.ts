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
    hud: 106,
    door: 120,
    banner: 140,
} as const

export const HEADER = {
    h: 96,
    dividers: [282, 1150],
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
    askX: 716,
    askW: 820,
} as const

export const VIEW = {
    x: 0,
    y: HEADER.h,
    w: W,
    h: H - HEADER.h,
    follow: 170,
    lead: 0.22,
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
    name: 20,
    arrow: 64,
} as const

export const DECO = {
    size: 190,
    fountain: 300,
    solid: { arvore: 40, pinheiro: 36, chafariz: 112 } as Record<string, number>,
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
    arm: 450,
    focus: -16,
} as const

export const CAPTION = { x: 640, y: 168 } as const

export const HAND = { size: 130, tapLift: 26 } as const

export const ZOOM = { town: 0.98, show: 0.62 } as const

export const MARKER = {
    inset: 46,
    size: 30,
} as const

export const BANNER = {
    x: 640,
    y: 600,
    w: 1060,
    h: 96,
} as const

export const CARRY = { lift: 168, size: 70 } as const
