export const W = 1280
export const H = 720

export const SURFACE = 260
export const FLOOR_GAP = 70
export const SHALLOW = { w: 5120, h: 2160 } as const
export const DEEP = { w: 5120, h: 3240 } as const

export const WORLD: { w: number; h: number } = { w: SHALLOW.w, h: SHALLOW.h }
export let FLOOR = SHALLOW.h - FLOOR_GAP

export function setWorld(size: { w: number; h: number }) {
    WORLD.w = size.w
    WORLD.h = size.h
    FLOOR = size.h - FLOOR_GAP
}

export const DEPTH = {
    bg: 0,
    decor: 2,
    pillar: 4,
    place: 6,
    pickup: 7,
    ripple: 11,
    fog: 10,
    lit: 12,
    litPlace: 13,
    sub: 16,
    ping: 18,
    dock: 20,
    client: 22,
    clientBalloon: 24,
    ui: 40,
    arrows: 44,
    controls: 46,
    card: 60,
    ask: 62,
    balloon: 70,
    finale: 80,
    hud: 100,
    curtain: 9500,
} as const

export const HUD = {
    chipX: 18,
    levelW: 112,
    levelH: 38,
    pipsX: 194,
    pipsY: 44,
    pipGap: 36,
    pipR: 12,
    livesX: 40,
    livesY: 40,
    livesSize: 30,
    helpX: 1220,
    helpY: 56,
    helpR: 36,
    helpHit: 96,
} as const

export const DOCK = { right: 380, deck: 250, x: 200, y: 330 } as const

export const CLIENT = { x: 120, foot: 250, scale: 0.5 } as const

export const SUB = {
    start: { x: 300, y: 360 },
    scale: 0.55,
    speed: 300,
    boost: 2.1,
    boostMs: 1000,
    cooldownMs: 1400,
    steer: 4,
    light: 260,
    touch: 74,
    retouch: 120,
} as const

export const AIR = { max: 100, boostDrain: 7, pickup: 35, dockRefill: 30, low: 25 } as const

export const BAG = { x: 836, y: 92, size: 58, gap: 10, art: 0.2 } as const

export const ASK = { x: 640, y: 38, h: 52, minW: 380 } as const

export const AIR_BAR = { x: 640, y: 88, w: 300, h: 18 } as const

export const MINIMAP = { right: 1262, top: 104, maxW: 300, maxH: 170 } as const

export function minimapBox() {
    const k = Math.min(MINIMAP.maxW / WORLD.w, MINIMAP.maxH / WORLD.h)
    const w = Math.round(WORLD.w * k)
    const h = Math.round(WORLD.h * k)
    return { x: MINIMAP.right - w / 2, y: MINIMAP.top + h / 2, w, h }
}

export const JOYSTICK = { x: 150, y: 600, r: 78, knob: 36, grab: 150, dead: 0.12 } as const

export const BOOST = { x: 1172, y: 606, r: 62, hit: 150 } as const

export const PANEL = { y: 650, h: 128 } as const

export const CHIP = { w: 132, h: 110, gap: 10, icon: 0.28, iconY: -16, labelY: 37, label: 22 } as const

export const ARROW = { inset: 54, top: 150, bottom: 540, size: 26 } as const

export const PLACE_SCALE = 0.62

export const CARD = { x: 640, y: 400, w: 600, h: 440, art: 1.02 } as const

export const BALLOON = { h: 62, minW: 240 } as const

export const PANEL_END = { x: 640, y: 390, w: 940, h: 440 } as const
